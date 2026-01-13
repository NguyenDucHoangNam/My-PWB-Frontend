import React, { useEffect, useState } from "react";
import { ChevronDown, FolderKanban, MessageCircle } from "lucide-react";
import { FaRankingStar } from "react-icons/fa6";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import UserMenu from "../../userMenu";
import LogoComponent from "../../../component/logo/LogoComponent";
import { smoothScrollToElement } from "../../../utils/scrollUtils";
import { NotificationBell } from "../../../component/notification/NotificationBell";
import { NotificationPanel } from "../../../component/notification/NotificationPanel";

// ================= Message Button with Badge =================
const MessageButton = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleUnreadCountChanged = (event: CustomEvent) => {
      const { totalUnreadCount } = event.detail;
      setUnreadCount(totalUnreadCount || 0);
    };

    window.addEventListener('unreadCountChanged' as any, handleUnreadCountChanged);
    return () => window.removeEventListener('unreadCountChanged' as any, handleUnreadCountChanged);
  }, []);

  return (
    <button
      onClick={() => {
        window.dispatchEvent(new CustomEvent('openGlobalChatSidebar'));
      }}
      className="p-2 rounded-full hover:scale-110 hover:shadow-[0_0_15px_rgba(139,92,246,0.6)] transition-transform duration-300 relative"
      title="Tin nhắn"
    >
      <MessageCircle className="w-5 h-5 text-gray-300" />
      {/* Unread badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

// ================= Feature Dropdown =================
const FeatureDropdown = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation(); 
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  type FeatureItem = {
    icon: React.ComponentType<{ className?: string; size?: number }>;
    text: string;
    sectionId: string;
    description: string;
    type: "scroll" | "navigate";
    path?: string;
  };

  const features: FeatureItem[] = [
    {
      icon: FaRankingStar,
      text: "Khám phá Producer",
      sectionId: "explore-producer",
      description: "Tìm kiếm và khám phá producer tài năng.",
      type: "scroll" as const,
    },
    {
      icon: FolderKanban,
      text: "Hợp tác & Phản hồi",
      sectionId: "collaboration-feedback",
      description: "Review và phê duyệt dự án dễ dàng.",
      type: "scroll" as const,
    },
    {
      icon: FolderKanban,
      text: "Quản lý File an toàn",
      sectionId: "secure-file-management",
      description: "Lưu trữ và chia sẻ tệp tin an toàn.",
      type: "scroll" as const,
    },
    {
      icon: FolderKanban,
      text: "Quản lý Dự án",
      sectionId: "project-management",
      description: "Sắp xếp và theo dõi tiến độ công việc.",
      type: "scroll" as const,
    },
    {
      icon: FolderKanban,
      text: "Hợp đồng & Thanh toán",
      sectionId: "contracts-payments",
      description: "Tạo hợp đồng và thanh toán trực tuyến.",
      type: "scroll" as const,
    },
    {
      icon: FolderKanban,
      text: "Giao tiếp",
      sectionId: "communication",
      description: "Trò chuyện và kết nối với đối tác.",
      type: "scroll" as const,
    },
    {
      icon: FolderKanban,
      text: "Bảo mật",
      sectionId: "security",
      description: "Bảo vệ dữ liệu và thông tin cá nhân.",
      type: "scroll" as const,
    },
    {
      icon: FolderKanban,
      text: "Hỗ Trợ AI",
      sectionId: "ai-support",
      description: "Trợ lý AI thông minh hỗ trợ công việc.",
      type: "scroll" as const,
    },
  ];

  // Đóng dropdown khi rời Home để tránh hiển thị ở trang khác
  useEffect(() => {
    if (!isHome) {
      setOpen(false);
    }
  }, [isHome]);

  const goToHomeAndScroll = (sectionId: string) => {
    setOpen(false);

    // Nếu đang ở HomePage thì chỉ scroll
    if (isHome) {
      setTimeout(() => {
        smoothScrollToElement(sectionId, 100);
      }, 100);
    } else {
      navigate("/");
    }
  };
  
  const handleItemClick = (item: FeatureItem) => {
    setOpen(false);
    
    if (item.type === "scroll") {
      goToHomeAndScroll(item.sectionId);
    } else if (item.type === "navigate" && item.path) {
      navigate(item.path);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => isHome && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => {
          if (!isHome) {
            navigate("/");
            return;
          }
          setOpen((prev) => !prev);
        }}
        className="flex items-center gap-1 px-3 py-2 rounded-lg font-semibold text-gray-200 hover:text-purple-400 transition-colors duration-300"
      >
        Tính năng
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      <div
        className={`absolute left-1/2 -translate-x-1/2 mt-3 p-6 w-[600px] rounded-3xl 
        bg-white/10 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 shadow-2xl z-50
        transition-all duration-300 transform origin-top
        ${open ? "opacity-100 visible scale-100 translate-y-0" : "opacity-0 invisible scale-95 -translate-y-3"}`}
      >
        <div className="grid grid-cols-2 gap-4">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                className={`
                group relative flex flex-col gap-2 p-4 rounded-2xl
                bg-gradient-to-br from-[#3b0764]/40 via-[#9333ea]/40 to-[#ff49a3]/40
                shadow-[0_0_15px_rgba(147,51,234,0.3)]
                border border-transparent
                hover:border-purple-400/50
                hover:shadow-[0_0_25px_rgba(236,72,153,0.6)]
                transition-all duration-300 transform
                hover:scale-105
                animate-fadeIn
                text-left 
              `}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {Icon && (
                  <div className="p-2 w-fit rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-md group-hover:scale-125 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.7)] transition-transform duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-100 group-hover:text-purple-300 transition-colors duration-300">
                  {item.text}
                </span>
                <p className="text-xs text-gray-400 group-hover:text-gray-200 line-clamp-2 transition-colors duration-300">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

};

// ================= Header =================
const Header: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`header-cosmic fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b 
    ${scrolled
          ? "bg-[#0f0921] border-gray-700 shadow-[0_0_30px_rgba(255,255,255,0.1)] backdrop-blur-md"
          : "bg-gradient-to-r from-[#0a0f2a]/40 via-[#1b0c3b]/40 to-[#2c063c]/40 border-transparent"
        }`}
    >
      <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-[4.5rem]">
          {/* ===== Logo ===== */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 via-indigo-500 to-pink-500 shadow-[0_0_25px_rgba(147,51,234,0.6)] animate-spin-slow group-hover:scale-110 transition-transform duration-500">
              <LogoComponent />
              {/* Hiệu ứng glow sao nhỏ */}
              <span className="absolute top-0 left-0 w-1 h-1 bg-white rounded-full animate-pulse opacity-70"></span>
              <span className="absolute bottom-1 right-1 w-1 h-1 bg-white rounded-full animate-pulse delay-200"></span>
            </div>
            <span className="ml-2 text-2xl font-extrabold bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent tracking-tight group-hover:scale-105 transition-transform duration-300">
              Producer Workbench
            </span>
          </div>

          {/* ===== Navigation ===== */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium">
            <FeatureDropdown />
            {[
              {
                name: "Update Pro",
                to: "/proPackage",
                color: "from-purple-400 via-indigo-400 to-pink-400",
              },
              {
                name: "Liên hệ",
                to: "/aboutUs",
                color: "from-pink-400 via-red-400 to-purple-500",
              },
              {
                name: "Tìm kiếm",
                to: "/listProducer",
                color: "from-indigo-400 via-blue-400 to-purple-400",
              },
            ].map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className={`
        relative px-2 py-1 font-semibold text-gray-200
        transition-all duration-300
        group
      `}
              >
                {/* Text với gradient neon hover */}
                <span
                  className={`
                    text-white
          relative z-10
          bg-clip-text text-transparent
          transition-all duration-500
          group-hover:text-transparent
          group-hover:bg-gradient-to-r ${link.color}
          group-hover:animate-gradient-x
        `}
                >
                  {link.name}
                </span>

                {/* Glow effect */}
                <span
                  className={`
          absolute inset-0 rounded-md opacity-0
          bg-gradient-to-r ${link.color}
          blur-xl
          transition-opacity duration-300
          group-hover:opacity-50
          group-hover:animate-pulse
        `}
                ></span>

                {/* Underline neon moving */}
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-white rounded-full transition-all duration-500 group-hover:w-full group-hover:animate-pulse"></span>
              </Link>
            ))}
          </nav>

          {/* ===== Actions (theme + notification + auth) ===== */}
          <div className="flex items-center gap-4">

            {/* Notification */}
            {isAuthenticated && (
              <>
                <NotificationBell />
                <NotificationPanel />
              </>
            )}

            {/* Messages with unread badge */}
            {isAuthenticated && (
              <MessageButton />
            )}

            {/* Auth */}
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500 text-white font-semibold rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(236,72,153,0.7)] hover:scale-105 transition-transform duration-300"
                >
                  Bắt đầu miễn phí
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
