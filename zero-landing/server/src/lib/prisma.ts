import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Explicitly load .env so ALL process.env.* (not just DATABASE_URL) are
// available — Prisma loads only what it needs; we need PASSWORD_VAULT_KEY,
// JWT_SECRET, ADMIN_*, etc. as well.
dotenv.config();

// Single shared instance — reuses connection across hot-reloads in dev.
const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.__prisma = prisma;

// ----------------------------------------------------------------------------
//  Secrets & admin bootstrap
//  ⚠️  In production, override ALL of these via real env vars. Never ship
//      the defaults to a public server.
// ----------------------------------------------------------------------------
export const JWT_SECRET =
  process.env.JWT_SECRET || "zero-dev-secret-change-in-production";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "zeru50549@gmail.com";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "zero7892345##";

// ----------------------------------------------------------------------------
//  Upload config
// ----------------------------------------------------------------------------
export const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
export const UPLOAD_MAX_MB = Number(process.env.UPLOAD_MAX_MB || 10);
export const UPLOAD_MAX_BYTES = UPLOAD_MAX_MB * 1024 * 1024;

// Allowed MIME types for upload
export const UPLOAD_ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/avif",
  "application/pdf",
];

// ----------------------------------------------------------------------------
//  Security config — tune via env in production
// ----------------------------------------------------------------------------
export const SECURITY_CONFIG = {
  // Account lockout: after this many failed attempts, lock for N minutes.
  MAX_FAILED_ATTEMPTS: Number(process.env.MAX_FAILED_ATTEMPTS || 5),
  LOCKOUT_MINUTES: Number(process.env.LOCKOUT_MINUTES || 15),

  // IP banning: after this many failed attempts from a single IP, ban it.
  IP_BAN_THRESHOLD: Number(process.env.IP_BAN_THRESHOLD || 20),
  IP_BAN_HOURS: Number(process.env.IP_BAN_HOURS || 24),

  // Rate limits (per IP)
  RATE_LIMIT_AUTH_WINDOW_MS: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS || 15 * 60 * 1000),
  RATE_LIMIT_AUTH_MAX: Number(process.env.RATE_LIMIT_AUTH_MAX || 10),
  RATE_LIMIT_API_WINDOW_MS: Number(process.env.RATE_LIMIT_API_WINDOW_MS || 60 * 1000),
  RATE_LIMIT_API_MAX: Number(process.env.RATE_LIMIT_API_MAX || 120),
  RATE_LIMIT_CONTACT_WINDOW_MS: Number(process.env.RATE_LIMIT_CONTACT_WINDOW_MS || 60 * 60 * 1000),
  RATE_LIMIT_CONTACT_MAX: Number(process.env.RATE_LIMIT_CONTACT_MAX || 5),
  RATE_LIMIT_REDIRECT_WINDOW_MS: Number(process.env.RATE_LIMIT_REDIRECT_WINDOW_MS || 60 * 1000),
  RATE_LIMIT_REDIRECT_MAX: Number(process.env.RATE_LIMIT_REDIRECT_MAX || 30),
};
