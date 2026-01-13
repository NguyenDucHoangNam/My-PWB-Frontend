import React, { useEffect, useRef } from "react";
import {
  Instagram,
  Twitter,
  Youtube,
  Github,
  Music,
} from "lucide-react";
import gsap from "gsap";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sao nhấp nháy nhẹ nhàng
    const stars = footerRef.current?.querySelectorAll(".star");
    stars?.forEach((star) => {
      gsap.to(star, {
        opacity: Math.random() * 0.7 + 0.3,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: Math.random() * 2,
      });
    });

    // Floating effect cho search box
    gsap.to(".footer-search", {
      y: -8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      duration: 3,
    });
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden text-white bg-gradient-to-b from-[#0a0226] via-[#120035] to-[#1a0033] border-t border-purple-800/30 z-0"
    >
      {/* 🌟 Nền sao */}
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="star absolute rounded-full bg-white/80"
          style={{
            width: `${Math.random() * 3}px`,
            height: `${Math.random() * 3}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.6,
            filter: "blur(1px)",
          }}
        ></div>
      ))}

      {/* 💫 Hiệu ứng ánh sáng quét */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-[moveLight_10s_linear_infinite]"></div>

      <style>
        {`
          @keyframes moveLight {
            0% { transform: translateX(-50%); opacity: 0.2; }
            50% { transform: translateX(50%); opacity: 0.5; }
            100% { transform: translateX(-50%); opacity: 0.2; }
          }
          @keyframes wavePulse {
            0% {
              transform: scale(0.4);
              opacity: 0.6;
            }
            100% {
              transform: scale(2.5);
              opacity: 0;
            }
          }
        `}
      </style>

      {/* Nội dung chính */}
      <div className="relative z-10 px-8 py-16 grid md:grid-cols-4 gap-12">
        {/* Logo & Search */}
        <div className="relative">
          {/* 🌌 Sóng âm quanh logo */}
          <div className="absolute -top-2 -left-2 w-14 h-14 flex items-center justify-center">
            <div className="absolute w-10 h-10 rounded-full border border-purple-500/40 animate-[wavePulse_3s_ease-out_infinite]" />
            <div className="absolute w-10 h-10 rounded-full border border-pink-400/30 animate-[wavePulse_3s_ease-out_infinite_1.5s]" />
          </div>

          <div className="flex items-center gap-2 mb-4 relative z-10">
            <Music className="w-7 h-7 text-purple-400 animate-pulse drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ProdMatch
            </h2>
          </div>

          <p className="text-sm text-gray-300/80 leading-relaxed mb-5">
            Kết nối nghệ sĩ với producer giữa không gian âm nhạc bao la.
            Khám phá thể loại, ngân sách và Sound-Alike như du hành giữa các hành tinh âm thanh.
          </p>

        </div>

        {/* Cột thông tin */}
        {[
          {
            title: "Hệ sao",
            items: ["Tìm Producer", "Hợp đồng", "Cột mốc", "Thanh toán"],
          },
          {
            title: "Tài nguyên",
            items: ["Hướng dẫn", "FAQ", "Blog", "Trung tâm trợ giúp"],
          },
          {
            title: "Phi hành đoàn",
            items: ["Về chúng tôi", "Tuyển dụng", "Điều khoản", "Riêng tư"],
          },
        ].map((col, i) => (
          <div key={i}>
            <h3 className="font-semibold text-purple-300 mb-4 text-lg">
              {col.title}
            </h3>
            <ul className="space-y-2 text-sm">
              {col.items.map((item) => (
                <li
                  key={item}
                  className="relative group text-gray-300 hover:text-purple-300 cursor-pointer"
                >
                  <span>{item}</span>
                  <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Dòng cuối */}
      <div className="border-t border-purple-800/30 px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400 relative z-10">
        <div className="flex gap-4">
          <span className="px-2 py-1 rounded-md bg-purple-900/40 hover:bg-purple-600/60 cursor-pointer transition">
            VN
          </span>
          <span className="px-2 py-1 rounded-md bg-purple-900/40 hover:bg-purple-600/60 cursor-pointer transition">
            USD
          </span>
        </div>

        <div className="flex gap-5">
          {[Instagram, Twitter, Youtube, Github].map((Icon, i) => (
            <motion.a
              key={i}
              href="#"
              whileHover={{ scale: 1.3, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 250 }}
              className="hover:text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.4)]"
            >
              <Icon className="w-5 h-5" />
            </motion.a>
          ))}
        </div>
      </div>

      {/* Hiệu ứng ánh sáng phản chiếu */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-purple-700/10 to-transparent blur-2xl"></div>
    </footer>
  );
};

export default Footer;
