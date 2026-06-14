import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // 预处理：修复双反斜杠转义（seed 中的 \\ 转为正确的 \）
  const fixedContent = useMemo(() => {
    return content
      .replace(/\\\\/g, "\\")
      .replace(/\\begin\{/g, "\\begin{")
      .replace(/\\end\{/g, "\\end{")
      .replace(/\\text\{/g, "\\text{")
      .replace(/\\log/g, "\\log")
      .replace(/\\cdot/g, "\\cdot");
  }, [content]);

  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
      >
        {fixedContent}
      </ReactMarkdown>
    </div>
  );
}
