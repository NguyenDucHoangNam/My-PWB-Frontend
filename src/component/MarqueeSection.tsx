import React from "react";
import { motion } from "framer-motion";

interface MarqueeProps {
  images: string[];
}

const MarqueeSection: React.FC<MarqueeProps> = ({ images }) => {
  const duplicatedImages = [...images, ...images];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 relative">
      {/* Tiêu đề album */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-3 text-amber-200/90 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
          📔 NHẬT KÝ PHI HÀNH ĐOÀN
        </h2>
        <p className="text-amber-300/70 text-lg italic">
          Ghi lại hành trình từ mặt đất đến các vì sao.
        </p>
      </motion.div>

      {/* Cuốn album với hiệu ứng giấy cũ */}
      <div className="relative">
        {/* Hiệu ứng bụi và vết xước */}
        <div className="absolute inset-0 pointer-events-none z-20 opacity-30">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-amber-900/20 rotate-12" />
          <div className="absolute top-0 right-1/3 w-0.5 h-full bg-amber-800/15 -rotate-6" />
          <div className="absolute top-1/4 left-0 w-full h-0.5 bg-amber-900/10" />
        </div>

        {/* Khung album chính */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-amber-50/5 via-amber-100/5 to-amber-50/5 border-2 border-amber-800/40 shadow-[0_0_50px_rgba(180,83,9,0.3),inset_0_0_100px_rgba(120,53,15,0.1)] backdrop-blur-sm">
          {/* Hiệu ứng giấy cũ - texture */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(120,53,15,0.1) 2px, rgba(120,53,15,0.1) 4px),
                repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(120,53,15,0.1) 2px, rgba(120,53,15,0.1) 4px)
              `,
            }}
          />

          {/* Gradient fade ở 2 bên */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050508] via-amber-950/50 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050508] via-amber-950/50 to-transparent z-10 pointer-events-none" />

          {/* Dải ảnh */}
          <motion.div
            className="flex gap-6 p-8 w-max will-change-transform"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 120,
              repeat: Infinity,
              ease: "linear",
            }}
            whileHover={{ animationPlayState: "paused" }}
          >
            {duplicatedImages.map((img, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6, scale: 1.03 }}
                className="relative h-72 w-auto min-w-[14rem] flex-shrink-0 group"
              >
                {/* Khung ảnh như album cũ */}
                <div className="relative h-full w-full p-2 bg-gradient-to-br from-amber-100/20 to-amber-900/30 rounded-sm border border-amber-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_0_30px_rgba(120,53,15,0.2)]">
                  {/* Hiệu ứng sepia và vintage */}
                  <div className="relative h-full w-full overflow-hidden rounded-sm">
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover sepia-[0.3] brightness-90 contrast-110 saturate-110 group-hover:sepia-0 group-hover:brightness-100 transition-all duration-700"
                      style={{
                        filter:
                          "sepia(30%) brightness(0.9) contrast(1.1) saturate(1.1)",
                      }}
                    />

                    {/* Overlay màu vàng nâu như ảnh cũ */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-amber-700/15 group-hover:opacity-0 transition-opacity duration-700" />

                    {/* Hiệu ứng góc ảnh bị cong (như ảnh dán trong album) */}
                    <div className="absolute top-1 left-1 w-3 h-3 bg-amber-800/30 rounded-full blur-sm opacity-50" />
                    <div className="absolute top-1 right-1 w-3 h-3 bg-amber-800/30 rounded-full blur-sm opacity-50" />
                    <div className="absolute bottom-1 left-1 w-3 h-3 bg-amber-800/30 rounded-full blur-sm opacity-50" />
                    <div className="absolute bottom-1 right-1 w-3 h-3 bg-amber-800/30 rounded-full blur-sm opacity-50" />
                  </div>

                  {/* Viền trang trí như album cũ */}
                  <div className="absolute -inset-1 border border-amber-600/30 rounded-sm opacity-60" />
                </div>

                {/* Hiệu ứng bóng đổ vintage */}
                <div className="absolute -inset-2 bg-amber-900/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Chữ ký hoặc dòng chữ ở dưới */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-center mt-8"
        >
          <p className="text-amber-300/80 text-base italic leading-relaxed">
            "Một dòng code nhỏ của lập trình viên, một bước tiến lớn cho cộng
            đồng Producer."
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default MarqueeSection;
