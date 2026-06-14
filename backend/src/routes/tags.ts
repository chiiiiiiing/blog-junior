import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// GET /api/tags — 获取所有标签（含文章计数）
router.get("/", async (_req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
    res.json({ tags });
  } catch (err) {
    console.error("获取标签列表错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// POST /api/tags — 创建标签（仅管理员）
router.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "标签名不能为空" });
      return;
    }

    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await prisma.tag.findFirst({
      where: { OR: [{ name: name.trim() }, { slug }] },
    });
    if (existing) {
      res.status(409).json({ error: "标签已存在" });
      return;
    }

    const tag = await prisma.tag.create({
      data: { name: name.trim(), slug },
    });
    res.status(201).json({ tag });
  } catch (err) {
    console.error("创建标签错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// DELETE /api/tags/:id — 删除标签（仅管理员）
router.delete("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "无效的标签 ID" });
      return;
    }

    await prisma.tag.delete({ where: { id } });
    res.json({ message: "标签已删除" });
  } catch (err) {
    console.error("删除标签错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

export default router;
