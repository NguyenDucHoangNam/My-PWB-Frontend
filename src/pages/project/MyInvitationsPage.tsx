import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Check,
  X,
  Inbox,
  Loader,
  Calendar,
  User,
  Briefcase,
} from "lucide-react";
import projectService from "../../services/projectService";
import type {
  Invitation,
  Page as PageType,
} from "../../services/projectService";
import AnimatedBackground from "../../component/background/AnimatedBackground";
import { motion } from "framer-motion";
import CosmicSelect from "@/component/CosmicSelect";
import BackToProjectButton from "@/component/buttons/BackToProjectButton";
import { useCosmicToast } from "../../component/toast/CosmicToastProvider";

export default function MyInvitationsPage() {
  // States
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const { showToast } = useCosmicToast();
  // Modal state
  const [confirmAction, setConfirmAction] = useState<{
    type: "accept" | "decline" | null;
    invitation: Invitation | null;
  }>({ type: null, invitation: null });

  // pagination & sort
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState<
    "createdAt,desc" | "createdAt,asc" | "expiresAt,desc" | "expiresAt,asc"
  >("createdAt,desc");
  const [pageInfo, setPageInfo] = useState<PageType<Invitation> | null>(null);

  // Định nghĩa loadInvitations trước khi sử dụng
  const loadInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getMyInvitationsPage({
        page,
        size,
        sort,
      });
      setPageInfo(data);
      setInvitations(data.content || []);
    } catch (err: any) {
      console.error("Error loading invitations:", err);
      setError(err.message || "Không thể tải danh sách lời mời");
    } finally {
      setLoading(false);
    }
  }, [page, size, sort]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  // Lắng nghe event khi có lời mời mới được tạo từ TeamInvitationPage
  useEffect(() => {
    // Handler cho custom event (hoạt động trong cùng tab)
    const handleInvitationCreated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        projectId: number;
        email: string;
        timestamp: number;
      }>;
      if (customEvent.detail) {
        console.log("Nhận được thông báo lời mời mới:", customEvent.detail);
        // Reload danh sách sau một chút delay để đảm bảo server đã xử lý xong
        setTimeout(() => {
          loadInvitations();
        }, 1000);
      }
    };

    // Handler cho storage event (hoạt động giữa các tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "invitationCreated" && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          console.log("Nhận được thông báo lời mời mới từ tab khác:", data);
          // Reload danh sách sau một chút delay để đảm bảo server đã xử lý xong
          setTimeout(() => {
            loadInvitations();
          }, 1000);
        } catch (err) {
          console.error("Error parsing invitationCreated data:", err);
        }
      }
    };

    // Đăng ký listeners
    window.addEventListener("invitationCreated", handleInvitationCreated);
    window.addEventListener("storage", handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener("invitationCreated", handleInvitationCreated);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadInvitations]);

  const handleConfirm = async () => {
    const { type, invitation } = confirmAction;
    if (!invitation || !type) return;

    setProcessingId(invitation.invitationId);
    setConfirmAction({ type: null, invitation: null });
    setError(null);
    setSuccess(null);

    try {
      if (type === "accept") {
        let token = invitation.token || "";

        if (!token && invitation.invitationLink) {
          const urlParams = new URLSearchParams(
            invitation.invitationLink.split("?")[1] || ""
          );
          token = urlParams.get("token") || "";
        }

        if (token) {
          await projectService.acceptInvitation({ token });
        } else {
          await projectService.acceptInvitationById(invitation.invitationId);
        }

        setSuccess("Đã chấp nhận lời mời! Bạn đã tham gia phi vụ âm nhạc.");

        // Thông báo cho TeamInvitationPage để reload danh sách pending invitations
        const acceptEvent = new CustomEvent("invitationAccepted", {
          detail: {
            invitationId: invitation.invitationId,
            projectId: invitation.projectId,
            timestamp: Date.now(),
          },
        });
        window.dispatchEvent(acceptEvent);

        // Lưu vào localStorage để trigger storage event (hoạt động giữa các tab)
        localStorage.setItem(
          "invitationAccepted",
          JSON.stringify({
            invitationId: invitation.invitationId,
            projectId: invitation.projectId,
            timestamp: Date.now(),
          })
        );
        setTimeout(() => {
          localStorage.removeItem("invitationAccepted");
        }, 100);
      } else if (type === "decline") {
        await projectService.declineInvitation(invitation.invitationId);
        setSuccess("Đã từ chối lời mời! Bạn đã không tham gia phi vụ âm nhạc.");

        // Thông báo cho TeamInvitationPage để reload danh sách pending invitations
        const declineEvent = new CustomEvent("invitationDeclined", {
          detail: {
            invitationId: invitation.invitationId,
            projectId: invitation.projectId,
            timestamp: Date.now(),
          },
        });
        window.dispatchEvent(declineEvent);

        // Lưu vào localStorage để trigger storage event (hoạt động giữa các tab)
        localStorage.setItem(
          "invitationDeclined",
          JSON.stringify({
            invitationId: invitation.invitationId,
            projectId: invitation.projectId,
            timestamp: Date.now(),
          })
        );
        setTimeout(() => {
          localStorage.removeItem("invitationDeclined");
        }, 100);
      }

      setTimeout(() => {
        loadInvitations();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Không thể xử lý lời mời");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Không xác định";
      }
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Không xác định";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "CLIENT":
        return "Khách hàng";
      case "COLLABORATOR":
        return "Cộng tác viên";
      case "OBSERVER":
        return "Quan sát viên";
      default:
        return role;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/50">
            Đang chờ
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/50">
            Đã chấp nhận
          </span>
        );
      case "DECLINED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/50">
            Đã từ chối
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300 border border-gray-500/50">
            {status}
          </span>
        );
    }
  };

  // Show toast notifications for error and success
  useEffect(() => {
    if (error) {
      showToast(error, "error");
      setError(null); // Clear error after showing toast
    }
  }, [error, showToast]);

  useEffect(() => {
    if (success) {
      showToast(success, "success");
      setSuccess(null); // Clear success after showing toast
    }
  }, [success, showToast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A061D] via-[#100C2E] to-[#16124A] text-white font-sans p-6">
      {/* Background effects */}
      <AnimatedBackground />

      <div className="max-w-5xl mx-auto relative z-10 mt-14">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 pb-2">
              Tín Hiệu Triệu Tập
            </h1>
            <BackToProjectButton projectId={null} />
          </div>
          <p className="text-gray-400 mt-2">
            Quản lý và phản hồi các tín hiệu mời bạn tham gia các phi vụ âm
            nhạc.
          </p>
        </div>

        {/* Sort & Page Size */}
        <div className="mb-6 flex flex-wrap items-end gap-6">
          {/* --- Select Sort --- */}
          <div className="relative group">
            <div className="relative">
              <CosmicSelect
                label="Sắp xếp"
                value={sort}
                onChange={(v) => {
                  setPage(0);
                  setSort(v as any);
                }}
                options={[
                  { value: "createdAt,desc", label: "✨ Mới nhất" },
                  { value: "createdAt,asc", label: "🕰️ Cũ nhất" },
                  { value: "expiresAt,asc", label: "⏳ Sắp hết hạn" },
                  { value: "expiresAt,desc", label: "🌌 Hết hạn xa" },
                ]}
              />

              {/* Icon */}
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <motion.svg
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 15, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </div>

              {/* Glow border animation */}
              <motion.div
                className="absolute pointer-events-none inset-0 rounded-xl bg-gradient-to-r from-fuchsia-600/10 via-purple-600/10 to-indigo-600/10 opacity-0 blur-xl"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>
          </div>

          {/* --- Select Size --- */}
          <div className="relative group">
            <div className="relative">
              <CosmicSelect
                label="Hiển thị"
                value={String(size)}
                onChange={(v) => {
                  setPage(0);
                  setSize(Number(v));
                }}
                options={[
                  { value: "5", label: "5 / trang" },
                  { value: "10", label: "10 / trang" },
                  { value: "20", label: "20 / trang" },
                ]}
              />

              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <motion.svg
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 15, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </div>

              <motion.div
                className="absolute pointer-events-none inset-0 rounded-xl bg-gradient-to-r from-fuchsia-600/10 via-purple-600/10 to-indigo-600/10 opacity-0 blur-xl"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative bg-gray-900/40 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-10 overflow-hidden shadow-[0_0_30px_rgba(88,28,135,0.2)]">
          {/* Hiệu ứng ánh sáng vũ trụ */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute w-72 h-72 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur-3xl top-0 left-0 animate-pulse" />
            <div className="absolute w-72 h-72 bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-400 rounded-full blur-3xl bottom-0 right-0 animate-[blob_12s_infinite]" />
          </div>

          {loading ? (
            <div className="text-center py-24 relative z-10">
              <Loader
                className="animate-spin mx-auto mb-4 text-purple-400"
                size={64}
              />
              <p className="text-gray-300 text-lg">Đang tải lời mời...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-20 relative z-10">
              <Inbox
                size={90}
                className="mx-auto mb-6 text-gray-600 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              />
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                Không có lời mời nào
              </h2>
              <p className="text-gray-400">
                Vũ trụ đang yên tĩnh... chưa có tín hiệu từ dự án nào 🌌
              </p>
            </div>
          ) : (
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold mb-8 flex items-center gap-3 bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                <Mail className="text-purple-400" />
                Danh sách Tín hiệu ({invitations.length})
              </h2>

              <div className="grid gap-6">
                {invitations.map((invitation) => {
                  const isPending = invitation.status === "PENDING";
                  const isProcessing = processingId === invitation.invitationId;

                  return (
                    <div
                      key={invitation.invitationId}
                      className="group relative overflow-hidden rounded-2xl border border-gray-700/60 bg-gray-800/40 p-6 transition-all duration-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:scale-[1.02]"
                    >
                      {/* Viền neon di chuyển */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-[shine_6s_linear_infinite]" />
                      </div>

                      <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                              <Briefcase size={26} />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">
                                {invitation.projectTitle}
                              </h3>
                              <p className="text-sm text-gray-400">
                                Từ: {invitation.inviterName || "Chủ dự án"}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(invitation.status)}
                        </div>

                        {/* Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-purple-400" />
                            <span>
                              Vai trò:{" "}
                              <strong className="text-white">
                                {getRoleLabel(
                                  invitation.invitedRole ||
                                    invitation.role ||
                                    ""
                                )}
                              </strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-purple-400" />
                            <span>
                              Gửi lúc:{" "}
                              <strong className="text-white">
                                {formatDate(invitation.createdAt)}
                              </strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-purple-400" />
                            <span>
                              Hết hạn:{" "}
                              <strong className="text-white">
                                {formatDate(invitation.expiresAt)}
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-900/40 rounded-lg p-3 mb-5 border border-gray-700/60">
                          <p className="text-sm text-gray-400">
                            Email:{" "}
                            <span className="text-white">
                              {invitation.invitedEmail ||
                                invitation.inviteeEmail}
                            </span>
                          </p>
                        </div>

                        {isPending ? (
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                setConfirmAction({ type: "accept", invitation })
                              }
                              disabled={isProcessing}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader className="animate-spin" size={18} />
                                  Đang xử lý...
                                </>
                              ) : (
                                <>
                                  <Check size={18} />
                                  Xác nhận lên tàu
                                </>
                              )}
                            </button>
                            <button
                              onClick={() =>
                                setConfirmAction({
                                  type: "decline",
                                  invitation,
                                })
                              }
                              disabled={isProcessing}
                              className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 hover:shadow-[0_0_15px_rgba(107,114,128,0.4)] text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader className="animate-spin" size={18} />
                                  Đang xử lý...
                                </>
                              ) : (
                                <>
                                  <X size={18} />
                                  Từ chối lên tàu
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`p-3 rounded-lg text-center ${
                              invitation.status === "ACCEPTED"
                                ? "bg-green-500/10 text-green-300"
                                : "bg-red-500/10 text-red-300"
                            }`}
                          >
                            {invitation.status === "ACCEPTED"
                              ? "✓ Xác nhận lên tàu?"
                              : "✕ Bạn đã từ chối lời mời này"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* 🔮 Confirm Modal */}
          {confirmAction.type && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
              <div className="bg-gradient-to-br from-[#1E1635] to-[#2C235A] border border-purple-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-[0_0_25px_rgba(168,85,247,0.3)]">
                <h3 className="text-xl font-bold mb-3 text-purple-300">
                  {confirmAction.type === "accept"
                    ? "Xác nhận chấp nhận lên tàu?"
                    : "Xác nhận từ chối lên tàu?"}
                </h3>
                <p className="text-gray-400 mb-6">
                  Phi vụ:{" "}
                  <span className="text-white font-semibold">
                    {confirmAction.invitation?.projectTitle}
                  </span>
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleConfirm}
                    className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                      confirmAction.type === "accept"
                        ? "bg-green-600 hover:bg-green-500 text-white"
                        : "bg-red-600 hover:bg-red-500 text-white"
                    }`}
                  >
                    Xác nhận
                  </button>
                  <button
                    onClick={() =>
                      setConfirmAction({ type: null, invitation: null })
                    }
                    className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          <style>{`
    @keyframes blob {
      0%,100% { transform: translate(0,0) scale(1); }
      33% { transform: translate(40px,-30px) scale(1.1); }
      66% { transform: translate(-30px,20px) scale(0.9); }
    }
    @keyframes shine {
      0% { transform: translateX(-100%); opacity: 0.2; }
      50% { opacity: 0.5; }
      100% { transform: translateX(100%); opacity: 0.2; }
    }
       @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
  `}</style>
        </div>

        {/* Pagination */}
        {pageInfo && pageInfo.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-gray-300">
              Trang {page + 1} / {pageInfo.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => (pageInfo && !pageInfo.last ? p + 1 : p))
              }
              disabled={pageInfo.last}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
