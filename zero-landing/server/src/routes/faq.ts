import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { adminRequired, type AuthedRequest } from "../middleware/auth.js";
import { parsePaging } from "../lib/paging.js";

const router = Router();

// GET /api/faq
// Query params:
//   page, limit — pagination
//   q           — search question/answer
//   category    — filter by category
//   all         — "true" => include hidden (admin)
router.get("/", async (req, res) => {
  try {
    const { page, limit, skip } = parsePaging(req);
    const q = (req.query.q as string) || "";
    const category = (req.query.category as string) || "";
    const includeAll = req.query.all === "true";

    const where: any = {};
    if (!includeAll) where.visible = true;
    if (q) {
      where.OR = [
        { question: { contains: q } },
        { answer: { contains: q } },
      ];
    }
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      prisma.fAQ.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.fAQ.count({ where }),
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

// POST /api/faq  — admin
router.post("/", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { question, answer, category, order, visible } = req.body || {};
    if (!question || !answer)
      return res.status(400).json({ error: "question و answer مطلوبان" });
    const item = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category: category || "general",
        order: order || 0,
        visible: visible !== false,
      },
    });
    res.json({ item });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/faq/:id  — admin
router.put("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { question, answer, category, order, visible } = req.body || {};
    const item = await prisma.fAQ.update({
      where: { id: req.params.id },
      data: {
        ...(question !== undefined && { question }),
        ...(answer !== undefined && { answer }),
        ...(category !== undefined && { category }),
        ...(order !== undefined && { order }),
        ...(visible !== undefined && { visible }),
      },
    });
    res.json({ item });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/faq/:id  — admin
router.delete("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    await prisma.fAQ.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
