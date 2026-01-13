import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCosmicToast } from "../../component/toast/CosmicToastProvider";
import {
  Video,
  Plus,
  Users,
  Calendar,
  Clock,
  Play,
  X,
  BarChart3,
  Crown,
  Loader2,
  Filter,
  Edit,
  Trash2,
  StopCircle,
  UserPlus,
} from "lucide-react";
import {
  getProjectSessions,
  createSession,
  updateSession,
  deleteSession,
  startSession,
  cancelSession,
  joinSession,
  endSession,
  isSessionHost,
  canJoinSession,
  formatSessionDuration,
  getAvailableMembers,
  inviteMoreMembers,
} from "../../services/sessionApi";
import type {
  Session,
  SessionStatus,
  AvailableMember,
} from "../../types/session";
import InviteMembersSection from "../../component/project/session/InviteMembersSection";
import BackToProjectButton from "@/component/buttons/BackToProjectButton";
import AnimatedBackground from "@/component/background/AnimatedBackground";

const StatusBadge: React.FC<{ status: SessionStatus }> = ({ status }) => {
  const configs = {
    SCHEDULED: {
      color: "bg-yellow-500/25 text-yellow-300 border-yellow-500/50",
      shadow: "shadow-lg shadow-yellow-500/20",
      icon: Calendar,
    },
    ACTIVE: {
      color: "bg-green-500/25 text-green-300 border-green-500/50",
      shadow: "shadow-lg shadow-green-500/20",
      icon: Video,
    },
    ENDED: {
      color: "bg-gray-500/25 text-gray-300 border-gray-500/50",
      shadow: "shadow-lg shadow-gray-500/20",
      icon: BarChart3,
    },
    CANCELLED: {
      color: "bg-red-500/25 text-red-300 border-red-500/50",
      shadow: "shadow-lg shadow-red-500/20",
      icon: X,
    },
  };

  const texts = {
    SCHEDULED: "Đã lên lịch",
    ACTIVE: "Đang diễn ra",
    ENDED: "Đã kết thúc",
    CANCELLED: "Đã hủy",
  };

  const config = configs[status];
  const IconComponent = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${config.color} ${config.shadow}`}
    >
      <IconComponent size={12} className="drop-shadow-[0_0_4px_currentColor]" />
      {texts[status]}
    </div>
  );
};

const SessionCard: React.FC<{
  session: Session;
  onStart: (id: string) => void;
  onJoin: (id: string) => void;
  onCancel: (id: string) => void;
  onEnd: (id: string) => void;
  onEdit: (session: Session) => void;
  onDelete: (id: string) => void;
  onInviteMore: (id: string) => void;
  onViewDetails: (id: string) => void;
}> = ({
  session,
  onStart,
  onJoin,
  onCancel,
  onEnd,
  onEdit,
  onDelete,
  onInviteMore,
  onViewDetails,
}) => {
  const isHost = session.currentUserId
    ? isSessionHost(session, session.currentUserId)
    : false;

  // ✅ Check if session can be edited (ONLY SCHEDULED)
  const canEdit = isHost && session.status === "SCHEDULED";

  // ✅ Check if session can be deleted (SCHEDULED, ENDED, or CANCELLED)
  const canDelete =
    isHost &&
    (session.status === "SCHEDULED" ||
      session.status === "ENDED" ||
      session.status === "CANCELLED");

  // ✅ Check if can invite more members (SCHEDULED + PRIVATE)
  const canInviteMore =
    isHost && session.status === "SCHEDULED" && !session.isPublic;

  // Collect all action buttons by category
  const primaryActions: React.ReactElement[] = [];
  const secondaryActions: React.ReactElement[] = [];
  const destructiveActions: React.ReactElement[] = [];

  // Primary Actions (Main actions) - Enhanced
  if (session.status === "ACTIVE" && canJoinSession(session)) {
    primaryActions.push(
      <button
        key="join"
        onClick={() => onJoin(session.id)}
        className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 shadow-[0_4px_20px_rgba(34,197,94,0.4)] hover:shadow-[0_6px_30px_rgba(34,197,94,0.6)] hover:scale-105 text-sm backdrop-blur-sm border border-green-400/30"
      >
        <Video
          size={16}
          className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
        />
        Tham gia
      </button>
    );
  }

  if (session.status === "SCHEDULED" && isHost) {
    primaryActions.push(
      <button
        key="start"
        onClick={() => onStart(session.id)}
        className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_30px_rgba(59,130,246,0.6)] hover:scale-105 text-sm backdrop-blur-sm border border-blue-400/30"
      >
        <Play
          size={16}
          className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
        />
        Bắt đầu
      </button>
    );
  }

  if (session.status === "ENDED") {
    primaryActions.push(
      <button
        key="details"
        onClick={() => onViewDetails(session.id)}
        className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 shadow-[0_4px_20px_rgba(107,114,128,0.3)] hover:shadow-[0_6px_30px_rgba(107,114,128,0.5)] hover:scale-105 text-sm backdrop-blur-sm border border-gray-500/30"
      >
        <BarChart3
          size={16}
          className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
        />
        Chi tiết
      </button>
    );
  }

  // Secondary Actions (Edit, Invite) - Enhanced
  if (canEdit) {
    secondaryActions.push(
      <button
        key="edit"
        onClick={() => onEdit(session)}
        className="flex items-center justify-center gap-1.5 bg-gray-800/60 hover:bg-gray-700/80 text-gray-200 hover:text-white px-3.5 py-2 rounded-xl font-medium transition-all duration-300 text-sm border border-gray-600/50 hover:border-gray-500/70 backdrop-blur-sm shadow-md hover:shadow-lg hover:scale-105"
        title="Chỉnh sửa session"
      >
        <Edit size={14} />
        Sửa
      </button>
    );
  }

  if (canInviteMore) {
    secondaryActions.push(
      <button
        key="invite"
        onClick={() => onInviteMore(session.id)}
        className="flex items-center justify-center gap-1.5 bg-gray-800/60 hover:bg-gray-700/80 text-gray-200 hover:text-white px-3.5 py-2 rounded-xl font-medium transition-all duration-300 text-sm border border-gray-600/50 hover:border-gray-500/70 backdrop-blur-sm shadow-md hover:shadow-lg hover:scale-105"
        title="Mời thêm thành viên"
      >
        <UserPlus size={14} />
        Mời
      </button>
    );
  }

  // Destructive Actions (Cancel, Delete, End) - Enhanced
  if (session.status === "SCHEDULED" && isHost) {
    destructiveActions.push(
      <button
        key="cancel"
        onClick={() => onCancel(session.id)}
        className="flex items-center justify-center gap-1.5 bg-red-600/20 hover:bg-red-600/35 text-red-300 hover:text-red-200 px-3.5 py-2 rounded-xl font-medium transition-all duration-300 text-sm border border-red-500/40 hover:border-red-400/60 backdrop-blur-sm shadow-md hover:shadow-lg hover:shadow-red-500/30 hover:scale-105"
      >
        <X size={14} />
        Hủy
      </button>
    );
  }

  if (session.status === "ACTIVE" && isHost) {
    destructiveActions.push(
      <button
        key="end"
        onClick={() => onEnd(session.id)}
        className="flex items-center justify-center gap-1.5 bg-red-600/20 hover:bg-red-600/35 text-red-300 hover:text-red-200 px-3.5 py-2 rounded-xl font-medium transition-all duration-300 text-sm border border-red-500/40 hover:border-red-400/60 backdrop-blur-sm shadow-md hover:shadow-lg hover:shadow-red-500/30 hover:scale-105"
        title="Kết thúc phiên ngay lập tức"
      >
        <StopCircle size={14} />
        Kết thúc
      </button>
    );
  }

  if (canDelete) {
    destructiveActions.push(
      <button
        key="delete"
        onClick={() => onDelete(session.id)}
        className="flex items-center justify-center gap-1.5 bg-red-600/20 hover:bg-red-600/35 text-red-300 hover:text-red-200 px-3.5 py-2 rounded-xl font-medium transition-all duration-300 text-sm border border-red-500/40 hover:border-red-400/60 backdrop-blur-sm shadow-md hover:shadow-lg hover:shadow-red-500/30 hover:scale-105"
        title="Xóa session"
      >
        <Trash2 size={14} />
        Xóa
      </button>
    );
  }

  return (
    <div className="group relative bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/60 hover:border-purple-500/60 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] transition-all duration-300 shadow-xl shadow-purple-900/20 overflow-hidden">
      {/* Animated Background Layer */}

      {/* Orbital Ring Effect - Outer */}
      <div className="absolute -inset-1 rounded-3xl border border-dashed border-purple-500/20 group-hover:border-purple-400/40 animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Pulsing Glow Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-purple-500/3 group-hover:to-purple-500/5 transition-all duration-500 animate-pulse-ring opacity-0 group-hover:opacity-100 pointer-events-none" />

      {/* Decorative Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div
          className="absolute top-2 right-4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-6 left-8 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute bottom-4 right-8 w-1 h-1 bg-cyan-300 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-8 left-4 w-1 h-1 bg-purple-300 rounded-full animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="relative z-10">
        {/* Header: Badges + Title */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            {/* Badges Row - Enhanced */}
            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
              <StatusBadge status={session.status} />
              {session.isPublic ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/50 rounded-full text-xs font-semibold backdrop-blur-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all">
                  <Users size={11} />
                  PUBLIC
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/50 rounded-full text-xs font-semibold backdrop-blur-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all">
                  <Users size={11} />
                  PRIVATE
                </div>
              )}
              {isHost && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 rounded-full text-xs font-semibold backdrop-blur-sm shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all">
                  <Crown size={11} />
                  Host
                </div>
              )}
            </div>
            {/* Title - Enhanced */}
            <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-purple-300 transition-all duration-300 line-clamp-1 drop-shadow-lg">
              {session.title}
            </h3>
          </div>
        </div>

        {/* Description - Enhanced */}
        {session.description && (
          <p className="text-gray-300 mb-5 text-sm leading-relaxed line-clamp-2 bg-gray-900/30 rounded-lg px-3 py-2 border border-gray-700/30 backdrop-blur-sm">
            {session.description}
          </p>
        )}

        {/* Session Info - Enhanced Layout */}
        <div className="flex flex-wrap items-center gap-4 text-xs mb-5 pb-5 border-b border-gray-700/60 relative">
          {/* Decorative divider dots */}
          <div className="absolute -bottom-[2px] left-1/4 w-1 h-1 bg-purple-400/60 rounded-full" />
          <div className="absolute -bottom-[2px] right-1/4 w-1 h-1 bg-purple-400/60 rounded-full" />

          <div className="flex items-center gap-2 text-gray-300 bg-gray-900/40 px-3 py-1.5 rounded-lg border border-gray-700/40 backdrop-blur-sm">
            <Crown
              size={13}
              className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
            />
            <span className="text-white font-semibold">{session.hostName}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 bg-gray-900/40 px-3 py-1.5 rounded-lg border border-gray-700/40 backdrop-blur-sm">
            <Users
              size={13}
              className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
            />
            <span className="text-white font-medium">
              {session.currentParticipants} người
            </span>
          </div>
          {session.scheduledStart && (
            <div className="flex items-center gap-2 text-gray-300 bg-gray-900/40 px-3 py-1.5 rounded-lg border border-gray-700/40 backdrop-blur-sm">
              <Calendar
                size={13}
                className="text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
              />
              <span className="text-white font-medium">
                {new Date(session.scheduledStart).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
          {session.actualStart && session.actualEnd && (
            <div className="flex items-center gap-2 text-gray-300 bg-gray-900/40 px-3 py-1.5 rounded-lg border border-gray-700/40 backdrop-blur-sm">
              <Clock
                size={13}
                className="text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]"
              />
              <span className="text-white font-medium">
                {formatSessionDuration(session.actualStart, session.actualEnd)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons - Enhanced with Cosmic Effects */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Primary Actions - With Orbital Effects */}
          {primaryActions.length > 0 && (
            <div className="flex items-center gap-3">
              {primaryActions.map((action, idx) => (
                <div key={idx} className="relative group/btn">
                  {/* Orbital Ring for Primary Actions */}
                  <div className="absolute -inset-1 rounded-xl border border-dashed border-green-500/30 group-hover/btn:border-green-400/60 animate-spin-slow opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  {/* Pulsing Glow */}
                  <div className="absolute inset-0 rounded-xl bg-green-500/0 group-hover/btn:bg-green-500/10 transition-all duration-300 animate-pulse-ring opacity-0 group-hover/btn:opacity-100 pointer-events-none" />
                  {action}
                </div>
              ))}
            </div>
          )}

          {/* Secondary Actions */}
          {secondaryActions.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              {secondaryActions}
            </div>
          )}

          {/* Destructive Actions */}
          {destructiveActions.length > 0 && (
            <div className="flex items-center gap-2">{destructiveActions}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const LiveSessionList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");
  const navigate = useNavigate();
  const { showToast } = useCosmicToast();

  console.log("🔍 [LiveSessionList] projectId:", projectId);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<SessionStatus | "ALL">(
    "ALL"
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [showInviteMoreModal, setShowInviteMoreModal] = useState(false);
  const [invitingSessionId, setInvitingSessionId] = useState<string | null>(
    null
  );

  // ✅ Check if current user is host/owner of the project
  // Logic:
  // - If no sessions exist yet → allow creating first session (backend will validate)
  // - If sessions exist → check if user is host of any session
  const isProjectHost =
    sessions.length === 0
      ? true // Allow creating first session, backend will validate permission
      : sessions[0].currentUserId
      ? isSessionHost(sessions[0], sessions[0].currentUserId)
      : false;

  console.log(
    "🔍 [LiveSessionList] isProjectHost:",
    isProjectHost,
    "sessions:",
    sessions.length
  );

  useEffect(() => {
    if (projectId) {
      loadSessions();
    } else {
      setLoading(false);
    }
  }, [projectId, filterStatus]);

  const loadSessions = async () => {
    if (!projectId) {
      console.log("⚠️ [LiveSessionList] No projectId, skipping load");
      setLoading(false);
      return;
    }

    console.log(
      "🔄 [LiveSessionList] Loading sessions for projectId:",
      projectId,
      "filterStatus:",
      filterStatus
    );

    try {
      setLoading(true);
      const result = await getProjectSessions(
        Number(projectId),
        filterStatus === "ALL" ? undefined : filterStatus,
        0,
        20
      );
      console.log(
        "✅ [LiveSessionList] Loaded sessions:",
        result.content.length
      );
      setSessions(result.content);
    } catch (error) {
      console.error("❌ [LiveSessionList] Failed to load sessions:", error);
      showToast("🚨 Không thể tải danh sách phiên live", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      await startSession(sessionId);
      showToast("🚀 Đã bắt đầu phiên live!", "success");
      loadSessions();
    } catch (error) {
      console.error("Failed to start session:", error);
      showToast("❌ Không thể bắt đầu phiên live", "error");
    }
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setShowEditModal(true);
  };

  const handleDeleteSession = async (sessionId: string) => {
    // ✅ Validate status trước khi xóa
    const session = sessions.find((s) => s.id === sessionId);

    if (!session) {
      showToast("❌ Không tìm thấy phiên live", "error");
      return;
    }

    // ✅ Check if session can be deleted (frontend validation)
    if (!["SCHEDULED", "ENDED", "CANCELLED"].includes(session.status)) {
      showToast(
        "❌ Chỉ có thể xóa phiên đã lên lịch, đã kết thúc hoặc đã hủy",
        "error"
      );
      return;
    }

    const confirmed = window.confirm(
      "⚠️ Xóa phiên live này?\n\nHành động này không thể hoàn tác!"
    );

    if (!confirmed) return;

    try {
      await deleteSession(sessionId);
      showToast("✅ Đã xóa phiên live thành công!", "success");
      loadSessions();
    } catch (error: any) {
      console.error("Failed to delete session:", error);
      const errorCode = error?.response?.data?.code;
      const errorMsg =
        error?.response?.data?.message || "Không thể xóa phiên live";

      // ✅ Handle specific error codes
      if (errorCode === 5306) {
        // CANNOT_DELETE_ACTIVE_SESSION
        showToast(
          "❌ Không thể xóa phiên đang hoạt động. Vui lòng kết thúc phiên trước!",
          "error"
        );
        return;
      }

      if (errorCode === 5307) {
        // CAN_ONLY_DELETE_SCHEDULED_ENDED_OR_CANCELLED_SESSION (UPDATED)
        showToast(
          "❌ Chỉ có thể xóa phiên đã lên lịch, đã kết thúc hoặc đã hủy",
          "error"
        );
        return;
      }

      if (errorCode === 5105) {
        // ONLY_HOST_CAN_PERFORM_ACTION
        showToast("❌ Chỉ người chủ trì phiên mới có thể xóa", "error");
        return;
      }

      showToast(errorMsg, "error");
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    console.log("🚀 [LiveSessionList] Joining session with ID:", sessionId);
    if (!sessionId || sessionId === "undefined") {
      showToast("Session ID không hợp lệ", "error");
      return;
    }

    // Find session to check if user is host
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      showToast("Không tìm thấy phiên live", "error");
      return;
    }

    // ✅ Check if user is owner/host
    const isHost = session.currentUserId
      ? isSessionHost(session, session.currentUserId)
      : false;

    if (isHost) {
      // ✅ Owner/Host: Join directly (bypass approval)
      try {
        const joinResponse = await joinSession(sessionId);
        console.log("🚀 Owner joined with Agora token:", joinResponse.token);
        showToast("Đã tham gia phiên live!", "success");
        navigate(`/session/${sessionId}/room`);
      } catch (error: any) {
        console.error("Failed to join session:", error);
        const errorMsg =
          error?.response?.data?.message || "Không thể tham gia phiên live";
        showToast(errorMsg, "error");
      }
    } else {
      // ✅ Member: Navigate to room and send join request (will be handled in LiveSessionRoom)
      console.log("👤 Member joining - will request approval in room");
      navigate(`/session/${sessionId}/room?needsApproval=true`);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    const confirmed = window.confirm("⚠️ Bạn có chắc muốn hủy phiên live này?");

    if (!confirmed) return;

    try {
      await cancelSession(sessionId, "Canceled by host");
      showToast("✅ Đã hủy phiên live thành công", "success");
      loadSessions();
    } catch (error: any) {
      console.error("Failed to cancel session:", error);
      const errorCode = error?.response?.data?.code;
      const errorMsg =
        error?.response?.data?.message || "Không thể hủy phiên live";

      // ✅ Handle specific error codes
      if (errorCode === 5016) {
        // CAN_ONLY_CANCEL_SCHEDULED_SESSION
        showToast("❌ Chỉ có thể hủy phiên đã lên lịch", "error");
        return;
      }

      if (errorCode === 5105) {
        // ONLY_HOST_CAN_PERFORM_ACTION
        showToast("❌ Chỉ người chủ trì phiên mới có thể hủy", "error");
        return;
      }

      showToast(`❌ ${errorMsg}`, "error");
    }
  };

  const handleEndSession = async (sessionId: string) => {
    const confirmed = window.confirm(
      "⚠️ Kết thúc phiên live ngay bây giờ?\n\nTất cả thành viên sẽ bị kick ra. Hành động này không thể hoàn tác!"
    );

    if (!confirmed) return;

    try {
      await endSession(sessionId);
      showToast("✅ Đã kết thúc phiên live thành công!", "success");
      loadSessions();
    } catch (error: any) {
      console.error("Failed to end session:", error);
      const errorCode = error?.response?.data?.code;
      const errorMsg =
        error?.response?.data?.message || "Không thể kết thúc phiên live";

      if (errorCode === 5105) {
        showToast("❌ Chỉ người chủ trì phiên mới có thể kết thúc", "error");
        return;
      }

      showToast(`❌ ${errorMsg}`, "error");
    }
  };

  const handleInviteMore = (sessionId: string) => {
    setInvitingSessionId(sessionId);
    setShowInviteMoreModal(true);
  };

  const handleViewDetails = (_sessionId: string) => {
    showToast("📊 Chi tiết session (coming soon)", "info");
  };

  const filterButtons = [
    { key: "ALL", label: "Tất cả", icon: Filter },
    { key: "SCHEDULED", label: "Đã lên lịch", icon: Calendar },
    { key: "ACTIVE", label: "Đang diễn ra", icon: Video },
    { key: "ENDED", label: "Đã kết thúc", icon: BarChart3 },
    { key: "CANCELLED", label: "Đã hủy", icon: X },
  ];

  // ✅ Check if projectId exists
  if (!projectId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-center bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 shadow-xl">
          <div className="text-6xl mb-6">⚠️</div>
          <h3 className="text-2xl font-semibold text-white mb-4">
            Không tìm thấy Project ID
          </h3>
          <p className="text-gray-400 mb-8">
            Vui lòng truy cập trang này từ một project cụ thể.
          </p>
          <button
            onClick={() => navigate("/projects")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
          >
            Quay lại Danh sách Project
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-purple-500 mx-auto mb-4" />
          <p className="text-gray-300 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-24 p-6 relative">
      {/* CSS Animations for Cosmic Effects */}
      <style>{`
        /* Slow spin for orbital rings */
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        /* Pulsing ring animation for holographic scanner */
        @keyframes pulse-ring {
          0% { 
            transform: scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: scale(1.15);
            opacity: 0.3;
          }
          100% { 
            transform: scale(1);
            opacity: 0.6;
          }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
      `}</style>
      <AnimatedBackground />
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        {/* Back Button - Absolute positioned */}
        <div className="absolute top-0 right-0">
          <BackToProjectButton />
        </div>

        {/* Main Header - Centered */}
        <header className="text-center mb-4">
          <h1 className="text-5xl font-extrabold tracking-tight mb-2">
            🚀 Trạm Liên Lạc{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400">
              Không Gian
            </span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Thiết lập đường truyền thời gian thực với Phi Hành Đoàn. Kết nối,
            cộng tác và tạo ra những bản nhạc tuyệt vời cùng nhau.
          </p>
        </header>

        {/* Filter Buttons + Create Session Button Row */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 flex-1">
            {filterButtons.map((button) => {
              const IconComponent = button.icon;
              return (
                <button
                  key={button.key}
                  onClick={() => setFilterStatus(button.key as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                    filterStatus === button.key
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                      : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 backdrop-blur-sm border border-gray-700/50"
                  }`}
                >
                  <IconComponent size={16} />
                  {button.label}
                </button>
              );
            })}
          </div>

          {/* Create Session Button - Same row as filters */}
          {isProjectHost && (
            <button
              onClick={() => {
                console.log("🎯 [LiveSessionList] Create button clicked!");
                setShowCreateModal(true);
              }}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-[0_4px_20px_rgba(168,85,247,0.5)] hover:shadow-[0_6px_30px_rgba(236,72,153,0.5)] transition-all hover:scale-105"
            >
              <Plus size={18} />⚡ Tạo Session Mới
            </button>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="max-w-7xl mx-auto relative z-10">
        {sessions.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-700/50 shadow-xl">
            <div className="text-6xl mb-6">🎵</div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              Vũ trụ đang im lặng...
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {isProjectHost
                ? "Khởi tạo tín hiệu đầu tiên để kết nối với đồng đội."
                : "Project này chưa có phiên live nào. Chỉ host/owner mới có thể tạo phiên live."}
            </p>
            {/* ✅ Only show "Create Session" button if user is project host */}
            {isProjectHost && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold mx-auto transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
              >
                <Plus size={20} />
                Tạo Session Ngay
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onStart={handleStartSession}
                onJoin={handleJoinSession}
                onCancel={handleCancelSession}
                onEnd={handleEndSession}
                onEdit={handleEditSession}
                onDelete={handleDeleteSession}
                onInviteMore={handleInviteMore}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateSessionModal
          projectId={Number(projectId)}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadSessions();
          }}
          showToast={showToast}
        />
      )}

      {/* ✅ Edit Modal */}
      {showEditModal && editingSession && (
        <EditSessionModal
          session={editingSession}
          onClose={() => {
            setShowEditModal(false);
            setEditingSession(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingSession(null);
            loadSessions();
          }}
          showToast={showToast}
        />
      )}

      {/* ✅ NEW: Invite More Members Modal */}
      {showInviteMoreModal && invitingSessionId && projectId && (
        <InviteMoreMembersModal
          sessionId={invitingSessionId}
          projectId={Number(projectId)}
          onClose={() => {
            setShowInviteMoreModal(false);
            setInvitingSessionId(null);
          }}
          onSuccess={() => {
            setShowInviteMoreModal(false);
            setInvitingSessionId(null);
            showToast("✅ Đã gửi lời mời thành công!", "success");
            loadSessions();
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
};

// ==================== CREATE SESSION MODAL ====================

interface CreateSessionModalProps {
  projectId: number;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  projectId,
  onClose,
  onSuccess,
  showToast,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledStart: "",
  });
  const [invitedMemberIds, setInvitedMemberIds] = useState<number[]>([]);
  const [inviteRoles, setInviteRoles] = useState<
    ("OWNER" | "COLLABORATOR" | "CLIENT")[]
  >([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await createSession({
        projectId,
        ...formData,
        scheduledStart: formData.scheduledStart || undefined,
        invitedMemberIds:
          invitedMemberIds.length > 0 ? invitedMemberIds : undefined,
        inviteRoles: inviteRoles.length > 0 ? inviteRoles : undefined,
      });
      showToast("🎉 Tạo phiên live thành công!", "success");
      onSuccess();
    } catch (error: any) {
      console.error("Failed to create session:", error);
      const errorCode = error?.response?.data?.code;
      const errorMsg =
        error?.response?.data?.message || "Không thể tạo phiên live";

      // ✅ Handle specific error codes
      if (errorCode === 4004) {
        // PROJECT_ALREADY_HAS_BLOCKING_SESSION
        showToast(errorMsg, "error");
        return;
      }

      if (errorCode === 5301) {
        // SCHEDULED_START_MUST_BE_FUTURE
        showToast("Thời gian bắt đầu phải là thời gian tương lai", "error");
        return;
      }

      if (errorCode === 5302) {
        // MAX_PARTICIPANTS_INVALID
        showToast("Số lượng người tham gia phải từ 2 đến 10", "error");
        return;
      }

      showToast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl max-w-3xl w-full p-6 border border-purple-600/50 shadow-[0_0_40px_rgba(128,0,255,0.3)] relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 flex items-center gap-2">
            <Plus className="text-purple-400" size={24} />
            Tạo Live Session Mới
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Đóng modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Tiêu đề và Thời gian bắt đầu */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-300 mb-1.5 text-sm font-medium">
                Tiêu đề *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-gray-900/60 text-white placeholder-purple-400 px-4 py-2 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition shadow-md shadow-purple-600/30 text-sm"
                placeholder="VD: Review Beat Demo v3"
                aria-label="Tiêu đề session"
                required
              />
            </div>
            <div>
              <label className="block text-purple-300 mb-1.5 text-sm font-medium">
                Thời gian bắt đầu
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledStart}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledStart: e.target.value })
                }
                className="w-full bg-gray-900/60 text-white px-4 py-2 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none shadow-md shadow-purple-600/20 text-sm"
                aria-label="Thời gian bắt đầu"
              />
            </div>
          </div>

          {/* Row 2: Mô tả */}
          <div>
            <label className="block text-purple-300 mb-1.5 text-sm font-medium">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-gray-900/60 text-white placeholder-purple-400 px-4 py-2 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition shadow-md shadow-purple-600/20 resize-none text-sm"
              rows={2}
              placeholder="Mô tả ngắn về phiên live..."
              aria-label="Mô tả session"
            />
          </div>

          {/* Invite Members Section */}
          <div className="pt-2">
            <InviteMembersSection
              projectId={projectId}
              selectedMemberIds={invitedMemberIds}
              selectedRoles={inviteRoles}
              onMemberIdsChange={setInvitedMemberIds}
              onRolesChange={setInviteRoles}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-purple-400 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-purple-700/20 text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 text-sm"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Tạo Session
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== EDIT SESSION MODAL ====================

interface EditSessionModalProps {
  session: Session;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

const EditSessionModal: React.FC<EditSessionModalProps> = ({
  session,
  onClose,
  onSuccess,
  showToast,
}) => {
  const [formData, setFormData] = useState({
    title: session.title,
    description: session.description || "",
    scheduledStart: session.scheduledStart
      ? new Date(session.scheduledStart).toISOString().slice(0, 16)
      : "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await updateSession(session.id, {
        title: formData.title,
        description: formData.description || undefined,
        scheduledStart: formData.scheduledStart || undefined,
      });
      showToast("✅ Cập nhật phiên live thành công!", "success");
      onSuccess();
    } catch (error: any) {
      console.error("Failed to update session:", error);
      const errorCode = error?.response?.data?.code;
      const errorMsg =
        error?.response?.data?.message || "Không thể cập nhật phiên live";

      // ✅ Handle specific error codes
      if (errorCode === 5304) {
        showToast("❌ Chỉ có thể cập nhật phiên đã lên lịch", "error");
        return;
      }

      if (errorCode === 5301) {
        showToast("❌ Thời gian bắt đầu phải là thời gian tương lai", "error");
        return;
      }

      if (errorCode === 5105) {
        showToast("❌ Chỉ người chủ trì phiên mới có thể chỉnh sửa", "error");
        return;
      }

      showToast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-2xl max-w-lg w-full p-8 border border-gray-700/50 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Edit className="text-blue-400" />
            Chỉnh Sửa Live Session
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Đóng modal"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              Tiêu đề *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="VD: Review Beat Demo v3"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
              rows={3}
              placeholder="Mô tả ngắn về phiên live..."
            />
          </div>

          <div>
            <label
              htmlFor="edit-scheduled-start"
              className="block text-gray-300 mb-2 font-medium"
            >
              Thời gian bắt đầu
            </label>
            <input
              id="edit-scheduled-start"
              type="datetime-local"
              value={formData.scheduledStart}
              onChange={(e) =>
                setFormData({ ...formData, scheduledStart: e.target.value })
              }
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              aria-label="Thời gian bắt đầu"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Edit size={16} />
                  Lưu Thay Đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== INVITE MORE MEMBERS MODAL ====================

interface InviteMoreMembersModalProps {
  sessionId: string;
  projectId: number;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

const InviteMoreMembersModal: React.FC<InviteMoreMembersModalProps> = ({
  sessionId,
  projectId: _projectId,
  onClose,
  onSuccess,
  showToast,
}) => {
  const [availableMembers, setAvailableMembers] = useState<AvailableMember[]>(
    []
  );
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAvailableMembers();
  }, [sessionId]);

  const loadAvailableMembers = async () => {
    try {
      setLoading(true);
      const members = await getAvailableMembers(sessionId);
      setAvailableMembers(members);
    } catch (error: any) {
      console.error("Failed to load available members:", error);
      showToast("❌ Không thể tải danh sách thành viên", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (userId: number) => {
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedMemberIds.length === 0) {
      showToast("⚠️ Vui lòng chọn ít nhất 1 thành viên", "info");
      return;
    }

    try {
      setSubmitting(true);

      // Build roles array based on each member's projectRole
      const roles = selectedMemberIds.map((memberId) => {
        const member = availableMembers.find((m) => m.userId === memberId);
        return member?.projectRole || "COLLABORATOR";
      });

      await inviteMoreMembers(sessionId, selectedMemberIds, roles);
      showToast(`✅ Đã mời ${selectedMemberIds.length} thành viên!`, "success");
      onSuccess();
    } catch (error: any) {
      console.error("Failed to invite members:", error);
      const errorCode = error?.response?.data?.code;
      const errorMsg =
        error?.response?.data?.message || "Không thể gửi lời mời";

      if (errorCode === 5310) {
        showToast("❌ Chỉ có thể mời thêm vào phiên đã lên lịch", "error");
        return;
      }

      if (errorCode === 5311) {
        showToast("❌ Chỉ có thể mời thêm vào phiên riêng tư", "error");
        return;
      }

      if (errorCode === 5105) {
        showToast("❌ Chỉ chủ trì phiên mới có thể mời thêm", "error");
        return;
      }

      showToast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown size={14} className="text-yellow-400" />;
      case "COLLABORATOR":
        return <Users size={14} className="text-blue-400" />;
      case "CLIENT":
        return <Users size={14} className="text-purple-400" />;
      default:
        return <Users size={14} />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Chủ dự án";
      case "COLLABORATOR":
        return "Cộng tác viên";
      case "CLIENT":
        return "Khách hàng";
      default:
        return role;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-2xl max-w-lg w-full p-8 border border-gray-700/50 max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <UserPlus className="text-purple-400" />
            Mời Thêm Thành Viên
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Đóng modal"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-gray-400">Đang tải danh sách thành viên...</p>
          </div>
        ) : availableMembers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Tất cả thành viên đã được mời</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-400">
                Chọn thành viên để gửi lời mời tham gia phiên:
              </p>

              <div className="space-y-2 max-h-96 overflow-y-auto bg-gray-700/50 rounded-lg p-3">
                {availableMembers.map((member) => (
                  <label
                    key={member.userId}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedMemberIds.includes(member.userId)
                        ? "bg-purple-600/30 border border-purple-500"
                        : "bg-gray-800 hover:bg-gray-700 border border-gray-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.includes(member.userId)}
                      onChange={() => toggleMember(member.userId)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />

                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                      {member.fullName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {member.fullName}
                        </span>
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-gray-700">
                          {getRoleIcon(member.projectRole)}
                          {getRoleLabel(member.projectRole)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {member.email}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {selectedMemberIds.length > 0 && (
              <div className="mb-6 p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                <p className="text-sm text-purple-200">
                  <UserPlus className="inline mr-1" size={14} />
                  Sẽ mời {selectedMemberIds.length} thành viên
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting || selectedMemberIds.length === 0}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Gửi lời mời
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LiveSessionList;
