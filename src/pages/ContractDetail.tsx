import { motion } from "framer-motion";
import { FileText, Eye, Download, Edit, Share2, FileDown } from "lucide-react";
import { Link } from "react-router-dom";

export default function ContractDetail() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white p-6 mt-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Album Single - Pop 2025</h1>
          <p className="text-slate-400 text-sm">
            Xem chi tiết hợp đồng, cột mốc, tiến độ, thanh toán và lịch sử chỉnh
            sửa.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to={"/contractManage"}>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition flex items-center gap-2">
              <FileText size={18} /> Quản lý hợp đồng
            </button>
          </Link>
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition flex items-center gap-2">
            <Share2 size={18} /> Chia sẻ
          </button>
          <button className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition flex items-center gap-2">
            <Edit size={18} /> Chỉnh sửa
          </button>
          <button className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 transition flex items-center gap-2">
            <FileDown size={18} /> Tải PDF
          </button>
        </div>
      </motion.div>

      {/* Status */}
      <div className="mb-6 flex items-center gap-4">
        <span className="px-4 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-400 border border-green-500/40 shadow-md">
          Đang hiệu lực
        </span>
        <span className="text-xs text-slate-400">Mã: CNT-2025-014</span>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin hợp đồng */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-lg hover:scale-[1.01] transition"
          >
            <h2 className="text-xl font-semibold mb-3">Thông tin hợp đồng</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Bên A (Artist)</p>
                <p className="font-medium">Nguyễn Minh Anh</p>
              </div>
              <div>
                <p className="text-slate-400">Bên B (Producer)</p>
                <p className="font-medium">Kai Moreno</p>
              </div>
              <div>
                <p className="text-slate-400">Ngày hiệu lực</p>
                <p>23/08/2025</p>
              </div>
              <div>
                <p className="text-slate-400">Ngày tạo</p>
                <p>23/08/2025</p>
              </div>
              <div>
                <p className="text-slate-400">Giá trị</p>
                <p className="text-indigo-400 font-semibold">60.000.000₫</p>
              </div>
              <div>
                <p className="text-slate-400">Thời hạn</p>
                <p>Không xác định</p>
              </div>
            </div>
          </motion.div>

          {/* Phạm vi & Bàn giao */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-3">Phạm vi & Bàn giao</h2>
            <p className="text-sm text-slate-400 mb-2">Số vòng sửa: 2</p>
            <p className="text-sm">WAV 24bit, MP3 320kbps, Stems</p>
            <p className="text-sm text-slate-400 mt-2">
              Tempo: 120 BPM / C# Minor
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Ghi chú kỹ thuật: Không clip, peak -1dBTP, LUFS -14 cho bản phân
              phối
            </p>
          </motion.div>

          {/* Cột mốc tiến độ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">Cột mốc & Tiến độ</h2>
            <div className="space-y-3">
              {[
                {
                  name: "Demo ý tưởng",
                  date: "30/08/2025",
                  money: "6.000.000₫",
                  progress: 20,
                },
                {
                  name: "Thu âm & Sản xuất",
                  date: "10/09/2025",
                  money: "30.000.000₫",
                  progress: 60,
                },
                {
                  name: "Mix & Master",
                  date: "18/09/2025",
                  money: "24.000.000₫",
                  progress: 0,
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className="bg-slate-800 p-3 rounded-xl border border-white/5"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-indigo-400 font-semibold">{m.money}</p>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Hạn: {m.date}</span>
                    <span>{m.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                      style={{ width: `${m.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Văn bản hợp đồng */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-3">
              Xem trước văn bản hợp đồng
            </h2>
            <p className="text-sm text-slate-300 mb-2">
              Điều 1 - Phạm vi công việc: Producer chịu trách nhiệm sản xuất 1
              bản thu âm thể loại Pop, bao gồm thu âm, chỉnh sửa, mix và master.
            </p>
            <p className="text-sm text-slate-300 mb-2">
              Điều 2 - Thời hạn: Tổng thời gian thực hiện dự án 30-45 ngày kể từ
              ngày hiệu lực.
            </p>
            <p className="text-sm text-slate-300">
              Điều 3 - Thanh toán: 40% đặt cọc, 60% khi bàn giao master cuối
              cùng.
            </p>
          </motion.div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="space-y-6">
          {/* Điều khoản tài chính */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-3">Điều khoản tài chính</h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Đã thanh toán</span>
                <span className="text-green-400">24.000.000₫</span>
              </div>
              <div className="flex justify-between">
                <span>Còn lại</span>
                <span className="text-yellow-400">36.000.000₫</span>
              </div>
              <div className="flex justify-between">
                <span>Doanh thu quyền</span>
                <span className="text-slate-300">3% Net</span>
              </div>
            </div>
            <button className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 w-full hover:opacity-90 transition">
              Gửi yêu cầu ký
            </button>
          </motion.div>

          {/* Quyền & Sở hữu */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-3">Quyền & Sở hữu</h2>
            <p className="text-sm text-slate-400">Chủ sở hữu bản ghi: Artist</p>
            <p className="text-sm">Producer: Kai Moreno</p>
          </motion.div>

          {/* Tài liệu đính kèm */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-3">Tài liệu đính kèm</h2>
            <div className="space-y-3">
              {[
                { name: "Scope_of_Work.pdf", size: "1.2MB" },
                { name: "Invoice_1.pdf", size: "350KB" },
              ].map((doc, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-slate-800 px-3 py-2 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-indigo-400" />
                    <span className="text-sm">{doc.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-md bg-slate-700 hover:bg-slate-600">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 rounded-md bg-slate-700 hover:bg-slate-600">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Điều khoản bổ sung */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-3">Điều khoản bổ sung</h2>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
              <li>Điều khoản bảo mật (NDA)</li>
              <li>Điều khoản chấm dứt hợp đồng</li>
              <li>Điều khoản ghi công (Credit)</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
