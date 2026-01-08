import React, { useEffect } from "react";
import AOS from "aos";
import { Link } from "react-router-dom";
import UpdateProducer from "./user/UpdateProducer";
import "aos/dist/aos.css";
import SplitText from "../component/SplitText";
import {
  Star,
  Users,
  Zap,
  Shield,
  TrendingUp,
  Music,
  Headphones,
  BarChart3,
} from "lucide-react";
import SearchProducer from "../component/SearchProducer";

const HomePage: React.FC = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: false, offset: 100 });
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 text-gray-900 dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#1e1b4b] dark:to-[#0f172a] 
                    dark:text-white transition-colors duration-300 pt-0"
    >
      {/* DYNAMIC BACKGROUND HERO */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Animated Background from loading.io */}

        {/* Dynamic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-purple-50/60 to-pink-50/70 dark:from-[#0f172a]/80 dark:via-[#1e1b4b]/70 dark:to-[#0f172a]/80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#8b5cf6,transparent_60%)] opacity-20 dark:opacity-30 animate-pulse"></div>
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,#ec4899,transparent_60%)] opacity-15 dark:opacity-25 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#6366f1,transparent_70%)] opacity-10 dark:opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-float"></div>
        <div
          className="absolute top-40 right-20 w-32 h-32 bg-pink-500/20 rounded-full blur-xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute bottom-20 right-1/3 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Overlaid Content */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="w-full px-6 py-20 max-w-7xl mx-auto">
            {/* Main Title Section */}
            <div className="text-center mb-16" data-aos="fade-down">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20 text-white text-lg font-medium mb-8 shadow-2xl">
                <Music className="w-6 h-6 mr-3" />
                Nền tảng kết nối âm nhạc hàng đầu Việt Nam
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-8">
                <SplitText
                  text="Kết nối với Producer hàng đầu"
                  splitType="chars"
                  className="inline-block mr-4 text-white drop-shadow-2xl"
                />
                <br />
              </h1>
            </div>

            {/* Search Section */}
            <SearchProducer />
            {/* Stats Grid */}
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300">
                  <div className="text-4xl font-bold text-white mb-2">500+</div>
                  <div className="text-white/80 text-sm">Producer Tài Năng</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300">
                  <div className="text-4xl font-bold text-white mb-2">
                    1000+
                  </div>
                  <div className="text-white/80 text-sm">Dự Án Thành Công</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300">
                  <div className="text-4xl font-bold text-white mb-2">4.9★</div>
                  <div className="text-white/80 text-sm">
                    Đánh Giá Trung Bình
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300">
                  <div className="text-4xl font-bold text-white mb-2">24/7</div>
                  <div className="text-white/80 text-sm">Hỗ Trợ Khách Hàng</div>
                </div>
              </div>
            </div>

            {/* Featured Producers Preview */}
            <div
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              {[
                {
                  name: "Ariana Knox",
                  genre: "Pop • EDM",
                  rating: "4.9",
                  projects: "210",
                  verified: true,
                },
                {
                  name: "Marcus Chen",
                  genre: "Hip-Hop • Trap",
                  rating: "4.8",
                  projects: "180",
                  verified: true,
                },
                {
                  name: "Luna Rodriguez",
                  genre: "Lo-fi • Chill",
                  rating: "4.9",
                  projects: "150",
                  verified: true,
                },
              ].map((producer, index) => (
                <div key={index} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">
                          {producer.name}
                        </h3>
                        <p className="text-white/70 text-sm">
                          {producer.genre}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white text-sm font-medium">
                          {producer.rating}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-white/70" />
                        <span className="text-white/70 text-sm">
                          {producer.projects} dự án
                        </span>
                      </div>
                    </div>
                    {producer.verified && (
                      <div className="flex items-center gap-1 mt-3">
                        <Shield className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">
                          Đã xác minh
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features for Artist */}
      <section
        className="px-6 py-20 bg-gradient-to-br from-gray-50 to-white dark:from-[#111827] dark:to-[#1F2937] transition-colors duration-300"
        data-aos="fade-up"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Users className="w-4 h-4 mr-2" />
              Dành cho nghệ sĩ & khách hàng
            </div>
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Tìm Producer hoàn hảo cho dự án của bạn
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Kết nối với những producer tài năng nhất, được xác minh và sẵn
              sàng biến ý tưởng của bạn thành hiện thực
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Producer Đã Xác Minh"
              desc="Làm việc với các chuyên gia đã được kiểm chứng và đánh giá cao bởi cộng đồng."
              color="green"
            />
            <FeatureCard
              icon={<Headphones className="w-8 h-8" />}
              title="Tìm Kiếm Giống Âm Thanh"
              desc="Mô tả âm thanh bạn muốn bằng cách tham chiếu nghệ sĩ hoặc bài hát yêu thích."
              color="purple"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Hợp Tác Trơn Tru"
              desc="Chia sẻ brief, phản hồi và theo dõi tiến độ dự án một cách minh bạch và hiệu quả."
              color="blue"
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Bản đồ nhiệt phản hồi"
              desc="Phân tích phản hồi của người nghe trên sóng âm để tìm ra những điểm cần cải thiện."
              color="purple"
              link="/heatmap"
            />
          </div>
        </div>
      </section>

      {/* Features for Producer */}
      <section
        className="px-6 py-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-[#1F2937] dark:to-[#2D1B69] transition-colors duration-300"
        data-aos="fade-up"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
              <Music className="w-4 h-4 mr-2" />
              Dành cho producer
            </div>
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Phát triển sự nghiệp âm nhạc của bạn
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Tăng thu nhập, mở rộng mạng lưới khách hàng và xây dựng danh tiếng
              trong ngành âm nhạc
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Tiếp Thị Tự Động"
              desc="Trưng bày sản phẩm dễ dàng, tự động tiếp cận khách hàng tiềm năng."
              color="pink"
            />
            <FeatureCard
              icon={<Star className="w-8 h-8" />}
              title="Quản Lý Dự Án"
              desc="Giữ brief, phản hồi, và thanh toán an toàn trong một nền tảng duy nhất."
              color="yellow"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Phát Triển Sự Nghiệp"
              desc="Nhận huy hiệu, thu thập đánh giá và xây dựng danh tiếng vững chắc."
              color="indigo"
            />
          </div>
        </div>
      </section>

      {/* Pricing / Upgrade */}
      <section
        className="px-6 py-20 bg-gray-100 dark:bg-[#111827] transition-colors duration-300"
        data-aos="fade-up"
      >
        <UpdateProducer />
      </section>
    </div>
  );
};
export default HomePage;

type FeatureProps = {
  title: string;
  desc: string;
  icon?: React.ReactNode;
  color?: "green" | "purple" | "blue" | "pink" | "yellow" | "indigo";
  link?: string;
};
const FeatureCard: React.FC<FeatureProps> = ({
  title,
  desc,
  icon,
  color = "purple",
  link,
}) => {
  const colorClasses = {
    green:
      "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
    purple:
      "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30",
    blue: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
    pink: "text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30",
    yellow:
      "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30",
    indigo:
      "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30",
  };

  const CardContent = (
    <div
      className="group relative p-8 bg-white/80 dark:bg-[#1F2937]/80 backdrop-blur-sm rounded-2xl 
                    border border-gray-200/50 dark:border-gray-700/50 
                    hover:shadow-2xl hover:shadow-purple-500/10 hover:bg-white/90 dark:hover:bg-[#1F2937]/90 
                    transition-all duration-300 hover:-translate-y-1"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-300 blur"></div>
      <div className="relative">
        {icon && (
          <div
            className={`w-16 h-16 ${colorClasses[color]} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
          >
            {icon}
          </div>
        )}
        <h3 className="font-bold mb-4 text-xl text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );

  return link ? (
    <Link to={link}>
      {CardContent}
    </Link>
  ) : (
    CardContent
  );
};
