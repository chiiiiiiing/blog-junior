import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GitHubCallback from "./pages/GitHubCallback";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEditPost from "./pages/AdminEditPost";

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/github-callback" element={<GitHubCallback />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/edit/:id" element={<AdminEditPost />} />
        </Routes>
      </main>
      <footer className="border-t border-gray-100 py-8 mt-20">
        <p className="text-center text-xs text-gray-300">
          © {new Date().getFullYear()} chiiiiiiing's blog junior · 用 ❤️ 和 TypeScript 构建
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
