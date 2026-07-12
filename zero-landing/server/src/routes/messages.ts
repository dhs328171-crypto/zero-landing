import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { adminRequired, type AuthedRequest } from "../middleware/auth.js";
import { parsePaging } from "../lib/paging.js";

const router = Router();

// Public: submit message
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "الاسم والبريد والرسالة مطلوبة" });
    }
    const item = await prisma.message.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject: (subject || "بدون موضوع").trim(),
        message: message.trim(),
      },
    });
    res.json({ success: true, id: item.id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: list messages — paginated + searchable + filterable
// GET /api/messages?page=1&limit=20&q=&filter=all|unread|starred
router.get("/", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { page, limit, skip } = parsePaging(req);
    const q = (req.query.q as string) || "";
    const filter = (req.query.filter as string) || "all";

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { subject: { contains: q } },
        { message: { contains: q } },
      ];
    }
    if (filter === "unread") where.read = false;
    else if (filter === "starred") where.starred = true;

    const [items, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.message.count({ where }),
    ]);

    const unreadCount = await prisma.message.count({ where: { read: false } });

    res.json({
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      unreadCount,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/messages/:id/read — mark as read/unread
router.put("/:id/read", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const read = req.body?.read !== false;
    const item = await prisma.message.update({
      where: { id: req.params.id },
      data: { read },
    });
    res.json({ item });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/messages/:id/star — toggle star
router.put("/:id/star", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const starred = req.body?.starred !== false;
    const item = await prisma.message.update({
      where: { id: req.params.id },
      data: { starred },
    });
    res.json({ item });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/messages/:id — admin
router.delete("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    await prisma.message.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
