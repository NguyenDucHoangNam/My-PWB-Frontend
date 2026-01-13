import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  HelpCircle,
  Package,
  Wallet,
  Receipt,
  Home, // Thêm icon Home
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../../component/useTheme";

// Thêm mục "Về trang chủ" vào đầu menuItems (hoặc để riêng biệt, tôi chọn cách thêm vào đây để đơn giản)
const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboardAdmin" },
  { name: "Người dùng", icon: Users, path: "/usersManagement" },
  { name: "Hỗ trợ & Khiếu nại", icon: HelpCircle, path: "/supportAdmin" },
  { name: "Gói dịch vụ Producer", icon: Package, path: "/producerPackages" },
  { name: "Thuế & kê khai", icon: Receipt, path: "/taxAdmin" },
  { name: "Lịch sử rút tiền", icon: Wallet, path: "/withdrawalsMoney" },
  { name: "Hướng dẫn người dùng", icon: Users, path: "/userGuides" },
];

export default function SidebarAdmin() {
  const { isDark } = useTheme();
  const location = useLocation();

  const isHomepage = location.pathname === "/"; // Check xem có đang ở trang chủ không

  return (
    <aside
      className={`w-64 h-screen fixed left-0 top-0 z-40 flex flex-col pt-16 border-r transition-all duration-500 
        ${
          isDark
            ? "bg-gray-900/30 border-gray-700/30 text-white"
            : "bg-gray-100 border-gray-300/30 text-gray-700"
        }`}
    >
      {/* Ánh sáng nền di chuyển */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-pink-500/30 via-purple-600/20 to-blue-400/20 blur-3xl"
        animate={{ x: [0, 50, -50, 0], y: [0, 30, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Danh sách menu */}
      <nav className="relative z-10 flex-1 px-5 py-3 space-y-2">
        {/* === Nút Về Trang Chủ Đã Được Tạo Kiểu === */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="pb-2" // Thêm padding bottom để cách ly
        >
          <Link
            to="/"
            className={`group flex items-center gap-3 px-5 py-3 rounded-xl font-medium text-sm transition-all border-2
              ${
                isDark
                  ? "text-yellow-300 border-yellow-500/50 hover:bg-yellow-500/10 hover:border-yellow-500/80"
                  : "text-gray-800 border-yellow-500/70 hover:bg-yellow-500/20 hover:border-yellow-500"
              }
            `}
          >
            <motion.div
              className={`p-2 rounded-lg ${
                isDark ? "bg-yellow-500/20" : "bg-yellow-500/30"
              } text-yellow-500`}
              animate={{ rotate: isHomepage ? [0, 5, -5, 0] : 0 }} // Hiệu ứng lắc nhẹ nếu đang ở trang chủ
              transition={{ duration: 1, repeat: isHomepage ? Infinity : 0 }}
            >
              <Home size={20} />
            </motion.div>

            <span className="transition-colors font-bold">Về trang chủ</span>
          </Link>
        </motion.div>

        <hr
          className={`my-4 ${
            isDark ? "border-purple-800/40" : "border-pink-300/30"
          }`}
        />

        {/* Danh sách menu Admin */}
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.name}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Link
                to={item.path}
                className={`group flex items-center gap-3 px-5 py-3 rounded-xl font-medium text-sm transition-all
                  ${
                    isActive
                      ? "bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                      : isDark
                      ? "text-gray-300 hover:text-white hover:bg-pink-600/20"
                      : "text-gray-800 hover:text-white hover:bg-pink-500/40"
                  }
                `}
              >
                <motion.div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? "bg-white/20 text-yellow-300"
                      : "group-hover:text-yellow-200"
                  }`}
                  animate={{
                    rotate: isActive ? [0, 15, -15, 0] : 0,
                  }}
                  transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                >
                  <Icon size={20} />
                </motion.div>

                <span
                  className={`transition-colors ${
                    isActive ? "text-white" : "group-hover:text-white"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <motion.div
        className={`relative z-10 text-xs text-center py-4 border-t
          ${
            isDark
              ? "text-gray-400 border-purple-800/40"
              : "text-gray-700 border-pink-300/30"
          }
        `}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        © 2025 Phi Hành Gia Âm Nhạc 🌌
      </motion.div>
    </aside>
  );
}
