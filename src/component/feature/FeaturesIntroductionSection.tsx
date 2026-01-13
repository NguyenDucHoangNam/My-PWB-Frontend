import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const FeaturesIntroductionSection: React.FC = () => {
  return (
    <section
        id="features-introduction"
        className="relative py-32 overflow-hidden bg-black/80 backdrop-blur-xl border-b border-white/10"
      >
        {/* === Cosmic Aurora Background === */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Aurora moving lights */}
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400 opacity-25 blur-3xl animate-aurora-move rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-l from-cyan-400 via-sky-500 to-indigo-400 opacity-20 blur-3xl animate-aurora-pulse rounded-full"></div>

          {/* Star field */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(white_1px,transparent_1px)] [background-size:40px_40px] opacity-10 animate-stars"></div>
        </div>

        {/* === Content === */}
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Label */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-8 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium tracking-wide">
                Tính năng chính
              </span>
            </div>

            {/* Title */}
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
              8 Tính năng nổi bật
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Khám phá những công cụ và trải nghiệm độc đáo giúp bạn phát triển
              sự nghiệp trong{" "}
              <span className="text-purple-300 font-semibold">
                vũ trụ âm nhạc
              </span>
              . Mỗi tính năng là một hành tinh — nơi sáng tạo và công nghệ hòa
              quyện.
            </p>
          </motion.div>
        </div>
    </section>
  );
};

export default FeaturesIntroductionSection;
