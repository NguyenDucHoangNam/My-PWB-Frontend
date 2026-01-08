import React from "react";
import {
  FileText,
  Calendar,
  ShieldCheck,
  Search,
  Eye,
  Edit,
  Trash2,
  FileDown,
  Archive,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Layers,
  CreditCard,
  ScrollText,
  Cookie,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ContractManager: React.FC = () => {
  const contracts = [
    {
      id: 1,
      name: "Album Single - Pop 2025",
      status: "Đang hiệu lực",
      color: "green",
      value: "60.000.000₫",
      created: "23/08/2025",
      due: "-",
      actions: ["Xem", "Chỉnh sửa"],
    },
    {
      id: 2,
      name: 'EP Indie - "Night Drive"',
      status: "Bản nháp",
      color: "gray",
      value: "45.000.000₫",
      created: "12/08/2025",
      due: "19/08/2025",
      actions: ["Tiếp tục", "Xóa"],
    },
    {
      id: 3,
      name: "Sync License - TVC 30s",
      status: "Hoàn thành",
      color: "blue",
      value: "120.000.000₫",
      created: "01/07/2025",
      due: "05/07/2025",
      actions: ["PDF", "Lưu trữ"],
    },
    {
      id: 4,
      name: "Beat Lease - Drill Type",
      status: "Đã hủy",
      color: "red",
      value: "8.000.000₫",
      created: "20/06/2025",
      due: "25/06/2025",
      actions: ["Chi tiết", "Khôi phục"],
    },
  ];

  const sidebarItems = [
    { label: "Hợp đồng", icon: FileText },
    { label: "Cột mốc", icon: Layers },
    { label: "Thanh toán", icon: CreditCard },
    { label: "Điều khoản", icon: ScrollText },
    { label: "Cookie Policy", icon: Cookie },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[rgb(var(--bg))] dark:text-[rgb(var(--text))] flex transition-colors mt-16">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 dark:bg-[#111827] border-r border-gray-200 dark:border-gray-800 p-6 space-y-6">
        <h2 className="text-lg font-bold">ProdMatch</h2>
        <nav className="space-y-3">
          {sidebarItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                className={`flex items-center gap-3 px-3 py-2 w-full rounded-md ${
                  idx === 0
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </motion.button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Quản Lý Hợp Đồng</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Xem, lọc và theo dõi tất cả các hợp đồng của bạn.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {["Tất cả", "Bản nháp", "Đang hiệu lực", "Hoàn thành", "Đã hủy"].map(
            (f, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-600/40 transition-colors"
              >
                {f}
              </motion.button>
            )
          )}
          <div className="relative flex-1 max-w-sm ml-auto">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hợp đồng..."
              className="pl-9 pr-4 py-2 rounded-md w-full bg-gray-100 dark:bg-[#111827] border border-gray-300 dark:border-gray-700 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { title: "Tổng hợp đồng", value: "18", icon: FileText },
            { title: "Đang hiệu lực", value: "6", icon: ShieldCheck },
            { title: "Chờ ký", value: "3", icon: Calendar },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-[#111827] p-4 rounded-lg flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition border border-gray-200 dark:border-gray-800"
              >
                <Icon className="w-6 h-6 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <h2 className="text-lg font-semibold">{stat.value}</h2>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Contract List */}
        <div className="bg-white dark:bg-[#111827] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400">
              <tr>
                <th className="py-3 px-4 text-left">Hợp đồng</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Ngày tạo</th>
                <th className="py-3 px-4">Hạn ký</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {contracts.map((c, idx) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="hover:bg-gray-800/40"
                >
                  <td className="py-3 px-4">{c.name}</td>
                  <td className="text-center">
                    <span
                      className={`px-2 py-1 text-xs rounded-full bg-${c.color}-900/40 text-${c.color}-400`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="text-center">{c.created}</td>
                  <td className="text-center">{c.due}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      {c.actions.includes("Xem") && (
                        <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center gap-1 hover:bg-purple-100 dark:hover:bg-purple-600/50">
                          <Eye className="w-4 h-4" /> Xem
                        </button>
                      )}
                      {c.actions.includes("Chỉnh sửa") && (
                        <Link to={"/contractDetail"}>
                          <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center gap-1 hover:bg-purple-100 dark:hover:bg-purple-600/50">
                            <Edit className="w-4 h-4" /> Chi tiết
                          </button>
                        </Link>
                      )}
                      {c.actions.includes("Xóa") && (
                        <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center gap-1 hover:bg-red-100 dark:hover:bg-red-600/50">
                          <Trash2 className="w-4 h-4" /> Xóa
                        </button>
                      )}
                      {c.actions.includes("PDF") && (
                        <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center gap-1 hover:bg-blue-100 dark:hover:bg-blue-600/50">
                          <FileDown className="w-4 h-4" /> PDF
                        </button>
                      )}
                      {c.actions.includes("Lưu trữ") && (
                        <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center gap-1 hover:bg-blue-100 dark:hover:bg-blue-600/50">
                          <Archive className="w-4 h-4" /> Lưu
                        </button>
                      )}
                      {c.actions.includes("Khôi phục") && (
                        <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center gap-1 hover:bg-green-100 dark:hover:bg-green-600/50">
                          <RotateCcw className="w-4 h-4" /> Khôi phục
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-gray-400 text-sm">
            Hiển thị 1–4 trong 18 hợp đồng
          </span>
          <div className="flex space-x-2">
            <button className="p-2 bg-gray-700 rounded-md hover:bg-purple-600/50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 bg-gray-700 rounded-md hover:bg-purple-600/50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContractManager;