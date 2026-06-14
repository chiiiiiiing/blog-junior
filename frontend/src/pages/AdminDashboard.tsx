import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import type { Post } from "../types";

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // 路由守卫
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/login");
    }
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    api
      .get("/posts/admin/all")
      .then((res) => setPosts(res.data.posts))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`确定删除「${title}」吗？此操作不可撤销。`)) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || "删除失败");
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
          <p className="text-sm text-gray-400 mt-1">管理员：{user?.username}</p>
        </div>
        <Link
          to="/admin/edit/new"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          + 新建文章
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">暂无文章</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-3 font-medium">标题</th>
                <th className="text-left px-6 py-3 font-medium">状态</th>
                <th className="text-left px-6 py-3 font-medium">评论</th>
                <th className="text-left px-6 py-3 font-medium">点赞</th>
                <th className="text-left px-6 py-3 font-medium">日期</th>
                <th className="text-right px-6 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900 truncate max-w-xs block">
                      {post.title}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        post.published
                          ? "bg-green-50 text-green-600"
                          : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {post.published ? "已发布" : "草稿"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{post._count?.comments ?? 0}</td>
                  <td className="px-6 py-4 text-gray-500">{post._count?.likes ?? 0}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(post.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/edit/${post.id}`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="text-red-400 hover:text-red-600 text-xs transition-colors cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to="/" className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
          ← 返回前台首页
        </Link>
      </div>
    </div>
  );
}
