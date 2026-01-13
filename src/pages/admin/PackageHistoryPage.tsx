import { Clock, Star, Rocket, Zap, Infinity, CalendarDays } from "lucide-react";

const fakeHistories = [
  {
    id: 1,
    packageName: "Basic Producer",
    icon: <Zap className="text-yellow-300" />,
    date: "2024-03-10",
    duration: "1 tháng",
    status: "Đã hết hạn",
    color: "from-yellow-500/30 to-orange-400/20",
  },
  {
    id: 2,
    packageName: "Pro Producer",
    icon: <Rocket className="text-cyan-300" />,
    date: "2024-05-10",
    duration: "3 tháng",
    status: "Đã hết hạn",
    color: "from-cyan-500/30 to-blue-400/20",
  },
  {
    id: 3,
    packageName: "Elite Producer",
    icon: <Star className="text-pink-300" />,
    date: "2024-08-10",
    duration: "6 tháng",
    status: "Đang hoạt động",
    color: "from-pink-500/30 to-purple-500/20",
  },
  {
    id: 4,
    packageName: "Ultimate Producer",
    icon: <Infinity className="text-amber-300" />,
    date: "2025-02-01",
    duration: "12 tháng",
    status: "Đang hoạt động",
    color: "from-amber-500/30 to-yellow-400/20",
  },
];

export default function PackageHistoryPage() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      {/* Header */}
      <header className="relative z-10 text-center py-16">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
          Lịch sử gói dịch vụ 🎶
        </h1>
        <p className="text-gray-300 mt-3 text-lg">
          Theo dõi hành trình nâng cấp của các Producer trên nền tảng.
        </p>
      </header>

      {/* Timeline */}
      <div className="relative z-10 max-w-5xl mx-auto px-8 pb-20">
        {/* Dòng timeline */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-pink-500 via-purple-500 to-cyan-500 rounded-full opacity-40"></div>

        {fakeHistories.map((item, index) => (
          <div
            key={item.id}
            className={`relative flex flex-col sm:flex-row items-center gap-6 mb-12 ${
              index % 2 === 0 ? "sm:flex-row-reverse" : ""
            }`}
          >
            {/* Dấu chấm trung tâm */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-r from-pink-400 to-cyan-400 border-4 border-[#1a0033] z-10 shadow-[0_0_15px_rgba(236,72,153,0.5)]"></div>

            {/* Nội dung card */}
            <div
              className={`relative bg-gradient-to-br ${item.color} border border-white/10 rounded-3xl p-6 w-full sm:w-5/12 backdrop-blur-md transition-all`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  {item.icon}
                </div>
                <h2 className="text-2xl font-bold">{item.packageName}</h2>
              </div>

              <div className="text-sm text-gray-300 space-y-2">
                <p className="flex items-center gap-2">
                  <CalendarDays size={16} /> Ngày kích hoạt:{" "}
                  <span className="text-white">{item.date}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={16} /> Thời hạn:{" "}
                  <span className="text-white">{item.duration}</span>
                </p>
                <p
                  className={`font-semibold ${
                    item.status === "Đang hoạt động"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {item.status}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-fuchsia-600/30 to-transparent" />
    </div>
  );
}
