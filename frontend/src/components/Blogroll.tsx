const LINKS = [
  { name: "轩神的blog", url: "https://haplotes405.xyz", desc: "宇轩gg太强啦" },
  // 添加或修改友链：按上面格式新增对象即可
];

export default function Blogroll() {
  return (
    <div className="py-10 border-t border-gray-100">
      <h3 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
        友链
      </h3>
      <div className="max-w-3xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {LINKS.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
          >
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
              {link.name}
            </span>
            <span className="block text-xs text-gray-400 mt-0.5">{link.desc}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
