import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { adminRequired, type AuthedRequest } from "../middleware/auth.js";
import { parsePaging } from "../lib/paging.js";

const router = Router();

// GET /api/services
// Query params:
//   page, limit  — pagination
//   q            — search title/description
//   all          — "true" => include inactive (admin)
router.get("/", async (req, res) => {
  try {
    const { page, limit, skip } = parsePaging(req);
    const q = (req.query.q as string) || "";
    const includeAll = req.query.all === "true";

    const where: any = {};
    if (!includeAll) where.active = true;
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
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

// POST /api/services  — admin
router.post("/", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { title, description, icon, features, price, active, order } =
      req.body || {};
    if (!title) return res.status(400).json({ error: "title مطلوب" });
    const item = await prisma.service.create({
      data: {
        title,
        description: description || "",
        icon: icon || "Code",
        features:
          typeof features === "string" ? features : JSON.stringify(features || []),
        price: price || null,
        active: active !== false,
        order: order || 0,
      },
    });
    res.json({ item });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/services/:id  — admin
router.put("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { title, description, icon, features, price, active, order } =
      req.body || {};
    const item = await prisma.service.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(features !== undefined && {
          features:
            typeof features === "string" ? features : JSON.stringify(features),
        }),
        ...(price !== undefined && { price }),
        ...(active !== undefined && { active }),
        ...(order !== undefined && { order }),
      },
    });
    res.json({ item });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/services/:id  — admin
router.delete("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
