/**
 * Admin → Security Dashboard
 *
 * Exposes:
 *   - Failed login attempts (with email, IP, time, reason)
 *   - Active IP bans (with manual unban)
 *   - Audit log (every privileged admin action)
 *   - Security events (rate-limit hits, injection attempts, IP auto-bans)
 *   - Aggregate stats (counts, charts data)
 */

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { adminRequired, type AuthedRequest } from "../middleware/auth.js";
import { parsePaging } from "../lib/paging.js";
import { audit, getClientIp } from "../lib/audit.js";

const router = Router();

// ---------------------------------------------------------------------------
//  GET /api/admin/security/overview  — top-line numbers for the dashboard
// ---------------------------------------------------------------------------
router.get("/overview", adminRequired, async (_req: AuthedRequest, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      lockedUsers,
      totalBannedIps,
      failedLogins24h,
      successfulLogins24h,
      securityEvents24h,
      criticalEvents7d,
      auditEntries7d,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { lockedUntil: { gt: now } } }),
      prisma.bannedIp.count(),
      prisma.loginAttempt.count({ where: { success: false, createdAt: { gte: last24h } } }),
      prisma.loginAttempt.count({ where: { success: true, createdAt: { gte: last24h } } }),
      prisma.securityEvent.count({ where: { createdAt: { gte: last24h } } }),
      prisma.securityEvent.count({ where: { severity: "critical", createdAt: { gte: last7d } } }),
      prisma.auditLog.count({ where: { createdAt: { gte: last7d } } }),
    ]);

    // Top 5 IPs with most failed attempts in last 24h
    const topFailingIps = await prisma.loginAttempt.groupBy({
      by: ["ip"],
      where: { success: false, createdAt: { gte: last24h }, ip: { not: "unknown" } },
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    // Login attempts over the last 7 days, grouped by day (success vs fail)
    const recentAttempts = await prisma.loginAttempt.findMany({
      where: { createdAt: { gte: last7d } },
      select: { success: true, createdAt: true },
    });
    const byDay: Record<string, { success: number; fail: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      byDay[key] = { success: 0, fail: 0 };
    }
    for (const a of recentAttempts) {
      const key = a.createdAt.toISOString().slice(0, 10);
      if (byDay[key]) {
        if (a.success) byDay[key].success++;
        else byDay[key].fail++;
      }
    }

    res.json({
      totalUsers,
      lockedUsers,
      totalBannedIps,
      failedLogins24h,
      successfulLogins24h,
      securityEvents24h,
      criticalEvents7d,
      auditEntries7d,
      topFailingIps: topFailingIps.map((t) => ({ ip: t.ip, count: t._count._all })),
      loginTrend: Object.entries(byDay).map(([date, v]) => ({ date, ...v })),
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  GET /api/admin/security/login-attempts?page=&filter=all|failed|success
// ---------------------------------------------------------------------------
router.get("/login-attempts", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { page, limit, skip } = parsePaging(req, { defaultLimit: 30, maxLimit: 100 });
    const filter = (req.query.filter as string) || "all";
    const where: any = {};
    if (filter === "failed") where.success = false;
    else if (filter === "success") where.success = true;

    const [items, total] = await Promise.all([
      prisma.loginAttempt.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.loginAttempt.count({ where }),
    ]);
    res.json({
      items: items.map((a) => ({
        id: a.id,
        email: a.email,
        ip: a.ip,
        userAgent: a.userAgent,
        success: a.success,
        reason: a.reason,
        createdAt: a.createdAt,
        user: a.user ? { name: a.user.name, email: a.user.email } : null,
      })),
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
//  GET /api/admin/security/banned-ips
// ---------------------------------------------------------------------------
router.get("/banned-ips", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { page, limit, skip } = parsePaging(req, { defaultLimit: 30, maxLimit: 100 });
    const [items, total] = await Promise.all([
      prisma.bannedIp.findMany({
        orderBy: { bannedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.bannedIp.count(),
    ]);
    res.json({
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/security/banned-ips  — manually ban an IP
router.post("/banned-ips", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { ip, reason, hours } = req.body || {};
    if (!ip) return res.status(400).json({ error: "IP مطلوب" });
    const expiresAt = hours
      ? new Date(Date.now() + Number(hours) * 60 * 60 * 1000)
      : null;
    const ban = await prisma.bannedIp.upsert({
      where: { ip },
      update: { reason: reason || "manual ban", expiresAt, bannedBy: req.user?.email || "admin" },
      create: {
        ip,
        reason: reason || "manual ban",
        expiresAt,
        bannedBy: req.user?.email || "admin",
      },
    });
    await audit(req, {
      action: "IP_BAN_MANUAL",
      target: ip,
      meta: { reason: ban.reason, hours: hours || "permanent" },
    });
    res.json({ ban });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/admin/security/banned-ips/:ip  — unban
router.delete("/banned-ips/:ip", adminRequired, async (req: AuthedRequest, res) => {
  try {
    await prisma.bannedIp.delete({ where: { ip: req.params.ip } });
    await audit(req, {
      action: "IP_UNBAN",
      target: req.params.ip,
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  GET /api/admin/security/audit-log
// ---------------------------------------------------------------------------
router.get("/audit-log", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { page, limit, skip } = parsePaging(req, { defaultLimit: 50, maxLimit: 200 });
    const action = (req.query.action as string) || "";
    const where: any = {};
    if (action) where.action = action;

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);
    res.json({
      items: items.map((a) => ({
        ...a,
        meta: a.meta ? JSON.parse(a.meta) : null,
      })),
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
//  GET /api/admin/security/events
// ---------------------------------------------------------------------------
router.get("/events", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { page, limit, skip } = parsePaging(req, { defaultLimit: 30, maxLimit: 100 });
    const severity = (req.query.severity as string) || "";
    const where: any = {};
    if (severity) where.severity = severity;

    const [items, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.securityEvent.count({ where }),
    ]);
    res.json({
      items,
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
//  POST /api/admin/security/unlock-user/:id  — manually unlock a locked user
// ---------------------------------------------------------------------------
router.post("/unlock-user/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { lockedUntil: null, failedAttempts: 0 },
    });
    await audit(req, {
      action: "USER_UNLOCK_MANUAL",
      target: user.id,
      meta: { targetEmail: user.email },
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
