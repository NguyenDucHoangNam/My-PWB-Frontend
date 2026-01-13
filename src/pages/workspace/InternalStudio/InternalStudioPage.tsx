import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  FileAudio,
  Loader,
  Trash2,
  X,
  Satellite,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import { buildTrackTree } from "../../../utils/internalStudio.helpers";

// Import custom hooks
import { useInternalStudioTracks } from "../../../component/hooks/useInternalStudio/useInternalStudioTracks";
import { useInternalStudioPermissions } from "../../../component/hooks/useInternalStudio/useInternalStudioPermissions";
import { useInternalStudioPlayer } from "../../../component/hooks/useInternalStudio/useInternalStudioPlayer";
import { useInternalStudioUpload } from "../../../component/hooks/useInternalStudio/useInternalStudioUpload";
import { useInternalStudioTrackActions } from "../../../component/hooks/useInternalStudio/useInternalStudioTrackActions";

// Import components
import { TrackTreeNode } from "./TrackTreeNode";
import { UploadModal } from "./UploadModal";
import { UploadVersionModal } from "./UploadVersionModal";
import { RejectTrackModal } from "./RejectTrackModal";
import { ViewRejectReasonModal } from "./ViewRejectReasonModal";
import { SendToClientModal } from "./SendToClientModal";
import { MiniPlayer } from "./MiniPlayer";
import { CenterCircleVisualizer } from "./CenterCircleVisualizer";
import { ManageDownloadPermissionModal } from "./ManageDownloadPermissionModal";
import AnimatedBackground from "@/component/background/AnimatedBackground";
import { type TrackDetailResponse } from "../../../services/trackService";
import { useMilestoneChat } from "../../../component/hooks/useMilestoneChat";
import { CreateMilestoneGroupChatModal } from "../../../component/workspace/CreateMilestoneGroupChatModal";
import DescriptionModal from "@/pages/project/DescriptionPage";

