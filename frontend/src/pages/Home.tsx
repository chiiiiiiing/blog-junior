import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import Blogroll from "../components/Blogroll";
import type { Post, Tag, PostsResponse, TagsResponse } from "../types";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  const search = searchParams.get("search") || "";
  const selectedTag = searchParams.get("tag") || "";

  // 加载标签列表
  useEffect(() => {
    api.get<TagsResponse>("/tags").then((res) => setAllTags(res.data.tags)).catch(() => {});
  }, []);

  // debounce search: 更新 URL 参数
  const handleSearchChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.delete("page"); // 搜索时回到第一页
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  // 标签过滤
  const handleTagClick = useCallback((tag: Tag) => {
    const params = new URLSearchParams(searchParams);
    if (selectedTag === tag.slug) {
      params.delete("tag");
    } else {
      params.set("tag", tag.slug);
    }
    params.delete("page");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams, selectedTag]);

  const handleTagClear = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("tag");
    params.delete("page");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  // 加载文章列表
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", "10");
    if (search) params.set("search", search);
    if (selectedTag) params.set("tag", selectedTag);

    api
      .get<PostsResponse>(`/posts?${params.toString()}`)
      .then((res) => {
        setPosts(res.data.posts);
        setTotalPages(res.data.pagination.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, selectedTag]);

  // URL tag 参数变化时重置页码
  useEffect(() => {
    setPage(1);
  }, [search, selectedTag]);

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

      {/* 搜索 + 标签过滤 */}
      <SearchBar
        value={search}
        onChange={handleSearchChange}
        selectedTag={selectedTag || null}
        onTagClear={handleTagClear}
        tags={allTags}
        onTagClick={handleTagClick}
      />

      {/* 搜索结果提示 */}
      {search && (
        <p className="text-sm text-gray-400 mb-6">
          搜索「{search}」的结果：{totalPages === 0 ? 0 : (page - 1) * 10 + posts.length} 篇
        </p>
      )}

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
          <p className="text-gray-400 text-lg">
            {search || selectedTag ? "未找到匹配的文章" : "暂无文章"}
          </p>
          {(search || selectedTag) && (
            <button
              onClick={() => setSearchParams({})}
              className="mt-3 text-blue-600 text-sm hover:underline cursor-pointer"
            >
              清除筛选条件
            </button>
          )}
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

      {/* 友链 */}
      <Blogroll />
    </div>
  );
}
