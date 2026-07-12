/**
 * Link Mask — URL cloaking / disguise feature.
 *
 * Admin can create a short, branded alias that, when visited at /r/:slug,
 * redirects visitors to the real (often long or ugly) target URL.
 *
 * Use cases:
 *   - Affiliate links (hide the tracking params)
 *   - External PDFs / docs (clean brand URL)
 *   - Campaign tracking
 *   - Hide that a link goes to a 3rd-party site
 *
 * Supports:
 *   - Optional password protection (bcrypt)
 *   - Optional expiry date
 *   - Click counter
 *   - Soft-delete (active = false)
 */

import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { adminRequired, authRequired, type AuthedRequest } from "../middleware/auth.js";
import { parsePaging } from "../lib/paging.js";
import { audit, recordSecurityEvent, getClientIp } from "../lib/audit.js";

const router = Router();

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function publicMask(m: any) {
  return {
    id: m.id,
    slug: m.slug,
    targetUrl: m.targetUrl,
    title: m.title || null,
    description: m.description || null,
    clicks: m.clicks,
    active: m.active,
    expiresAt: m.expiresAt || null,
    hasPassword: !!m.password,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

// ---------------------------------------------------------------------------
//  ADMIN: list / create / update / delete
// ---------------------------------------------------------------------------

// GET /api/link-mask?page=&limit=&q=
router.get("/", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { page, limit, skip } = parsePaging(req, { defaultLimit: 20, maxLimit: 100 });
    const q = (req.query.q as string) || "";
    const where: any = {};
    if (q) {
      where.OR = [
        { slug: { contains: q } },
        { title: { contains: q } },
        { targetUrl: { contains: q } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.linkMask.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.linkMask.count({ where }),
    ]);
    res.json({
      items: items.map(publicMask),
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/link-mask
router.post("/", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { slug, targetUrl, title, description, password, expiresAt, active } = req.body || {};
    if (!targetUrl || !isValidUrl(targetUrl)) {
      return res.status(400).json({ error: "الرابط الهدف غير صالح (يجب أن يبدأ بـ http أو https)" });
    }
    const finalSlug = slugify(slug || title || targetUrl);
    if (!finalSlug) {
      return res.status(400).json({ error: "الـ slug غير صالح" });
    }
    const existing = await prisma.linkMask.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return res.status(409).json({ error: "هذا الـ slug مستخدم بالفعل" });
    }
    const hashedPassword = password ? await bcrypt.hash(String(password), 10) : null;
    const mask = await prisma.linkMask.create({
      data: {
        slug: finalSlug,
        targetUrl: targetUrl.trim(),
        title: title?.trim() || null,
        description: description?.trim() || null,
        password: hashedPassword,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: active !== false,
      },
    });
    await audit(req, {
      action: "LINK_MASK_CREATE",
      target: mask.id,
      meta: { slug: mask.slug, targetUrl: mask.targetUrl },
    });
    res.json({ mask: publicMask(mask) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/link-mask/:id
router.put("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { slug, targetUrl, title, description, password, expiresAt, active } = req.body || {};
    const data: any = {};
    if (slug !== undefined) {
      const s = slugify(slug);
      if (!s) return res.status(400).json({ error: "الـ slug غير صالح" });
      const conflict = await prisma.linkMask.findFirst({
        where: { slug: s, NOT: { id: req.params.id } },
      });
      if (conflict) return res.status(409).json({ error: "slug مستخدم" });
      data.slug = s;
    }
    if (targetUrl !== undefined) {
      if (!isValidUrl(targetUrl)) {
        return res.status(400).json({ error: "رابط الهدف غير صالح" });
      }
      data.targetUrl = targetUrl.trim();
    }
    if (title !== undefined) data.title = title?.trim() || null;
    if (description !== undefined) data.description = description?.trim() || null;
    if (password !== undefined) {
      data.password = password ? await bcrypt.hash(String(password), 10) : null;
    }
    if (expiresAt !== undefined) {
      data.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }
    if (active !== undefined) data.active = !!active;

    const updated = await prisma.linkMask.update({
      where: { id: req.params.id },
      data,
    });
    await audit(req, {
      action: "LINK_MASK_UPDATE",
      target: updated.id,
      meta: { slug: updated.slug, fields: Object.keys(data) },
    });
    res.json({ mask: publicMask(updated) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/link-mask/:id
router.delete("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const m = await prisma.linkMask.findUnique({ where: { id: req.params.id } });
    if (!m) return res.status(404).json({ error: "غير موجود" });
    await prisma.linkMask.delete({ where: { id: req.params.id } });
    await audit(req, {
      action: "LINK_MASK_DELETE",
      target: m.id,
      meta: { slug: m.slug, targetUrl: m.targetUrl },
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/link-mask/:id/clicks/reset
router.post("/:id/clicks/reset", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const updated = await prisma.linkMask.update({
      where: { id: req.params.id },
      data: { clicks: 0 },
    });
    res.json({ mask: publicMask(updated) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  PUBLIC: redirect  GET /r/:slug
//  - If link has a password, expect ?pw=... or POST { password } to validate.
//  - Tracks click + returns the target URL (client does the actual redirect).
//    We don't issue a 302 from the server because (a) the front-end router
//    handles /r/:slug, and (b) it lets us render a branded "you are being
//    redirected" interstitial page if desired.
// ---------------------------------------------------------------------------

// GET /api/link-mask/r/:slug  → returns target URL (and bumps click counter).
//   If password-protected, requires `?pw=...` and returns 401 if missing/wrong.
router.get("/r/:slug", async (req, res) => {
  try {
    const mask = await prisma.linkMask.findUnique({ where: { slug: req.params.slug } });
    if (!mask || !mask.active) {
      return res.status(404).json({ error: "الرابط غير موجود أو معطّل" });
    }
    if (mask.expiresAt && mask.expiresAt.getTime() < Date.now()) {
      return res.status(410).json({ error: "انتهت صلاحية هذا الرابط" });
    }
    if (mask.password) {
      const pw = (req.query.pw as string) || "";
      if (!pw) {
        return res.status(401).json({ error: "هذا الرابط محمي بكلمة مرور", requiresPassword: true });
      }
      const ok = await bcrypt.compare(pw, mask.password);
      if (!ok) {
        await recordSecurityEvent({
          type: "link_mask_wrong_password",
          severity: "warn",
          ip: getClientIp(req),
          path: req.path,
          detail: `slug=${mask.slug}`,
        });
        return res.status(403).json({ error: "كلمة المرور غير صحيحة" });
      }
    }
    // Bump click counter (fire and forget — don't block the redirect)
    prisma.linkMask
      .update({ where: { id: mask.id }, data: { clicks: { increment: 1 } } })
      .catch(() => {});
    res.json({
      targetUrl: mask.targetUrl,
      title: mask.title || null,
      slug: mask.slug,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
