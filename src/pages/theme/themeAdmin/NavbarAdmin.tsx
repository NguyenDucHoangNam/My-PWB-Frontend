import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { NotificationBell } from "@/component/notification/NotificationBell";
import { NotificationPanel } from "@/component/notification/NotificationPanel";

export default function NavbarAdmin() {
  const [scrolled, setScrolled] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        // Nếu scroll > 10px
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("🎉   Đăng xuất thành công! 👋", {
      style: {
        borderRadius: "12px",
        background: "#1E1E2F",
        color: "#fff",
        padding: "12px 16px",
      },
      iconTheme: {
        primary: "#8b5cf6",
        secondary: "#fff",
      },
    });
    window.location.href = "/";
  };
  return (
    <div
      className={`h-14 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 border-b transition-colors duration-500
    ${
      scrolled
        ? "bg-gray-900/90 backdrop-blur-md border-gray-700"
        : "bg-transparent border-transparent"
    }
  `}
    >
      <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        Dashboard Admin
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-sm opacity-90">Xin chào, Admin 👋</span>
        {/* Notification Bell */}
        <NotificationBell />
        <button
          className="text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1.5 rounded-full shadow-md hover:opacity-90 transition"
          onClick={handleLogout}
        >
          Đăng xuất
        </button>
      </div>
      {/* Notification Panel */}
      <NotificationPanel />
    </div>
  );
}
