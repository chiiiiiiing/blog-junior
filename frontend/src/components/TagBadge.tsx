import type { Tag } from "../types";

interface TagBadgeProps {
  tag: Tag;
  onClick?: (tag: Tag) => void;
  active?: boolean;
}

export default function TagBadge({ tag, onClick, active }: TagBadgeProps) {
  return (
    <span
      onClick={onClick ? (e) => { e.preventDefault(); onClick(tag); } : undefined}
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      {tag.name}
    </span>
  );
}
