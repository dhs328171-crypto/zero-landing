import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { prisma, UPLOAD_DIR, UPLOAD_MAX_BYTES, UPLOAD_MAX_MB, UPLOAD_ALLOWED_MIME } from "../lib/prisma.js";
import { adminRequired, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

// ----------------------------------------------------------------------------
//  Multer storage — disk-based, sanitised filenames
// ----------------------------------------------------------------------------
const uploadRoot = path.resolve(process.cwd(), UPLOAD_DIR);
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || "";
    const base = path.basename(file.originalname, ext)
      .replace(/[^\p{L}\p{N}_-]+/gu, "_")
      .slice(0, 40);
    const rand = crypto.randomBytes(6).toString("hex");
    cb(null, `${Date.now()}_${rand}_${base || "file"}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: UPLOAD_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (UPLOAD_ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`نوع الملف غير مدعوم: ${file.mimetype}`));
  },
});

// ----------------------------------------------------------------------------
//  Helpers
// ----------------------------------------------------------------------------
function publicUrl(filename: string) {
  return `/uploads/${filename}`;
}

function safeRemoveFile(url: string) {
  try {
    const filename = path.basename(url);
    const full = path.join(uploadRoot, filename);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  } catch {
    /* ignore */
  }
}

// ----------------------------------------------------------------------------
//  Routes
// ----------------------------------------------------------------------------

// POST /api/media/upload  — admin only, single or multiple files (field: "files")
router.post(
  "/upload",
  adminRequired,
  upload.array("files", 10),
  async (req: AuthedRequest, res) => {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      if (files.length === 0) {
        return res.status(400).json({ error: "لم يتم استلام أي ملف" });
      }
      const created = [];
      for (const f of files) {
        const url = publicUrl(f.filename);
        const item = await prisma.media.create({
          data: {
            name: f.originalname,
            url,
            type: f.mimetype,
            size: f.size,
            alt: path.basename(f.originalname, path.extname(f.originalname)),
          },
        });
        created.push(item);
      }
      res.json({ items: created });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
);

// Error handler for multer (file too large / wrong type)
// (works as middleware-level error — we attach it explicitly)
router.use("/upload", (err: any, _req: any, res: any, _next: any) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res
      .status(413)
      .json({ error: `حجم الملف يتجاوز الحد المسموح (${UPLOAD_MAX_MB} MB)` });
  }
  if (err?.message?.includes("نوع الملف")) {
    return res.status(415).json({ error: err.message });
  }
  if (err) return res.status(400).json({ error: err.message || "Upload error" });
});

// GET /api/media — admin only, paginated + searchable
router.get("/", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 24));
    const q = (req.query.q as string) || "";
    const type = (req.query.type as string) || "";

    const where: any = {};
    if (q) where.name = { contains: q };
    if (type === "image") where.type = { contains: "image/" };
    else if (type === "pdf") where.type = { contains: "pdf" };

    const [items, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.media.count({ where }),
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

// PUT /api/media/:id — update alt text
router.put("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { alt } = req.body || {};
    const item = await prisma.media.update({
      where: { id: req.params.id },
      data: { ...(alt !== undefined && { alt }) },
    });
    res.json({ item });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/media/:id — admin only
router.delete("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const item = await prisma.media.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Not found" });
    safeRemoveFile(item.url);
    await prisma.media.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
