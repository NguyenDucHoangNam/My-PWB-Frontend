import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { User, Briefcase, Folder, Mail, LogOut, HelpCircle, LayoutDashboard, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import userService from "../services/userService";
// Permissions API removed

const UserMenu = () => {
  const { user, logout, userRole } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  // role đã được cung cấp bởi AuthContext từ JWT

  useEffect(() => {
    let isMounted = true;

    const fetchAvatar = async () => {
      try {
        const profile = await userService.getPersonalProfile();
        if (!isMounted) {
          return;
        }
        setAvatarUrl(profile.avatarUrl || null);
        setAvatarError(false);
      } catch (error) {
        console.error("Lỗi lấy avatar người dùng:", error);
      }
    };

    if (user?.email) {
      fetchAvatar();
    } else {
      setAvatarUrl(null);
      setAvatarError(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  const handleLogout = async () => {
    await logout();
    toast.success("🎉 Đăng xuất thành công! 👋", {
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
    navigate("/");
  };

  const menuItems = useMemo(() => {
    const items = [
      { label: "Xem hồ sơ", icon: <User size={18} />, action: () => navigate("/userProfile") },
      { label: "Portfolio", icon: <Briefcase size={18} />, action: () => navigate("/portfolio") },
      { label: "Quản lý dự án", icon: <Folder size={18} />, action: () => navigate("/projectManage") },
      { label: "Lời mời của tôi", icon: <Mail size={18} />, action: () => navigate("/myInvitations") },
      { label: "Tài chính", icon: <Wallet size={18} />, action: () => navigate("/finance") },
      { label: "Hỗ trợ", icon: <HelpCircle size={18} />, action: () => navigate("/myTickets") },
    ];

    if (userRole === "ADMIN") {
      items.unshift({
        label: "Dashboard Admin",
        icon: <LayoutDashboard size={18} />,
        action: () => navigate("/dashboardAdmin"),
      });
    }

    return items;
  }, [navigate, userRole]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Avatar */}
      <button
        type="button"
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg hover:scale-110 hover:shadow-2xl transition-transform duration-300 overflow-hidden border border-transparent ${avatarUrl && !avatarError ? "bg-gray-900 border-purple-400/60" : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"}`}
      >
        {avatarUrl && !avatarError ? (
          <img
            src={avatarUrl}
            alt="avatar người dùng"
            className="w-full h-full object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          (user?.name?.charAt(0).toUpperCase() ||
            user?.email?.charAt(0).toUpperCase() ||
            "U")
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-56 bg-white dark:bg-purple-900/80
                       rounded-xl shadow-xl overflow-hidden z-50 backdrop-blur-md"
          >
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="flex items-center gap-3 w-full px-5 py-3 text-sm font-medium 
                           text-gray-700 dark:text-gray-200 
                           hover:bg-purple-500/20 hover:text-purple-400 
                           transition-colors duration-200"
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-5 py-3 text-sm font-medium 
                         text-red-500 hover:bg-red-500/20 hover:text-red-400 
                         transition-colors duration-200"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
