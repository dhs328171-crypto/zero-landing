import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { adminRequired, type AuthedRequest } from "../middleware/auth.js";
import { parsePaging } from "../lib/paging.js";

const router = Router();

// ----------------------------------------------------------------------------
//  GET /api/blog
//  Query params:
//    page, limit  — pagination
//    q            — search title/excerpt/content
//    tag          — filter by tag
//    hot          — "true" => only hot
//    all          — "true" => include drafts (admin)
// ----------------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const { page, limit, skip } = parsePaging(req);
    const q = (req.query.q as string) || "";
    const tag = (req.query.tag as string) || "";
    const includeAll = req.query.all === "true";

    const where: any = {};
    if (!includeAll) where.published = true;
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { excerpt: { contains: q } },
        { content: { contains: q } },
      ];
    }
    if (tag) where.tag = tag;
    if (req.query.hot === "true") where.hot = true;

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
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

// GET /api/blog/:slug  — single (increments views)
router.get("/:slug", async (req, res) => {
  try {
    const item = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug },
    });
    if (!item) return res.status(404).json({ error: "Not found" });
    // Fire-and-forget view increment
    prisma.blogPost
      .update({ where: { id: item.id }, data: { views: { increment: 1 } } })
      .catch(() => {});
    res.json({ item: { ...item, views: item.views + 1 } });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/blog  — admin
router.post("/", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { title, slug, excerpt, content, image, tag, hot, published } =
      req.body || {};
    if (!title || !slug)
      return res.status(400).json({ error: "title و slug مطلوبان" });
    const item = await prisma.blogPost.create({
      data: {
        title,
        slug: slug.trim().toLowerCase(),
        excerpt: excerpt || "",
        content: content || "",
        image: image || "",
        tag: tag || "General",
        hot: !!hot,
        published: published !== false,
        authorId: req.user?.id,
      },
    });
    res.json({ item });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/blog/:id  — admin
router.put("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { title, slug, excerpt, content, image, tag, hot, published } =
      req.body || {};
    const item = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug: slug.trim().toLowerCase() }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content !== undefined && { content }),
        ...(image !== undefined && { image }),
        ...(tag !== undefined && { tag }),
        ...(hot !== undefined && { hot }),
        ...(published !== undefined && { published }),
      },
    });
    res.json({ item });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/blog/:id  — admin
router.delete("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    await prisma.blogPost.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
