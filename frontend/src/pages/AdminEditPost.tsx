import { useState, useEffect, useCallback, useRef, type DragEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import MarkdownRenderer from "../components/MarkdownRenderer";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-+|-+$/g, "");
}

/** 从 Markdown 内容中提取标题（第一个 # 标题行） */
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

export default function AdminEditPost() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(!isNew);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 路由守卫
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/login");
    }
  }, [authLoading, isAdmin, navigate]);

  // 加载已有文章
  useEffect(() => {
    if (isNew) return;
    setPageLoading(true);
    api
      .get(`/posts/${id}`)
      .then((res) => {
        const p = res.data.post;
        setTitle(p.title);
        setSlug(p.slug);
        setContent(p.content);
        setPublished(p.published);
      })
      .catch(() => setError("加载文章失败"))
      .finally(() => setPageLoading(false));
  }, [id, isNew]);

  // 自动生成 slug
  const handleTitleChange = useCallback(
    (val: string) => {
      setTitle(val);
      if (isNew) {
        setSlug(generateSlug(val));
      }
    },
    [isNew]
  );

  const handleSubmit = async (status: "draft" | "publish") => {
    setError("");
    setSaving(true);

    const data = {
      title,
      slug,
      content,
      published: status === "publish",
    };

    try {
      if (isNew) {
        await api.post("/posts", data);
      } else {
        await api.put(`/posts/${id}`, data);
      }
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  /** 处理 .md 文件上传（前端 FileReader 读取 + 后端 API 兜底） */
  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".md")) {
        setError("仅支持 .md 格式的 Markdown 文件");
        return;
      }

      setUploading(true);
      setError("");

      try {
        // 优先通过后端 API 上传（可提取标题和 slug）
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post("/posts/upload-md", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const { title: extractedTitle, slug: extractedSlug, content: fileContent } = res.data;

        if (extractedTitle && isNew) {
          setTitle(extractedTitle);
          setSlug(extractedSlug || generateSlug(extractedTitle));
        }
        setContent(fileContent);
      } catch {
        // 后端 API 不可用时降级为前端 FileReader
        try {
          const text = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("文件读取失败"));
            reader.readAsText(file, "utf-8");
          });

          const extractedTitle = extractTitle(text);
          if (extractedTitle && isNew) {
            setTitle(extractedTitle);
            setSlug(generateSlug(extractedTitle));
          }
          setContent(text);
        } catch (readErr: any) {
          setError(readErr.message || "文件读取失败");
        }
      } finally {
        setUploading(false);
      }
    },
    [isNew]
  );

  /** 拖拽事件 */
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  /** 点击选择文件 */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // 重置 input 以允许重复上传同一文件
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [handleFile]
  );

  if (authLoading || !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center text-gray-400">
        加载中...
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 工具栏 */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
              ← 返回
            </Link>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="文章标题..."
              className="text-lg font-semibold text-gray-900 outline-none bg-transparent min-w-[300px] placeholder-gray-300"
            />
          </div>
          {!isNew && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${published ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
              {published ? "已发布" : "草稿"}
            </span>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSubmit("draft")}
              disabled={saving || !title.trim() || !content.trim()}
              className="px-4 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-all cursor-pointer"
            >
              存草稿
            </button>
            <button
              onClick={() => handleSubmit("publish")}
              disabled={saving || !title.trim() || !content.trim()}
              className="bg-blue-600 text-white px-5 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
            >
              {saving ? "保存中..." : "发布"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg inline-block">{error}</p>
        </div>
      )}

      {/* 双栏编辑器 */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 gap-6 h-[calc(100vh-9rem)]">
        {/* 编辑栏 */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Markdown 编辑</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="article-slug"
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-mono outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />

          {/* ===== 拖拽上传 .md 文件 ===== */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,text/markdown"
            onChange={handleFileChange}
            className="hidden"
          />
          {isNew && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <span className="animate-spin">⏳</span> 解析文件中...
                </div>
              ) : dragOver ? (
                <p className="text-sm text-blue-600 font-medium">📂 释放以上传 .md 文件</p>
              ) : (
                <div>
                  <p className="text-sm text-gray-500">
                    📄 <span className="text-blue-600 font-medium">点击选择</span> 或拖拽{" "}
                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">.md</code> 文件到此处
                  </p>
                  <p className="text-xs text-gray-300 mt-1">自动填充标题、Slug 和内容</p>
                </div>
              )}
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="开始用 Markdown 编写..."
            className="flex-1 w-full p-6 rounded-xl border border-gray-200 font-mono text-sm leading-relaxed resize-none outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* 预览栏 */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">实时预览</label>
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-8 overflow-y-auto">
            {content ? (
              <MarkdownRenderer content={content} />
            ) : (
              <p className="text-gray-300 text-center pt-20">预览区域</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
