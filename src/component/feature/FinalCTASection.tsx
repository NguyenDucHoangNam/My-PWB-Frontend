import React from "react";
import { Link } from "react-router-dom";
import { Search, UserPlus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const FinalCTASection: React.FC = () => {
  return (
    <section className="relative py-24 bg-gradient-to-b from-[#1a093b] via-[#2a104a] to-[#0a031f] overflow-hidden">
      {/* Hiệu ứng ánh sáng nền */}
      <div className="absolute inset-0">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-purple-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[600px] h-[600px] bg-pink-500/10 blur-[100px] rounded-full" />
      </div>

      {/* Nội dung chính */}
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Viền glow nhẹ */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl blur-lg opacity-25 animate-pulse"></div>

          <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-12 border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent"
            >
              Sẵn sàng bắt đầu?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
            >
              Tham gia cộng đồng producer và khách hàng hàng đầu Việt Nam ngay hôm nay
            </motion.p>

            {/* Nút hành động */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
              {/* Nút 1 */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/listProducer"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white
                    bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 
                    rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/40
                    transition-all duration-300"
                >
                  <Search className="w-6 h-6" />
                  🚀 Tìm Producer Ngay
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>

              {/* Nút 2 */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/proPackage"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white
                    bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500
                    rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-400/40
                    transition-all duration-300"
                >
                  <UserPlus className="w-6 h-6" />
                  🧑‍🚀 Tham gia với tư cách Producer
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
