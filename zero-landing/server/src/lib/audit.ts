/**
 * Audit logging helper.
 *
 * Every privileged admin action (viewing a user's password, banning an IP,
 * creating a link mask, etc.) MUST be recorded here so the trail can be
 * reviewed later from /admin/security.
 */

import { prisma } from "./prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";

export interface AuditInput {
  action: string;
  target?: string | null;
  meta?: Record<string, any> | null;
}

export async function audit(
  req: AuthedRequest | null,
  input: AuditInput
): Promise<void> {
  try {
    const ip =
      (req?.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req?.socket?.remoteAddress ||
      null;
    const userAgent = (req?.headers["user-agent"] as string) || null;
    await prisma.auditLog.create({
      data: {
        actorId: req?.user?.id || null,
        actorEmail: req?.user?.email || null,
        action: input.action,
        target: input.target || null,
        ip,
        userAgent,
        meta: input.meta ? JSON.stringify(input.meta) : null,
      },
    });
  } catch (e) {
    // Audit failures must NEVER break the request flow.
    console.error("[audit] failed to write log:", e);
  }
}

/**
 * Record a login attempt (used by the auth route).
 */
export async function recordLoginAttempt(params: {
  email?: string | null;
  ip: string;
  userAgent?: string | null;
  success: boolean;
  reason?: string;
  userId?: string | null;
}): Promise<void> {
  try {
    await prisma.loginAttempt.create({
      data: {
        email: params.email || null,
        ip: params.ip,
        userAgent: params.userAgent || null,
        success: params.success,
        reason: params.reason || null,
        userId: params.userId || null,
      },
    });
  } catch (e) {
    console.error("[audit] failed to record login attempt:", e);
  }
}

/**
 * Record a security event (rate-limit hits, injection attempts, etc.).
 */
export async function recordSecurityEvent(params: {
  type: string;
  severity?: "info" | "warn" | "critical";
  ip?: string | null;
  path?: string | null;
  detail?: string | null;
  blocked?: boolean;
}): Promise<void> {
  try {
    await prisma.securityEvent.create({
      data: {
        type: params.type,
        severity: params.severity || "warn",
        ip: params.ip || null,
        path: params.path || null,
        detail: params.detail || null,
        blocked: params.blocked ?? true,
      },
    });
  } catch (e) {
    console.error("[audit] failed to record security event:", e);
  }
}

/**
 * Get client IP from an Express request (handles proxies).
 */
export function getClientIp(req: any): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}
