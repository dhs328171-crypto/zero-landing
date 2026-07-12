import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { adminRequired, type AuthedRequest } from "../middleware/auth.js";
import { parsePaging } from "../lib/paging.js";

const router = Router();

// ----------------------------------------------------------------------------
//  GET /api/projects
//  Query params:
//    page, limit          — pagination
//    q                    — search title/description/tech
//    category             — filter by category
//    featured             — "true" / "false"
//    all                  — "true" => include drafts (admin)
// ----------------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const { page, limit, skip } = parsePaging(req);
    const q = (req.query.q as string) || "";
    const category = (req.query.category as string) || "";

    const where: any = {};
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { tech: { contains: q } },
      ];
    }
    if (category) where.category = category;
    if (req.query.featured === "true") where.featured = true;
    if (req.query.featured === "false") where.featured = false;

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
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

// GET /api/projects/:slug  — single
router.get("/:slug", async (req, res) => {
  try {
    const item = await prisma.project.findUnique({
      where: { slug: req.params.slug },
    });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ item });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/projects  — admin
router.post("/", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { title, slug, description, tech, category, image, url, featured } =
      req.body || {};
    if (!title || !slug)
      return res.status(400).json({ error: "title و slug مطلوبان" });
    const item = await prisma.project.create({
      data: {
        title,
        slug: slug.trim().toLowerCase(),
        description: description || "",
        tech: tech || "",
        category: category || "General",
        image: image || "",
        url: url || null,
        featured: !!featured,
      },
    });
    res.json({ item });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/projects/:id  — admin
router.put("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { title, slug, description, tech, category, image, url, featured } =
      req.body || {};
    const item = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug: slug.trim().toLowerCase() }),
        ...(description !== undefined && { description }),
        ...(tech !== undefined && { tech }),
        ...(category !== undefined && { category }),
        ...(image !== undefined && { image }),
        ...(url !== undefined && { url: url || null }),
        ...(featured !== undefined && { featured }),
      },
    });
    res.json({ item });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/projects/:id  — admin
router.delete("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
