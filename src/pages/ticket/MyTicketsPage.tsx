import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  TicketPostService,
  TicketReplyResponse,
  TicketResponse,
} from "@/services/ticketsService";
import { AxiosError } from "axios";
import AnimatedBackground from "@/component/background/AnimatedBackground";
import {
  Clock,
  FileText,
  MessageSquare,
  Package,
  Loader,
  AlertTriangle,
  Inbox,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import BackToProjectButton from "@/component/buttons/BackToProjectButton";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadStarsPreset } from "@tsparticles/preset-stars";
import type { Engine, ISourceOptions } from "@tsparticles/engine";

// -----------------------------
// 1️⃣ TypeScript Types chính xác theo response backend
// -----------------------------
interface PageInfo {
  size: number;
  number: number; // Trang hiện tại (0-based)
  totalElements: number;
  totalPages: number;
}

interface PageResponse<T> {
  content: T[];
  page: PageInfo;
}

// -----------------------------
// 2️⃣ Component chính: AdminTicketsPage
// -----------------------------
const AdminTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [ticketDetail, setTicketDetail] = useState<TicketResponse | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replies, setReplies] = useState<TicketReplyResponse[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  /* ---------- STARFIELD (tsParticles) ---------- */
  const [particlesReady, setParticlesReady] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadStarsPreset(engine);
    }).then(() => setParticlesReady(true));
  }, []);

  const particlesOptions: ISourceOptions = useMemo(
    () => ({
      preset: "stars",
      background: { color: { value: "transparent" } },
      fullScreen: { enable: true, zIndex: -1 },
      particles: {
        number: { value: 90, density: { enable: true, area: 900 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: {
          value: 0.55,
          random: { enable: true },
          animation: { enable: true, speed: 1, minimumValue: 0.1, sync: false },
        },
        size: { value: { min: 1, max: 3 }, random: { enable: true } },
        links: { enable: false },
        move: {
          enable: true,
          speed: 0.45,
          direction: "bottom-right",
          random: true,
          straight: false,
          outModes: "out",
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: "repulse" },
          onClick: { enable: true, mode: "push" },
        },
        modes: {
          repulse: { distance: 120, duration: 0.35 },
          push: { quantity: 3 },
        },
      },
    }),
    []
  );
  // -----------------------------
  // 3️⃣ Logic tải dữ liệu
  // -----------------------------
  const fetchAllTickets = useCallback(async (pageNumber: number) => {
    setLoading(true);
    setError(null);

    try {
      const response: PageResponse<TicketResponse> =
        await TicketPostService.getMyTickets(pageNumber, pageSize);
      console.log("data:", response);

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

  // -----------------------------
  // 4️⃣ Gọi API khi mount hoặc khi trang thay đổi
  // -----------------------------
  useEffect(() => {
    fetchAllTickets(page);
  }, [page, fetchAllTickets]);

  // -----------------------------
  // 5️⃣ Logic phân trang
  // -----------------------------
  const handlePreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };
  const renderStatusPill = (status: string) => {
    let classes =
      "px-3 py-1 text-xs font-bold rounded-full shadow-lg transition duration-200";
    const text = mapStatusToVietnamese(status);
    switch (status) {
      case "OPEN":
        classes +=
          " bg-green-600 text-white shadow-green-500/50 animate-pulse-slow";
        break;
      case "IN_PROGRESS":
        classes += " bg-blue-600 text-white shadow-blue-500/50";
        break;
      case "RESOLVED":
        classes += " bg-purple-600 text-white shadow-purple-500/50";
        break;
      case "CLOSED":
        classes += " bg-gray-600 text-gray-200";
        break;
      default:
        classes += " bg-gray-500 text-gray-200";
    }
    return <span className={classes}>{text}</span>;
  };
  const mapStatusToVietnamese = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Mới tạo";
      case "IN_PROGRESS":
        return "Đang xử lý";
      case "RESOLVED":
        return "Đã giải quyết";
      case "CLOSED":
        return "Đã đóng";
      default:
        return status;
    }
  };

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

  const openRepliesModal = async (ticketId: number) => {
    setLoadingReplies(true);
    try {
      const data = await TicketPostService.getTicketReplies(ticketId);
      setReplies(data);
      setReplyModalOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReplies(false);
    }
  };

  // -----------------------------
  // 6️⃣ UI hiển thị
  // -----------------------------
  const textNeonPrimary = "text-cyan-400";
  const textNeonSecondary = "text-purple-300";
  const bgCardDetail = "bg-[#150F28]"; // Nền modal đậm
  const borderCardDetail = "border-purple-600/70"; // Viền neon

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#060418] via-[#0A0A2A] to-[#0E0B3F] text-white">
      {/* Nebula layers */}
      <AnimatedBackground />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[36rem] w-[36rem] rounded-full bg-sky-600/20 blur-3xl" />
      </div>

      {/* Star field */}
      {particlesReady && <Particles options={particlesOptions} />}

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10">
        <div className="absolute top-[100px] left-2">
          <BackToProjectButton />
        </div>

        {/* Header */}
        <header className="mb-10 flex flex-col items-center gap-3 text-center mt-10 pt-4">
          <h1 className="pb-2 bg-gradient-to-r from-sky-300 via-fuchsia-300 to-pink-300 bg-clip-text text-4xl font-extrabold leading-tight text-transparent md:text-5xl">
            Trạm Kiểm Soát Hỗ Trợ
          </h1>
          <p className="max-w-2xl text-balance text-zinc-300/90">
            Theo dõi và quản lý các yêu cầu hỗ trợ từ khắp nơi trong thiên hà âm nhạc.
          </p>
          <div className="mt-2 flex items-center gap-3">
            <Link to={"/tickets"}>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-sky-600 px-5 py-2.5 text-white shadow-lg hover:from-fuchsia-500 hover:to-sky-500 transition-all"
              >
                + Tạo Báo Cáo
              </button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-16 text-center">
              <Loader className="mx-auto h-10 w-10 animate-spin text-fuchsia-300" />
              <p className="mt-4 text-zinc-300">Đang thiết lập liên kết không gian...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-xl p-12 text-center">
              <AlertTriangle className="mx-auto h-10 w-10 text-rose-300" />
              <p className="mt-3 font-semibold text-rose-200">
                Mất tín hiệu vệ tinh
              </p>
              <p className="mt-1 text-sm text-rose-200/80">{error}</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-12 text-center min-h-[50vh] flex flex-col justify-center items-center">
              <Inbox className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
              <p className="text-xl font-medium text-zinc-200">Khoang hỗ trợ trống rỗng!</p>
              <p className="text-sm text-zinc-400 mt-2">
                Chưa có báo cáo hỗ trợ nào được gửi. Mọi thứ đang yên bình.
              </p>
              <div className="mt-6">
                <Link to={"/tickets"}>
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-sky-600 px-5 py-2.5 text-white shadow-lg hover:from-fuchsia-500 hover:to-sky-500 transition-all"
                  >
                    Tạo Báo Cáo Ngay
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket, idx) => (
                <div
                  key={ticket.id}
                  onClick={() => openTicketDetail(ticket.id)}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {/* Gradient Border Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-cyan-500/20 to-pink-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Card Content */}
                  <div className="relative h-full bg-gradient-to-br from-[#1a1035] via-[#150d28] to-[#0d0a1a] border border-purple-500/20 group-hover:border-purple-400/50 rounded-2xl p-5 flex flex-col transition-all duration-300">

                    {/* Top Header with Status */}
                    <div className="flex justify-end items-center mb-4">
                      {renderStatusPill(ticket.status)}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-4 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-pink-300 transition-all duration-300">
                      {ticket.title}
                    </h3>

                    {/* Info Cards */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:border-sky-500/30 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                          <Package className="w-4 h-4 text-sky-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">Dự án</div>
                          <div className="text-sm text-white truncate">{ticket.projectName}</div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span>{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Xem chi tiết →
                      </div>
                    </div>

                    {/* Action Button if Resolved */}
                    {ticket.status === "RESOLVED" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openRepliesModal(ticket.id);
                        }}
                        className="mt-3 w-full py-2.5 text-sm rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition-all shadow-lg shadow-indigo-500/30"
                      >
                        💬 Xem phản hồi
                      </button>
                    )}
                  </div>

                  {/* Glow Effect */}
                  <div
                    className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
                    style={{
                      background:
                        "conic-gradient(from 180deg at 50% 50%, #8b5cf6, #22d3ee, #ec4899, #f43f5e, #8b5cf6)",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={handlePreviousPage}
              disabled={page === 0}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-zinc-200 backdrop-blur transition disabled:opacity-40 hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
              Trang trước
            </button>
            <span className="text-sm text-zinc-300">
              Trang <b>{page + 1}</b> / <b>{totalPages}</b>
            </span>
            <button
              onClick={handleNextPage}
              disabled={page >= totalPages - 1}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-zinc-200 backdrop-blur transition disabled:opacity-40 hover:bg-white/20"
            >
              Trang sau
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {/* MODAL CHI TIẾT TICKET */}
      {selectedTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={closeTicketDetail} // click ra ngoài đóng modal
          ></div>

          {/* MODAL CONTAINER */}
          <div
            // Tăng max-w lên 2xl để có thêm không gian hiển thị
            className={`relative z-10 max-w-2xl w-full p-8 ${bgCardDetail} rounded-xl border ${borderCardDetail} shadow-2xl shadow-purple-900/80 transform scale-95 animate-fade-in-scale`}
          >
            {/* NÚT ĐÓNG */}
            <button
              onClick={closeTicketDetail}
              className="absolute top-3 right-3 text-2xl text-red-400 opacity-80 hover:opacity-100 transition-opacity"
            >
              &times;
            </button>

            {/* LOADING STATE */}
            {ticketLoading && (
              <div className="flex flex-col items-center justify-center py-12">
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
              <div className="space-y-6">
                {/* TIÊU ĐỀ & STATUS */}
                <div className="flex justify-between items-start border-b border-indigo-500/40 pb-4">
                  <h2
                    className={`text-3xl font-extrabold ${textNeonPrimary} drop-shadow-[0_0_5px_rgba(74,222,128,0.2)]`}
                  >
                    {/* Icon MessageSquare (Giả định đã import) */}
                    <MessageSquare className="inline w-6 h-6 mr-3 text-pink-400" />
                    {ticketDetail.title}
                  </h2>
                  {renderStatusPill(ticketDetail.status)}
                </div>

                {/* METADATA - Đơn giản hóa, chỉ hiện Dự án và Ngày tạo */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {/* Dự án (Package) */}
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 flex items-center shadow-inner">
                    <Package className="w-5 h-5 mr-3 text-cyan-400 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-400 block">Dự án</strong>
                      <span className={textNeonSecondary}>
                        {ticketDetail.projectName}
                      </span>
                    </div>
                  </div>

                  {/* Ngày tạo (Clock) */}
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 flex items-center shadow-inner">
                    <Clock className="w-5 h-5 mr-3 text-pink-400 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-400 block">Ngày tạo</strong>
                      <span className="text-gray-300 text-xs">
                        {new Date(ticketDetail.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* NỘI DUNG CHI TIẾT */}
                {ticketDetail.description && (
                  <div className="pt-4 border-t border-purple-500/40">
                    <h3
                      className={`text-lg font-bold mb-2 ${textNeonSecondary}`}
                    >
                      📝 Nội dung báo cáo:
                    </h3>
                    <div className="p-4 bg-gray-900/60 rounded-lg border border-purple-800/50 text-gray-200 whitespace-pre-wrap shadow-inner overflow-y-auto max-h-48">
                      {ticketDetail.description}
                    </div>
                  </div>
                )}

                {/* ATTACHMENTS */}
                <div className="pt-4 border-t border-purple-500/40">
                  <h3 className={`text-lg font-bold mb-3 ${textNeonSecondary}`}>
                    {/* Icon FileText (Giả định đã import) */}
                    <FileText className="inline w-5 h-5 mr-2 text-blue-400" />
                    Data Logs / Tệp Đính Kèm (
                    {ticketDetail.attachmentUrls?.length || 0})
                  </h3>

                  {ticketDetail.attachmentUrls?.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-4 max-h-72 overflow-y-auto pr-2">
                      {ticketDetail.attachmentUrls.map((url, index) => {
                        const fileName = url.substring(url.lastIndexOf("/") + 1);
                        const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);

                        if (isImage) {
                          return (
                            <div
                              key={index}
                              className="relative group cursor-pointer rounded-lg overflow-hidden border border-purple-700/50 hover:border-cyan-400/70 transition-all bg-[#2A1D42] w-64"
                              onClick={() => setLightboxUrl(url)}
                            >
                              <img
                                src={url}
                                alt={fileName}
                                className="w-full h-36 object-cover transition-transform group-hover:scale-105"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">🔍 Xem chi tiết</span>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                <span className="text-xs text-gray-200 truncate block">
                                  {fileName.length > 25 ? fileName.substring(0, 22) + "..." : fileName}
                                </span>
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
                              className="flex items-center p-4 bg-[#2A1D42] rounded-lg border border-purple-700/50 hover:bg-[#3A2D52] hover:border-cyan-400/50 transition-all"
                            >
                              <span className="text-3xl mr-3">📄</span>
                              <span className="text-sm text-blue-300 truncate">{fileName}</span>
                            </a>
                          );
                        }
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic p-2 bg-gray-900/50 rounded-md">
                      Không có tệp đính kèm nào được phát hiện.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {replyModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-950/90 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-900/50 p-6 max-w-xl w-full relative transform transition-all duration-300 ease-out scale-100 opacity-100">
            {/* 🚀 Nút Đóng - Thiết kế như một nút điều khiển tàu không gian */}
            <button
              className="absolute top-4 right-4 text-purple-300 hover:text-white text-2xl p-1 rounded-full bg-purple-900/30 hover:bg-purple-700/50 transition-colors"
              onClick={() => setReplyModalOpen(false)}
              aria-label="Đóng cửa sổ"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>

            {/* 🌌 Tiêu đề - Hiển thị như một bảng điều khiển Holographic */}
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6 border-b border-purple-500/50 pb-2 tracking-wide">
              Phản hồi từ Trung tâm Điều phối
            </h2>

            {/* --- Nội dung Phản hồi --- */}
            {loadingReplies ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-cyan-300 animate-pulse text-lg">
                  Đang tải tín hiệu từ Vũ trụ...
                </p>
              </div>
            ) : replies.length === 0 ? (
              <div className="p-4 bg-gray-800/50 rounded-lg border border-cyan-500/30">
                <p className="text-gray-400 text-center">
                  Không có bản ghi liên lạc nào được tìm thấy
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar-space">
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="p-4 rounded-xl bg-gray-800/50 border border-cyan-600/20 hover:border-cyan-500/50 transition-all duration-200 shadow-md shadow-black/50 space-y-1"
                  >
                    {/* Thông tin Người gửi - Tag phi hành gia */}
                    <p className="text-sm font-semibold flex items-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${reply.senderRole === "ADMIN"
                          ? "bg-red-600/70 text-white shadow-red-500/40"
                          : "bg-cyan-600/70 text-white shadow-cyan-500/40"
                          } mr-2 uppercase tracking-wider`}
                      >
                        {reply.senderRole === "ADMIN" ? "ADMIN" : "PRODUCER"}
                      </span>
                      <span className="text-purple-300">
                        {reply.senderName}
                      </span>
                    </p>

                    {/* Nội dung Thông điệp */}
                    <p className="text-gray-100 mt-1 whitespace-pre-line text-base leading-relaxed">
                      {reply.content}
                    </p>

                    {/* Thời gian - Dấu thời gian liên lạc */}
                    <p className="text-xs text-gray-500 pt-1 border-t border-gray-700/50">
                      Thời gian Ghi nhận:{" "}
                      <span className="text-cyan-400">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </p>

                    {/* 📂 Tệp đính kèm - Dữ liệu Vệ tinh/Log */}
                    {reply.attachmentUrls?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-400 mb-1">
                          Tệp đính kèm (Dữ liệu Log):
                        </p>
                        <ul className="space-y-1">
                          {reply.attachmentUrls.map((url, idx) => (
                            <li key={idx}>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-indigo-400 hover:text-indigo-300 underline text-sm transition-colors"
                              >
                                <svg
                                  className="w-4 h-4 mr-1 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 10a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h6a1 1 0 100-2H7z"
                                    clipRule="evenodd"
                                  ></path>
                                </svg>
                                File Dữ liệu {idx + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
      }

      {/* LIGHTBOX - Xem ảnh phóng to */}
      {
        lightboxUrl && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={() => setLightboxUrl(null)}
          >
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white text-4xl font-light z-10 transition-colors"
            >
              ×
            </button>
            <img
              src={lightboxUrl}
              alt="Phóng to"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <a
              href={lightboxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full text-sm font-medium transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              📥 Tải xuống
            </a>
          </div>
        )
      }
    </div >
  );
};
<style>{`
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
    border: 1px solid rgba(56, 189, 248, 0.3); /* cyan-400 */
  }
  .custom-scrollbar-space::-webkit-scrollbar-thumb:hover {
    background-color: rgba(99, 102, 241, 0.8); /* indigo-500 */
  }
`}</style>

export default AdminTicketsPage;
