import { Link } from "react-router-dom";
import type { Post } from "../types";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const date = new Date(post.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden">
      <Link to={`/post/${post.slug}`} className="block p-8">
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span>{date}</span>
          <span>·</span>
          <span>{post.author.username}</span>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-snug">
          {post.title}
        </h2>

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {post._count?.comments ?? 0} 评论
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {post._count?.likes ?? 0} 赞
          </span>
        </div>
      </Link>
    </article>
  );
}
