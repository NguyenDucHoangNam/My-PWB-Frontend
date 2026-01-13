import React, { useState } from "react";
import {
  User,
  Users,
  ChevronRight,
  Music,
  FileText,
  Loader,
  Rocket,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import projectService from "../../services/projectService";
import { ROUTER } from "../../routes/router";
import { useCosmicToast } from "../../component/toast/CosmicToastProvider";

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"choice" | "form">("choice");
  const [projectType, setProjectType] = useState<
    "PERSONAL" | "COLLABORATIVE" | null
  >(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [showRibbon, setShowRibbon] = useState(false);
  const { showToast } = useCosmicToast();
  const handleChoice = (type: "PERSONAL" | "COLLABORATIVE") => {
    if (type === "PERSONAL") {
      setShowRibbon(true);
      // Tự động ẩn sau 3 giây
      setTimeout(() => setShowRibbon(false), 3000);
      return;
    }
    setProjectType(type);
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectType || !title) return;

    setIsLoading(true);
    setError(null);

    try {
      const newProject = await projectService.createProject({
        title,
        description,
        type: projectType,
      });

      // ✅ Hiển thị toast thành công
      showToast({
        type: "success",
        title: "🚀 Dự án đã được tạo!",
        message: `✨ "${newProject.title}" đã sẵn sàng để khởi hành!`,
      });

      // ⏳ Chuyển trang sau một chút delay để toast kịp hiển thị
      setTimeout(() => {
        navigate(`${ROUTER.USER.PROJECTDETAIL}?id=${newProject.id}`, {
          state: { project: newProject },
        });
      }, 1500);
    } catch (err: any) {
      const backendMessage = err?.message;
      const fallbackMessage = "Đã có lỗi xảy ra. Vui lòng thử lại.";
      const messageToShow = backendMessage || fallbackMessage;

      setError(messageToShow);
      showToast({
        type: "error",
        title: "Lỗi!",
        message: messageToShow,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isCollaborative = projectType === "COLLABORATIVE";

  return (
    <div className="relative min-h-screen bg-[#07051C] text-white overflow-hidden flex items-center justify-center font-sans">
      {/* 🌈 Background animated lights */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-fuchsia-600/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-2xl animation-delay-4000 animate-blob" />
      </div>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: "var(--noise-bg-pattern)" }}
      />

      <div className="relative z-10 w-full px-6">
        {step === "choice" ? (
          <div className="text-center">
              {/* --- HEADER --- */}
              <header className="mb-16">
                <h1
                  className="text-6xl md:text-7xl font-extrabold tracking-tight"
                  style={{
                    textShadow: "0 0 25px rgba(139,92,246,0.6)",
                  }}
                >
                  🚀
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-sky-400 animate-gradient">
                    Khởi Hành Vào Hành Trình Âm Nhạc
                  </span>
                </h1>
                <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto font-light">
                  Hãy chọn hướng bay của bạn — đơn độc khám phá vì sao riêng,
                  hay cùng đồng đội chinh phục dải ngân hà âm nhạc.
                </p>
              </header>

              {/* --- CHOICE CARDS --- */}
              <main className="flex flex-col md:flex-row justify-center items-center gap-12">
                {/* Cá nhân */}
                <motion.div
                  whileHover={{
                    scale: 1.08,
                    rotateY: 10,
                    boxShadow: "0 0 60px rgba(56,189,248,0.3)",
                  }}
                  transition={{ type: "spring", stiffness: 250, damping: 15 }}
                  onClick={() => handleChoice("PERSONAL")}
                  className="group relative w-[320px] p-8 rounded-3xl bg-gradient-to-br from-sky-900/30 via-fuchsia-900/10 to-transparent border border-sky-400/20 backdrop-blur-lg cursor-pointer overflow-hidden"
                >
                  {/* Băng đỏ chéo - chỉ hiện khi bấm vào */}
                  {showRibbon && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="absolute top-0 right-0 w-48 h-48 overflow-hidden z-20 pointer-events-none"
                    >
                      <div className="absolute -top-6 right-6 w-64 h-16 bg-gradient-to-r from-red-600 to-red-500 transform rotate-45 flex items-center justify-center">
                        <span className="text-white text-xs font-extrabold tracking-wider whitespace-nowrap">CHỨC NĂNG ĐANG PHÁT TRIỂN</span>
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15),transparent_60%)]"></div>
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: 20, scale: 1.1 }}
                      className="inline-flex p-4 bg-sky-500/10 rounded-2xl backdrop-blur-md border border-sky-400/20"
                    >
                      <User className="text-sky-300" size={50} />
                    </motion.div>
                    <h2 className="mt-6 text-3xl font-bold text-white group-hover:text-sky-300 transition-colors">
                      Dự án Cá nhân
                    </h2>
                    <p className="text-gray-400 mt-3 text-base font-light">
                      Khám phá vũ trụ âm thanh của riêng bạn, nơi bạn là thuyền trưởng duy nhất.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 border border-sky-400/40 rounded-full px-5 py-2 text-sky-300 font-medium group-hover:bg-sky-400/10 transition-all">
                      Khởi động <ChevronRight size={18} />
                    </div>
                  </div>
                </motion.div>

                {/* Hợp tác */}
                <motion.div
                  whileHover={{
                    scale: 1.08,
                    rotateY: -10,
                    boxShadow: "0 0 60px rgba(232,121,249,0.3)",
                  }}
                  transition={{ type: "spring", stiffness: 250, damping: 15 }}
                  onClick={() => handleChoice("COLLABORATIVE")}
                  className="group relative w-[320px] p-8 rounded-3xl bg-gradient-to-br from-fuchsia-900/30 via-purple-900/10 to-transparent border border-fuchsia-400/20 backdrop-blur-lg cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-[radial-gradient(circle_at_center,rgba(232,121,249,0.15),transparent_60%)]"></div>
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: -20, scale: 1.1 }}
                      className="inline-flex p-4 bg-fuchsia-500/10 rounded-2xl backdrop-blur-md border border-fuchsia-400/20"
                    >
                      <Users className="text-fuchsia-300" size={50} />
                    </motion.div>
                    <h2 className="mt-6 text-3xl font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                      Dự án Hợp tác
                    </h2>
                    <p className="text-gray-400 mt-3 text-base font-light">
                    Kết nối đối tác và phi hành đoàn. Cùng nhau kiến tạo những bản hit vượt ngoài không gian.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 border border-fuchsia-400/40 rounded-full px-5 py-2 text-fuchsia-300 font-medium group-hover:bg-fuchsia-400/10 transition-all">
                      Lên Tàu <ChevronRight size={18} />
                    </div>
                  </div>
                </motion.div>
              </main>
          </div>
        ) : (
          // --- FORM --- //
          <div className="w-full max-w-3xl mx-auto min-h-[90vh] flex flex-col justify-center px-4">
              <header className="text-center mb-8 mt-[70px]">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-fuchsia-600/40 to-sky-600/40 mb-4 shadow-lg"
                >
                  {isCollaborative ? (
                    <FileText size={36} />
                  ) : (
                    <Music size={36} />
                  )}
                </motion.div>

                <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                  {isCollaborative
                    ? "Khởi tạo Vũ trụ Hợp tác"
                    : "Bắt đầu Dự án Âm nhạc Cá nhân"}
                </h1>
                <p className="mt-3 text-gray-400 max-w-2xl mx-auto font-light text-base">
                  {isCollaborative
                    ? "Đặt tên cho bản giao hưởng tiếp theo — nơi giai điệu hợp nhất tâm hồn."
                    : "Hãy viết nên những nốt nhạc đầu tiên của hành trình sáng tạo."}
                </p>
              </header>

              <form
                onSubmit={handleSubmit}
                className="relative bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl p-6 shadow-[0_0_30px_rgba(139,92,246,0.15)] space-y-6 overflow-hidden"
              >
                <motion.div
                  className="absolute -top-6 -left-6 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl"
                  animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 6,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute bottom-0 right-0 w-44 h-44 bg-sky-500/20 rounded-full blur-3xl"
                  animate={{ x: [0, -20, 0], y: [0, -20, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 8,
                    ease: "easeInOut",
                  }}
                />

                <div>
                  <label className="block text-lg font-bold text-gray-200 mb-2">
                  Tên Hiệu Nhiệm Vụ <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-fuchsia-400/40 focus:bg-white/15 transition"
                    placeholder={
                      isCollaborative
                        ? "Ví dụ: Hợp tác ca khúc 'Sóng Xanh'"
                        : "Ví dụ: Album 'Giấc Mơ Không Trọng Lực'"
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-200 mb-2">
                  Tuyên Bố Sứ Mệnh{" "}
                    <span className="text-gray-500 font-normal text-base">
                      (Không bắt buộc)
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-sky-400/40 focus:bg-white/15 transition"
                    placeholder="Viết đôi dòng về phong cách, cảm hứng hoặc mục tiêu của bạn..."
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-fuchsia-600 via-purple-600 to-sky-600 hover:from-fuchsia-500 hover:via-purple-500 hover:to-sky-500 transition-all duration-300 shadow-[0_0_25px_rgba(167,139,250,0.4)] hover:scale-105 overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 hover:opacity-100"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear",
                      }}
                    />
                    {isLoading ? (
                      <Loader className="animate-spin" />
                    ) : (
                      <>
                        <Rocket className="h-5 w-5 animate-bounce" />
                        {isCollaborative
                          ? "Bắt Đầu Sứ Mệnh"
                          : "Bắt đầu Sáng tạo"}{" "}
                        <ChevronRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </form>
          </div>
        )}
      </div>

      {/* Styles */}
      <style>{`
        .choice-card {
          @apply relative bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-10 w-full max-w-sm flex flex-col items-center justify-center transition-all duration-500 transform-gpu hover:scale-[1.03] hover:shadow-2xl cursor-pointer;
        }
        .icon-wrapper {
          @apply p-5 rounded-full bg-gradient-to-br from-gray-800/70 to-gray-700/70 border border-gray-600/50 shadow-lg transition-all duration-300;
        }
        .cta-button {
          @apply mt-8 flex items-center gap-2 text-lg font-semibold px-6 py-3 rounded-full border border-gray-600/50 text-gray-300 transition-all duration-300 group-hover:bg-gradient-to-r from-fuchsia-600/30 to-sky-600/30;
        }
        .form-input {
          @apply w-full bg-gray-900/60 border border-gray-700 rounded-xl py-3.5 px-5 text-lg placeholder-gray-500 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all duration-300 shadow-md;
        }
        .glass-card-form {
          background: rgba(22, 21, 40, 0.45);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite cubic-bezier(0.4, 0, 0.2, 1); }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        :root { 
          --noise-bg-pattern: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgNTAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIi8+PC9zdmc+);
        }
        
        /* Ribbon animation */
        @keyframes ribbon-shimmer {
          0%, 100% { 
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
            opacity: 1;
          }
          50% { 
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.4);
            opacity: 0.95;
          }
        }
        .animate-ribbon-shimmer {
          animation: ribbon-shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
