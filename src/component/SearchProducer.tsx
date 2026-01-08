import { Headphones, Play, TrendingUp, Zap } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
const SearchProducer = () => {
  useEffect(()=>{
    AOS.init({duration: 800, once: false});
  },[])
  return (
    <div className="max-w-4xl mx-auto mb-16" data-aos="fade-up">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-30"></div>
        <div className="relative bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-3xl p-8 border border-white/20 dark:border-white/10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Nhập nghệ sĩ hoặc bài hát tham chiếu..."
                className="w-full px-6 py-4 rounded-2xl 
                                   bg-white/90 dark:bg-white/10 backdrop-blur-sm
                                   border border-white/30 dark:border-white/20 
                                   text-gray-800 dark:text-white 
                                   focus:ring-2 focus:ring-purple-400 focus:border-transparent
                                   transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-300
                                   shadow-lg"
              />
              <Headphones className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>
            <Link to="/listProducer">
              <button
                className="px-8 py-4 rounded-2xl 
                                         bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 
                                         hover:from-purple-600 hover:via-purple-700 hover:to-pink-600 
                                         shadow-2xl hover:shadow-purple-500/50 
                                         transition-all duration-300 hover:scale-105 text-white font-bold text-lg
                                         flex items-center gap-3"
              >
                <Zap className="w-6 h-6" />
                Tìm Producer Ngay
              </button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-4 mt-6 justify-center">
            <button
              className="px-6 py-3 rounded-xl 
                                       bg-white/20 dark:bg-white/10 backdrop-blur-sm
                                       hover:bg-white/30 dark:hover:bg-white/20 
                                       text-white transition-all duration-300
                                       border border-white/30 dark:border-white/20 hover:border-white/50
                                       flex items-center gap-2 shadow-lg"
            >
              <Play className="w-5 h-5" />
              Thử Tìm Kiếm Giống Âm Thanh
            </button>
            <button
              className="px-6 py-3 rounded-xl 
                                       bg-white/20 dark:bg-white/10 backdrop-blur-sm
                                       hover:bg-white/30 dark:hover:bg-white/20 
                                       text-white transition-all duration-300
                                       border border-white/30 dark:border-white/20 hover:border-white/50
                                       flex items-center gap-2 shadow-lg"
            >
              <TrendingUp className="w-5 h-5" />
              Duyệt Producer Hàng Đầu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchProducer;
