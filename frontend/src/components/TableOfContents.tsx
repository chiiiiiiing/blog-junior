import { useMemo, useState, useEffect, useCallback } from "react";

interface TocItem {
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [activeText, setActiveText] = useState<string>("");

  const headings = useMemo(() => {
    const items: TocItem[] = [];
    const regex = /^(#{1,3})\s+(.+)$/gm;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      items.push({ text, level });
    }
    return items;
  }, [content]);

  const findHeadingEl = useCallback((text: string): HTMLElement | null => {
    const container = document.getElementById("article-content");
    if (!container) return null;
    const all = container.querySelectorAll("h1, h2, h3");
    for (const el of all) {
      if (el.textContent?.trim() === text) return el as HTMLElement;
    }
    return null;
  }, []);

  // 滚动高亮
  useEffect(() => {
    if (headings.length === 0) return;

    const onScroll = () => {
      for (let i = headings.length - 1; i >= 0; i--) {
        const el = findHeadingEl(headings[i].text);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveText(headings[i].text);
            return;
          }
        }
      }
      if (headings.length > 0) setActiveText(headings[0].text);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings, findHeadingEl]);

  if (headings.length === 0) return null;

  return (
    <nav className="toc">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        目录
      </h4>
      <ul className="space-y-1">
        {headings.map((h) => (
          <li
            key={h.text}
            style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
          >
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                const el = findHeadingEl(h.text);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActiveText(h.text);
                }
              }}
              className={`block text-sm py-0.5 border-l-2 pl-3 transition-all ${
                activeText === h.text
                  ? "border-blue-500 text-blue-600 font-medium"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
