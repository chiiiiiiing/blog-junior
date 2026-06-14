import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import githubAuthRoutes from "./routes/github-auth";
import postRoutes from "./routes/posts";
import commentRoutes from "./routes/comments";
import likeRoutes from "./routes/likes";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

// 健康检查
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 路由注册
app.use("/api/auth", authRoutes);
app.use("/api/auth", githubAuthRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", commentRoutes);
app.use("/api", likeRoutes);

// 404 处理
app.use((_req, res) => {
  res.status(404).json({ error: "接口不存在" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

export default app;
