import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import image1 from "../assets/image/MacBook Pro 16_ - 12(1).png";
import SplitText from "../component/SplitText";
import SearchProducer from "../component/SearchProducer";
const builder = [
  { image: image1, name: "Nguyễn Đức Hoàng Nam", role: "Project Manager" },
  { image: image1, name: "Hồ Ngọc Minh", role: "Frontend Developer" },
  { image: image1, name: "Phạm Thanh Vũ", role: "Backend Developer" },
  { image: image1, name: "Võ Đức Vũ", role: "Backend Developer" },
  { image: image1, name: "Nguyễn Văn Hải Quyến", role: "Backend Developer" },
];

const Instruct = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050505] to-[#0d0d18] text-white flex flex-col items-center justify-center px-6 py-12 pt-[70px]">
      {/* Hero Text */}
      <div className="text-center max-w-3xl">
        <SplitText
          text="Nâng tầm quy trình sản xuất âm nhạc của bạn."
          splitType="chars"
          className="text-4xl md:text-6xl font-bold leading-tight"
        />
        <p className="mt-6 text-lg text-gray-300 pb-5">
          Hợp tác trực quan, quản lý chuyên nghiệp, thanh toán an toàn. Nền tảng
          tất-cả-trong-một dành cho Music Producer.
        </p>
        <button className="px-7 py-2.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition mb-7">
          <Link to={"/signup"}> Bắt đầu miễn phí </Link>
        </button>
        <button className="px-7 py-2.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition ml-2">
          <Link to={"/signup"}> Tham gia với tư cách Producer </Link>
        </button>
        <SearchProducer />
      </div>

      {/* Mock Audio Player */}
      <div className="mt-8 w-full max-w-4xl bg-[#1e1e28] rounded-2xl overflow-hidden shadow-[0_0_75px_#243c4d]">
        <iframe
          className="w-full h-64 md:h-96"
          src="https://www.youtube.com/embed/co-hmKQ9ZgI"
          title="YouTube video player"
        ></iframe>

        {/* Waveform mock */}

        {/* Controls */}
        <div className="flex items-center justify-between px-4 py-3 text-gray-300 text-sm border-t border-gray-700 shadow-[0_0_75px_#243c4d]">
          <div className="flex items-center gap-3">
            <span>00:00 / 02:34</span>
            <div className="w-40 h-1 bg-gray-600 rounded">
              <div className="h-1 bg-sky-400 w-1/3 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <input
              placeholder="Leave your comment..."
              className="bg-[#2a2a36] px-3 py-1 rounded text-white placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Đội ngũ phát triển */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <h1 className="text-[#f3f5fb] text-center text-[32px] font-medium leading-[140%]">
          Đội ngũ phát triển
        </h1>

        <div className="w-full flex justify-center py-10 bg-[#0f0f18] relative">
          <div className="relative w-[800px] overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-[#0f0f18] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-[#0f0f18] to-transparent z-10 pointer-events-none"></div>
            <div className="flex gap-10 animate-slide">
              {[...builder, ...builder].map((member, idx) => (
                <div key={idx} className="flex-shrink-0">
                  <img
                    src={member.image}
                    alt={`img-${idx}`}
                    className="w-64 h-72 rounded-xl object-cover shadow-lg hover:scale-105 transition-transform duration-300"
                  />
                  <h2 className="mt-2 text-lg font-semibold">{member.name}</h2>
                  <span className="text-sm text-gray-400">{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Instruct;
