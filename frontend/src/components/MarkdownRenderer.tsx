import { useMemo, createElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";

interface MarkdownRendererProps {
  content: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractText(children: unknown): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return extractText((children as { props: { children?: unknown } }).props.children);
  }
  return "";
}

/** 为 h1/h2/h3 自动生成 id，供 TOC 锚点跳转 */
function makeHeading(tag: "h1" | "h2" | "h3") {
  return function Heading({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) {
    const id = slugify(extractText(children));
    return createElement(tag, { id, ...props }, children as ReactNode);
  };
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const fixedContent = useMemo(() => {
    return content
      .replace(/\\\\/g, "\\")
      .replace(/\\begin\{/g, "\\begin{")
      .replace(/\\end\{/g, "\\end{")
      .replace(/\\text\{/g, "\\text{")
      .replace(/\\log/g, "\\log")
      .replace(/\\cdot/g, "\\cdot");
  }, [content]);

  const components = useMemo(() => ({
    h1: makeHeading("h1"),
    h2: makeHeading("h2"),
    h3: makeHeading("h3"),
  }), []);

  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
        components={components}
      >
        {fixedContent}
      </ReactMarkdown>
    </div>
  );
}
