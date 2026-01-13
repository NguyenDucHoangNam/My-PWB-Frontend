import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, Search } from "lucide-react";

type Complaint = {
  id: string;
  title: string;
  user: string;
  date: string;
  status: "pending" | "resolved" | "in-progress";
};

const complaints: Complaint[] = [
  {
    id: "CPL-001",
    title: "Producer không phản hồi sau khi nhận dự án",
    user: "Minh Nguyen",
    date: "2025-09-01",
    status: "pending",
  },
  {
    id: "CPL-002",
    title: "Bị thu phí gói dịch vụ 2 lần",
    user: "Lan Pham",
    date: "2025-09-02",
    status: "resolved",
  },
  {
    id: "CPL-003",
    title: "File nhạc upload bị lỗi",
    user: "Khai Tran",
    date: "2025-09-05",
    status: "in-progress",
  },
];

const ComplaintList: React.FC = () => {
  const getStatusBadge = (status: Complaint["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-yellow-900/40 text-yellow-400">
            <AlertTriangle className="w-3 h-3" /> Đang chờ
          </span>
        );
      case "resolved":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-green-900/40 text-green-400">
            <CheckCircle2 className="w-3 h-3" /> Đã giải quyết
          </span>
        );
      case "in-progress":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-blue-900/40 text-blue-400">
            <Clock className="w-3 h-3" /> Đang xử lý
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[rgb(var(--bg))] dark:text-[rgb(var(--text))] p-8 transition-colors mt-[70px]">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-2xl font-bold">Danh sách đơn khiếu nại</h1>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm khiếu nại..."
            className="pl-10 pr-4 py-2 rounded-md bg-gray-100 dark:bg-[#111827] border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-purple-500 text-sm"
          />
        </div>
      </motion.div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-colors">
          <thead className="bg-gray-100 dark:bg-[#111827] text-gray-600 dark:text-gray-400 text-sm">
            <tr>
              <th className="px-4 py-3 text-left">Mã đơn</th>
              <th className="px-4 py-3 text-left">Tiêu đề</th>
              <th className="px-4 py-3 text-left">Người gửi</th>
              <th className="px-4 py-3 text-left">Ngày gửi</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c, i) => (
              <motion.tr
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#1F2937] transition"
              >
                <td className="px-4 py-3 font-mono text-sm">{c.id}</td>
                <td className="px-4 py-3">{c.title}</td>
                <td className="px-4 py-3">{c.user}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.date}</td>
                <td className="px-4 py-3">{getStatusBadge(c.status)}</td>
                <td className="px-4 py-3 text-right">
                  <button className="px-3 py-1 text-sm rounded-md bg-purple-600 hover:bg-purple-700 text-white transition">
                    Xem chi tiết
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplaintList;
