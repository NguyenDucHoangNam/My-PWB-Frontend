// trang gốc

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useCosmicToast } from "../../component/toast/CosmicToastProvider";
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useAgoraRTC } from "../../component/hooks/useAgoraRTC";
import { useWebSocket } from "../../component/hooks/useWebSocket";
import { useSessionManager } from "../../component/hooks/useSessionManager";
import { useSessionEvents } from "../../component/hooks/useSessionEvents";
import { useChatMessages } from "../../component/hooks/useChatMessages";
import { useJoinRequest } from "../../component/hooks/useJoinRequest";
import { useJoinApproval } from "../../component/hooks/useJoinApproval";
import { leaveSession, isSessionHost } from "../../services/sessionApi";
import websocketService from "../../services/websocketService";
import LocalVideoPlayer from "./live-room/video/LocalVideoPlayer";
import RemoteVideoPlayer from "./live-room/video/RemoteVideoPlayer";
import LiveSessionHeader from "./live-room/header/LiveSessionHeader";
import SessionSidebar from "./live-room/SessionSidebar";
import KeyboardShortcuts from "./live-room/KeyboardShortcuts";
import MusicPlayer from "./live-room/music/MusicPlayer";
import JoinRequestWaitingModal from "./live-room/modals/JoinRequestWaitingModal";
import JoinErrorModal from "./live-room/modals/JoinErrorModal";
import type { ChatMessage, JoinRequestNotification, RoomType } from "../../types/session";
import type { Track } from "../../types/music";
import { useTrackNotes } from "../../component/hooks/useTrackNotes";

const LoadingScreen: React.FC = () => (
  <div 
    className="min-h-screen flex items-center justify-center relative"
    style={{
      fontFamily: "'Space Grotesk', sans-serif",
      background: "radial-gradient(circle at top, #242446, #151526 70%)",
    }}
  >
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
      `}
    </style>

    <div className="relative bg-[#0B0E1E]/90 backdrop-blur-xl border border-purple-500/40 rounded-2xl p-10 shadow-2xl text-center max-w-md">
      {/* Holographic Border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-purple-500/40 p-[1px] -z-10">
        <div className="w-full h-full rounded-2xl bg-[#0B0E1E]/90"></div>
      </div>

      {/* Glass morphism overlay */}
      <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
          <Loader2 className="h-16 w-16 text-purple-400 relative drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]" />
        </div>
        <h3 className="text-white text-xl font-bold mb-2 drop-shadow-lg">
          Đang tham gia phiên
        </h3>
        <p className="text-gray-400 text-sm">Kết nối đến phiên làm việc...</p>

        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]"
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ErrorScreen: React.FC<{ error: string; onGoBack: () => void }> = ({
  error,
  onGoBack,
}) => (
  <div 
    className="min-h-screen flex items-center justify-center p-6 relative"
    style={{
      fontFamily: "'Space Grotesk', sans-serif",
      background: "radial-gradient(circle at top, #242446, #151526 70%)",
    }}
  >
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
      `}
    </style>

    <div className="relative bg-[#0B0E1E]/90 backdrop-blur-xl border border-red-500/40 rounded-2xl px-10 py-8 max-w-md text-center shadow-2xl">
      {/* Holographic Border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/40 via-red-600/40 to-red-500/40 p-[1px] -z-10">
        <div className="w-full h-full rounded-2xl bg-[#0B0E1E]/90"></div>
      </div>

      {/* Glass morphism overlay */}
      <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="relative mx-auto mb-6 w-16 h-16">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
          <AlertCircle className="h-16 w-16 text-red-400 relative mx-auto drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
        </div>
        <h3 className="text-xl font-bold mb-3 text-red-300 drop-shadow-lg">Lỗi kết nối</h3>
        <p className="mb-6 text-gray-300 leading-relaxed text-sm">{error}</p>
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold transition-all mx-auto border border-white/20 hover:border-white/30"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
      </div>
    </div>
  </div>
);


