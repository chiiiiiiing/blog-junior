import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

const commentSchema = z.object({
  content: z.string().min(1, "评论内容不能为空").max(2000, "评论内容不能超过2000字"),
});

// POST /api/posts/:id/comments — 发表评论
router.post("/posts/:id/comments", requireAuth, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      res.status(400).json({ error: "无效的文章 ID" });
      return;
    }

    // 检查文章是否存在
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      res.status(404).json({ error: "文章不存在" });
      return;
    }

    const body = commentSchema.parse(req.body);

    const comment = await prisma.comment.create({
      data: {
        content: body.content,
        postId,
        authorId: req.user!.userId,
      },
      include: {
        author: {
          select: { id: true, username: true },
        },
      },
    });

    res.status(201).json({ comment });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error("创建评论错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// DELETE /api/comments/:id — 删除评论（评论者本人或管理员）
router.delete("/comments/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.id);
    if (isNaN(commentId)) {
      res.status(400).json({ error: "无效的评论 ID" });
      return;
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      res.status(404).json({ error: "评论不存在" });
      return;
    }

    // 只有评论者本人或管理员可以删除
    if (comment.authorId !== req.user!.userId && req.user!.role !== "ADMIN") {
      res.status(403).json({ error: "无权删除此评论" });
      return;
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ message: "评论已删除" });
  } catch (err) {
    console.error("删除评论错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

export default router;
