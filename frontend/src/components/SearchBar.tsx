import type { Tag } from "../types";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  selectedTag: string | null;
  onTagClear: () => void;
  tags: Tag[];
  onTagClick?: (tag: Tag) => void;
}

export default function SearchBar({ value, onChange, selectedTag, onTagClear, tags, onTagClick }: SearchBarProps) {
  return (
    <div className="mb-10 space-y-3">
      {/* 搜索框 */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="搜索文章..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-300"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* 标签过滤栏 */}
      {tags.length > 0 && (
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs text-gray-400 mr-1">标签：</span>
          {selectedTag && (
            <button
              onClick={onTagClear}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-white hover:bg-gray-600 transition-colors cursor-pointer"
            >
              ✕ 清除筛选
            </button>
          )}
          {tags.map((tag) => (
            <span
              key={tag.id}
              onClick={() => onTagClick?.(tag)}
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                selectedTag === tag.slug
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              }`}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
