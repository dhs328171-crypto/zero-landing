import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { adminRequired, type AuthedRequest } from "../middleware/auth.js";
import { parsePaging } from "../lib/paging.js";

const router = Router();

// ----------------------------------------------------------------------------
//  GET /api/testimonials
//  Query params:
//    page, limit      — pagination
//    q                — search name/role/text
//    rating           — filter by rating
//    all              — "true" => include unapproved (admin)
//    featured         — "true" => only featured
// ----------------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const { page, limit, skip } = parsePaging(req);
    const q = (req.query.q as string) || "";
    const includeAll = req.query.all === "true";

    const where: any = {};
    if (!includeAll) where.approved = true;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { role: { contains: q } },
        { text: { contains: q } },
        { company: { contains: q } },
      ];
    }
    if (req.query.rating) where.rating = Number(req.query.rating);
    if (req.query.featured === "true") where.featured = true;

    const [items, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.testimonial.count({ where }),
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

// POST /api/testimonials  — admin
router.post("/", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { name, role, company, rating, text, avatar, approved, featured } =
      req.body || {};
    if (!name || !text)
      return res.status(400).json({ error: "name و text مطلوبان" });
    const item = await prisma.testimonial.create({
      data: {
        name,
        role: role || "",
        company: company || null,
        rating: rating || 5,
        text,
        avatar: avatar || null,
        approved: approved !== false,
        featured: !!featured,
      },
    });
    res.json({ item });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/testimonials/:id  — admin
router.put("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    const { name, role, company, rating, text, avatar, approved, featured } =
      req.body || {};
    const item = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(company !== undefined && { company: company || null }),
        ...(rating !== undefined && { rating }),
        ...(text !== undefined && { text }),
        ...(avatar !== undefined && { avatar }),
        ...(approved !== undefined && { approved }),
        ...(featured !== undefined && { featured }),
      },
    });
    res.json({ item });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/testimonials/:id  — admin
router.delete("/:id", adminRequired, async (req: AuthedRequest, res) => {
  try {
    await prisma.testimonial.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
