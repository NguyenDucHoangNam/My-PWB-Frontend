import React from 'react';
import { TrendingUp, Users, Star, Clock } from 'lucide-react';

const StatsSection: React.FC = () => {
  const stats = [
    { 
      number: "500+", 
      label: "Producer Tài Năng", 
      icon: <Users className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-500/20 to-cyan-500/20"
    },
    { 
      number: "1000+", 
      label: "Dự Án Thành Công", 
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-500/20 to-emerald-500/20"
    },
    { 
      number: "4.9★", 
      label: "Đánh Giá Trung Bình", 
      icon: <Star className="w-8 h-8" />,
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-500/20 to-orange-500/20"
    },
    { 
      number: "24/7", 
      label: "Hỗ Trợ Khách Hàng", 
      icon: <Clock className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-500/20 to-pink-500/20"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-aurora-gradient to-aurora relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10"></div>
      <div className="absolute top-10 left-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-10 right-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-6">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Thống kê ấn tượng</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Những con số biết nói
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Thành tựu của chúng tôi được thể hiện qua những con số ấn tượng và đáng tin cậy
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center scroll-animate group">
              <div className="relative">
                <div className={`absolute -inset-1 bg-gradient-to-r ${stat.color} rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500`}></div>
                <div className={`relative bg-gradient-to-br ${stat.bgColor} backdrop-blur-md rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2`}>
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                    {stat.number}
                  </div>
                  <div className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors duration-300">
                    {stat.label}
                  </div>
                  <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
