import { useState } from "react";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  PlayCircle,
  Video,
  Image as ImageIcon,
} from "lucide-react";

interface Advertisement {
  id: number;
  title: string;
  description: string;
  type: "video" | "image";
  mediaUrl: string;
  date: string;
}

const fakeAds: Advertisement[] = [
  {
    id: 1,
    title: "Chiến dịch quảng bá gói Pro 🎧",
    description: "Thu hút hàng nghìn Producer với gói Pro nâng cấp mới nhất.",
    type: "image",
    mediaUrl:
      "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=800&q=60",
    date: "2025-08-01",
  },
  {
    id: 2,
    title: "Video hướng dẫn Producer Starter",
    description: "Video hướng dẫn đăng ký và sử dụng cơ bản cho người mới.",
    type: "video",
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    date: "2025-09-20",
  },
  {
    id: 3,
    title: "Sự kiện hợp tác cùng DJ Star 🔥",
    description: "Quảng bá sự kiện ra mắt gói Ultimate với DJ Star nổi tiếng.",
    type: "image",
    mediaUrl:
      "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=800&q=60",
    date: "2025-09-28",
  },
];

export default function AdvertisementManagementPage() {
  const [ads] = useState(fakeAds);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-10 py-12">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Quản lý Quảng Cáo 💡
          </h1>
          <p className="text-gray-300 mt-2">
            Quản lý bài quảng cáo, video hướng dẫn và chiến dịch truyền thông.
          </p>
        </div>

        <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-fuchsia-500 to-cyan-400 rounded-xl font-semibold text-black shadow-lg">
          <PlusCircle size={18} /> Thêm quảng cáo
        </button>
      </header>

      {/* Danh sách quảng cáo */}
      <div className="relative z-10 px-10 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="relative rounded-3xl border border-white/10 p-5 backdrop-blur-md bg-gradient-to-br from-white/5 to-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
          >
            {/* Media */}
            <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4">
              {ad.type === "image" ? (
                <img
                  src={ad.mediaUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <video
                  src={ad.mediaUrl}
                  className="w-full h-full object-cover rounded-2xl"
                  controls
                />
              )}

              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-xl text-xs flex items-center gap-1">
                {ad.type === "video" ? (
                  <>
                    <Video size={14} /> Video
                  </>
                ) : (
                  <>
                    <ImageIcon size={14} /> Hình ảnh
                  </>
                )}
              </div>
            </div>

            {/* Nội dung */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold">{ad.title}</h2>
              <p className="text-gray-300 text-sm">{ad.description}</p>
              <p className="text-xs text-gray-400 mt-2">Ngày đăng: {ad.date}</p>
            </div>

            {/* Action */}
            <div className="flex justify-end gap-3 mt-5">
              <button className="p-2 bg-white/10 rounded-lg hover:bg-fuchsia-500/30">
                <Eye size={16} />
              </button>
              <button className="p-2 bg-white/10 rounded-lg hover:bg-cyan-500/30">
                <Edit3 size={16} />
              </button>
              <button className="p-2 bg-white/10 rounded-lg hover:bg-red-500/30">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Khu vực video hướng dẫn */}
      <section className="relative z-10 px-10 py-10 border-t border-white/10">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent flex items-center gap-2">
          <PlayCircle /> Video hướng dẫn sử dụng 🎥
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((v) => (
            <div
              key={v}
              className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              <video
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                controls
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">
                  Hướng dẫn sử dụng tính năng nâng cao
                </h3>
                <p className="text-gray-400 text-sm">
                  Giới thiệu các bước sử dụng giao diện Producer Studio.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
