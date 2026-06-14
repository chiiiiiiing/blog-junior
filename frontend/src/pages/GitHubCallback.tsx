import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/axios";

export default function GitHubCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("授权失败：未收到登录凭证");
      return;
    }

    // 保存 token 并获取用户信息
    localStorage.setItem("token", token);

    api
      .get("/auth/me")
      .then((res) => {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        // 刷新页面以触发 AuthContext 重新读取
        window.location.href = "/";
      })
      .catch(() => {
        setError("获取用户信息失败，请重试");
        localStorage.removeItem("token");
      });
  }, [searchParams, navigate, user]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😿</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">登录失败</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <a href="/login" className="text-blue-600 hover:underline text-sm">
            ← 返回登录页
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">正在登录...</h2>
        <p className="text-gray-400 text-sm">通过 GitHub 验证中</p>
      </div>
    </div>
  );
}
