import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { signToken } from "../utils/jwt";

const router = Router();
const prisma = new PrismaClient();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || "http://localhost:3001/api/auth/github/callback";

// GET /api/auth/github — 跳转到 GitHub 授权页
router.get("/github", (_req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID || "";
  if (!clientId) {
    res.status(500).json({ error: "GitHub OAuth 未配置，请设置 GITHUB_CLIENT_ID 环境变量" });
    return;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: process.env.GITHUB_CALLBACK_URL || "",
    scope: "user:email",
    state: Math.random().toString(36).substring(2),
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

// GET /api/auth/github/callback — GitHub 回调处理
router.get("/github/callback", async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    res.status(400).send("<h3>授权失败：缺少 code 参数</h3>");
    return;
  }

  try {
    // 1. 用 code 换取 access_token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID || "",
        client_secret: process.env.GITHUB_CLIENT_SECRET || "",
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL || "",
      }),
    });

    const tokenData = await tokenRes.json() as any;
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      res.status(401).send("<h3>授权失败：无法获取 access_token</h3>");
      return;
    }

    // 2. 用 access_token 获取用户信息
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "blog-xlab",
      },
    });

    const githubUser = await userRes.json() as any;

    // 3. 获取邮箱（可能为 null，GitHub 允许隐藏邮箱）
    let email = githubUser.email;
    if (!email) {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "blog-xlab",
        },
      });
      const emails = await emailsRes.json() as any[];
      const primary = emails.find((e: any) => e.primary);
      email = primary?.email || `${githubUser.login}@github.user`;
    }

    // 4. 查找或创建用户
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ githubId: String(githubUser.id) }, { email }],
      },
    });

    if (user) {
      // 已有用户：更新 githubId 和 avatar（如果之前是通过邮箱注册的）
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          githubId: String(githubUser.id),
          avatar: user.avatar || githubUser.avatar_url,
        },
      });
    } else {
      // 新用户：通过 GitHub 注册
      const username = githubUser.login + (Math.random() > 0.5 ? "" : String(Math.floor(Math.random() * 1000)));
      const uniqueUsername = await ensureUniqueUsername(username);

      user = await prisma.user.create({
        data: {
          username: uniqueUsername,
          email,
          githubId: String(githubUser.id),
          avatar: githubUser.avatar_url,
          role: "USER",
        },
      });
    }

    // 5. 签发 JWT
    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // 6. 重定向到前端，URL 中携带 token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/github-callback?token=${token}`);
  } catch (err) {
    console.error("GitHub OAuth 错误:", err);
    res.status(500).send("<h3>服务器错误，请稍后重试</h3>");
  }
});

/** 确保用户名唯一 */
async function ensureUniqueUsername(base: string): Promise<string> {
  let username = base;
  let exists = await prisma.user.findUnique({ where: { username } });
  let attempts = 0;

  while (exists && attempts < 10) {
    username = `${base}${Math.floor(Math.random() * 10000)}`;
    exists = await prisma.user.findUnique({ where: { username } });
    attempts++;
  }

  return username;
}

export default router;
