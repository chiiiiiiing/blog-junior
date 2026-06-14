import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";

export default function MarkdownRenderer({ content }: { content: string }) {
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
    <div className="prose" id="article-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
      >
        {fixedContent}
      </ReactMarkdown>
    </div>
  );
}
