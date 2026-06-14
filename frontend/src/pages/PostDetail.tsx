import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import MarkdownRenderer from "../components/MarkdownRenderer";
import LikeButton from "../components/LikeButton";
import CommentSection from "../components/CommentSection";
import type { Post } from "../types";

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError("");

    api
      .get(`/posts/${slug}`)
      .then((res) => setPost(res.data.post))
      .catch((err) => setError(err.response?.data?.error || "加载失败"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 bg-gray-100 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-6xl font-bold text-gray-200 mb-4">404</h2>
        <p className="text-gray-500 text-lg mb-8">{error || "文章不存在"}</p>
        <Link to="/" className="text-blue-600 hover:underline">← 回到首页</Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      {/* 返回链接 */}
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-8">
        ← 返回文章列表
      </Link>

      {/* 文章头部 */}
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
              {post.author.username[0].toUpperCase()}
            </div>
            <span className="text-gray-600 font-medium">{post.author.username}</span>
          </div>
          <span>·</span>
          <time>{new Date(post.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</time>
        </div>
      </header>

      {/* 文章正文 */}
      <MarkdownRenderer content={post.content} />

      {/* 分隔线 */}
      <hr className="my-12 border-gray-100" />

      {/* 点赞与互动 */}
      <div className="flex items-center justify-center gap-4">
        <LikeButton postId={post.id} initialLikesCount={post._count?.likes ?? 0} />
      </div>

      {/* 评论区域 */}
      <CommentSection postId={post.id} comments={post.comments ?? []} />
    </article>
  );
}
