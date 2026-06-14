import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import type { Comment } from "../types";

interface CommentSectionProps {
  postId: number;
  comments: Comment[];
}

export default function CommentSection({ postId, comments: initialComments }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await api.post(`/posts/${postId}/comments`, { content: content.trim() });
      setComments((prev) => [res.data.comment, ...prev]);
      setContent("");
    } catch (err: any) {
      setError(err.response?.data?.error || "评论发表失败");
    } finally {
      setSubmitting(false);
    }
  }, [content, postId]);

  const handleDelete = useCallback(
    async (commentId: number) => {
      if (!confirm("确定删除这条评论吗？")) return;
      try {
        await api.delete(`/comments/${commentId}`);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch (err: any) {
        alert(err.response?.data?.error || "删除失败");
      }
    },
    []
  );

  return (
    <div className="max-w-2xl mx-auto mt-16">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        评论 ({comments.length})
      </h3>

      {/* 评论输入框 */}
      {user ? (
        <div className="mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的想法..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none text-sm transition-all"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || !content.trim()}
              className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {submitting ? "发表中..." : "发表评论"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl text-center text-sm text-gray-400">
          请<a href="/login" className="text-blue-600 mx-1 hover:underline">登录</a>后发表评论
        </div>
      )}

      {/* 评论列表 */}
      <div className="space-y-5">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold shrink-0">
              {comment.author.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {comment.author.username}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
              {/* 删除按钮 */}
              {(user?.id === comment.authorId || user?.role === "ADMIN") && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs text-gray-300 hover:text-red-400 mt-1 transition-colors cursor-pointer"
                >
                  删除
                </button>
              )}
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">暂无评论，来说两句吧</p>
        )}
      </div>
    </div>
  );
}
