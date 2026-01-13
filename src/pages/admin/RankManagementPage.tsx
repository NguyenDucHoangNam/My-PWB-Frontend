import { useState } from "react";
import {
  Star,
  Crown,
  Music,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

interface RankItem {
  id: number;
  name: string;
  points: number;
  level: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
  change: number; // dương hoặc âm, thể hiện lên/xuống hạng
}

const fakeRankData: RankItem[] = [
  { id: 1, name: "DJ Nova", points: 9850, level: "Diamond", change: +2 },
  { id: 2, name: "Producer Alpha", points: 9420, level: "Platinum", change: 0 },
  { id: 3, name: "MC Luna", points: 8750, level: "Gold", change: -1 },
  { id: 4, name: "BeatMaker Orion", points: 7990, level: "Silver", change: +3 },
  { id: 5, name: "DJ Galaxy", points: 7400, level: "Bronze", change: 0 },
];

export default function RankManagementPage() {
  const [ranks] = useState<RankItem[]>(fakeRankData);

  const getLevelColor = (level: RankItem["level"]) => {
    switch (level) {
      case "Bronze":
        return "from-orange-700 to-amber-400 text-amber-300";
      case "Silver":
        return "from-gray-400 to-gray-100 text-gray-200";
      case "Gold":
        return "from-yellow-400 to-amber-200 text-yellow-300";
      case "Platinum":
        return "from-cyan-300 to-blue-400 text-cyan-200";
      case "Diamond":
        return "from-indigo-400 to-purple-500 text-indigo-200";
    }
  };

  return (
    <div className="relative min-h-screen  text-white overflow-hidden">
      {/* Header */}
      <header className="relative z-10 px-8 py-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
            Quản lý cấp bậc 🎵
          </h1>
          <p className="text-gray-300 mt-2">
            Theo dõi và cập nhật bảng xếp hạng các Producer hàng đầu trong hệ
            thống.
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-700/40 to-blue-600/40 px-6 py-3 rounded-xl border border-purple-400/20 text-sm">
          <Star className="inline-block mr-2 text-yellow-300" />
          Tổng hạng: {ranks.length}
        </div>
      </header>

      {/* Bảng xếp hạng */}
      <div className="relative z-10 px-8 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ranks.map((rank) => (
          <div
            key={rank.id}
            className={`rounded-2xl p-6 border border-white/10 bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.1)] hover:shadow-[0_0_35px_rgba(147,51,234,0.4)] transition-all duration-500`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                {rank.id === 1 ? (
                  <Crown className="text-yellow-400" size={28} />
                ) : (
                  <Music className="text-purple-300" size={24} />
                )}
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${getLevelColor(
                  rank.level
                )} bg-clip-text text-transparent border border-white/10`}
              >
                {rank.level}
              </span>
            </div>

            {/* Nội dung */}
            <h2 className="text-xl font-bold mb-2">{rank.name}</h2>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Điểm xếp hạng:</span>
              <span className="font-bold text-pink-300">{rank.points}</span>
            </div>

            <div className="flex items-center justify-between mt-2 text-sm">
              {rank.change > 0 ? (
                <div className="flex items-center gap-1 text-green-400">
                  <ArrowUpCircle size={16} /> +{rank.change} hạng
                </div>
              ) : rank.change < 0 ? (
                <div className="flex items-center gap-1 text-red-400">
                  <ArrowDownCircle size={16} /> {rank.change} hạng
                </div>
              ) : (
                <div className="text-gray-400 flex items-center gap-1">
                  <ArrowUpCircle size={14} className="opacity-30" /> Giữ nguyên
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Hiệu ứng "Wave Light" phía dưới */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-700/40 to-transparent" />
    </div>
  );
}
