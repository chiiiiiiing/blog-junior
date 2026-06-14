import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import multer from "multer";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// 配置文件上传（只接受 .md 文件，最大 5MB）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.toLowerCase().endsWith(".md");
    const mime = file.mimetype === "text/markdown" || file.mimetype === "text/plain" || file.mimetype === "text/x-markdown";
    if (ext || mime) {
      cb(null, true);
    } else {
      cb(new Error("仅支持 .md 格式的 Markdown 文件"));
    }
  },
});

const postSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  slug: z
    .string()
    .min(1, "Slug 不能为空")
    .regex(/^[a-z0-9-]+$/, "Slug 只能包含小写字母、数字和连字符"),
  content: z.string().min(1, "内容不能为空"),
  published: z.boolean().optional().default(false),
});

const postUpdateSchema = postSchema.partial();

// GET /api/posts — 文章列表（支持分页）
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string) || 10));
    const skip = (page - 1) * pageSize;

    const where = { published: true };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { id: true, username: true },
          },
          _count: {
            select: { comments: true, likes: true },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    res.json({
      posts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("获取文章列表错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// GET /api/posts/admin/all — 管理员获取所有文章（含未发布）
router.get("/admin/all", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, username: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    });

    res.json({ posts });
  } catch (err) {
    console.error("获取管理文章列表错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// GET /api/posts/:slugOrId — 文章详情（支持 slug 或 ID）
router.get("/:slugOrId", async (req: Request, res: Response) => {
  try {
    const param = req.params.slugOrId;
    const isId = /^\d+$/.test(param);

    const post = await prisma.post.findUnique({
      where: isId ? { id: parseInt(param) } : { slug: param },
      include: {
        author: {
          select: { id: true, username: true },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: { id: true, username: true },
            },
          },
        },
        _count: {
          select: { likes: true },
        },
      },
    });

    if (!post) {
      res.status(404).json({ error: "文章不存在" });
      return;
    }

    res.json({ post });
  } catch (err) {
    console.error("获取文章详情错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// POST /api/posts — 创建文章（仅管理员）
router.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const body = postSchema.parse(req.body);

    // 检查 slug 唯一性
    const existing = await prisma.post.findUnique({ where: { slug: body.slug } });
    if (existing) {
      res.status(409).json({ error: "该 Slug 已被使用" });
      return;
    }

    const post = await prisma.post.create({
      data: {
        ...body,
        authorId: req.user!.userId,
      },
      include: {
        author: { select: { id: true, username: true } },
      },
    });

    res.status(201).json({ post });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error("创建文章错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// POST /api/posts/upload-md — 上传 .md 文件并返回解析后的内容
router.post("/upload-md", requireAuth, requireAdmin, upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "请上传一个 .md 文件" });
      return;
    }

    const content = req.file.buffer.toString("utf-8");

    // 尝试从内容中提取标题（第一个 # 标题）
    let title = "";
    const match = content.match(/^#\s+(.+)$/m);
    if (match) {
      title = match[1].trim();
    }

    // 生成 slug
    let slug = "";
    if (title) {
      slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .trim()
        .replace(/^-+|-+$/g, "");
    }

    res.json({
      title,
      slug,
      content,
      filename: req.file.originalname,
      size: req.file.size,
    });
  } catch (err: any) {
    console.error("文件上传错误:", err);
    res.status(500).json({ error: err.message || "文件上传失败" });
  }
});

// PUT /api/posts/:id — 更新文章（仅管理员）
router.put("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "无效的文章 ID" });
      return;
    }

    const body = postUpdateSchema.parse(req.body);

    // 如果更新 slug，检查唯一性
    if (body.slug) {
      const existing = await prisma.post.findFirst({
        where: { slug: body.slug, NOT: { id } },
      });
      if (existing) {
        res.status(409).json({ error: "该 Slug 已被使用" });
        return;
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: body,
      include: {
        author: { select: { id: true, username: true } },
      },
    });

    res.json({ post });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error("更新文章错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// DELETE /api/posts/:id — 删除文章（仅管理员）
router.delete("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "无效的文章 ID" });
      return;
    }

    await prisma.post.delete({ where: { id } });
    res.json({ message: "文章已删除" });
  } catch (err) {
    console.error("删除文章错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

export default router;
