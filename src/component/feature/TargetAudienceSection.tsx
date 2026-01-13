import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Users, Music, CheckCircle, Sparkles, Star } from "lucide-react";

const TargetAudienceSection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle stars effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const stars: { x: number; y: number; r: number; s: number }[] = [];

    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.5,
        s: Math.random() * 0.5 + 0.2,
      });
    }

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "white";
      stars.forEach((star) => {
        ctx.globalAlpha = Math.random() * 0.7 + 0.3;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      });
      update();
      requestAnimationFrame(draw);
    };

    const update = () => {
      stars.forEach((star) => {
        star.y += star.s;
        if (star.y > h) {
          star.x = Math.random() * w;
          star.y = 0;
        }
      });
    };

    draw();
    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Cosmic star background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
      ></canvas>

      {/* Aurora glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-800/30 via-blue-900/20 to-transparent blur-3xl"></div>
      <div className="absolute top-20 left-10 w-56 h-56 bg-purple-500/20 rounded-full blur-[120px] animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-64 h-64 bg-blue-500/20 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-6 backdrop-blur-md">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">
              Đối tượng người dùng
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(180,120,255,0.3)]">
            Dành cho ai?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Nền tảng được thiết kế đặc biệt cho hai đối tượng chính với những
            tính năng độc đáo
          </p>
        </motion.div>

        {/* --- Section 1: Customers --- */}
        <div className="space-y-24">
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="grid lg:grid-cols-2 gap-16 items-center group"
          >
            {/* Image Left */}
            <div className="relative rounded-3xl overflow-hidden group-hover:scale-105 transition-transform duration-700">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <img
                src="https://static.tuoitre.vn/tto/i/s626/2016/10/05/slimv-noo-phuoc-thinh-1475655225.jpg"
                alt="Khách hàng & Nghệ sĩ"
                className="relative z-10 w-full h-auto rounded-3xl object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-white/20 backdrop-blur-md rounded-full p-2">
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                </div>
              </div>
            </div>

            {/* Content Right */}
            <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-lg shadow-blue-500/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-2 text-white">
                    Khách hàng & Nghệ sĩ
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">
                      Đang hoạt động
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                Tìm kiếm và hợp tác với những producer tài năng nhất để biến ý
                tưởng âm nhạc của bạn thành hiện thực.
              </p>
              <div className="space-y-4">
                {[
                  "Tìm producer phù hợp với phong cách",
                  "Hợp tác trực quan và minh bạch",
                  "Thanh toán an toàn và bảo vệ",
                  "Theo dõi tiến độ dự án real-time",
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 group/item transition-all"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center group-hover/item:scale-110 transition-transform">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-300 group-hover/item:text-white transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* --- Section 2: Producers --- */}
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="grid lg:grid-cols-2 gap-16 items-center group"
          >
            {/* Content Left */}
            <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-lg shadow-purple-500/10 order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-pink-500/30">
                  <Music className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-2 text-white">
                    Music Producer
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-purple-400 text-sm font-medium">
                      Chuyên nghiệp
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                Phát triển sự nghiệp, tăng thu nhập và xây dựng danh tiếng trong
                ngành âm nhạc.
              </p>
              <div className="space-y-4">
                {[
                  "Tiếp thị tự động và hiệu quả",
                  "Quản lý dự án chuyên nghiệp",
                  "Xây dựng portfolio ấn tượng",
                  "Thanh toán nhanh chóng và an toàn",
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 group/item transition-all"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center group-hover/item:scale-110 transition-transform">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-300 group-hover/item:text-white transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Right */}
            <div className="relative rounded-3xl overflow-hidden group-hover:scale-105 transition-transform duration-700 order-1 lg:order-2">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <img
                src="https://twostorymelody.com/wp-content/uploads/2022/02/musicproducer-scaled.jpg"
                alt="Music Producer"
                className="relative z-10 w-full h-auto rounded-3xl object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-white/20 backdrop-blur-md rounded-full p-2">
                  <Music className="w-6 h-6 text-pink-400" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TargetAudienceSection;
