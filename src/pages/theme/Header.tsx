import React, { useEffect, useState } from "react";
import { Bell, ChevronDown, FolderKanban, Moon, Sun } from "lucide-react";
import { FaRankingStar } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useTheme } from "../../component/useTheme";
import { useAuth } from "../../contexts/AuthContext";
import UserMenu from "../userMenu";
import { div } from "framer-motion/client";

// Component Dropdown dành riêng cho "Tính năng"
const FeatureDropdown = () => {
  const [open, setOpen] = useState(false);

  // Dữ liệu cho các mục trong dropdown
  const features = [
    {
      icon: FaRankingStar,
      text: "Hợp tác & Phản hồi",
      path: "/collab-request",
      description: "Review và phê duyệt dự án dễ dàng.",
    },
    {
      icon: FolderKanban,
      text: "Quản lý File an toàn",
      path: "/listProducer",
      description: "Lưu trữ và chia sẻ tệp tin an toàn.",
    },
    {
      icon: FolderKanban,
      text: "Quản lý Dự án",
      path: "/listProducer",
      description: "Sắp xếp và theo dõi tiến độ công việc.",
    },
    {
      icon: FolderKanban,
      text: "Hợp đồng & Thanh toán",
      path: "/listProducer",
      description: "Tạo hợp đồng và thanh toán trực tuyến.",
    },
    {
      icon: FolderKanban,
      text: "Giao tiếp",
      path: "/listProducer",
      description: "Trò chuyện và kết nối với đối tác.",
    },
    {
      icon: FolderKanban,
      text: "Bảo mật",
      path: "/listProducer",
      description: "Bảo vệ dữ liệu và thông tin cá nhân.",
    },
  ];

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="flex items-center gap-1 px-2 py-1 rounded-md hover:text-purple-400 transition">
        Tính năng
        <ChevronDown className="w-4 h-4 transition-transform duration-200" />
      </button>

      <div
        className={`absolute left-1/2 -translate-x-1/2 mt-2 p-4 w-fit rounded-3xl 
          bg-white/90 dark:bg-zinc-800/90 shadow-xl backdrop-blur-md z-50 transition-all duration-300
          ${
            open
              ? "opacity-100 visible scale-100"
              : "opacity-0 invisible scale-95"
          }`}
      >
        <div className="flex gap-6">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.path}
                className="flex flex-col items-center p-4 rounded-xl text-center
                           hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
              >
                {Icon && (
                  <div className="mb-2 p-2 rounded-full bg-purple-100 dark:bg-purple-500/30">
                    <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {item.text}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ... giữ nguyên các imports khác của Header

const Header: React.FC = () => {
  // ... giữ nguyên code useState, useEffect, và các hàm toggle
  const { isDark, setTheme } = useTheme();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();
  // const toggleNotif = () => {
  //   setIsNotifOpen((prev) => !prev);
  // };
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b
    ${
      scrolled
        ? "bg-white/90 dark:bg-[rgb(var(--surface))] border-gray-200 dark:border-[rgb(var(--border))] shadow-md backdrop-blur-md"
        : "bg-gradient-to-br from-white/10 via-purple-500/10 to-pink-500/10 dark:from-[#0f172a]/40 dark:via-[#1e1b4b]/40 dark:to-[#0f172a]/40 border-transparent"
    }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 text-xl font-bold text-gray-900 dark:text-[rgb(var(--text))] tracking-wide">
            <Link to="/">ProdMatch</Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-gray-700 dark:text-[rgb(var(--muted))] text-sm font-medium">
            {/* Sử dụng component mới tại đây */}
            <FeatureDropdown />

            <Link to="/instruct" className="hover:text-purple-400 transition">
              Hướng dẫn
            </Link>
            <Link
              to="/complaintList"
              className="hover:text-purple-400 transition"
            >
              Liên hệ
            </Link>
            <Link
              to="/listProducer"
              className="hover:text-purple-400 transition"
            >
              Tìm kiếm
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* ... Giữ nguyên các button khác */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Notification */}
            <div
              className="relative"
              onMouseEnter={() => setIsNotifOpen(true)}
              onMouseLeave={() => setIsNotifOpen(false)}
            >
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-slideDown">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Bell className="w-6 h-6 text-purple-500" />
                      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        Thông báo
                      </h2>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      🚧 Tính năng thông báo đang được phát triển. Vui lòng quay
                      lại sau!
                    </p>
                  </div>
                </div>
              )}
            </div>
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <button className="  text-white hover:text-purple-700 transition">
                  <Link to={"login"}> Đăng nhập </Link>
                </button>
                <button className="px-7 py-2.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition">
                  <Link to={"/signup"}> Bắt đầu miễn phí </Link>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
