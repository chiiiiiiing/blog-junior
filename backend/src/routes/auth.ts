import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signToken } from "../utils/jwt";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

const registerSchema = z.object({
  username: z.string().min(2, "用户名至少2个字符").max(30),
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少6个字符"),
});

const loginSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(1, "请输入密码"),
});

// POST /api/auth/register — 注册
router.post("/register", async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);

    // 检查用户名和邮箱是否已存在
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: body.username }, { email: body.email }],
      },
    });

    if (existing) {
      const field = existing.username === body.username ? "用户名" : "邮箱";
      res.status(409).json({ error: `${field}已被注册` });
      return;
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        passwordHash,
      },
    });

    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.status(201).json({
      message: "注册成功",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error("注册错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// POST /api/auth/login — 登录
router.post("/login", async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      res.status(401).json({ error: "邮箱或密码错误" });
      return;
    }

    if (!user.passwordHash) {
      res.status(401).json({ error: "该账号通过 GitHub 登录，未设置密码。请使用 GitHub 登录" });
      return;
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "邮箱或密码错误" });
      return;
    }

    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      message: "登录成功",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error("登录错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// GET /api/auth/me — 获取当前用户信息
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        githubId: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "用户不存在" });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error("获取用户信息错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

export default router;
