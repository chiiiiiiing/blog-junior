import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

interface LikeButtonProps {
  postId: number;
  initialLikesCount: number;
}

export default function LikeButton({ postId, initialLikesCount }: LikeButtonProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikesCount);
  const [animating, setAnimating] = useState(false);

  // 加载点赞状态
  useEffect(() => {
    if (!user) return;
    api
      .get(`/posts/${postId}/like-status`)
      .then((res) => {
        setLiked(res.data.liked);
        setCount(res.data.likesCount);
      })
      .catch(() => {});
  }, [postId, user]);

  const handleToggle = useCallback(async () => {
    if (!user) return;

    // Optimistic UI: 立即更新
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    try {
      const res = await api.post(`/posts/${postId}/like`);
      setLiked(res.data.liked);
      setCount(res.data.likesCount);
    } catch {
      // 失败时回滚
      setLiked((prev) => !prev);
      setCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  }, [postId, liked, user]);

  return (
    <button
      onClick={handleToggle}
      disabled={!user}
      title={user ? (liked ? "取消点赞" : "点赞") : "请登录后点赞"}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-200 cursor-pointer ${
        liked
          ? "bg-red-50 border-red-200 text-red-500"
          : "bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-400"
      } ${animating ? "scale-110" : "scale-100"} ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <svg
        className={`w-4 h-4 transition-transform duration-300 ${animating ? "scale-125" : ""}`}
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className={animating ? "animate-bounce" : ""}>{count}</span>
    </button>
  );
}
