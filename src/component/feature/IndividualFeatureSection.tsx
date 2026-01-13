import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  Zap,
  Star,
  CheckCircle,
  Users,
  BarChart3,
  Headphones,
  TrendingUp,
  Shield,
} from "lucide-react";

const IndividualFeatureSection: React.FC = () => {
  const features = [
    {
      id: "explore-producer",
      icon: <Search className="w-10 h-10 text-white" />,
      title: "Khám phá Producer",
      description:
        "Tìm kiếm và khám phá những producer tài năng nhất với công nghệ AI thông minh. Hệ thống sẽ gợi ý những producer phù hợp với phong cách âm nhạc và ngân sách của bạn.",
      features: [
        "Tìm kiếm theo phong cách âm nhạc",
        "Lọc theo ngân sách và thời gian",
        "Xem portfolio và đánh giá",
        "So sánh producer một cách trực quan",
      ],
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "collaboration-feedback",
      icon: <Zap className="w-10 h-10 text-white" />,
      title: "Hợp tác & Phản hồi",
      description:
        "Công cụ hợp tác real-time giúp bạn và producer làm việc hiệu quả. Chia sẻ ý tưởng, đưa ra phản hồi và theo dõi tiến độ dự án một cách minh bạch.",
      features: [
        "Chia sẻ ý tưởng và brief chi tiết",
        "Phản hồi real-time trên từng track",
        "Theo dõi tiến độ dự án",
        "Lưu trữ lịch sử thay đổi",
      ],
      image:
        "https://glints.com/vn/blog/wp-content/uploads/2023/05/ky-nang-phan-hoi.jpg",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "secure-file-management",
      icon: <Shield className="w-10 h-10 text-white" />,
      title: "Quản lý File an toàn",
      description:
        "Lưu trữ và chia sẻ file âm thanh một cách an toàn với hệ thống mã hóa tiên tiến. Bảo vệ bản quyền và tài sản trí tuệ của bạn.",
      features: [
        "Mã hóa file với công nghệ AES-256",
        "Chia sẻ file với quyền truy cập có kiểm soát",
        "Backup tự động và khôi phục dữ liệu",
        "Theo dõi lịch sử truy cập file",
      ],
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "project-management",
      icon: <TrendingUp className="w-10 h-10 text-white" />,
      title: "Quản lý Dự án",
      description:
        "Quản lý dự án âm nhạc một cách chuyên nghiệp với các công cụ theo dõi tiến độ, phân công nhiệm vụ và quản lý timeline hiệu quả.",
      features: [
        "Tạo timeline và milestone",
        "Phân công nhiệm vụ cho team",
        "Theo dõi tiến độ real-time",
        "Báo cáo và thống kê dự án",
      ],
      image:
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=800&q=80",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "contracts-payments",
      icon: <Headphones className="w-10 h-10 text-white" />,
      title: "Hợp đồng & Thanh toán",
      description:
        "Tạo hợp đồng thông minh và thanh toán an toàn. Đảm bảo quyền lợi của cả hai bên và minh bạch trong giao dịch.",
      features: [
        "Tạo hợp đồng tự động",
        "Thanh toán qua ví điện tử",
        "Bảo vệ quyền lợi hai bên",
        "Lưu trữ hợp đồng trên AWS",
      ],
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: "communication",
      icon: <BarChart3 className="w-10 h-10 text-white" />,
      title: "Giao tiếp",
      description:
        "Kết nối và giao tiếp hiệu quả với producer và khách hàng thông qua hệ thống chat tích hợp và video call chất lượng cao.",
      features: [
        "Chat real-time với team",
        "Video call chất lượng cao",
        "Chia sẻ file trong chat",
        "Thông báo thông minh",
      ],
      image:
        "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=800&q=80",
      color: "from-red-500 to-pink-500",
    },
    {
      id: "security",
      icon: <Users className="w-10 h-10 text-white" />,
      title: "Bảo mật",
      description:
        "Bảo vệ dữ liệu và thông tin cá nhân với hệ thống bảo mật đa lớp. Tuân thủ các tiêu chuẩn bảo mật quốc tế và bảo vệ quyền riêng tư.",
      features: [
        "Mã hóa dữ liệu end-to-end",
        "Xác thực 2 yếu tố",
        "Tuân thủ GDPR và các quy định",
        "Kiểm tra bảo mật định kỳ",
      ],
      image:
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80",
      color: "from-teal-500 to-cyan-500",
    },
    {
      id: "ai-support",
      icon: <Star className="w-10 h-10 text-white" />,
      title: "Hỗ Trợ AI",
      description:
        "Trợ lý AI thông minh hỗ trợ bạn trong mọi khía cạnh của dự án âm nhạc. Từ gợi ý producer đến phân tích xu hướng âm nhạc.",
      features: [
        "Gợi ý producer phù hợp",
        "Phân tích xu hướng âm nhạc",
        "Tự động tối ưu hóa workflow",
        "Hỗ trợ 24/7 với chatbot AI",
      ],
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
      color: "from-amber-500 to-yellow-500",
    },
  ];

  return (
    <>
      {features.map((feature, index) => {
        const isReversed = index % 2 !== 0; // So le layout

        return (
          <section
            key={feature.id}
            id={feature.id}
            className="relative py-28 overflow-hidden bg-black/80 backdrop-blur-xl border-b border-white/10"
          >
            {/* Cosmic Aurora Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className={`absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-r ${feature.color} opacity-25 blur-3xl animate-aurora-move rounded-full`}
              ></div>
              <div
                className={`absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-l ${feature.color} opacity-20 blur-3xl animate-aurora-pulse rounded-full`}
              ></div>
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(white_1px,transparent_1px)] [background-size:40px_40px] opacity-10 animate-stars"></div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
              <div
                className={`grid lg:grid-cols-2 gap-16 items-center ${
                  isReversed ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                {/* IMAGE */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="relative group rounded-3xl overflow-hidden shadow-2xl"
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover rounded-3xl transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                  {/* Đường xiên ánh sáng */}
                  <div
                    className={`absolute inset-y-0 ${
                      isReversed ? "left-0" : "right-0"
                    } w-20 bg-gradient-to-${isReversed ? "l" : "r"} ${
                      feature.color
                    } opacity-30 skew-x-12`}
                  ></div>
                </motion.div>

                {/* CONTENT */}
                <motion.div
                  initial={{
                    opacity: 0,
                    x: isReversed ? -60 : 60,
                  }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-white"
                >
                  <div
                    className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-4xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300/90 mb-8 text-lg leading-relaxed">
                    {feature.description}
                  </p>

                  <ul className="space-y-4">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 group">
                        <CheckCircle className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="text-gray-200 group-hover:text-white transition-colors">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
};

export default IndividualFeatureSection;
