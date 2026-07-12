/**
 * Admin → User Management
 *
 * Lists every registered user, supports search, pagination, role change,
 * password reveal (decrypted from vault, with audit log), and password reset.
 *
 * ⚠️  Password reveal is a HIGH-PRIVILEGE action. Every reveal is recorded
 *     in the audit log with the admin's id, email, IP, and timestamp. The
 *     /admin/security page exposes this trail.
 */

import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { adminRequired, type AuthedRequest } from "../middleware/auth.js";
import { parsePaging } from "../lib/paging.js";
import { audit, getClientIp } from "../lib/audit.js";
import { encryptPassword, decryptPassword, generateSecurePassword } from "../lib/vault.js";

const router = Router();

function publicUser(u: any) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    avatar: u.avatar || null,
    bio: u.bio || null,
    phone: u.phone || null,
    country: u.country || null,
    website: u.website || null,
    verified: u.verified,
    joinedAt: u.joinedAt,
    lastLoginAt: u.lastLoginAt || null,
    lastLoginIp: u.lastLoginIp || null,
    failedAttempts: u.failedAttempts ?? 0,
    lockedUntil: u.lockedUntil || null,
    hasVault: !!u.passwordVault,
  };
}

// ---------------------------------------------------------------------------
//  GET /api/admin/users?page=&limit=&q=&role=&filter=
//    filter: all | active | locked | admins
// ---------------------------------------------------------------------------
router.get("/", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { page, limit, skip } = parsePaging(req, { defaultLimit: 20, maxLimit: 100 });
    const q = (req.query.q as string) || "";
    const role = (req.query.role as string) || "";
    const filter = (req.query.filter as string) || "all";

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }
    if (role) where.role = role;
    if (filter === "locked") {
      where.lockedUntil = { gt: new Date() };
    } else if (filter === "admins") {
      where.role = "admin";
    } else if (filter === "active") {
      where.lastLoginAt = { ne: null };
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { joinedAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true, email: true, name: true, role: true, avatar: true,
          bio: true, phone: true, country: true, website: true, verified: true,
          joinedAt: true, lastLoginAt: true, lastLoginIp: true,
          failedAttempts: true, lockedUntil: true, passwordVault: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      items: items.map(publicUser),
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  GET /api/admin/users/:id
// ---------------------------------------------------------------------------
router.get("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
    res.json({ user: publicUser(user) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  POST /api/admin/users/:id/reveal-password
//  Decrypt the vault and return plaintext. AUDITED.
// ---------------------------------------------------------------------------
router.post("/:id/reveal-password", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
    if (!user.passwordVault) {
      return res.status(404).json({ error: "لا توجد كلمة مرور محفوظة لهذا المستخدم (vault فارغ)" });
    }
    let plain: string;
    try {
      plain = decryptPassword(user.passwordVault);
    } catch (e: any) {
      return res.status(500).json({ error: "فشل فك تشفير كلمة المرور: " + e.message });
    }
    await audit(req, {
      action: "USER_VIEW_PASSWORD",
      target: user.id,
      meta: { targetEmail: user.email, ip: getClientIp(req) },
    });
    res.json({ password: plain, revealedAt: new Date().toISOString() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  POST /api/admin/users/:id/reset-password
//  Admin generates a new secure password, returns it ONCE, updates the hash
//  and the vault. AUDITED.
// ---------------------------------------------------------------------------
router.post("/:id/reset-password", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

    const newPassword = (req.body?.password as string) || generateSecurePassword(14);
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    }
    const hashed = await bcrypt.hash(newPassword, 12);
    const vault = encryptPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordVault: vault,
        failedAttempts: 0,
        lockedUntil: null,
      },
    });
    await audit(req, {
      action: "USER_RESET_PASSWORD",
      target: user.id,
      meta: { targetEmail: user.email },
    });
    res.json({ password: newPassword, generatedAt: new Date().toISOString() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  PUT /api/admin/users/:id/role
// ---------------------------------------------------------------------------
router.put("/:id/role", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const role = req.body?.role;
    if (role !== "admin" && role !== "user") {
      return res.status(400).json({ error: "الدور يجب أن يكون admin أو user" });
    }
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });
    await audit(req, {
      action: "USER_CHANGE_ROLE",
      target: updated.id,
      meta: { newRole: role, targetEmail: updated.email },
    });
    res.json({ user: publicUser(updated) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  PUT /api/admin/users/:id/lock  (lock/unlock)
// ---------------------------------------------------------------------------
router.put("/:id/lock", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const lock = req.body?.lock !== false;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        lockedUntil: lock ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
        failedAttempts: lock ? 99 : 0,
      },
    });
    await audit(req, {
      action: lock ? "USER_LOCK" : "USER_UNLOCK",
      target: updated.id,
      meta: { targetEmail: updated.email },
    });
    res.json({ user: publicUser(updated) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  PUT /api/admin/users/:id  (general update — name/email/phone/etc)
// ---------------------------------------------------------------------------
router.put("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { name, email, phone, country, website, bio, verified } = req.body || {};
    const data: any = {};
    if (name !== undefined) data.name = String(name).slice(0, 100);
    if (email !== undefined) data.email = String(email).toLowerCase().slice(0, 200);
    if (phone !== undefined) data.phone = String(phone).slice(0, 50);
    if (country !== undefined) data.country = String(country).slice(0, 50);
    if (website !== undefined) data.website = String(website).slice(0, 200);
    if (bio !== undefined) data.bio = String(bio).slice(0, 1000);
    if (verified !== undefined) data.verified = !!verified;

    const updated = await prisma.user.update({ where: { id: req.params.id }, data });
    await audit(req, {
      action: "USER_UPDATE",
      target: updated.id,
      meta: { fields: Object.keys(data), targetEmail: updated.email },
    });
    res.json({ user: publicUser(updated) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  DELETE /api/admin/users/:id  (cannot delete self / the bootstrap admin)
// ---------------------------------------------------------------------------
router.delete("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: "لا يمكن حذف حسابك الحالي" });
    }
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: "المستخدم غير موجود" });
    if (target.email === ADMIN_EMAIL) {
      return res.status(400).json({ error: "لا يمكن حذف حساب الأدمن الرئيسي" });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    await audit(req, {
      action: "USER_DELETE",
      target: req.params.id,
      meta: { deletedEmail: target.email },
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  GET /api/admin/users/:id/login-history
// ---------------------------------------------------------------------------
router.get("/:id/login-history", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { page, limit, skip } = parsePaging(req, { defaultLimit: 30, maxLimit: 100 });
    const [items, total] = await Promise.all([
      prisma.loginAttempt.findMany({
        where: { userId: req.params.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.loginAttempt.count({ where: { userId: req.params.id } }),
    ]);
    res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Need ADMIN_EMAIL import for the bootstrap-admin guard
import { ADMIN_EMAIL } from "../lib/prisma.js";

export default router;
