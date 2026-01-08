import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut } from "lucide-react";
import toast from "react-hot-toast";

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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
    navigate("/login");
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Avatar */}
      <button
        className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 
                   flex items-center justify-center text-white font-bold 
                   shadow-md hover:scale-105 transition-transform"
      >
        {user?.name?.charAt(0).toUpperCase() ||
          user?.email.charAt(0).toUpperCase()}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-52 bg-dark-surface border border-border-color 
                       rounded-xl shadow-lg overflow-hidden z-50 backdrop-blur-sm"
          >
            <button
              onClick={() => navigate("/userProfile")}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-text-primary 
                         hover:bg-purple-500/20 transition-colors"
            >
              <User size={16} /> Xem hồ sơ
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 
                         hover:bg-red-500/20 transition-colors"
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
