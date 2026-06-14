import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight hover:text-blue-600 transition-colors">
          chiiiiiiing's blog junior
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {isAdmin && (
            <Link to="/admin/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              管理后台
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-7 h-7 rounded-full border border-gray-200" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                  {user.username[0].toUpperCase()}
                </span>
              )}
              <span className="text-gray-500 text-sm">
                <span className="font-medium text-gray-700">{user.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                退出
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                登录
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 transition-colors shadow-sm"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