export default function InternalStudioPage() {
  const [searchParams] = useSearchParams();
  const milestoneId = searchParams.get("milestoneId");
  const projectId =
    searchParams.get("projectId") || sessionStorage.getItem("currentProjectId");

  // Expanded tracks state
  const [expandedTracks, setExpandedTracks] = useState<Set<number>>(new Set());

  // Custom hooks
  const { tracks, loading, loadTracks, startPolling, updateTrack } =
    useInternalStudioTracks(milestoneId);

  const {
    permission,
    canApproveTrackStatus,
    canSendTrackToClient,
    productCountRemaining,
    editCountRemaining,
    sentToClientTrackIds,
    reloadClientDeliveryInfo,
    canDeleteTrack,
    canDownloadTrack,
  } = useInternalStudioPermissions(projectId, milestoneId);

  // State cho modal quản lý quyền download
  const [selectedTrackForPermission, setSelectedTrackForPermission] =
    useState<TrackDetailResponse | null>(null);

  // Chỉ chủ dự án mới có quyền quản lý download permission
  const isOwner = permission?.role?.projectRole === "OWNER";

  // Handler để mở modal quản lý quyền download
  const handleOpenManageDownloadPermission = (track: TrackDetailResponse) => {
    setSelectedTrackForPermission(track);
  };

  // Handler để đóng modal
  const handleCloseManageDownloadPermission = () => {
    setSelectedTrackForPermission(null);
  };

  const {
    playingTrackId,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    volume,
    playbackSpeed,
    isLooping,
    audioRef,
    playTrack,
    togglePlayPause,
    toggleMute,
    handleTimeUpdate,
    handleSeek,
    handleEnded,
    setVolume,
    setPlaybackSpeed,
    toggleLoop,
  } = useInternalStudioPlayer();

  const {
    uploadForm,
    setUploadForm,
    selectedFile,
    uploadProgress,
    showUploadModal,
    handleFileSelect,
    handleUpload,
    openUploadModal,
    closeUploadModal,
    selectedTrackForVersion,
    versionForm,
    setVersionForm,
    versionFile,
    versionProgress,
    showVersionModal,
    handleVersionFileSelect,
    handleUploadVersion,
    openVersionModal,
    closeVersionModal,
  } = useInternalStudioUpload(projectId, milestoneId, (trackId) => {
    loadTracks();
    startPolling(trackId);
  });

  const {
    handleStatusChange,
    showRejectModal,
    rejectingTrack,
    rejectReason,
    setRejectReason,
    handleRejectTrack,
    closeRejectModal,
    showViewRejectReasonModal,
    viewingRejectTrack,
    handleViewRejectReason,
    closeViewRejectReasonModal,
    showSendToClientModal,
    selectedTrackForSending,
    sendNote,
    setSendNote,
    handleOpenSendToClientModal,
    handleSendToClient,
    closeSendToClientModal,
    handleViewDetail,
    handleDeleteTrack,
    showDeleteConfirm,
    trackToDelete,
    isDeleting,
    setShowDeleteConfirm,
    setTrackToDelete,
    handleConfirmDeleteTrack,
    handleDownloadTrack,
  } = useInternalStudioTrackActions(
    milestoneId,
    projectId,
    updateTrack,
    reloadClientDeliveryInfo,
    () => {
      // Reload tracks after deletion
      loadTracks();
    }
  );

  // Helper functions
  const toggleTrackExpand = (trackId: number) => {
    setExpandedTracks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  // Alias for version modal handlers (from upload hook)
  const handleOpenVersionModal = openVersionModal;
  const handleCloseVersionModal = closeVersionModal;

  // Milestone chat hook
  const {
    groupChats,
    milestoneDetail: chatMilestoneDetail,
    showCreateModal: showCreateChatModal,
    setShowCreateModal: setShowCreateChatModal,
    handleChatClick,
    handleGroupChatCreated,
  } = useMilestoneChat({
    projectId,
    milestoneId,
    chatType: "INTERNAL",
  });
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  // Logic để hiển thị button chat:
  // - Nếu chưa có group chat: chỉ Owner mới thấy để tạo group chat
  // - Nếu đã có group chat: tất cả đều thấy
  const shouldShowChatButton =
    groupChats.length > 0 || permission?.role?.projectRole === "OWNER";

  if (!milestoneId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-center text-white">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold mb-2">Thiếu milestoneId</h2>
          <p className="text-gray-400">Vui lòng truy cập từ trang workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pt-12">
      {/* Inline CSS for gradient animation + header rocket */}
      <style>{`
                @keyframes gradient {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
                .animate-gradient {
                    animation: gradient 3s ease infinite;
                    background-size: 200% 200%;
                }
                @keyframes header-rocket-sat-orbit {
                    0% {
                        transform: rotate(0deg) translateX(1.5rem) rotate(-45deg);
                    }
                    100% {
                        transform: rotate(360deg) translateX(1.5rem) rotate(-45deg);
                    }
                }
                .header-rocket-orbit {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 3rem;
                    height: 3rem;
                    margin-left: -1.5rem;
                    margin-top: -1.5rem;
                    border-radius: 9999px;
                    border: 1px dashed rgba(56,189,248,0.5);
                    pointer-events: none;
                }
                .header-rocket-sat {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform-origin: center center;
                    animation: header-rocket-sat-orbit 4s linear infinite;
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
                /* Slow spin for orbital rings */
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>

      <AnimatedBackground />

      {/* Center Circle Visualizer - 3D Audio Visualization */}
      <CenterCircleVisualizer
        audioRef={audioRef}
        isPlaying={isPlaying}
        playingTrack={tracks.find((t) => t.id === playingTrackId) || null}
      />

      <main className="relative z-10 max-w-7xl mx-auto p-6 md:p-10 text-white pb-24 ">
        {/* Header Section - Cosmic Design */}
        <div className="mb-12 relative">
          {/* Title Section */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* Decorative stars/particles effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute top-0 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse opacity-60"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="absolute top-0 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse opacity-70"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute bottom-0 left-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-pulse opacity-50"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute bottom-0 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-pulse opacity-65"
                style={{ animationDelay: "1.5s" }}
              ></div>
            </div>

            {/* Main Title with Music Icon */}
            <div className="relative inline-flex items-center gap-3 mb-4">
              <h1 className="text-3xl pb-2 md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 animate-gradient bg-[length:200%_auto]">
                Trạm Tín Hiệu Nội Bộ
              </h1>
            </div>
          </div>

          {/* Subtitle row + Stats + Signal button on the same line */}
          <div className="mt-2 flex flex-col gap-4 md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
            {/* Stats Section - Left on desktop */}
            {canSendTrackToClient && (
              <div className="order-2 md:order-1 flex flex-col gap-1 text-[10px] text-slate-300 md:justify-self-start">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 rounded-full bg-cyan-400/60 opacity-60 animate-ping" />
                    <span className="relative h-2 w-2 rounded-full bg-cyan-300" />
                  </span>
                  <span className="text-gray-400">Sản phẩm còn lại</span>
                  <span className="text-xs font-semibold text-cyan-300">
                    {productCountRemaining}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span
                      className="absolute inset-0 rounded-full bg-purple-400/60 opacity-60 animate-ping"
                      style={{ animationDelay: "0.5s" }}
                    />
                    <span className="relative h-2 w-2 rounded-full bg-purple-300" />
                  </span>
                  <span className="text-gray-400">Lượt chỉnh sửa</span>
                  <span className="text-xs font-semibold text-purple-300">
                    {editCountRemaining}
                  </span>
                </div>
              </div>
            )}

            {/* Subtitle - Center / middle */}
            <div className="order-1 md:order-2 text-center md:text-center md:col-start-2 md:col-end-3">
              <p className="text-gray-300 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed md:mx-auto">
                Truyền và quản lý các tín hiệu cho{" "}
                <span className="text-cyan-400 font-semibold">
                  Thuyền Trưởng
                </span>{" "}
                và{" "}
                <span className="text-purple-400 font-semibold">
                  Phi Hành Đoàn
                </span>
              </p>
            </div>

            {/* Upload Button - Right on desktop */}
            <div className="order-3 flex items-center justify-center md:justify-end md:justify-self-end">
              <button
                onClick={openUploadModal}
                className="group relative flex items-center text-xs md:text-sm font-semibold text-cyan-300 hover:text-cyan-100 transition-colors"
              >
                <span className="relative inline-flex items-center">
                  {/* Rocket orbiting around the label */}
                  <span className="header-rocket-orbit">
                    <span className="header-rocket-sat">
                      <Satellite size={16} className="text-cyan-300" />
                    </span>
                  </span>
                  <span className="whitespace-nowrap px-6">
                    Truyền Tín Hiệu
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* Cosmic divider between subtitle and track list */}
          <div className="mt-1 mb-0 relative h-3 max-w-4xl mx-auto overflow-hidden">
            <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-slate-400/40 to-transparent" />
            <div className="absolute left-1/5 inset-y-0 flex items-center gap-0.5">
              <span className="w-[1px] h-2 bg-slate-400/60 rounded-full" />
              <span className="w-[1px] h-3 bg-slate-300/70 rounded-full" />
              <span className="w-[1px] h-2 bg-slate-400/60 rounded-full" />
            </div>
            <div className="absolute right-1/5 inset-y-0 flex items-center gap-0.5">
              <span className="w-[1px] h-2 bg-slate-400/60 rounded-full" />
              <span className="w-[1px] h-3 bg-slate-300/70 rounded-full" />
              <span className="w-[1px] h-2 bg-slate-400/60 rounded-full" />
            </div>
          </div>
        </div>

        {/* Tracks List - Cosmic Audio Data Center */}
        <div className="relative z-10 px-2 pt-0 pb-0 animate-fade-in">
          {loading ? (
            <div className="text-center py-12">
              <Loader
                size={40}
                className="animate-spin mx-auto mb-4 text-purple-400"
              />
              <p className="text-gray-400">Đang tải tracks...</p>
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-12">
              <FileAudio size={64} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-4">
                Chưa có track nào được upload
              </p>
              <button
                onClick={openUploadModal}
                className="px-4 py-2 bg-white/5 border border-purple-500/40 text-purple-300 rounded-lg hover:bg-white/10 hover:border-purple-400/60 transition-all backdrop-blur-sm"
              >
                Upload track đầu tiên
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {buildTrackTree(tracks).map((node) => (
                <TrackTreeNode
                  key={node.track.id}
                  node={node}
                  expandedTracks={expandedTracks}
                  playingTrackId={playingTrackId}
                  isPlaying={isPlaying}
                  onToggleExpand={toggleTrackExpand}
                  onPlay={playTrack}
                  onUploadVersion={handleOpenVersionModal}
                  onViewDetail={handleViewDetail}
                  canApproveTrackStatus={canApproveTrackStatus}
                  onStatusChange={handleStatusChange}
                  onViewRejectReason={handleViewRejectReason}
                  canSendTrackToClient={canSendTrackToClient}
                  onSendToClient={handleOpenSendToClientModal}
                  sentToClientTrackIds={sentToClientTrackIds}
                  canDeleteTrack={canDeleteTrack}
                  onDeleteTrack={handleDeleteTrack}
                  canDownloadTrack={canDownloadTrack}
                  onDownloadTrack={handleDownloadTrack}
                  isOwner={isOwner}
                  onManageDownloadPermission={
                    handleOpenManageDownloadPermission
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Audio Player (Hidden, controlled programmatically) */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          className="hidden"
        />

        {/* Mini Player (Fixed Bottom) */}
        <MiniPlayer
          playingTrack={tracks.find((t) => t.id === playingTrackId) || null}
          isPlaying={isPlaying}
          isMuted={isMuted}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          playbackSpeed={playbackSpeed}
          isLooping={isLooping}
          onTogglePlayPause={togglePlayPause}
          onToggleMute={toggleMute}
          onSeek={handleSeek}
          onVolumeChange={setVolume}
          onPlaybackSpeedChange={setPlaybackSpeed}
          onToggleLoop={toggleLoop}
        />

        {/* Upload Modal */}
        <UploadModal
          show={showUploadModal}
          onClose={closeUploadModal}
          uploadForm={uploadForm}
          setUploadForm={setUploadForm}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          uploadProgress={uploadProgress}
          onUpload={handleUpload}
        />

        {/* Upload Version Modal */}
        <UploadVersionModal
          show={showVersionModal}
          onClose={handleCloseVersionModal}
          selectedTrack={selectedTrackForVersion}
          versionForm={versionForm}
          setVersionForm={setVersionForm}
          versionFile={versionFile}
          onFileSelect={handleVersionFileSelect}
          versionProgress={versionProgress}
          onUpload={handleUploadVersion}
        />

        {/* Reject Track Modal */}
        <RejectTrackModal
          show={showRejectModal}
          onClose={closeRejectModal}
          track={rejectingTrack}
          rejectReason={rejectReason}
          onRejectReasonChange={setRejectReason}
          onReject={handleRejectTrack}
        />

        {/* View Reject Reason Modal */}
        <ViewRejectReasonModal
          show={showViewRejectReasonModal}
          onClose={closeViewRejectReasonModal}
          track={viewingRejectTrack}
        />

        {/* Send to Client Modal */}
        <SendToClientModal
          show={showSendToClientModal}
          onClose={closeSendToClientModal}
          track={selectedTrackForSending}
          sendNote={sendNote}
          onSendNoteChange={setSendNote}
          productCountRemaining={productCountRemaining}
          editCountRemaining={editCountRemaining}
          onSend={handleSendToClient}
        />

        {/* Manage Download Permission Modal */}
        <ManageDownloadPermissionModal
          show={selectedTrackForPermission !== null}
          onClose={handleCloseManageDownloadPermission}
          projectId={projectId}
          milestoneId={milestoneId}
          track={selectedTrackForPermission}
        />

        {/* Delete Confirm Dialog - Inline trong page */}
        {showDeleteConfirm && trackToDelete && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50">
                    <Trash2 size={28} className="text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Xóa Track</h3>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setTrackToDelete(null);
                  }}
                  disabled={isDeleting}
                  className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <p className="text-gray-300 text-lg mb-2">
                Bạn có chắc chắn muốn xóa track:
              </p>
              <p className="text-white font-semibold text-xl mb-6 bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                "{trackToDelete.name}"
              </p>
              <p className="text-red-400 text-sm mb-6">
                ⚠️ Hành động này không thể hoàn tác.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setTrackToDelete(null);
                  }}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDeleteTrack}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Xóa
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Group Chat Modal */}
        <CreateMilestoneGroupChatModal
          isOpen={showCreateChatModal}
          onClose={() => setShowCreateChatModal(false)}
          projectId={projectId || ""}
          milestoneId={milestoneId || ""}
          milestoneDetail={chatMilestoneDetail}
          onGroupChatCreated={handleGroupChatCreated}
          filterType="INTERNAL"
        />
      </main>

      {/* Fixed Action Buttons - Bottom Left Corner */}
      {!isDescriptionModalOpen && (
        <div className="fixed bottom-24 left-12 z-[10000] flex flex-col gap-4">
          {/* Thông số Tín hiệu Button */}
          <button
            onClick={() => setIsDescriptionModalOpen(true)}
            className="group relative flex items-center justify-center transition-all duration-300"
            title="Xem thông số tín hiệu của milestone"
          >
            {/* Orbital Rotating Ring */}
            <div className="absolute -inset-2 rounded-2xl border border-dashed border-cyan-400/40 animate-spin-slow group-hover:animate-spin group-hover:border-cyan-400/70"></div>

            {/* Pulsing Ring Animation */}
            <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/40 animate-pulse-ring"></div>

            {/* Tech Frame - Hexagonal Squircle */}
            <div className="relative w-16 h-16 rounded-2xl border-2 border-cyan-500/60 bg-cyan-900/40 backdrop-blur-xl group-hover:border-cyan-400 group-hover:bg-cyan-800/50 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] shadow-2xl">
              {/* Inner Glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20"></div>
              {/* Icon */}
              <div className="relative w-full h-full flex items-center justify-center">
                <CheckCircle
                  size={28}
                  className="text-cyan-300 group-hover:text-cyan-100 transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(34,211,238,0.9)]"
                />
              </div>
            </div>
            <span className="sr-only">Thông số Tín hiệu</span>
          </button>
          {/* Milestone Chat Button - Cosmic Style */}
          {shouldShowChatButton && (
            <button
              onClick={handleChatClick}
              className="group relative flex items-center justify-center transition-all duration-300"
              title="Chat với nhóm"
              aria-label="Mở chat"
            >
              {/* Orbital Rotating Ring */}
              <div className="absolute -inset-2 rounded-2xl border border-dashed border-purple-400/40 animate-spin-slow group-hover:animate-spin group-hover:border-purple-400/70"></div>

              {/* Pulsing Ring Animation */}
              <div className="absolute inset-0 rounded-2xl border-2 border-purple-400/40 animate-pulse-ring"></div>

              {/* Tech Frame - Hexagonal Squircle */}
              <div className="relative w-16 h-16 rounded-2xl border-2 border-purple-500/60 bg-purple-900/40 backdrop-blur-xl group-hover:border-purple-400 group-hover:bg-purple-800/50 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] shadow-2xl">
                {/* Inner Glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20"></div>
                {/* Icon */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <MessageCircle
                    size={28}
                    className="text-purple-300 group-hover:text-purple-100 transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(168,85,247,0.9)]"
                  />
                </div>
              </div>
              <span className="sr-only">Chat với nhóm</span>
            </button>
          )}
        </div>
      )}

      {/* Description Modal */}
      <DescriptionModal
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        projectId={Number(projectId)}
        milestoneId={Number(milestoneId)}
        initialScope="INTERNAL"
      />
    </div>
  );
}