const VideoGrid: React.FC<{
  localVideoTrack: any;
  localAudioTrack: any;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  remoteUsers: any[];
  participants: any[];
  currentUserId: number;
}> = ({
  localVideoTrack,
  localAudioTrack,
  isVideoEnabled,
  isAudioEnabled,
  remoteUsers,
  participants,
  currentUserId,
}) => {
    const completeParticipants = useMemo(() => {
      const remoteParticipants = participants.filter(
        (p) => p.userId !== currentUserId && p.isOnline
      );

      return remoteParticipants.map((participant) => {
        const remoteUser = remoteUsers.find(
          (user) =>
            user.uid === participant.userId || user.uid === participant.agoraUid
        );

        return {
          ...participant,
          remoteUser: remoteUser || null,
          hasVideo: remoteUser?.hasVideo || false,
          videoTrack: remoteUser?.videoTrack || null,
          audioTrack: remoteUser?.audioTrack || null,  // ← ADD THIS LINE
          hasAudio: remoteUser?.hasAudio || false,
        };
      });
    }, [participants, remoteUsers, currentUserId]);

    const totalUsers = completeParticipants.length + 1;

    // Optimized grid layout for 1-6 participants
    const gridClass = useMemo(() => {
      if (totalUsers === 1) return "grid-cols-1 max-w-md"; // Single user: compact
      if (totalUsers === 2) return "grid-cols-2 max-w-3xl"; // 2 users: side by side
      if (totalUsers <= 4) return "grid-cols-2"; // 3-4 users: 2x2 grid
      if (totalUsers <= 6) return "grid-cols-3"; // 5-6 users: 3x2 grid
      return "grid-cols-3"; // Fallback
    }, [totalUsers]);

    // Adjust aspect ratio based on participant count
    const aspectClass = useMemo(() => {
      if (totalUsers === 1) return "aspect-[4/3]"; // More square for single user
      if (totalUsers === 2) return "aspect-[4/3]"; // Balanced for 2 users
      return "aspect-video"; // 16:9 for 3+ users
    }, [totalUsers]);

    return (
      <div className="h-full p-3 flex items-center justify-center">
        <div className={`w-full grid gap-3 ${gridClass} mx-auto`}>
          {/* Local Video */}
          <div
            className={`${aspectClass} relative rounded-xl overflow-hidden bg-[#0B0E1E]/90 backdrop-blur-md border border-purple-500/40 shadow-lg group`}
            style={{
              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",
            }}
          >
            {/* Left Gradient Border */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-cyan-500 to-purple-500 group-hover:from-purple-400 group-hover:via-cyan-400 group-hover:to-purple-400 transition-all duration-300"></div>

            {/* Glass Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none opacity-50"></div>

            {/* Content */}
            <div className="relative z-10 w-full h-full">
              <LocalVideoPlayer
                videoTrack={localVideoTrack}
                audioTrack={localAudioTrack}
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                userName="Bạn"
              />
            </div>
          </div>

          {/* Remote Participants */}
          {completeParticipants.map((participant) => (
            <div
              key={participant.userId}
              className={`${aspectClass} relative rounded-xl overflow-hidden bg-[#0B0E1E]/90 backdrop-blur-md border border-gray-700/50 shadow-md group hover:border-purple-500/40 transition-all duration-300`}
              style={{
                clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",
              }}
            >
              {/* Left Gradient Border */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-600 via-gray-500 to-gray-600 group-hover:from-purple-500 group-hover:via-cyan-500 group-hover:to-purple-500 transition-all duration-300"></div>

              {/* Glass Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/3 to-transparent pointer-events-none opacity-30"></div>

              {/* Content */}
              <div className="relative z-10 w-full h-full">
                <RemoteVideoPlayer
                  uid={participant.remoteUser?.uid || participant.userId}
                  videoTrack={participant.videoTrack}
                  audioTrack={participant.audioTrack}
                  hasVideo={participant.hasVideo}
                  userName={
                    participant.userName || `Người dùng ${participant.userId}`
                  }
                  isOnline={participant.isOnline}
                  hasAudio={participant.hasAudio}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

// Memoize VideoGrid to prevent re-renders when audio time updates
const VideoGridMemo = React.memo(VideoGrid);

const LiveSessionRoom: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSidebar, setShowSidebar] = useState(true);
  const [joinRequests, setJoinRequests] = useState<JoinRequestNotification[]>(
    []
  );
  const [_milestones, setMilestones] = useState<any[]>([]);
  const [_musicQueue, setMusicQueue] = useState<Track[]>([]);
  const [_playTrackFn, setPlayTrackFn] = useState<((track: Track) => void) | null>(null);

  // New States for Layout Refactor
  const [sidebarMode, setSidebarMode] = useState<'chat' | 'notes'>('chat');
  const [playingTrack, setPlayingTrack] = useState<Track | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekFn, setSeekFn] = useState<((time: number) => void) | null>(null);

  // Track Notes Logic
  const trackNotesHook = useTrackNotes({
    trackId: playingTrack?.id || null,
    roomType: (playingTrack?.roomType as RoomType) || 'INTERNAL',
    sessionId: sessionId
  });

  const handleToggleNotes = useCallback(() => {
    setSidebarMode(prev => {
      if (prev === 'notes' && showSidebar) {
        // Option: Close sidebar if clicking note again?
        // For now, just ensure it's open/notes
        return 'notes';
      }
      setShowSidebar(true);
      return 'notes';
    });
    if (!showSidebar) setShowSidebar(true);
  }, [showSidebar]);

  const handleBackToChat = useCallback(() => {
    setSidebarMode('chat');
  }, []);

  // ✅ Add state for join error modal
  const [showJoinError, setShowJoinError] = useState(false);
  const [joinErrorMessage, setJoinErrorMessage] = useState("");

  // Check if member needs approval
  const needsApproval = searchParams.get("needsApproval") === "true";

  const {
    session,
    joinData,
    currentUserId,
    participants,
    setParticipants,
    loading,
    error,
    isJoined,
    isConnected, // ✅ Get WebSocket connection state
    authToken,
    manualJoin,
  } = useSessionManager(sessionId, needsApproval); // ✅ Pass skipAutoJoin flag

  const {
    messages,
    typingUsers,
    addMessage,
    addSystemMessage,
    handleTypingStart,
    handleTypingStop,
  } = useChatMessages();

  const { showToast } = useCosmicToast();

  // Check if current user is host
  const isHost = session ? isSessionHost(session, currentUserId) : false;

  // ✅ JOIN REQUEST HOOK (Member) - Only enabled for members with WebSocket connected
  const joinRequest = useJoinRequest({
    sessionId: sessionId || "",
    enabled: !isHost && isConnected, // ✅ Only enabled when connected
    onJoinSuccess: async () => {
      showToast("✅ Đã được chấp nhận! Đang tham gia...", "success");
      // ✅ Call manualJoin to actually join the session
      if (manualJoin) {
        try {
          await manualJoin();
          showToast("🎉 Đã tham gia phiên thành công!", "success");
        } catch (error: any) {
          // ✅ Handle join failure with retry option
          console.error("Failed to join after approval:", error);
          setJoinErrorMessage(error.message || "Không thể tham gia phiên");
          setShowJoinError(true);
        }
      }
    },
    onJoinError: (errorMsg) => {
      // ✅ When rejected by owner, navigate back immediately
      showToast(`❌ ${errorMsg}`, "error");
      setTimeout(() => {
        const projectId = session?.projectId;
        if (projectId) {
          navigate(`/live-sessions/?id=${projectId}`);
        } else {
          navigate(-1);
        }
      }, 2000); // Wait 2s to show toast before navigating
    },
    onCancel: () => {
      // ✅ No longer needed - member can't cancel, only leave
      console.log(
        "🚫 Cancel callback deprecated - member should use leave button"
      );
    },
  });

  // ✅ JOIN APPROVAL HOOK (Owner) - Only enabled for hosts with WebSocket connected
  const joinApproval = useJoinApproval({
    sessionId: sessionId || "",
    currentUserId, // ✅ Pass currentUserId
    enabled: isHost && isConnected, // ✅ Only enabled when connected
    onNewRequest: (notification) => {
      // Add to chat as special message
      setJoinRequests((prev) => [...prev, notification]);
      showToast(`🙋 ${notification.userName} muốn tham gia`, "info");
    },
    onNotification: (notification) => {
      // ✅ Handle request cancellation/expiry/disconnect by member
      if (
        notification.type === "JOIN_REQUEST_CANCELLED" ||
        notification.type === "JOIN_REQUEST_EXPIRED" ||
        notification.type === "MEMBER_DISCONNECTED"
      ) {
        if (notification.data?.requestId) {
          const requestId = notification.data.requestId;
          console.log(
            "🗑️ Removing request from UI:",
            requestId,
            "Reason:",
            notification.type
          );
          setJoinRequests((prev) =>
            prev.filter((r) => r.requestId !== requestId)
          );
        }
      }

      // Show toast notification
      showToast(
        notification.message,
        notification.type?.toLowerCase() || "info"
      );
    },
  });

  // ✅ Wrapper to remove request from UI after approve
  const handleApproveRequest = useCallback(
    (requestId: string) => {
      joinApproval.approveRequest(requestId);
      // Remove from UI immediately
      setJoinRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    },
    [joinApproval]
  );

  // ✅ Wrapper to remove request from UI after reject
  const handleRejectRequest = useCallback(
    (requestId: string, reason: string) => {
      joinApproval.rejectRequest(requestId, reason);
      // Remove from UI immediately
      setJoinRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    },
    [joinApproval]
  );

  // ✅ Auto-send join request if member needs approval and WebSocket connected
  useEffect(() => {
    // ✅ Better condition check - avoid duplicate requests
    if (
      needsApproval &&
      !isHost &&
      sessionId &&
      isConnected &&
      !isJoined &&
      !joinRequest.isWaiting &&
      !joinRequest.response // ✅ Don't send if already got response
    ) {
      console.log("👤 Member needs approval - sending join request...");
      joinRequest.sendRequest();
      showToast("🚀 Đã gửi yêu cầu tham gia...", "info");
    }
  }, [
    needsApproval,
    isHost,
    sessionId,
    isConnected,
    isJoined,
    joinRequest.isWaiting,
    joinRequest.response,
  ]); // ✅ Complete dependency array

  const agoraProps = useMemo(
    () => ({
      appId: joinData?.appId || "",
      channel: joinData?.channelName || "",
      token: joinData?.token || "",
      uid: joinData?.uid || 0,
    }),
    [joinData]
  );

  const agoraHook = useAgoraRTC(agoraProps);

  // Direct chat message handler
  const handleDirectChatMessage = useCallback(
    (chatData: any) => {
      let actualChatData = chatData;

      if (chatData.eventType === "CHAT_MESSAGE" && chatData.payload) {
        actualChatData = chatData.payload;
      }

      if (actualChatData?.messageId && actualChatData?.content) {
        const chatMessage: ChatMessage = {
          messageId: actualChatData.messageId,
          sessionId: actualChatData.sessionId || sessionId || "",
          senderId: Number(actualChatData.senderId) || 0,
          senderName: actualChatData.senderName || "Unknown",
          senderAvatarUrl: actualChatData.senderAvatarUrl,
          content: actualChatData.content,
          type: actualChatData.type || "TEXT",
          timestamp: actualChatData.timestamp || new Date().toISOString(),
        };

        addMessage(chatMessage);
      }
    },
    [sessionId, addMessage]
  );

  // Leave handler
  const handleLeave = useCallback(async () => {
    showToast("Đang rời phiên...", "info");

    try {
      if (sessionId && websocketService.isConnected()) {
        websocketService.sendLeaveSignal(sessionId);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await agoraHook.leaveChannel();

      if (sessionId) {
        await leaveSession(sessionId);
      }

      showToast("Đã rời phiên thành công", "success");
      setTimeout(() => navigate(-1), 300);
    } catch (err) {
      showToast("Có lỗi khi rời phiên", "error");
      setTimeout(() => navigate(-1), 500);
    }
  }, [sessionId, agoraHook.leaveChannel, navigate]);

  // Session events handler
  const { handleWebSocketEvent } = useSessionEvents({
    sessionId,
    currentUserId,
    setParticipants,
    addSystemMessage,
    addChatMessage: addMessage,
    handleTypingStart,
    handleTypingStop,
    handleLeave,
  });

  const { sendMessage } = useWebSocket({
    sessionId: isJoined ? sessionId || "" : "",
    token: authToken || "",
    userId: currentUserId,
    onEvent: handleWebSocketEvent,
    onChatMessage: handleDirectChatMessage,
  });

  const handleSendChatMessage = useCallback(
    (message: string) => {
      sendMessage(message);
    },
    [sendMessage]
  );

  const handleTypingStartLocal = useCallback(() => {
    if (sessionId) {
      websocketService.sendTypingIndicator(sessionId, "start");
    }
  }, [sessionId]);

  const handleTypingStopLocal = useCallback(() => {
    if (sessionId) {
      websocketService.sendTypingIndicator(sessionId, "stop");
    }
  }, [sessionId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target &&
        ["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
      )
        return;

      switch (e.key.toLowerCase()) {
        case "s":
          e.preventDefault();
          agoraHook.toggleAudio();
          break;
        case "v":
          e.preventDefault();
          agoraHook.toggleVideo();
          break;
        case "escape":
          setShowSidebar(!showSidebar);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [agoraHook.toggleAudio, agoraHook.toggleVideo, showSidebar]);

  // Browser close handler
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        agoraHook.leaveChannel();
      } catch (err) {
        // Silent fail
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [agoraHook.leaveChannel]);

  // ✅ Subscribe to participant state updates (video/audio toggle)
  useEffect(() => {
    if (!sessionId || !websocketService.isConnected()) return;

    console.log("👥 Subscribing to participant events for session:", sessionId);

    const unsubscribe = websocketService.subscribeToParticipants(
      sessionId,
      (event) => {
        console.log("👥 Received participant event:", event);

        // Ignore own events
        if (event.userId === currentUserId) {
          console.log("🔄 Ignoring own participant event");
          return;
        }

        // Update participants list with new video/audio state
        setParticipants((prev) =>
          prev.map((p) =>
            p.userId === event.userId
              ? {
                ...p,
                audioEnabled: event.hasAudio ?? p.audioEnabled,
                videoEnabled: event.hasVideo ?? p.videoEnabled,
              }
              : p
          )
        );

        // Show toast notification
        const action =
          event.action === "TOGGLE_VIDEO"
            ? event.hasVideo
              ? "bật camera"
              : "tắt camera"
            : event.hasAudio
              ? "bật mic"
              : "tắt mic";

        showToast(`${event.username} đã ${action}`, "info");
      }
    );

    return () => {
      console.log("👥 Unsubscribing from participant events");
      unsubscribe();
    };
  }, [sessionId, currentUserId, setParticipants]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onGoBack={() => navigate(-1)} />;

  const currentUserName =
    participants.find((p) => p.userId === currentUserId)?.userName || "Bạn";
  const onlineCount = participants.filter((p) => p.isOnline).length;
  const chatCount = messages.filter((m) => m.type !== "SYSTEM").length;

  return (
    <div 
      className="min-h-screen flex flex-col overflow-hidden relative"
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        background: "radial-gradient(circle at top, #242446, #151526 70%)",
      }}
    >
      {/* Import font */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
        `}
      </style>

      {/* Background Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          background: `
            repeating-conic-gradient(
              from 0deg at 50% 50%,
              transparent 0deg,
              rgba(168, 85, 247, 0.1) 0.5deg,
              transparent 1deg,
              transparent 2deg
            )
          `,
        }}
      />

      {/* Header */}
      <LiveSessionHeader
        sessionTitle={session?.title}
        sessionType={session?.sessionType}
        participants={participants}
        currentUserId={currentUserId}
        onlineCount={onlineCount}
        isVideoEnabled={agoraHook.isVideoEnabled}
        isAudioEnabled={agoraHook.isAudioEnabled}
        onToggleVideo={agoraHook.toggleVideo}
        onToggleAudio={agoraHook.toggleAudio}
        onLeave={handleLeave}
        isHost={session?.hostId === currentUserId}
        sessionId={sessionId}
        currentUserName={currentUserName}
        isConnected={agoraHook.isJoined}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
      />

      {/* Main Content - Optimized Layout: Fit in one screen */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 gap-4 p-4 z-10">
        {/* Top Section: Video Grid */}
        <div className="flex-shrink-0 flex flex-col gap-4">
          {/* Video Grid - Enhanced Design */}
          <div className="relative w-full h-64 max-h-[28rem] rounded-2xl overflow-hidden bg-[#0B0E1E]/90 backdrop-blur-xl border border-purple-500/40 shadow-2xl">
            {/* Holographic Border Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-purple-500/40 p-[1px] -z-10">
              <div className="w-full h-full rounded-2xl bg-[#0B0E1E]/90"></div>
            </div>

            {/* Glass Shine Effect (Static) */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-30">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
            </div>

            {/* Vinyl Groove Pattern Background */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl"
              style={{
                background: `
                  repeating-conic-gradient(
                    from 0deg at 50% 50%,
                    transparent 0deg,
                    rgba(168, 85, 247, 0.08) 0.5deg,
                    transparent 1deg,
                    transparent 2deg
                  ),
                  repeating-radial-gradient(
                    circle at center,
                    transparent 0px,
                    transparent 2px,
                    rgba(34, 211, 238, 0.06) 2px,
                    rgba(34, 211, 238, 0.06) 3px,
                    transparent 3px,
                    transparent 5px
                  )
                `,
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
              }}
            />

            {/* Video grid content */}
            <div className="relative w-full h-full p-3 z-10">
              <VideoGridMemo
                localVideoTrack={agoraHook.localVideoTrack}
                localAudioTrack={agoraHook.localAudioTrack}
                isVideoEnabled={agoraHook.isVideoEnabled}
                isAudioEnabled={agoraHook.isAudioEnabled}
                remoteUsers={agoraHook.remoteUsers}
                participants={participants}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section: Music Player + Sidebar */}
        <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
          {/* Music Player Area (70%) */}
          <div className="relative flex-1 rounded-2xl overflow-hidden">
            {/* Background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B0E1E]/95 via-gray-900/90 to-[#0B0E1E]/95 backdrop-blur-2xl"></div>

            {/* Holographic Border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-purple-500/40 p-[1px] -z-10">
              <div className="w-full h-full rounded-2xl bg-[#0B0E1E]/95"></div>
            </div>

            {/* Glass morphism overlay */}
            <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-xl pointer-events-none"></div>

            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none rounded-2xl"
              style={{
                background: `
                  repeating-conic-gradient(
                    from 0deg at 50% 50%,
                    transparent 0deg,
                    rgba(168, 85, 247, 0.1) 1deg,
                    transparent 2deg
                  )
                `,
              }}
            />

            {/* Content */}
            <div className="relative z-10 h-full">
              <MusicPlayer
                sessionId={sessionId || ""}
                isOwner={session?.hostId === currentUserId}
                currentUserId={currentUserId}
                centered={true}
                onMilestonesReady={(milestones) => {
                  setMilestones(milestones);
                }}
                onQueueReady={(queue) => {
                  setMusicQueue(queue);
                }}
                onPlayTrack={(playFn) => {
                  setPlayTrackFn(() => playFn);
                }}
                trackNotes={trackNotesHook.notes}
                onToggleNotes={handleToggleNotes}
                onTrackChange={setPlayingTrack}
                onTimeUpdate={setCurrentTime}
                onSeekReady={setSeekFn}
              />
            </div>
          </div>

          {/* Right Sidebar (30%) */}
          <SessionSidebar
            showSidebar={showSidebar}
            messages={messages}
            typingUsers={typingUsers}
            currentUserName={currentUserName}
            currentUserId={currentUserId}
            chatCount={chatCount}
            onSendMessage={handleSendChatMessage}
            onTypingStart={handleTypingStartLocal}
            onTypingStop={handleTypingStopLocal}
            joinRequests={joinRequests}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            isProcessingRequest={joinApproval.isProcessing}
            mode={sidebarMode}
            trackNotesProps={{
              trackId: playingTrack?.id || null,
              roomType: (playingTrack?.roomType as RoomType) || 'INTERNAL',
              sessionId: sessionId,
              currentTime,
              onSeek: seekFn || undefined,
              notes: trackNotesHook.notes || [],
              permission: trackNotesHook.permission,
              loading: trackNotesHook.loading,
              submitting: trackNotesHook.submitting,
              isWsConnected: trackNotesHook.isWsConnected,
              onAddNote: trackNotesHook.addNote,
              onUpdateNote: trackNotesHook.updateNote,
              onDeleteNote: trackNotesHook.deleteNote,
              onClose: handleBackToChat
            }}
          />
        </div>
      </div>

      {/* Error Display */}
      {agoraHook.error && (
        <div className="fixed top-20 right-4 bg-[#0B0E1E]/95 backdrop-blur-xl text-white px-5 py-4 rounded-2xl shadow-2xl z-50 border border-red-500/40">
          {/* Holographic Border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/40 via-red-600/40 to-red-500/40 p-[1px] -z-10">
            <div className="w-full h-full rounded-2xl bg-[#0B0E1E]/95"></div>
          </div>

          {/* Glass morphism overlay */}
          <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-xl pointer-events-none"></div>

          <div className="relative flex items-start gap-3">
            <div className="relative flex-shrink-0 mt-0.5">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md"></div>
              <AlertCircle
                size={20}
                className="relative text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-red-300">Lỗi kết nối</p>
              <p className="text-sm text-red-200/80 mt-1 break-words">{agoraHook.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Helper - Top Right */}
      <KeyboardShortcuts />

      {/* ✅ JOIN REQUEST WAITING MODAL (Member) */}
      {!isHost && joinRequest.isWaiting && (
        <JoinRequestWaitingModal
          isOpen={joinRequest.isWaiting}
          ownerName={session?.hostName || "Host"}
          ownerAvatarUrl={undefined}
          expiresAt={undefined}
          onLeave={() => {
            // ✅ Navigate back to session list when member chooses to leave
            const projectId = session?.projectId;
            if (projectId) {
              navigate(`/live-sessions/?id=${projectId}`);
            } else {
              navigate(-1);
            }
          }}
        />
      )}

      {/* ✅ JOIN ERROR MODAL (Member - when join fails after approval) */}
      <JoinErrorModal
        isOpen={showJoinError}
        errorMessage={joinErrorMessage}
        onRetry={async () => {
          setShowJoinError(false);
          try {
            if (manualJoin) {
              await manualJoin();
              showToast("🎉 Đã tham gia phiên thành công!", "success");
            }
          } catch (error: any) {
            setJoinErrorMessage(error.message || "Không thể tham gia phiên");
            setShowJoinError(true);
          }
        }}
        onClose={() => {
          setShowJoinError(false);
          // Navigate back to session list
          const projectId = session?.projectId;
          if (projectId) {
            navigate(`/projects/${projectId}/sessions`);
          } else {
            navigate(-1);
          }
        }}
      />

      {/* ✅ JOIN REQUEST CHAT MESSAGES (Owner - rendered in ChatPanel) */}
      {/* This is handled by passing joinRequests to ChatPanel */}
    </div>
  );
};

export default LiveSessionRoom;