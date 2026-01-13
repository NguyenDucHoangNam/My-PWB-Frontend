import React from "react";
import { Mail, Facebook } from "lucide-react";
import { motion } from "framer-motion";

// Giữ nguyên các import assets của bạn

import AnimatedBackground from "@/component/background/AnimatedBackground";
import MarqueeSection from "@/component/MarqueeSection";
import { ALL_GALLERY_IMAGES } from "@/component/teamAssets";
import ChristmasMagic from "@/component/christmas/ChristmasMagic";
import Tvu2 from "../assets/image/Phi-Hanh-Doan/Tvu2.webp";
import Tvu3 from "../assets/image/Phi-Hanh-Doan/Tvu3.webp";
import Minh3 from "../assets/image/Phi-Hanh-Doan/Minh3.webp";
import Minh4 from "../assets/image/Phi-Hanh-Doan/Minh4.webp";
import Minh5 from "../assets/image/Phi-Hanh-Doan/Minh5.webp";
import Nam1 from "../assets/image/Phi-Hanh-Doan/Nam1.webp";
import Nam3 from "../assets/image/Phi-Hanh-Doan/Nam3.webp";
import Nam4 from "../assets/image/Phi-Hanh-Doan/Nam4.webp";
import Dvu2 from "../assets/image/Phi-Hanh-Doan/Dvu2.webp";
import Dvu3 from "../assets/image/Phi-Hanh-Doan/Dvu3.webp";
import Quyen2 from "../assets/image/Phi-Hanh-Doan/Quyen2.webp";
import Quyen3 from "../assets/image/Phi-Hanh-Doan/Quyen3.webp";
import mentor1 from "../assets/image/Phi-Hanh-Doan/mentor1.webp";
import team1 from "../assets/image/Phi-Hanh-Doan/team1.webp";
import team9 from "../assets/image/Phi-Hanh-Doan/team9.webp";
import teamtruoc from "../assets/image/Phi-Hanh-Doan/teamtruoc_11zon.jpg";
import teamsau from "../assets/image/Phi-Hanh-Doan/teamsau_11zon.jpg";
import logo from "@/assets/image/logo1.png";
interface Member {
  name: string;
  role: string;
  bio: string;
  images: string[];
  color: string;
  facebook: string;
}

const teamMembers: Member[] = [
  {
    name: "Hồ Minh",
    role: "Chuyên Viên Kỹ Thuật",
    bio: "Thiết kế giao diện như những vì sao lung linh.",
    images: [Minh3, Minh5],
    color: "border-purple-500 shadow-purple-500/20",
    facebook: "https://www.facebook.com/minh.hongoc.737",
  },
  {
    name: "Hải Quyến",
    role: "Kỹ Sư Tín Hiệu",
    bio: "Khám phá tiềm năng AI, biến dữ liệu thành giai điệu.",
    images: [Quyen2, Quyen3],
    color: "border-emerald-400 shadow-emerald-400/20",
    facebook: "https://www.facebook.com/quyenhai1st",
  },
  {
    name: "Hoàng Nam",
    role: "Cơ trưởng ",
    bio: "Dẫn dắt con tàu âm nhạc bay qua các dải ngân hà.",
    images: [Nam1, Nam3],
    color: "border-cyan-400 shadow-cyan-500/20",
    facebook: "https://www.facebook.com/namhoang511/",
  },
  {
    name: "Thanh Vũ",
    role: "Cơ phó",
    bio: "Người gác cổng dữ liệu, đảm bảo tín hiệu luôn ổn định.",
    images: [Tvu2, Tvu3],
    color: "border-blue-500 shadow-blue-500/20",
    facebook: "https://www.facebook.com/thanhvu.48",
  },
  {
    name: "Đức Vũ",
    role: "Hoa Tiêu",
    bio: "Lan tỏa câu chuyện của phi hành đoàn đến mọi thiên hà.",
    images: [Dvu2, Dvu3],
    color: "border-pink-500 shadow-pink-500/20",
    facebook: "https://www.facebook.com/vovudn95",
  },
];

