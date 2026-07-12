/**
 * Security middleware stack.
 *
 * Layered defence in depth:
 *   1. helmet           — secure HTTP headers (CSP, HSTS, X-Frame-Options…)
 *   2. compression      — gzip responses (helps absorb burst traffic)
 *   3. hpp              — HTTP Parameter Pollution protection
 *   4. mongoSanitize    — strip $ and . from inputs (NoSQL injection)
 *   5. sanitizeBody     — light SQL-injection / XSS heuristic check
 *   6. ipBanCheck       — reject requests from banned IPs
 *   7. rateLimit (auth) — strict per-IP limiter on /api/auth/* (login/register)
 *   8. rateLimit (api)  — global limiter for all other /api/* routes
 *   9. rateLimit (contact) — very strict limiter on public contact form
 */

import type { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import { prisma, SECURITY_CONFIG } from "./prisma.js";
import { recordSecurityEvent, getClientIp } from "./audit.js";

// ---------------------------------------------------------------------------
//  Header + param hygiene
// ---------------------------------------------------------------------------
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'", // Vite dev requires this; tighten in prod
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // breakage on third-party images
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

export const compressionMiddleware = compression();
export const hppMiddleware = hpp();
export const mongoSanitizeMiddleware = mongoSanitize();

// ---------------------------------------------------------------------------
//  Light-weight injection / XSS heuristic.
//  For production, replace with a WAF (Cloudflare / AWS WAF).
// ---------------------------------------------------------------------------
const SQLI_PATTERN =
  /(\bunion\b\s+\bselect\b)|(\bselect\b\s+.+\bfrom\b)|(\binsert\b\s+\binto\b)|(\bdrop\b\s+\btable\b)|(--\s)|(\bor\b\s+1\s*=\s*1)/i;
const XSS_PATTERN =
  /<script\b|javascript:|onerror\s*=|onload\s*=|<iframe\b|<embed\b|<object\b/i;

export function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  // Skip for multipart uploads (body is a stream at this point)
  if (!req.body || typeof req.body !== "object") return next();

  const check = (val: any, path: string): boolean => {
    if (typeof val === "string") {
      if (SQLI_PATTERN.test(val) || XSS_PATTERN.test(val)) {
        console.warn(`[security] suspicious input at ${path}: ${val.slice(0, 80)}`);
        return true;
      }
    } else if (Array.isArray(val)) {
      return val.some((v, i) => check(v, `${path}[${i}]`));
    } else if (val && typeof val === "object") {
      return Object.keys(val).some((k) => check(val[k], `${path}.${k}`));
    }
    return false;
  };

  if (check(req.body, "body")) {
    recordSecurityEvent({
      type: "injection_attempt",
      severity: "critical",
      ip: getClientIp(req),
      path: req.path,
      detail: "Blocked by sanitizeBody heuristic",
    });
    return _res.status(400).json({
      error: "تم رصد محاولة اختراق. تم حظر الطلب.",
    });
  }
  next();
}

// ---------------------------------------------------------------------------
//  IP ban check — runs on every request.
// ---------------------------------------------------------------------------
export async function ipBanCheck(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);
  if (!ip || ip === "unknown") return next();
  try {
    const ban = await prisma.bannedIp.findUnique({ where: { ip } });
    if (ban) {
      // Expired ban? Clean it up.
      if (ban.expiresAt && ban.expiresAt.getTime() < Date.now()) {
        await prisma.bannedIp.delete({ where: { id: ban.id } });
      } else {
        return res.status(403).json({
          error: "تم حظر هذا الـ IP بسبب نشاط مشبوه. تواصل مع الإدارة.",
        });
      }
    }
  } catch (e) {
    // If DB fails, fail open (don't block legitimate traffic)
    console.error("[ipBanCheck] error:", e);
  }
  next();
}

// ---------------------------------------------------------------------------
//  Auto-ban helper. Call when an IP hits the brute-force threshold.
// ---------------------------------------------------------------------------
export async function autoBanIp(ip: string, reason: string): Promise<void> {
  if (!ip || ip === "unknown") return;
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
      await recordSecurityEvent({
        type: "ip_auto_banned",
        severity: "critical",
        ip,
        detail: reason,
      });
      console.warn(`[security] IP ${ip} auto-banned: ${reason}`);
    }
  } catch (e) {
    console.error("[autoBanIp] error:", e);
  }
}

// ---------------------------------------------------------------------------
//  Rate limiters
// ---------------------------------------------------------------------------
const skip = (_req: Request, _res: Response): boolean =>
  process.env.NODE_ENV !== "production" && process.env.SKIP_RATE_LIMIT === "1";

export const authLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.RATE_LIMIT_AUTH_WINDOW_MS,
  max: SECURITY_CONFIG.RATE_LIMIT_AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  keyGenerator: (req) => getClientIp(req),
  handler: (req, res) => {
    recordSecurityEvent({
      type: "auth_rate_limit",
      severity: "warn",
      ip: getClientIp(req),
      path: req.path,
    });
    res.status(429).json({
      error: "محاولات كثيرة جداً. حاول مرة أخرى بعد قليل.",
    });
  },
});

export const apiLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.RATE_LIMIT_API_WINDOW_MS,
  max: SECURITY_CONFIG.RATE_LIMIT_API_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  keyGenerator: (req) => getClientIp(req),
  handler: (req, res) => {
    recordSecurityEvent({
      type: "api_rate_limit",
      severity: "info",
      ip: getClientIp(req),
      path: req.path,
    });
    res.status(429).json({
      error: "تجاوزت الحد المسموح من الطلبات. حاول بعد دقيقة.",
    });
  },
});

export const contactLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.RATE_LIMIT_CONTACT_WINDOW_MS,
  max: SECURITY_CONFIG.RATE_LIMIT_CONTACT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  keyGenerator: (req) => getClientIp(req),
  handler: (req, res) => {
    recordSecurityEvent({
      type: "contact_rate_limit",
      severity: "warn",
      ip: getClientIp(req),
      path: req.path,
    });
    res.status(429).json({
      error: "أرسلت رسائل كثيرة. تابع لاحقاً.",
    });
  },
});

export const redirectLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.RATE_LIMIT_REDIRECT_WINDOW_MS,
  max: SECURITY_CONFIG.RATE_LIMIT_REDIRECT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  keyGenerator: (req) => getClientIp(req),
  handler: (_req, res) => {
    res.status(429).send("Too many redirects. Slow down.");
  },
});
