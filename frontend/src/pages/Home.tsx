import { useState, useEffect } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import Pagination from "../components/Pagination";
import type { Post, PostsResponse } from "../types";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<PostsResponse>(`/posts?page=${page}&pageSize=10`)
      .then((res) => {
        setPosts(res.data.posts);
        setTotalPages(res.data.pagination.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* 页头 */}
      <header className="mb-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          chiiiiiiing's blog junior
        </h1>
        <p className="text-gray-500 text-lg">
          探索技术、代码与思想的边界
        </p>
      </header>

      {/* 文章列表 */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-8 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">暂无文章</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* 分页 */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
