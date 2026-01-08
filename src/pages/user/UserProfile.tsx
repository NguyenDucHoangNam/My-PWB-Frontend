import React from "react";
import { motion } from "framer-motion";
import {
  Home,
  Music,
  FolderKanban,
  User,
  MessageSquare,
  Shield,
  Facebook,
  Instagram,
  Twitter,
  Music2,
} from "lucide-react";
const sidebarVariants = {
  hidden: { x: -80, opacity: 0 },
  show: { x: 0, opacity: 1, transition: { duration: 0.4 } },
};

const navItemVariants = {
  hidden: { x: -20, opacity: 0 },
  show: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
};

const UserProfile: React.FC = () => {
  const navItems = [
    { label: "Overview", icon: Home, href: "#" },
    { label: "Music Samples", icon: Music, href: "#" },
    { label: "Projects", icon: FolderKanban, href: "#" },
  ];

  const accountItems = [
    { label: "Hồ sơ", icon: User, href: "#" },
    { label: "Feedback", icon: MessageSquare, href: "#" },
    { label: "Cài đặt bảo mật", icon: Shield, href: "#" },
  ];

  const socialItems = [
    {
      icon: Facebook,
      color: "hover:text-blue-500",
      href: "https://facebook.com",
    },
    {
      icon: Instagram,
      color: "hover:text-pink-500",
      href: "https://instagram.com",
    },
    { icon: Twitter, color: "hover:text-sky-400", href: "https://twitter.com" },
    {
      icon: Music2,
      color: "hover:text-orange-500",
      href: "https://soundcloud.com",
    },
  ];
  return (
    <div className="bg-[#0D1117] text-white min-h-screen flex">
      {/* SIDEBAR */}
      {/* SIDEBAR */}
      <motion.aside
        initial="hidden"
        animate="show"
        variants={sidebarVariants}
        className="w-64 bg-[#111827] p-6 flex flex-col justify-between shadow-xl"
      >
        <div>
          {/* Logo */}
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-extrabold mb-8 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
          >
            ProdMatch
          </motion.h1>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 text-gray-300">
            {navItems.map((item, i) => (
              <motion.a
                key={item.label}
                custom={i}
                variants={navItemVariants}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1F2937] hover:text-white transition-all duration-200"
                href={item.href}
              >
                <item.icon className="w-5 h-5" /> {item.label}
              </motion.a>
            ))}
          </nav>

          {/* Account section */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <p className="mb-3 text-sm text-gray-400 uppercase tracking-wide">
              Tài khoản
            </p>
            <div className="flex flex-col gap-2">
              {accountItems.map((item, i) => (
                <motion.a
                  key={item.label}
                  custom={i}
                  variants={navItemVariants}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1F2937] hover:text-white transition-all duration-200"
                  href={item.href}
                >
                  <item.icon className="w-5 h-5" /> {item.label}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Social icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4 mt-8 text-gray-400 justify-center"
        >
          {socialItems.map((s, i) => (
            <a
              key={i}
              href={s.href}
              target="_blank"
              className={`transition-transform duration-200 hover:scale-110 ${s.color}`}
            >
              <s.icon className="w-6 h-6" />
            </a>
          ))}
        </motion.div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Hồ sơ người dùng</h2>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-md border border-gray-600 hover:bg-[#1F2937] transition">
              Chỉnh sửa
            </button>
            <button className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 transition">
              Cài đặt bảo mật
            </button>
          </div>
        </div>
       
        {/* PROFILE HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src="https://i.pravatar.cc/100"
            alt="avatar"
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h3 className="text-xl font-semibold">Minh Nguyen</h3>
            <p className="text-gray-400">Nghệ sĩ độc lập • Hà Nội, Việt Nam</p>
            <div className="flex gap-2 mt-1 text-sm">
              <span className="bg-pink-700 px-2 py-0.5 rounded">Pop</span>
              <span className="bg-blue-700 px-2 py-0.5 rounded">Indie</span>
              <span className="bg-green-700 px-2 py-0.5 rounded">Lo-fi</span>
              <span className="bg-green-600 px-2 py-0.5 rounded">Verified</span>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-3 mb-6">
          <button className="px-4 py-2 bg-purple-600 rounded-md">
            Overview
          </button>
          <button className="px-4 py-2 bg-[#1F2937] rounded-md">
            Music Samples
          </button>
          <button className="px-4 py-2 bg-[#1F2937] rounded-md">
            Projects
          </button>
        </div>

        {/* GRID CONTENT */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* LEFT CONTENT */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {/* GIỚI THIỆU */}
            <div className="bg-[#111827] p-6 rounded-lg border border-gray-700">
              <h4 className="font-semibold mb-3">Giới thiệu</h4>
              <p className="text-gray-300">
                Ca sĩ kiêm songwriter, đang tìm producer phù hợp để phát triển
                EP 5 bài. Ưu tiên âm thanh ấm, synth retro nhẹ.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm text-gray-300">
                <p>
                  <span className="font-medium">Thành viên từ:</span> 2023
                </p>
                <p>
                  <span className="font-medium">Ngân sách dự án:</span> $1,500 -
                  $3,000
                </p>
                <p>
                  <span className="font-medium">Liên hệ:</span>{" "}
                  minh.nguyen@example.com
                </p>
                <p>
                  <span className="font-medium">Mạng xã hội:</span> @minhmusic
                </p>
              </div>
            </div>

            {/* MẪU NHẠC */}
            <div className="bg-[#111827] p-6 rounded-lg border border-gray-700">
              <h4 className="font-semibold mb-3">Mẫu nhạc đã tải lên</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-[#1F2937] p-3 rounded-md">
                  <span>Demo: Midnight Drive</span>
                  <span className="text-sm text-gray-400">
                    100 BPM • A minor
                  </span>
                </div>
                <div className="flex justify-between items-center bg-[#1F2937] p-3 rounded-md">
                  <span>Demo: Summer Rain</span>
                  <span className="text-sm text-gray-400">
                    92 BPM • C major
                  </span>
                </div>
              </div>
            </div>

            {/* HOẠT ĐỘNG GẦN ĐÂY */}
            <div className="bg-[#111827] p-6 rounded-lg border border-gray-700">
              <h4 className="font-semibold mb-3">Hoạt động gần đây</h4>
              <ul className="space-y-2 text-gray-300">
                <li>❤️ Đã lưu Producer: EchoLake • 2 ngày trước</li>
                <li>📤 Gửi yêu cầu dự án cho EchoLake • 1 tuần trước</li>
              </ul>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="flex flex-col gap-6">
            {/* DỰ ÁN */}
            <div className="bg-[#111827] p-6 rounded-lg border border-gray-700">
              <h4 className="font-semibold mb-3">Dự án của tôi</h4>
              <div className="space-y-2 text-sm">
                <p>
                  EP 2025 • "City Lights"{" "}
                  <span className="text-gray-400">(Đang chờ phản hồi)</span>
                </p>
                <p>
                  Single • "Paper Boat"{" "}
                  <span className="text-gray-400">(Đang sản xuất)</span>
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="px-3 py-1 bg-purple-600 rounded-md">
                  + Tạo dự án
                </button>
                <button className="px-3 py-1 bg-[#1F2937] rounded-md">
                  Xem tất cả
                </button>
              </div>
            </div>

            {/* CÀI ĐẶT HỒ SƠ */}
            <div className="bg-[#111827] p-6 rounded-lg border border-gray-700">
              <h4 className="font-semibold mb-3">Cài đặt hồ sơ</h4>
              <div className="space-y-3 text-sm">
                <input
                  type="text"
                  placeholder="Tên hiển thị"
                  className="w-full bg-[#1F2937] px-3 py-2 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full bg-[#1F2937] px-3 py-2 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Thể loại ưa thích"
                  className="w-full bg-[#1F2937] px-3 py-2 rounded-md"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1 bg-purple-600 rounded-md">
                  Lưu thay đổi
                </button>
                <button className="px-3 py-1 bg-[#1F2937] rounded-md">
                  Hoàn tác
                </button>
              </div>
            </div>

            {/* BẢO MẬT */}
            <div className="bg-[#111827] p-6 rounded-lg border border-gray-700">
              <h4 className="font-semibold mb-3">Bảo mật & tài khoản</h4>
              <p className="text-sm text-gray-300 mb-3">
                Đổi mật khẩu yêu cầu nhập mật khẩu hiện tại (không dùng
                email/OTP).
              </p>
              <button className="px-4 py-2 bg-purple-600 rounded-md">
                Cài đặt bảo mật
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
