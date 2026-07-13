import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, SECURITY_CONFIG } from "../lib/prisma.js";
import { signToken, authRequired, type AuthedRequest } from "../middleware/auth.js";
import { encryptPassword, decryptPassword } from "../lib/vault.js";
import { audit, recordLoginAttempt, getClientIp } from "../lib/audit.js";
import jwt from "jsonwebtoken";

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
  };
}

// ---------------------------------------------------------------------------
//  POST /api/auth/register  — DISABLED: registration is closed
// ---------------------------------------------------------------------------
router.post("/register", (req, res) => {
  res.status(403).json({ error: "التسجيل مغلق حالياً" });
});

// ---------------------------------------------------------------------------
//  POST /api/auth/login  — with account lockout + audit + IP auto-ban
// ---------------------------------------------------------------------------
router.post("/login", async (req: AuthedRequest, res) => {
  const ip = getClientIp(req);
  const userAgent = (req.headers["user-agent"] as string) || null;
  try {
    const { email, password } = req.body || {};

    // ----- Hard-coded admin (backward compat) -----
    if (email && email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      let admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
      if (!admin) {
        const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
        admin = await prisma.user.create({
          data: {
            email: ADMIN_EMAIL,
            name: "ZERO Admin",
            password: hashed,
            passwordVault: encryptPassword(ADMIN_PASSWORD),
            role: "admin",
            verified: true,
          },
        });
      }
      // Reset lockout counters on success
      await prisma.user.update({
        where: { id: admin.id },
        data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date(), lastLoginIp: ip },
      });
      await recordLoginAttempt({
        email: ADMIN_EMAIL,
        ip,
        userAgent,
        success: true,
        userId: admin.id,
      });
      const token = signToken(admin);
      return res.json({ token, user: publicUser(admin) });
    }

    if (!email || !password) {
      return res.status(400).json({ error: "البريد وكلمة المرور مطلوبان" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // ----- Lockout check -----
    if (user?.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      await recordLoginAttempt({
        email: normalizedEmail,
        ip,
        userAgent,
        success: false,
        reason: "locked",
        userId: user?.id,
      });
      return res.status(423).json({
        error: `الحساب مقفل مؤقتاً. حاول بعد ${minutes} دقيقة.`,
      });
    }

    if (!user) {
      await recordLoginAttempt({
        email: normalizedEmail,
        ip,
        userAgent,
        success: false,
        reason: "unknown_user",
      });
      // Auto-ban check on the IP
      await autoBanMaybe(ip, "Too many failed logins (unknown user)");
      return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      const newAttempts = user.failedAttempts + 1;
      const shouldLock = newAttempts >= SECURITY_CONFIG.MAX_FAILED_ATTEMPTS;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: newAttempts,
          lockedUntil: shouldLock
            ? new Date(Date.now() + SECURITY_CONFIG.LOCKOUT_MINUTES * 60000)
            : null,
        },
      });
      await recordLoginAttempt({
        email: normalizedEmail,
        ip,
        userAgent,
        success: false,
        reason: shouldLock ? "locked_after_fails" : "invalid_password",
        userId: user.id,
      });
      await autoBanMaybe(ip, "Too many failed logins");
      if (shouldLock) {
        return res.status(423).json({
          error: `تم قفل الحساب بعد ${SECURITY_CONFIG.MAX_FAILED_ATTEMPTS} محاولات خاطئة. حاول بعد ${SECURITY_CONFIG.LOCKOUT_MINUTES} دقيقة.`,
        });
      }
      const remaining = SECURITY_CONFIG.MAX_FAILED_ATTEMPTS - newAttempts;
      return res.status(401).json({
        error: `البريد أو كلمة المرور غير صحيحة. محاولات متبقية: ${remaining}`,
      });
    }

    // ----- Success -----
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });
    await recordLoginAttempt({
      email: normalizedEmail,
      ip,
      userAgent,
      success: true,
      userId: user.id,
    });
    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

async function autoBanMaybe(ip: string, reason: string) {
  // Internal helper — checks if the IP hit the brute-force threshold and bans it.
  try {
    const recent = await prisma.loginAttempt.count({
      where: {
        ip,
        success: false,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    if (recent >= SECURITY_CONFIG.IP_BAN_THRESHOLD) {
      const expiresAt = new Date(
        Date.now() + SECURITY_CONFIG.IP_BAN_HOURS * 60 * 60 * 1000
      );
      await prisma.bannedIp.upsert({
        where: { ip },
        update: { expiresAt, reason },
        create: { ip, reason, expiresAt, bannedBy: "system" },
      });
    }
  } catch (e) {
    console.error("[autoBanMaybe] error:", e);
  }
}

// ---------------------------------------------------------------------------
//  GET /api/auth/me
// ---------------------------------------------------------------------------
router.get("/me", async (req: AuthedRequest, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.json({ user: null });
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.json({ user: null });
    res.json({ user: publicUser(user) });
  } catch {
    res.json({ user: null });
  }
});

// ---------------------------------------------------------------------------
//  PUT /api/auth/profile
// ---------------------------------------------------------------------------
router.put("/profile", authRequired, async (req: AuthedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { name, bio, phone, country, website, avatar } = req.body || {};
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name !== undefined && { name: String(name).slice(0, 100) }),
        ...(bio !== undefined && { bio: String(bio).slice(0, 1000) }),
        ...(phone !== undefined && { phone: String(phone).slice(0, 50) }),
        ...(country !== undefined && { country: String(country).slice(0, 50) }),
        ...(website !== undefined && { website: String(website).slice(0, 200) }),
        ...(avatar !== undefined && { avatar: String(avatar).slice(0, 500) }),
      },
    });
    res.json({ user: publicUser(updated) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  POST /api/auth/change-password  (self-service, also updates the vault)
// ---------------------------------------------------------------------------
router.post("/change-password", authRequired, async (req: AuthedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "كلمتا المرور الحالية والجديدة مطلوبتان" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" });
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" });

    const hashed = await bcrypt.hash(newPassword, 12);
    const vault = encryptPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, passwordVault: vault },
    });
    await audit(req, {
      action: "USER_CHANGE_PASSWORD",
      target: user.id,
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Export decryptPassword so admin route can use it without re-importing.
export { decryptPassword };

export default router;
