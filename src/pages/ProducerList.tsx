import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Star,
  BadgeCheck,
  Award,
  Music,
  UserRound,
  ChevronRight,
} from "lucide-react";

type Producer = {
  id: string;
  name: string;
  avatar: string;
  genres: string[];
  verified?: boolean;
  pro?: boolean;
  topRated?: boolean;
  rating: number;
  reviews: number;
  summary: string; // small tagline
  stat1: string;
  stat2: string;
};

const producers: Producer[] = [
  {
    id: "1",
    name: "NovaBeats",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
    genres: ["Hip-Hop", "Trap", "Lo-fi"],
    verified: true,
    topRated: true,
    rating: 4.9,
    reviews: 320,
    summary: "Đã hoàn thành 150+ dự án",
    stat1: "150+ dự án",
    stat2: "Xếp hạng cao",
  },
  {
    id: "2",
    name: "EchoLake",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=300&auto=format&fit=crop",
    genres: ["Pop", "Synthwave", "Indie"],
    pro: true,
    rating: 4.8,
    reviews: 210,
    summary: "Âm thanh hiện đại",
    stat1: "120+ dự án",
    stat2: "5 năm kinh nghiệm",
  },
  {
    id: "3",
    name: "PulseCraft",
    avatar:
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=300&auto=format&fit=crop",
    genres: ["EDM", "House", "Techno"],
    verified: true,
    topRated: true,
    rating: 4.7,
    reviews: 185,
    summary: "200+ buổi phát hành",
    stat1: "200+ publish",
    stat2: "Top Rated",
  },
  {
    id: "4",
    name: "SoulFoundry",
    avatar:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=300&auto=format&fit=crop",
    genres: ["R&B", "Neo-soul", "Pop"],
    rating: 5.0,
    reviews: 98,
    summary: "Âm sắc ấm áp",
    stat1: "80+ dự án",
    stat2: "Khách hàng quốc tế",
  },
  {
    id: "5",
    name: "DrumSmith",
    avatar:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=300&auto=format&fit=crop",
    genres: ["Rock", "Alternative", "Metal"],
    verified: true,
    rating: 4.6,
    reviews: 140,
    summary: "Năng lượng cao",
    stat1: "90+ ở tour",
    stat2: "Châu Âu",
  },
  {
    id: "6",
    name: "AmbientArc",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=300&auto=format&fit=crop",
    genres: ["Ambient", "Chill", "Downtempo"],
    rating: 4.8,
    reviews: 76,
    summary: "Khống gian thư giãn",
    stat1: "Bản nhạc phim",
    stat2: "Nhạc game",
  },
];

