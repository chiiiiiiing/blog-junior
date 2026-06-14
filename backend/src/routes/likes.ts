import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// POST /api/posts/:id/like — 点赞/取消点赞切换
router.post("/posts/:id/like", requireAuth, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      res.status(400).json({ error: "无效的文章 ID" });
      return;
    }

    const userId = req.user!.userId;

    // 检查文章是否存在
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      res.status(404).json({ error: "文章不存在" });
      return;
    }

    // 查找已有的点赞
    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      // 已点赞 → 取消点赞
      await prisma.like.delete({ where: { id: existing.id } });
      const count = await prisma.like.count({ where: { postId } });
      res.json({ liked: false, likesCount: count });
    } else {
      // 未点赞 → 点赞
      await prisma.like.create({ data: { userId, postId } });
      const count = await prisma.like.count({ where: { postId } });
      res.json({ liked: true, likesCount: count });
    }
  } catch (err) {
    console.error("点赞操作错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// GET /api/posts/:id/like-status — 检查当前用户是否已点赞
router.get("/posts/:id/like-status", requireAuth, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      res.status(400).json({ error: "无效的文章 ID" });
      return;
    }

    const userId = req.user!.userId;

    const like = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    const likesCount = await prisma.like.count({ where: { postId } });

    res.json({
      liked: !!like,
      likesCount,
    });
  } catch (err) {
    console.error("获取点赞状态错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

export default router;
