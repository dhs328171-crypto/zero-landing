import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/stats — public summary counts
router.get("/", async (_req, res) => {
  try {
    const [projects, posts, testimonials, messages, users, media] =
      await Promise.all([
        prisma.project.count(),
        prisma.blogPost.count({ where: { published: true } }),
        prisma.testimonial.count({ where: { approved: true } }),
        prisma.message.count(),
        prisma.user.count(),
        prisma.media.count(),
      ]);
    res.json({
      projects,
      posts,
      testimonials,
      messages,
      users,
      media,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
