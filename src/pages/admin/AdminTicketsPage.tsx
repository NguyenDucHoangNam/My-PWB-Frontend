import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TicketPostService,
  TicketResponse,
  TicketStatus,
} from "@/services/ticketsService"; // Đường dẫn dịch vụ
import { AxiosError } from "axios";
import { useCosmicToast } from "@/component/toast/CosmicToastProvider";
import { ROUTER } from "@/routes/router";

// -----------------------------
// 2️⃣ Component chính: AdminTicketsPage
// -----------------------------
const AdminTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0); // Bắt đầu từ trang 0
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [ticketDetail, setTicketDetail] = useState<TicketResponse | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [replyLoading, setReplyLoading] = useState(false);
  const { showToast } = useCosmicToast();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  // ... (Logic fetchAllTickets, useEffect, handlePreviousPage, handleNextPage giữ nguyên)
  // -----------------------------
  // 3️⃣ Logic Tải Dữ liệu (Sử dụng getAllTickets)
  // -----------------------------
  const fetchAllTickets = useCallback(async (pageNumber: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await TicketPostService.getAllTickets(
        pageNumber,
        pageSize
      );

      setTickets(response.content);
      setTotalPages(response.page.totalPages);
      setPage(response.page.number);
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error("Lỗi API getAllTickets:", axiosError);
      setError(
        (axiosError.response?.data as any)?.message ||
        axiosError.message ||
        "Lỗi kết nối hoặc hệ thống."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // 4️⃣ Gọi API khi component mount hoặc khi trang thay đổi
  useEffect(() => {
    fetchAllTickets(page);
  }, [page, fetchAllTickets]);

  // 5️⃣ Logic Phân trang
  const handlePreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  // -----------------------------
  // 6️⃣ UI Hiển thị (ĐÃ SỬA THEO CONCEPT TỐI/NEON)
  // -----------------------------

  const openTicketDetail = async (ticketId: number) => {
    setSelectedTicketId(ticketId);
    setTicketLoading(true);
    setTicketError(null);
    try {
      const data = await TicketPostService.getTicketDetail(ticketId);
      setTicketDetail(data);
    } catch (err: any) {
      console.error(err);
      setTicketError("Không thể tải thông tin ticket. Vui lòng thử lại.");
    } finally {
      setTicketLoading(false);
    }
  };

  const closeTicketDetail = () => {
    setSelectedTicketId(null);
    setTicketDetail(null);
    setTicketError(null);
  };
  const handleReplySubmit = async (ticketId: number) => {
    if (!replyContent.trim()) return;

    try {
      setReplyLoading(true);

      // 1️⃣ Tạo reply
      await TicketPostService.createReply(
        ticketId,
        {
          content: replyContent,
        },
        replyFiles
      );

      // 3️⃣ Reload ticket detail
      const updatedDetail = await TicketPostService.getTicketDetail(ticketId);
      setTicketDetail(updatedDetail);

      // 4️⃣ Reset form
      setShowReplyForm(false);
      setReplyContent("");
      setReplyFiles([]);

      showToast("Đã gửi phản hồi thành công!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Đã có lỗi khi gửi phản hồi!", "error");
    } finally {
      setReplyLoading(false);
    }
  };
  const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED"];
  const statusLabelMap: Record<TicketStatus, string> = {
    OPEN: "Mới tạo",
    IN_PROGRESS: "Đang xử lý",
    RESOLVED: "Đã giải quyết",
  };

  const handleUpdateStatus = async (ticketId: number, status: TicketStatus) => {
    try {
      setTicketLoading(true);
      const updated = await TicketPostService.updateTicketStatus(
        ticketId,
        status
      );
      setTicketDetail(updated);

      // Cập nhật luôn danh sách table nếu đang load page hiện tại
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: updated.status } : t
        )
      );

      showToast(`Ticket đã chuyển sang trạng thái ${status}`, "success");
    } catch (err: any) {
      console.error(err);
      showToast(
        err.message || "Đã có lỗi khi cập nhật trạng thái ticket!",
        "error"
      );
    } finally {
      setTicketLoading(false);
    }
  };
  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "OPEN":
        return "bg-red-600/40 text-red-300 border-red-500 shadow-[0_0_6px_rgba(255,80,80,0.6)]";
      case "IN_PROGRESS":
        return "bg-yellow-600/40 text-yellow-300 border-yellow-500 shadow-[0_0_6px_rgba(255,200,80,0.6)]";
      case "RESOLVED":
        return "bg-green-600/40 text-green-300 border-green-500 shadow-[0_0_6px_rgba(80,255,120,0.6)]";
      default:
        return "bg-gray-700 text-gray-300 border-gray-500";
    }
  };

  const bgCard = "bg-gray-800 bg-opacity-70 backdrop-blur-sm";

  const handleOpenProject = (projectId?: number) => {
    if (!projectId) {
      showToast("Không tìm thấy mã dự án để điều hướng.", "error");
      return;
    }
    navigate(`${ROUTER.USER.PROJECTDETAIL}?id=${projectId}`);
  };

  if (loading) {
    return (
      <div
        className={`p-10 text-center text-indigo-400 ${bgCard} rounded-xl shadow-neon-md`}
      >
        🌀{" "}
        <span className="animate-pulse">
          Phi hành gia đang tải dữ liệu từ Trạm Quản lý...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-10 text-center text-red-400 border border-red-500 ${bgCard} rounded-xl shadow-2xl`}
      >
        ⚠️ **LỖI KẾT NỐI VŨ TRỤ:** **{error}**
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0520] via-[#0d0a2a] to-[#05021a] p-6 flex items-center justify-center">
        <div className="max-w-lg w-full mx-auto">
          <div className="relative">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 rounded-2xl blur-2xl animate-pulse"></div>
            
            {/* Main container */}
            <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-900/50 p-8 md:p-10">
              {/* Icon container with animation */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 blur-xl animate-pulse"></div>
                  
                  {/* Icon circle */}
                  <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-purple-600/40 via-pink-600/40 to-cyan-600/40 border-2 border-purple-400/50 flex items-center justify-center shadow-lg shadow-purple-900/50">
                    <svg 
                      className="w-12 h-12 md:w-14 md:h-14 text-purple-300 animate-bounce" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="1.5" 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  
                  {/* Floating particles */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-1/2 -left-3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                  Trạm hỗ trợ đang yên tĩnh
                </span>
              </h2>

              {/* Description */}
              <p className="text-gray-400 text-center text-base md:text-lg mb-2 leading-relaxed">
                Hiện tại không có ticket nào trong hệ thống
              </p>
              <p className="text-gray-500 text-center text-sm md:text-base">
                Các yêu cầu hỗ trợ từ người dùng sẽ xuất hiện tại đây
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0520] via-[#0d0a2a] to-[#05021a] p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              🛸 Trung Tâm Điều Phối Ticket
            </h1>
            <p className="text-gray-400 mt-2">Quản lý và xử lý tất cả yêu cầu hỗ trợ từ người dùng</p>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-4 mt-4 md:mt-0">
            <div className="px-4 py-2 bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl">
              <div className="text-2xl font-bold text-green-400">{tickets.filter(t => t.status === 'OPEN').length}</div>
              <div className="text-xs text-green-300/70">Mới tạo</div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl">
              <div className="text-2xl font-bold text-yellow-400">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</div>
              <div className="text-xs text-yellow-300/70">Đang xử lý</div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl">
              <div className="text-2xl font-bold text-purple-400">{tickets.filter(t => t.status === 'RESOLVED').length}</div>
              <div className="text-xs text-purple-300/70">Đã xong</div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#0f0825]/80 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl shadow-purple-900/30 overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-cyan-900/50">
                  <th className="py-4 px-5 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="py-4 px-5 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Dự án
                  </th>
                  <th className="py-4 px-5 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Người gửi
                  </th>
                  <th className="py-4 px-5 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="py-4 px-5 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="py-4 px-5 text-center text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Đính kèm
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-800/30">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="group hover:bg-purple-900/30 transition-all duration-200 cursor-pointer"
                    onClick={() => openTicketDetail(ticket.id)}
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/40 to-pink-600/40 flex items-center justify-center text-white font-bold text-sm border border-purple-500/30">
                          {ticket.id}
                        </div>
                        <div className="max-w-[200px]">
                          <div className="text-white font-medium truncate group-hover:text-cyan-300 transition-colors">
                            {ticket.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-3 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                        {ticket.projectName}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {ticket.createdBy?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="text-sm text-gray-300">{ticket.createdBy}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          handleUpdateStatus(ticket.id, e.target.value as TicketStatus)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-purple-500
                          ${getStatusColor(ticket.status)} 
                          cursor-pointer transition-all appearance-none pr-8`}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem' }}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s} className="bg-gray-900 text-white">
                            {statusLabelMap[s as TicketStatus]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-sm text-gray-400">
                        {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(ticket.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center">
                      {ticket.attachmentUrls?.length ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-500/20 text-pink-300 rounded-lg text-xs font-medium">
                          📎 {ticket.attachmentUrls.length}
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex justify-between items-center px-6 py-4 bg-[#0a0520]/50 border-t border-purple-500/20">
              <p className="text-sm text-gray-400">
                Hiển thị <span className="text-purple-300 font-semibold">{tickets.length}</span> ticket ·
                Trang <span className="text-purple-300 font-semibold">{page + 1}</span> / <span className="text-purple-300 font-semibold">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    bg-gray-800 text-gray-300 border border-gray-700
                    hover:bg-purple-900/50 hover:border-purple-500/50 hover:text-white
                    disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Trước
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    bg-gradient-to-r from-purple-600 to-pink-600 text-white
                    hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-500/30
                    disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* MODAL CHI TIẾT TICKET */}
      {selectedTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={closeTicketDetail} // click ra ngoài đóng modal
          ></div>

          {/* MODAL CONTAINER - nhỏ gọn hơn */}
          <div className="relative z-10 max-w-xl w-full mx-4 p-6 bg-[#150F28] rounded-xl border border-purple-600/70 shadow-2xl shadow-purple-900/80 max-h-[85vh] overflow-y-auto">
            {/* NÚT ĐÓNG */}
            <button
              onClick={closeTicketDetail}
              className="absolute top-3 right-3 text-2xl text-red-400 opacity-80 hover:opacity-100 transition-opacity"
            >
              &times; {/* Sử dụng ký tự X lớn hơn */}
            </button>

            {/* LOADING STATE */}
            {ticketLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                {/* Biểu tượng Load Spin Neon mạnh hơn */}
                <svg
                  className="w-10 h-10 animate-spin text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                <p className="mt-4 text-lg font-medium text-purple-300">
                  Đang tải hồ sơ nhiệm vụ...
                </p>
              </div>
            )}

            {/* ERROR STATE */}
            {ticketError && (
              <div className="p-5 text-red-300 bg-red-900/30 border border-red-700 rounded-lg shadow-inner">
                <h3 className="font-bold text-xl mb-2">
                  🚨 Lỗi Truyền Tải Dữ Liệu
                </h3>
                <p>{ticketError}</p>
              </div>
            )}

            {/* DETAIL CONTENT */}
            {ticketDetail && (
              // 1. Mission Control Container
              // Đảm bảo container chính có thể cuộn (overflow-y-auto) để không bị che nội dung
              <div className="space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar-space hide-scrollbar">
                {/* 2. HEADER - Tên Nhiệm vụ và Trạng thái */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-indigo-500/40 pb-4">
                  <h2
                    // Tiêu đề lớn, hiệu ứng holographic
                    className={`text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400 tracking-wider`}
                  >
                    {/* Giả định MessageSquare là một icon imported */}
                    <svg
                      className="inline w-7 h-7 mr-3 text-pink-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z"
                      ></path>
                    </svg>
                    {ticketDetail.title}
                  </h2>
                </div>

                {/* 3. METADATA - Thông số kỹ thuật nhiệm vụ */}
                {/* Thiết kế như các bảng mạch/chip dữ liệu */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  {/* Người tạo */}
                  <div className="p-3 bg-gray-800/60 rounded-lg border border-indigo-600/30 flex flex-col items-start shadow-md hover:border-indigo-500 transition-colors">
                    <strong className="text-gray-400 block flex items-center mb-1">
                      {/* Giả định User là một icon imported */}
                      <svg
                        className="w-4 h-4 mr-2 text-indigo-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        ></path>
                      </svg>
                      Người tạo
                    </strong>
                    <span className="text-cyan-300 font-medium truncate w-full">
                      {ticketDetail.createdBy}
                    </span>
                  </div>

                  {/* Dự án */}
                  <div className="p-3 bg-gray-800/60 rounded-lg border border-cyan-600/30 flex flex-col items-start shadow-md hover:border-cyan-500 transition-colors">
                    <strong className="text-gray-400 block flex items-center mb-1">
                      {/* Giả định Package là một icon imported */}
                      <svg
                        className="w-4 h-4 mr-2 text-cyan-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                        ></path>
                      </svg>
                      Dự án
                    </strong>
                    <span className="text-pink-300 font-medium truncate w-full">
                      {ticketDetail.projectName}
                    </span>
                    <button
                      onClick={() => handleOpenProject(ticketDetail.projectId)}
                      className="mt-2 px-3 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow hover:shadow-cyan-500/30 transition"
                    >
                      Xem dự án
                    </button>
                  </div>

                  {/* Ngày tạo */}
                  <div className="p-3 bg-gray-800/60 rounded-lg border border-pink-600/30 flex flex-col items-start shadow-md hover:border-pink-500 transition-colors">
                    <strong className="text-gray-400 block flex items-center mb-1">
                      {/* Giả định Clock là một icon imported */}
                      <svg
                        className="w-4 h-4 mr-2 text-pink-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      Ngày tạo
                    </strong>
                    <span className="text-gray-300 text-xs">
                      {new Date(ticketDetail.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* ID Ticket */}
                  <div className="p-3 bg-gray-800/60 rounded-lg border border-yellow-600/30 flex flex-col items-start shadow-md hover:border-yellow-500 transition-colors">
                    <strong className="text-gray-400 block flex items-center mb-1">
                      {/* Giả định Link là một icon imported */}
                      <svg
                        className="w-4 h-4 mr-2 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                        ></path>
                      </svg>
                      ID Ticket
                    </strong>
                    <span className="text-yellow-300 font-medium text-lg">
                      #{ticketDetail.id}
                    </span>
                  </div>
                </div>

                {/* --- Tóm tắt sự cố --- */}
                {ticketDetail.title && (
                  <div className="pt-4 border-t border-purple-500/40">
                    <h3
                      className={`text-lg font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 tracking-wide`}
                    >
                      Tóm tắt sự cố / Yêu cầu:
                    </h3>
                    <div className="p-3 bg-gray-900/70 rounded-xl border border-blue-600/30 text-gray-200 shadow-inner shadow-black/50">
                      {ticketDetail.title}
                    </div>
                  </div>
                )}

                {/* --- Chi tiết sự cố / Nội dung báo cáo --- */}
                {(ticketDetail.description || (ticketDetail as any).content) && (
                  <div className="pt-4 border-t border-purple-500/40">
                    <h3
                      className={`text-lg font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 tracking-wide`}
                    >
                      Chi tiết sự cố / Nội dung báo cáo:
                    </h3>
                    <div className="p-4 bg-gray-900/70 rounded-xl border border-green-600/30 text-gray-200 whitespace-pre-wrap shadow-inner shadow-black/50">
                      {ticketDetail.description || (ticketDetail as any).content || ""}
                    </div>
                  </div>
                )}

                {/* --- Tệp Đính Kèm --- */}
                <div className="pt-3 border-t border-purple-500/40">
                  <h3 className="text-sm font-bold mb-2 text-cyan-300">
                    📎 Tệp đính kèm ({ticketDetail.attachmentUrls?.length || 0})
                  </h3>

                  {ticketDetail.attachmentUrls?.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-3">
                      {ticketDetail.attachmentUrls.map((url, index) => {
                        const fileName = url.substring(url.lastIndexOf("/") + 1);
                        const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);

                        if (isImage) {
                          return (
                            <div
                              key={index}
                              className="relative group cursor-pointer rounded-lg overflow-hidden border border-purple-700/50 hover:border-cyan-400/70 transition-all bg-[#2A1D42] w-32"
                              onClick={() => setLightboxUrl(url)}
                            >
                              <img
                                src={url}
                                alt={fileName}
                                className="w-full h-24 object-cover transition-transform group-hover:scale-105"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-medium">🔍 Xem</span>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-[#2A1D42] rounded-lg border border-purple-700/50 hover:bg-[#3A2D52] hover:border-cyan-400/50 transition-all text-xs"
                            >
                              <span>📄</span>
                              <span className="text-blue-300 truncate max-w-[100px]">{fileName}</span>
                            </a>
                          );
                        }
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">
                      Không có tệp đính kèm.
                    </p>
                  )}
                </div>

                {/* --- Khu vực Giao tiếp (Communication Zone) --- */}
                <div className="pt-4 border-t border-indigo-500/40 flex flex-col gap-3">
                  {/* Nút hành động */}
                  <div className="flex justify-end gap-3">
                    {/* Button Trả lời lần đầu */}
                    {!showReplyForm && (
                      <button
                        onClick={() => setShowReplyForm(true)}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg transition duration-200 
            bg-green-600 border border-green-600 
            hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/40 
            active:scale-[0.98] active:shadow-inner"
                      >
                        Mở Kênh Liên lạc
                      </button>
                    )}
                  </div>

                  {/* FORM TRẢ LỜI */}
                  {showReplyForm && (
                    <div className="mt-4 p-5 bg-gray-900/70 border-2 border-green-600/50 rounded-xl space-y-4 shadow-xl shadow-green-900/30">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Nhập phản hồi để truyền tải qua kênh giao tiếp..."
                        className="w-full p-4 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/80 focus:border-green-500/80 transition-colors"
                        rows={4}
                      />
                      <input
                        type="file"
                        multiple
                        onChange={(e) =>
                          setReplyFiles(
                            e.target.files ? Array.from(e.target.files) : []
                          )
                        }
                        // Thiết kế input file kiểu "chọn tệp" trông đẹp hơn
                        className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/70 file:text-white hover:file:bg-indigo-600/70 transition"
                      />
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setShowReplyForm(false)}
                          className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                        >
                          Hủy Truyền tải
                        </button>
                        <button
                          onClick={() => handleReplySubmit(ticketDetail.id)}
                          disabled={replyLoading || !replyContent.trim()}
                          className={`px-4 py-2 rounded-lg text-white font-semibold transition duration-200 
                bg-green-600 border border-green-600 hover:bg-green-700
                ${replyLoading || !replyContent.trim()
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:shadow-lg hover:shadow-green-500/40 active:scale-[0.98]"
                            }`}
                        >
                          {replyLoading ? "Đang Truyền tải..." : "Gửi Phản hồi"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIGHTBOX cho xem ảnh */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white text-3xl hover:text-red-400 transition-colors z-10"
          >
            ×
          </button>
          <img
            src={lightboxUrl}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <a
            href={lightboxUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            📥 Tải xuống
          </a>
        </div>
      )}
    </div>
  );
};
<style>{`
  /* Thanh cuộn cho toàn bộ modal */
  .custom-scrollbar-space::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar-space::-webkit-scrollbar-track {
    background: rgba(100, 100, 100, 0.1);
    border-radius: 10px;
  }
  .custom-scrollbar-space::-webkit-scrollbar-thumb {
    background-color: rgba(147, 51, 234, 0.6); /* purple-600 */
    border-radius: 10px;
  }
  .custom-scrollbar-space::-webkit-scrollbar-thumb:hover {
    background-color: rgba(99, 102, 241, 0.8); /* indigo-500 */
  }

  /* Thanh cuộn cho phần attachments */
  .custom-scrollbar-attachments::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar-attachments::-webkit-scrollbar-track {
    background: rgba(45, 45, 45, 0.3);
    border-radius: 10px;
  }
  .custom-scrollbar-attachments::-webkit-scrollbar-thumb {
    background-color: rgba(60, 190, 250, 0.5); /* blue neon */
    border-radius: 10px;
  }
`}</style>

export default AdminTicketsPage;
