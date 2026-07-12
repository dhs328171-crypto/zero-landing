import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { UPLOAD_DIR } from "./lib/prisma.js";
import {
  helmetMiddleware,
  compressionMiddleware,
  hppMiddleware,
  mongoSanitizeMiddleware,
  sanitizeBody,
  ipBanCheck,
  authLimiter,
  apiLimiter,
  contactLimiter,
  redirectLimiter,
} from "./lib/security.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import blogRoutes from "./routes/blog.js";
import messageRoutes from "./routes/messages.js";
import testimonialRoutes from "./routes/testimonials.js";
import faqRoutes from "./routes/faq.js";
import serviceRoutes from "./routes/services.js";
import statsRoutes from "./routes/stats.js";
import mediaRoutes from "./routes/media.js";
import adminUserRoutes from "./routes/admin-users.js";
import linkMaskRoutes from "./routes/link-mask.js";
import adminSecurityRoutes from "./routes/admin-security.js";
import adminFileRoutes from "./routes/admin-files.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// ---------------------------------------------------------------------------
//  Trust proxy — when behind nginx / Cloudflare / load balancer, this lets
//  req.ip and req.headers['x-forwarded-for'] reflect the real client IP
//  (rate limiters and IP banning depend on this).
// ---------------------------------------------------------------------------
app.set("trust proxy", 1);

// ---------------------------------------------------------------------------
//  Security & compression middleware (apply BEFORE routes)
// ---------------------------------------------------------------------------
app.use(helmetMiddleware);
app.use(compressionMiddleware);
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(hppMiddleware);
app.use(mongoSanitizeMiddleware);
app.use(sanitizeBody);
app.use(ipBanCheck);

// ---------------------------------------------------------------------------
//  Static: serve uploaded files at /uploads/*
// ---------------------------------------------------------------------------
const uploadAbs = path.resolve(process.cwd(), UPLOAD_DIR);
fs.mkdirSync(uploadAbs, { recursive: true });
app.use(
  "/uploads",
  express.static(uploadAbs, {
    maxAge: "30d",
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Content-Security-Policy", "default-src 'none'");
    },
  })
);

// Also serve built frontend in production (monolith mode)
const publicDir = path.resolve(__dirname, "../../dist/public");
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// Logging middleware (lightweight, no PII)
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// ---------------------------------------------------------------------------
//  Health check (open)
// ---------------------------------------------------------------------------
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ZERO API", time: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
//  Rate-limited API routes
// ---------------------------------------------------------------------------
// Global limiter for everything under /api (excluding health + auth + contact)
app.use("/api", (req, res, next) => {
  // Skip global limiter for the auth + contact routes (they have their own).
  if (req.path.startsWith("/auth/") || req.path === "/messages") return next();
  if (req.path === "/health") return next();
  if (req.path.startsWith("/link-mask/r/")) return next(); // redirect endpoint has own limiter
  apiLimiter(req, res, next);
});

// Auth: strict limiter
app.use("/api/auth", authLimiter, authRoutes);

// Contact form: very strict limiter
app.use("/api/messages", contactLimiter, messageRoutes);

app.use("/api/projects", projectRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/media", mediaRoutes);

// Admin-only
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/security", adminSecurityRoutes);
app.use("/api/admin/files", adminFileRoutes);

// Link mask — admin CRUD under /api/link-mask, public redirect at /api/link-mask/r/:slug
app.use("/api/link-mask", redirectLimiter, linkMaskRoutes);

// ---------------------------------------------------------------------------
//  SPA fallback (production only — let dev Vite handle its own routes)
// ---------------------------------------------------------------------------
if (fs.existsSync(publicDir)) {
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

// 404 for unmatched API routes
app.use((req, res, _next) => {
  if (req.url.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  _next();
});

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("Unhandled error:", err);
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "حجم الملف يتجاوز الحد المسموح" });
  }
  if (err?.code === "ENOENT") {
    return res.status(404).json({ error: "Resource not found" });
  }
  // Don't leak internal errors in production
  const msg = process.env.NODE_ENV === "production" ? "Internal server error" : err.message;
  res.status(500).json({ error: msg });
});

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  ZERO API Server                              ║`);
  console.log(`║  Running on http://localhost:${PORT}             ║`);
  console.log(`║  Health: /api/health                          ║`);
  console.log(`║  Uploads dir: ${UPLOAD_DIR.padEnd(33)}║`);
  console.log(`║  Security: helmet, rate-limit, hpp, sanitize  ║`);
  console.log(`╚══════════════════════════════════════════════╝\n`);
});