const MemberCard = ({ member, index }: { member: Member; index: number }) => {
  const vOffset = [40, 20, 0, 20, 40];
  const vScale = [0.9, 0.95, 1, 0.95, 0.9];
  const zIndex = [10, 20, 30, 20, 10];

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: vOffset[index] }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
      style={{ zIndex: zIndex[index] }}
      className="relative group p-[2px] rounded-[40px] overflow-visible transition-all duration-500"
    >
      {/* Glow effect */}
      <div
        className={`absolute inset-0 rounded-[40px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-b ${member.color
          .split(" ")[0]
          .replace("border-", "from-")}`}
      />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.2,
        }}
        className={`relative bg-black/60 backdrop-blur-xl border-2 ${member.color} rounded-[40px] p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col items-center text-center overflow-hidden`}
        style={{ transform: `scale(${vScale[index]})` }}
      >
        {/* --- PHẦN THAY ĐỔI: HIỆU ỨNG LẬT ẢNH --- */}
        <div className="relative w-full aspect-[4/5] mb-6 rounded-3xl [perspective:1000px] group/flip">
          <div className="relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] group-hover/flip:[transform:rotateY(180deg)]">
            {/* Ảnh mặt trước (Ảnh 1) */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
              <img
                src={member.images[0]}
                className="w-full h-full object-cover rounded-3xl saturate-[1.2]"
                alt={member.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent rounded-3xl" />
            </div>

            {/* Ảnh mặt sau (Ảnh 2) */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <img
                src={member.images[1]}
                className="w-full h-full object-cover rounded-3xl saturate-[1.2]"
                alt={`${member.name} alt`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent rounded-3xl" />
            </div>
          </div>
        </div>
        {/* --------------------------------------- */}

        <h3 className="text-xl font-black mb-1 tracking-tight text-white drop-shadow-md">
          {member.name}
        </h3>

        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3">
          <p className="text-[10px] font-mono text-cyan-400 tracking-[0.2em] uppercase">
            {member.role}
          </p>
        </div>

        <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-2 px-2 font-medium">
          {member.bio}
        </p>

        {/* Social Icons */}
        <div className="flex items-center gap-3 mt-6">
          <motion.a
            href={member.facebook}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, y: -2 }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          >
            <Facebook className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
          </motion.a>
          <p className="text-[10px] text-gray-400 font-medium">
            Full Stack Developer
          </p>
        </div>

        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/10 group-hover:bg-cyan-500 transition-colors animate-pulse" />
      </motion.div>
    </motion.div>
  );
};

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020205] text-white font-sans overflow-x-hidden">
      <AnimatedBackground />

      {/* 🚀 Hero Section */}
      <motion.section
        className="relative text-center pt-28 pb-10 px-6 overflow-visible"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {/* 🌟 Particles xung quanh */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full opacity-30"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `floatUp ${5 + Math.random() * 5}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight mb-3">
          🪐 Phi Hành Đoàn <span className="text-purple-600">Âm Nhạc</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Chúng tôi là những{" "}
          <span className="text-aurora font-semibold animate-[pulse_2s_ease-in-out_infinite]">
            người du hành âm thanh
          </span>{" "}
          — khám phá nơi nghệ thuật gặp gỡ công nghệ, tạo nên những giai điệu từ
          vũ trụ.
        </p>
      </motion.section>
      {/* 🪐 Orbit Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[400px] py-8 -mt-8 overflow-hidden">
        <div className="relative w-[400px] h-[400px]">
          {/* ☀️ Center Logo */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-28 h-28 bg-gradient-to-tr from-purple-600 to-cyan-400 rounded-full blur-2xl opacity-70 animate-pulse object-cover" />
              <img
                src={logo} // 👉 thay bằng logo của bạn
                alt="Cosmic Studio"
                className="w-40 h-40 z-10"
              />
            </div>
          </div>

          {/* 🌠 Orbit ring border */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-[340px] h-[340px] border border-white/20 rounded-full animate-spin-reverse opacity-40"
              style={{ animationDuration: "180s" }}
            />
          </div>

          {/* 🪐 Orbiting members */}
          {[...Array(5)].map((_, i) => {
            const reverse = i % 2 === 1;
            const duration = 70 + i * 10;
            const planetIcons = ["🪐", "🌕", "☄️", "🌍", "⭐"];

            return (
              <div
                key={i}
                className={`absolute inset-0 flex items-center justify-center ${
                  reverse ? "animate-spin-reverse" : "animate-spin-slower"
                }`}
                style={{
                  animationDuration: `${duration}s`,
                }}
              >
                {/* 🔵 Position on orbit */}
                <div
                  className="absolute"
                  style={{
                    transform: `rotate(${
                      i * (360 / 5)
                    }deg) translateX(170px) rotate(-${i * (360 / 5)}deg)`,
                  }}
                >
                  {/* 👩‍🚀 Member avatar */}
                  <div className="relative w-24 h-24 rounded-full border border-white/30 shadow-[0_0_25px_rgba(128,0,255,0.4)] overflow-visible">
                    <img
                      src={teamMembers[i]?.images?.[0]}
                      alt={teamMembers[i]?.name}
                      className="w-full h-full object-cover rounded-full "
                    />

                    {/* 🪙 Planet icon */}
                    <div
                      className="absolute -top-5 -right-5 text-2xl animate-[float_3s_ease-in-out_infinite] drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]"
                      style={{
                        filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))",
                      }}
                    >
                      {planetIcons[i]}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 pb-40 pt-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-start">
          {teamMembers.map((member, i) => (
            <MemberCard key={i} member={member} index={i} />
          ))}
        </div>
      </section>
      <MarqueeSection images={ALL_GALLERY_IMAGES} />

      {/* 🙏 Mentor Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 relative">
        {/* Background particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-8 items-stretch relative z-10"
        >
          {/* Ảnh mentor */}
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative h-full flex items-center justify-center group"
          >
            {/* Animated gradient border */}
            <motion.div
              className="absolute -inset-1 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(147,51,234,0.5), rgba(34,211,238,0.5))",
                  "linear-gradient(135deg, rgba(34,211,238,0.5), rgba(236,72,153,0.5))",
                  "linear-gradient(225deg, rgba(236,72,153,0.5), rgba(147,51,234,0.5))",
                  "linear-gradient(315deg, rgba(147,51,234,0.5), rgba(34,211,238,0.5))",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ filter: "blur(8px)" }}
            />

            <div className="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-[0_0_40px_rgba(147,51,234,0.4),0_0_80px_rgba(34,211,238,0.2)] h-full min-h-[300px] group-hover:border-cyan-400/70 transition-all duration-500">
              <img
                src={mentor1}
                alt="Thầy Nguyễn Xuân Long"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-purple-900/20 to-transparent" />

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Glow effects */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/30 via-cyan-500/30 to-pink-500/30 rounded-2xl blur-2xl -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
            <motion.div
              className="absolute -inset-8 bg-purple-500/20 rounded-2xl blur-3xl -z-20"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Caption */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col justify-center space-y-3 rounded-2xl border-2 border-purple-500/50 shadow-[0_0_40px_rgba(147,51,234,0.4),0_0_80px_rgba(34,211,238,0.2)] p-5 bg-gradient-to-br from-black/40 via-purple-950/20 to-cyan-950/20 backdrop-blur-sm h-full min-h-[300px] group hover:border-cyan-400/70 transition-all duration-500 relative overflow-hidden"
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, rgba(147,51,234,0.3), transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(34,211,238,0.3), transparent 50%)",
                  "radial-gradient(circle at 50% 50%, rgba(236,72,153,0.3), transparent 50%)",
                  "radial-gradient(circle at 0% 0%, rgba(147,51,234,0.3), transparent 50%)",
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.h3
              className="text-2xl md:text-3xl font-bold mb-3 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                Lời Cảm Ơn Đặc Biệt
              </span>
            </motion.h3>

            <div className="space-y-3 text-gray-300 leading-relaxed relative z-10">
              <motion.p
                className="text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
              >
                Chúng em xin gửi lời cảm ơn đặc biệt đến{" "}
                <span className="text-cyan-400 font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  thầy Nguyễn Xuân Long
                </span>
                . Thầy chính là người đã định nghĩa lại khái niệm 'Mentor' trong
                lòng chúng em: Trên công việc, thầy là người hướng dẫn nghiêm
                khắc và sắc sảo; nhưng phía sau đó, thầy lại là một người bạn
                đồng hành cực kỳ tâm lý.
              </motion.p>
              <motion.p
                className="text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
              >
                Cảm ơn thầy đã luôn 'online' cùng nhóm, sẵn sàng gạt bỏ những
                nghi thức xã giao để ngồi xuống cùng chúng em giải quyết vấn đề
                như những người đồng đội thực thụ. Nếu không có sự 'vừa là thầy,
                vừa là bạn' ấy của thầy Long, chắc chắn nhóm khó có thể đi đến
                đích ngày hôm nay.
              </motion.p>
            </div>

            <motion.div
              className="pt-4 border-t border-purple-500/30 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 }}
            >
              <p className="text-cyan-400/80 text-sm italic flex items-center gap-2">
                <span className="text-purple-400">—</span> Phi Hành Đoàn PWB
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* 👨‍✈️ Captain Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 relative">
        {/* Background particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-8 items-stretch relative z-10"
        >
          {/* Caption - đặt bên trái */}
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col justify-center space-y-3 rounded-2xl border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(34,211,238,0.4),0_0_80px_rgba(147,51,234,0.2)] p-5 bg-gradient-to-br from-black/40 via-cyan-950/20 to-purple-950/20 backdrop-blur-sm h-full min-h-[300px] group hover:border-purple-400/70 transition-all duration-500 relative overflow-hidden"
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, rgba(34,211,238,0.3), transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(147,51,234,0.3), transparent 50%)",
                  "radial-gradient(circle at 50% 50%, rgba(236,72,153,0.3), transparent 50%)",
                  "radial-gradient(circle at 0% 0%, rgba(34,211,238,0.3), transparent 50%)",
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.h3
              className="text-2xl md:text-3xl font-bold mb-3 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Cơ Trưởng PWB
              </span>
            </motion.h3>

            <div className="space-y-3 text-gray-300 leading-relaxed relative z-10">
              <motion.p
                className="text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                Từ những ngày thơ ấu,{" "}
                <span className="text-purple-400 font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Hoàng Nam
                </span>{" "}
                đã để trái tim mình lạc nhịp theo những giai điệu EDM sôi động
                của Alan Walker, Avicii hay Martin Garrix. Niềm đam mê ấy lớn
                dần qua những đêm miệt mài tự học FL Studio, nuôi dưỡng giấc mơ
                một ngày được tỏa sáng dưới ánh đèn sân khấu.
              </motion.p>
              <motion.p
                className="text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                Tuy nhiên, Nam đã chọn ngã rẽ Lập trình công nghệ – một nền tảng
                vững chắc để làm bệ phóng cho tương lai. Và dự án này chính là
                điểm chạm hoàn hảo, nơi 'Tình yêu âm nhạc' và 'Tư duy logic' hòa
                làm một. Đây không chỉ là một sản phẩm công nghệ, mà là tâm
                huyết của Nam nhằm mang đến giải pháp tối ưu nhất, chắp cánh cho
                cộng đồng nhà sản xuất âm nhạc.
              </motion.p>
            </div>
          </motion.div>

          {/* Ảnh captain - đặt bên phải */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="relative h-full flex items-center justify-center group"
          >
            {/* Animated gradient border */}
            <motion.div
              className="absolute -inset-1 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(34,211,238,0.5), rgba(147,51,234,0.5))",
                  "linear-gradient(135deg, rgba(147,51,234,0.5), rgba(236,72,153,0.5))",
                  "linear-gradient(225deg, rgba(236,72,153,0.5), rgba(34,211,238,0.5))",
                  "linear-gradient(315deg, rgba(34,211,238,0.5), rgba(147,51,234,0.5))",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ filter: "blur(8px)" }}
            />

            <div className="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(34,211,238,0.4),0_0_80px_rgba(147,51,234,0.2)] h-full min-h-[300px] group-hover:border-purple-400/70 transition-all duration-500">
              <img
                src={Nam4}
                alt="Cơ Trưởng PWB - Hoàng Nam"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-cyan-900/20 to-transparent" />

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Glow effects */}
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/30 via-purple-600/30 to-pink-500/30 rounded-2xl blur-2xl -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
            <motion.div
              className="absolute -inset-8 bg-cyan-500/20 rounded-2xl blur-3xl -z-20"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* 👨‍✈️ Cơ phó Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 relative">
        {/* Background particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-8 items-stretch relative z-10"
        >
          {/* Ảnh Cơ phó */}
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative h-full flex items-center justify-center group"
          >
            {/* Animated gradient border */}
            <motion.div
              className="absolute -inset-1 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(59,130,246,0.5), rgba(34,211,238,0.5))",
                  "linear-gradient(135deg, rgba(34,211,238,0.5), rgba(147,51,234,0.5))",
                  "linear-gradient(225deg, rgba(147,51,234,0.5), rgba(59,130,246,0.5))",
                  "linear-gradient(315deg, rgba(59,130,246,0.5), rgba(34,211,238,0.5))",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ filter: "blur(8px)" }}
            />

            <div className="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.4),0_0_80px_rgba(34,211,238,0.2)] h-full min-h-[300px] group-hover:border-cyan-400/70 transition-all duration-500">
              <img
                src={Tvu2}
                alt="Cơ phó"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-blue-900/20 to-transparent" />

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Glow effects */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-purple-500/30 rounded-2xl blur-2xl -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
            <motion.div
              className="absolute -inset-8 bg-blue-500/20 rounded-2xl blur-3xl -z-20"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Caption */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col justify-center space-y-3 rounded-2xl border-2 border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.4),0_0_80px_rgba(34,211,238,0.2)] p-5 bg-gradient-to-br from-black/40 via-blue-950/20 to-cyan-950/20 backdrop-blur-sm h-full min-h-[300px] group hover:border-cyan-400/70 transition-all duration-500 relative overflow-hidden"
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, rgba(59,130,246,0.3), transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(34,211,238,0.3), transparent 50%)",
                  "radial-gradient(circle at 50% 50%, rgba(147,51,234,0.3), transparent 50%)",
                  "radial-gradient(circle at 0% 0%, rgba(59,130,246,0.3), transparent 50%)",
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.h3
              className="text-2xl md:text-3xl font-bold mb-3 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Cơ phó
              </span>
            </motion.h3>

            <div className="space-y-3 text-gray-300 leading-relaxed relative z-10">
              <motion.p
                className="text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                Tôi là{" "}
                <span className="text-blue-400 font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Thanh Vũ Phạm
                </span>
                , một trong những người đồng sáng lập Producer Workbench (PWB).
                Chúng tôi bắt đầu PWB từ một câu hỏi đơn giản: làm thế nào để
                producer và các đội nhóm sáng tạo có thể tập trung trọn vẹn vào
                giá trị họ tạo ra, thay vì bị phân tán bởi quy trình và công cụ?
              </motion.p>
              <motion.p
                className="text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                Trong hành trình làm việc cùng các đội nhóm sáng tạo, chúng tôi
                nhận ra rằng sự thiếu kết nối, phân mảnh thông tin và khó khăn
                trong việc theo dõi tiến độ là những rào cản lớn làm chậm sự
                phát triển của dự án. Producer Workbench được tạo ra để phá vỡ
                những rào cản đó – mang đến một không gian làm việc thống nhất,
                nơi mọi người có thể cùng nhau cộng tác, chia sẻ và phát triển
                dự án một cách rõ ràng và hiệu quả hơn.
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 🔧 Kỹ Sư Tín Hiệu Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 relative">
        {/* Background particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-8 items-stretch relative z-10"
        >
          {/* Caption - đặt bên trái */}
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col justify-center space-y-3 rounded-2xl border-2 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.4),0_0_80px_rgba(34,211,238,0.2)] p-5 bg-gradient-to-br from-black/40 via-emerald-950/20 to-cyan-950/20 backdrop-blur-sm h-full min-h-[300px] group hover:border-cyan-400/70 transition-all duration-500 relative overflow-hidden"
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, rgba(16,185,129,0.3), transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(34,211,238,0.3), transparent 50%)",
                  "radial-gradient(circle at 50% 50%, rgba(147,51,234,0.3), transparent 50%)",
                  "radial-gradient(circle at 0% 0%, rgba(16,185,129,0.3), transparent 50%)",
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.h3
              className="text-2xl md:text-3xl font-bold mb-3 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Kỹ Sư Tín Hiệu
              </span>
            </motion.h3>

            <div className="space-y-3 text-gray-300 leading-relaxed relative z-10">
              <motion.p
                className="text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                Trong khi thế giới âm nhạc luôn chuyển động không ngừng,{" "}
                <span className="text-emerald-400 font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Hải Quyến
                </span>{" "}
                thường chọn cho mình một góc lặng với dòng nhạc Indie để quan
                sát và lắng nghe. Không theo đuổi giấc mơ trở thành nghệ sĩ
                trình diễn, Quyến dành sự quan tâm đặc biệt cho quy trình sáng
                tạo phía sau mỗi bản thu.
              </motion.p>
              <motion.p
                className="text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                Nhận thấy những khó khăn mà các Producer đang gặp phải trong
                việc quản lý dự án và bảo vệ quyền lợi nghệ thuật, Quyến đã dồn
                tâm huyết vào dự án này với tư duy của một lập trình viên:
                logic, chính xác và hiệu quả. Với Quyến, việc kết hợp giữa sở
                thích cá nhân và kỹ năng công nghệ không chỉ là hoàn thành một
                đồ án, mà là tạo ra một 'bến đỗ' chuyên nghiệp, giúp những người
                làm nhạc Indie nói riêng và Producer nói chung có thể yên tâm
                sáng tạo mà không bị rào cản quản lý làm chùn bước.
              </motion.p>
            </div>
          </motion.div>

          {/* Ảnh Kỹ Sư Tín Hiệu - đặt bên phải */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="relative h-full flex items-center justify-center group"
          >
            {/* Animated gradient border */}
            <motion.div
              className="absolute -inset-1 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(16,185,129,0.5), rgba(34,211,238,0.5))",
                  "linear-gradient(135deg, rgba(34,211,238,0.5), rgba(147,51,234,0.5))",
                  "linear-gradient(225deg, rgba(147,51,234,0.5), rgba(16,185,129,0.5))",
                  "linear-gradient(315deg, rgba(16,185,129,0.5), rgba(34,211,238,0.5))",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ filter: "blur(8px)" }}
            />

            <div className="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.4),0_0_80px_rgba(34,211,238,0.2)] h-full min-h-[300px] group-hover:border-cyan-400/70 transition-all duration-500">
              <img
                src={Quyen2}
                alt="Kỹ Sư Tín Hiệu"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-emerald-900/20 to-transparent" />

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Glow effects */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-purple-500/30 rounded-2xl blur-2xl -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
            <motion.div
              className="absolute -inset-8 bg-emerald-500/20 rounded-2xl blur-3xl -z-20"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* 🧭 Hoa Tiêu Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 relative">
        {/* Background particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-pink-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-8 items-stretch relative z-10"
        >
          {/* Ảnh Hoa Tiêu */}
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative h-full flex items-center justify-center group"
          >
            {/* Animated gradient border */}
            <motion.div
              className="absolute -inset-1 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(236,72,153,0.5), rgba(147,51,234,0.5))",
                  "linear-gradient(135deg, rgba(147,51,234,0.5), rgba(34,211,238,0.5))",
                  "linear-gradient(225deg, rgba(34,211,238,0.5), rgba(236,72,153,0.5))",
                  "linear-gradient(315deg, rgba(236,72,153,0.5), rgba(147,51,234,0.5))",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ filter: "blur(8px)" }}
            />

            <div className="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-pink-500/50 shadow-[0_0_40px_rgba(236,72,153,0.4),0_0_80px_rgba(147,51,234,0.2)] h-full min-h-[300px] group-hover:border-purple-400/70 transition-all duration-500">
              <img
                src={Dvu2}
                alt="Hoa Tiêu"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-pink-900/20 to-transparent" />

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Glow effects */}
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/30 via-purple-600/30 to-cyan-500/30 rounded-2xl blur-2xl -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
            <motion.div
              className="absolute -inset-8 bg-pink-500/20 rounded-2xl blur-3xl -z-20"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Caption */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col justify-center space-y-3 rounded-2xl border-2 border-pink-500/50 shadow-[0_0_40px_rgba(236,72,153,0.4),0_0_80px_rgba(147,51,234,0.2)] p-5 bg-gradient-to-br from-black/40 via-pink-950/20 to-purple-950/20 backdrop-blur-sm h-full min-h-[300px] group hover:border-purple-400/70 transition-all duration-500 relative overflow-hidden"
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, rgba(236,72,153,0.3), transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(147,51,234,0.3), transparent 50%)",
                  "radial-gradient(circle at 50% 50%, rgba(34,211,238,0.3), transparent 50%)",
                  "radial-gradient(circle at 0% 0%, rgba(236,72,153,0.3), transparent 50%)",
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.h3
              className="text-2xl md:text-3xl font-bold mb-3 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Hoa Tiêu
              </span>
            </motion.h3>

            <div className="space-y-3 text-gray-300 leading-relaxed relative z-10">
              <motion.p
                className="text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
              >
                Có những giấc mơ không bao giờ mất đi, chúng chỉ chuyển hóa từ
                hình thái này sang hình thái khác. Với{" "}
                <span className="text-pink-400 font-semibold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Đức Vũ
                </span>
                , âm nhạc là sợi dây kết nối với quá khứ, còn công nghệ chính là
                đôi cánh đưa anh chạm đến tương lai.
              </motion.p>
              <motion.p
                className="text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
              >
                Từng là một cậu bé với khát khao đứng dưới ánh đèn sân khấu, Vũ
                của hiện tại chọn một vị trí lặng thầm nhưng đầy sức mạnh: người
                đứng sau những giải pháp công nghệ để nâng tầm giá trị cho nghệ
                thuật. Mình tin rằng, nếu một nốt nhạc có thể chạm đến cảm xúc,
                thì một dòng code tâm huyết cũng có thể tạo nên những thay đổi
                kỳ diệu cho cộng đồng.
              </motion.p>
              <motion.p
                className="text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 }}
              >
                Dự án này chính là bản giao hưởng trọn vẹn nhất trong sự nghiệp
                của Vũ. Đó là nơi những rung cảm thuần khiết của tuổi trẻ hòa
                quyện cùng tư duy logic sắc bén của một lập trình viên thực thụ.
                Đây không chỉ là một sản phẩm kỹ thuật, mà là món quà Vũ dành
                tặng cho chính mình của năm xưa và cho tất cả những ai vẫn đang
                miệt mài kiếm tìm sự hoàn mỹ trong sự giao thoa giữa nghệ thuật
                và công nghệ.
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 🛠️ Chuyên Viên Kỹ Thuật Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 relative">
        {/* Background particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-8 items-stretch relative z-10"
        >
          {/* Caption - đặt bên trái */}
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col justify-center space-y-3 rounded-2xl border-2 border-purple-500/50 shadow-[0_0_40px_rgba(147,51,234,0.4),0_0_80px_rgba(236,72,153,0.2)] p-5 bg-gradient-to-br from-black/40 via-purple-950/20 to-pink-950/20 backdrop-blur-sm h-full min-h-[300px] group hover:border-pink-400/70 transition-all duration-500 relative overflow-hidden"
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, rgba(147,51,234,0.3), transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(236,72,153,0.3), transparent 50%)",
                  "radial-gradient(circle at 50% 50%, rgba(34,211,238,0.3), transparent 50%)",
                  "radial-gradient(circle at 0% 0%, rgba(147,51,234,0.3), transparent 50%)",
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.h3
              className="text-2xl md:text-3xl font-bold mb-3 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Chuyên Viên Kỹ Thuật
              </span>
            </motion.h3>

            <div className="space-y-3 text-gray-300 leading-relaxed relative z-10">
              <motion.p
                className="text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                Lớn lên trong những lời ca ngọt ngào của cả cha và mẹ, âm nhạc
                đã sớm trở thành hơi thở và là giấc mơ lấp lánh nhất trong lòng{" "}
                <span className="text-purple-400 font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Hồ Minh
                </span>
                . Thế nhưng, khi đối diện với thực tế nghiệt ngã về giới hạn của
                bản thân, Minh buộc phải cất lại khát khao đứng dưới ánh đèn sân
                khấu để chọn con đường lập trình viên bền vững.
              </motion.p>
              <motion.p
                className="text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                Dẫu vậy, niềm đam mê ấy chưa bao giờ nguội tắt, nó vẫn âm thầm
                chảy trong huyết quản qua mỗi dòng code. Dự án này chính là cách
                Minh dùng lý trí của hiện tại để bảo tồn và chắp cánh cho những
                giọng ca tuyệt vời khác — như một cách để viết tiếp giấc mơ của
                gia đình bằng một ngôn ngữ mới.
              </motion.p>
            </div>
          </motion.div>

          {/* Ảnh Chuyên Viên Kỹ Thuật - đặt bên phải */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="relative h-full flex items-center justify-center group"
          >
            {/* Animated gradient border */}
            <motion.div
              className="absolute -inset-1 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(147,51,234,0.5), rgba(236,72,153,0.5))",
                  "linear-gradient(135deg, rgba(236,72,153,0.5), rgba(34,211,238,0.5))",
                  "linear-gradient(225deg, rgba(34,211,238,0.5), rgba(147,51,234,0.5))",
                  "linear-gradient(315deg, rgba(147,51,234,0.5), rgba(236,72,153,0.5))",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ filter: "blur(8px)" }}
            />

            <div className="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-[0_0_40px_rgba(147,51,234,0.4),0_0_80px_rgba(236,72,153,0.2)] h-full min-h-[300px] group-hover:border-pink-400/70 transition-all duration-500">
              <img
                src={Minh4}
                alt="Chuyên Viên Kỹ Thuật"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-purple-900/20 to-transparent" />

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Glow effects */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 via-pink-600/30 to-cyan-500/30 rounded-2xl blur-2xl -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
            <motion.div
              className="absolute -inset-8 bg-purple-500/20 rounded-2xl blur-3xl -z-20"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* 🎄 Christmas Memory Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 relative">
        {/* Snow particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${-10 + Math.random() * 10}%`,
                fontSize: `${Math.random() * 10 + 10}px`,
              }}
              animate={{
                y: [0, 800],
                x: [0, Math.random() * 50 - 25],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear",
              }}
            >
              ❄
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-8 items-stretch relative z-10"
        >
          {/* Ảnh team */}
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative h-full flex items-center justify-center group"
          >
            {/* Christmas glow - red and green */}
            <motion.div
              className="absolute -inset-1 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(220,38,38,0.4), rgba(34,197,94,0.4))",
                  "linear-gradient(135deg, rgba(34,197,94,0.4), rgba(234,179,8,0.4))",
                  "linear-gradient(225deg, rgba(234,179,8,0.4), rgba(220,38,38,0.4))",
                  "linear-gradient(315deg, rgba(220,38,38,0.4), rgba(34,197,94,0.4))",
                ],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ filter: "blur(8px)" }}
            />

            <div className="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-red-500/50 shadow-[0_0_40px_rgba(220,38,38,0.4),0_0_80px_rgba(34,197,94,0.2)] h-full min-h-[300px] group-hover:border-green-400/70 transition-all duration-500">
              <img
                src={team9}
                alt="Kỷ niệm Giáng sinh"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-red-900/10 to-transparent" />

              {/* Warm light shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/20 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Christmas glow effects */}
            <div className="absolute -inset-4 bg-gradient-to-r from-red-600/30 via-green-500/30 to-yellow-500/30 rounded-2xl blur-2xl -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
            <motion.div
              className="absolute -inset-8 bg-red-500/20 rounded-2xl blur-3xl -z-20"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Caption */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col justify-center space-y-3 rounded-2xl border-2 border-red-500/50 shadow-[0_0_40px_rgba(220,38,38,0.4),0_0_80px_rgba(34,197,94,0.2)] p-5 bg-gradient-to-br from-black/40 via-red-950/20 to-green-950/20 backdrop-blur-sm h-full min-h-[300px] group hover:border-green-400/70 transition-all duration-500 relative overflow-hidden"
          >
            {/* Animated background gradient - Christmas colors */}
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, rgba(220,38,38,0.3), transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(34,197,94,0.3), transparent 50%)",
                  "radial-gradient(circle at 50% 50%, rgba(234,179,8,0.3), transparent 50%)",
                  "radial-gradient(circle at 0% 0%, rgba(220,38,38,0.3), transparent 50%)",
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.h3
              className="text-2xl md:text-3xl font-bold mb-3 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <span className="bg-gradient-to-r from-red-400 via-green-400 to-yellow-400 bg-clip-text text-transparent">
                🎄 Kỷ Niệm Giáng Sinh
              </span>
            </motion.h3>

            <div className="space-y-3 text-gray-300 leading-relaxed relative z-10">
              <motion.p
                className="text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
              >
                Có lẽ đây là mùa Giáng sinh 'kỳ lạ' nhất nhưng cũng ấm áp nhất
                mà mình từng trải qua. Không có những buổi dạo phố dưới ánh đèn
                lung linh, không có những bữa tiệc xa hoa, Noel của chúng mình
                gói gọn trong căn phòng nhỏ sáng đèn, tiếng gõ phím lạch cạch
                thay cho tiếng chuông ngân và những dòng tin nhắn bàn luận công
                việc thay cho lời chúc.
              </motion.p>
              <motion.p
                className="text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
              >
                Nhưng chính trong cái không khí 'chạy deadline' ấy, mình mới cảm
                nhận rõ nhất hơi ấm của tình đồng đội. Cùng nhau chia nhau chiếc
                bánh mì nguội, cùng nhau reo lên khi giải quyết được một vấn đề
                khó,... Những khoảnh khắc giản đơn ấy đã biến một đêm Noel làm
                việc vất vả trở thành kỷ niệm đẹp nhất của thanh xuân mà mình sẽ
                không bao giờ quên.
              </motion.p>
            </div>

            <motion.div
              className="pt-4 border-t border-red-500/30 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 }}
            >
              <p className="text-green-400/80 text-sm italic flex items-center gap-2">
                <span className="text-red-400">🎅</span> Phi Hành Đoàn PWB
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ✨ Divider Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 relative">
        <div className="relative">
          {/* Animated gradient line */}
          <div className="relative h-[2px] w-full overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/50 via-cyan-500/50 via-pink-500/50 to-transparent"
              animate={{
                background: [
                  "linear-gradient(90deg, transparent, rgba(147,51,234,0.5), rgba(34,211,238,0.5), rgba(236,72,153,0.5), transparent)",
                  "linear-gradient(90deg, transparent, rgba(34,211,238,0.5), rgba(236,72,153,0.5), rgba(147,51,234,0.5), transparent)",
                  "linear-gradient(90deg, transparent, rgba(236,72,153,0.5), rgba(147,51,234,0.5), rgba(34,211,238,0.5), transparent)",
                  "linear-gradient(90deg, transparent, rgba(147,51,234,0.5), rgba(34,211,238,0.5), rgba(236,72,153,0.5), transparent)",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-pink-500/30 blur-sm" />
          </div>

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/40"
              style={{
                left: `${12.5 + i * 12.5}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Center icon/decoration */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 via-cyan-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: {
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              },
              scale: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            <span className="text-2xl">✨</span>
          </motion.div>
        </div>
      </section>

      {/* 🎨 Team Photo Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 relative overflow-hidden">
        {/* Subtle cosmic background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle nebula clouds */}
          <motion.div
            className="absolute top-1/4 left-0 w-96 h-96 rounded-full blur-3xl opacity-15"
            style={{
              background:
                "radial-gradient(circle, rgba(147,51,234,0.3), transparent 70%)",
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full blur-3xl opacity-15"
            style={{
              background:
                "radial-gradient(circle, rgba(34,211,238,0.3), transparent 70%)",
            }}
            animate={{
              x: [0, -50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Subtle twinkling stars */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute rounded-full bg-white/60"
              style={{
                width: `${Math.random() * 1.5 + 0.5}px`,
                height: `${Math.random() * 1.5 + 0.5}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative flex items-center justify-center gap-8 z-10"
        >
          {/* Decorative side elements - Left side */}
          <div className="hidden lg:flex flex-col items-center gap-4 flex-1 max-w-[200px] relative">
            {/* Simple decorative lines */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />

            {/* Subtle floating particles */}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full bg-purple-400/40"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Frame container */}
          <div className="relative group flex-shrink-0 max-w-5xl w-full">
            {/* Subtle gradient glow */}
            <motion.div
              className="absolute -inset-3 rounded-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(147,51,234,0.2), rgba(34,211,238,0.2))",
                  "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(236,72,153,0.2))",
                  "linear-gradient(225deg, rgba(236,72,153,0.2), rgba(147,51,234,0.2))",
                  "linear-gradient(315deg, rgba(147,51,234,0.2), rgba(34,211,238,0.2))",
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ filter: "blur(12px)" }}
            />

            {/* Main image container */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-transparent bg-gradient-to-r from-purple-500/50 via-cyan-500/50 to-purple-500/50 bg-clip-padding p-[2px] group-hover:from-purple-400/70 group-hover:via-cyan-400/70 group-hover:to-purple-400/70 transition-all duration-700">
              <div className="relative rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm">
                <motion.div
                  className="relative w-full h-[300px] md:h-[400px] overflow-hidden"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.6 }}
                >
                  <img
                    src={team1}
                    alt="Phi Hành Đoàn PWB"
                    className="w-full h-full object-cover"
                  />

                  {/* Subtle gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-cyan-900/10" />

                  {/* Subtle shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-400/60 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-pink-400/60 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-400/60 rounded-br-2xl" />

            {/* Subtle floating particles */}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1.5 h-1.5 bg-white/40 rounded-full"
                style={{
                  left: `${30 + i * 40}%`,
                  top: `${25 + (i % 2) * 50}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}

            {/* Shadow glow */}
            <div className="absolute -inset-4 rounded-2xl bg-purple-500/10 blur-2xl -z-10 group-hover:bg-purple-500/20 transition-colors duration-700" />
          </div>

          {/* Decorative side elements - Right side */}
          <div className="hidden lg:flex flex-col items-center gap-4 flex-1 max-w-[200px] relative">
            {/* Simple decorative lines */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

            {/* Subtle floating particles */}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full bg-pink-400/40"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Caption with gradient */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-lg md:text-xl font-semibold bg-gradient-to-r from-purple-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
            Phi Hành Đoàn PWB
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Cùng nhau khám phá vũ trụ âm nhạc
          </p>
        </motion.div>
      </section>

      {/* 🖼️ Team Photo Flip Section */}
      <section className="relative flex flex-col items-center justify-center py-8 px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-full max-w-xl mx-auto"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-3xl blur-xl opacity-20 bg-gradient-to-br from-purple-600/50 via-cyan-500/50 to-pink-500/50" />

          <div className="relative w-full aspect-[4/3] rounded-3xl [perspective:1000px] group/flip overflow-hidden border-2 border-purple-500/50 shadow-[0_0_30px_rgba(147,51,234,0.4)]">
            <div className="relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] group-hover/flip:[transform:rotateY(180deg)]">
              {/* Ảnh mặt trước */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
                <img
                  src={teamtruoc}
                  className="w-full h-full object-cover saturate-[1.1]"
                  alt="Phi Hành Đoàn PWB - Mặt Trước"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Ảnh mặt sau */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <img
                  src={teamsau}
                  className="w-full h-full object-cover saturate-[1.1]"
                  alt="Phi Hành Đoàn PWB - Mặt Sau"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 🎄 Christmas Magic Section */}
      <section className="relative w-full h-[600px]">
        <ChristmasMagic />
      </section>

      {/* 🌠 Footer gọn gàng */}
      <footer className="bg-black/40 py-12 border-t border-white/5 text-center">
        <h2 className="text-2xl font-bold mb-8">
          Gửi tín hiệu đến chúng tôi 🚀
        </h2>
        <div className="flex flex-wrap justify-center gap-4 px-4">
          <a
            href="mailto:producerworkbench@gmail.com"
            className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/10 transition-all hover:border-purple-500"
          >
            <Mail className="w-4 h-4" />
            <span className="text-xs">producerworkbench@gmail.com</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
