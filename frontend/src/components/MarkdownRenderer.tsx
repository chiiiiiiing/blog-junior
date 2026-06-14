import { useMemo, type ComponentPropsWithoutRef } from "react";
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

/** 为 h1/h2/h3 自动生成 id，供 TOC 锚点跳转 */
function createHeading(level: number) {
  const tag = `h${level}` as keyof JSX.IntrinsicElements;
  return function Heading(props: ComponentPropsWithoutRef<"h1" | "h2" | "h3">) {
    const text = typeof props.children === "string" ? props.children : String(props.children ?? "");
    // @ts-ignore extract text from React children
    const id = slugify(extractText(props.children));
    const H = tag;
    return <H id={id} {...props} />;
  };
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

  const components = useMemo(() => ({
    h1: createHeading(1),
    h2: createHeading(2),
    h3: createHeading(3),
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