const tagClass =
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs border bg-gray-100 text-slate-700 border-gray-200 dark:bg-[#0E1B2A]/40 dark:text-blue-200 dark:border-white/5";

const Pill: React.FC<
  React.PropsWithChildren<{ tone?: "green" | "slate" | "purple"; icon?: React.ReactNode }>
> = ({ children, tone = "slate", icon }) => {
  const map: Record<string, string> = {
    green:
      "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/20",
    slate:
      "bg-gray-100 text-slate-700 border border-gray-200 dark:bg-white/5 dark:text-slate-200 dark:border-white/10",
    purple:
      "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-200 dark:border-fuchsia-400/20",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md ${map[tone]}`}>
      {icon}
      {children}
    </span>
  );
};

const SearchHero: React.FC = () => {
  return (
    <section className="mx-auto max-w-6xl mt-16">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0F1724] p-6 py-5">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Tìm Producer phù hợp cho âm nhạc của bạn
        </h1>
        <p className="text-gray-600 dark:text-slate-300 mt-2 text-sm">
          Nhập nghệ sĩ/bài hát, lọc theo thể loại hoặc dán link YouTube/Spotify để phân tích.
        </p>

        {/* Search 1 */}
        <div className="mt-5 grid gap-3">
          <div className="flex rounded-lg border border-gray-300 bg-white px-3 py-2 items-center shadow-xs dark:border-white/10 dark:bg-white/5">
            <Search className="w-5 h-5 text-slate-400 mr-2" />
            <input
              placeholder="Tìm theo nghệ sĩ, bài hát hoặc từ khóa..."
              className="bg-transparent outline-none w-full placeholder:text-gray-500 dark:placeholder:text-slate-400 text-sm text-gray-900 dark:text-white"
            />
            <button className="ml-3 px-3 py-1.5 rounded-md bg-fuchsia-600 text-white text-sm hover:bg-fuchsia-700 shadow-sm">
              Tìm kiếm
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-2 rounded-md bg-white border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10">
              <SlidersHorizontal className="w-4 h-4" />
              Thể loại: Tất cả
            </button>
            <button className="flex items-center gap-2 rounded-md bg-white border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10">
              <SlidersHorizontal className="w-4 h-4" />
              Tâm trạng: Bất kỳ
            </button>
          </div>

          <div className="flex rounded-lg border border-gray-300 bg-white px-3 py-2 items-center shadow-xs dark:border-white/10 dark:bg-white/5">
            <Music className="w-5 h-5 text-slate-400 mr-2" />
            <input
              placeholder="Dán link YouTube hoặc Spotify để phân tích tệp..."
              className="bg-transparent outline-none w-full placeholder:text-gray-500 dark:placeholder:text-slate-400 text-sm text-gray-900 dark:text-white"
            />
            <button className="ml-3 px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 border border-gray-300 shadow-xs dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-white">
              Phân tích
            </button>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button className="inline-flex items-center gap-2 rounded-md bg-green-400 text-white dark:bg-emerald-600/90 px-3 py-1.5 text-sm dark:hover:bg-emerald-600 ">
              <Search className="w-4 h-4" />
              Thử Tìm Kiếm Giống Âm Thanh
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm hover:bg-gray-50 border border-gray-300 text-gray-700 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-white">
              <Award className="w-4 h-4" />
              Duyệt Producer Hàng Đầu
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProducerCard: React.FC<{ p: Producer; index: number }> = ({ p, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0F1724] p-5 hover:shadow-md hover:border-fuchsia-500/30 transition group"
    >
      <div className="flex items-center gap-3">
        <img
          src={p.avatar}
          alt={p.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">{p.name}</h3>
            {p.verified && (
              <Pill tone="green" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                Đã xác minh
              </Pill>
            )}
            {p.pro && <Pill tone="purple">Pro</Pill>}
            {p.topRated && <Pill tone="slate">Top Rated</Pill>}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {p.genres.map((g) => (
              <span key={g} className={tagClass}>
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
        <Star className="w-4 h-4 text-amber-400" />
        <span className="font-medium">{p.rating}</span>
        <span className="text-gray-500 dark:text-slate-400">({p.reviews} đánh giá)</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-gray-50 border border-gray-200 dark:bg-white/5 dark:border-white/10 px-3 py-2">
          <span className="text-gray-700 dark:text-slate-300">{p.summary}</span>
        </div>
        <div className="rounded-lg bg-gray-50 border border-gray-200 dark:bg-white/5 dark:border-white/10 px-3 py-2 flex items-center justify-between">
          <div className="text-gray-700 dark:text-slate-300">
            <div>{p.stat1}</div>
            <div className="text-gray-500 dark:text-slate-400 text-xs">{p.stat2}</div>
          </div>
          <BadgeCheck className="w-5 h-5 text-fuchsia-400" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
          <UserRound className="w-4 h-4" />
          <span>Xem hồ sơ</span>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-fuchsia-600 text-white px-3 py-1.5 text-sm hover:bg-fuchsia-700 shadow-sm">
          Xem hồ sơ <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const GridSection: React.FC = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Gợi ý thông minh</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm">
          12 Producer phù hợp • Sắp xếp: Đánh giá cao
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {producers.map((p, i) => (
          <ProducerCard key={p.id} p={p} index={i} />
        ))}
      </div>
    </section>
  );
};

const ProducerList: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#0B1320] dark:text-white">
      <SearchHero />
      <GridSection />
    </div>
  );
};

export default ProducerList;
