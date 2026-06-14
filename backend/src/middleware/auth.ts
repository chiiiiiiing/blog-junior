import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * 必须登录中间件 — 验证 JWT Token
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "未登录，请先登录" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token 无效或已过期，请重新登录" });
  }
}

/**
 * 可选登录中间件 — 有 Token 就解析，没有也放行
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      req.user = verifyToken(token);
    } catch {
      // Token 无效，忽略
    }
  }

  next();
}

/**
 * 管理员权限中间件 — 必须在 requireAuth 之后使用
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== "ADMIN") {
    res.status(403).json({ error: "权限不足，仅管理员可操作" });
    return;
  }
  next();
}
