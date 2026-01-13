import { useSearchParams } from 'react-router-dom';
import {
    Loader,
    AlertCircle,
    CheckCircle,
    Download,
    FileAudio,
    Trash2,
    X,
} from 'lucide-react';
import { buildClientTrackTree } from '../../../utils/clientRoom.helpers';
import { useClientRoom } from '../../../component/hooks/useClientRoom';
import { ClientTrackTreeNodeComponent } from './ClientTrackTreeNode';
import { FeedbackModal } from './FeedbackModal';
import { DownloadModal } from './DownloadModal';
import { MiniPlayer } from './MiniPlayer';
import { CenterCircleVisualizer } from './CenterCircleVisualizer';
import AnimatedBackground from '@/component/background/AnimatedBackground';
import { useMilestoneChat } from '../../../component/hooks/useMilestoneChat';
import { MilestoneChatButton } from '../../../component/workspace/MilestoneChatButton';
import { CreateMilestoneGroupChatModal } from '../../../component/workspace/CreateMilestoneGroupChatModal';
import DescriptionModal from '@/pages/project/DescriptionPage';
import { useState } from 'react';
import { ConfirmModal } from '../../../component/modal/ConfirmModal';

export default function ClientRoomPage() {
    const [searchParams] = useSearchParams();
    const milestoneId = searchParams.get('milestoneId');
    const projectId = searchParams.get('projectId') || sessionStorage.getItem('currentProjectId');

    const {
        // Data
        clientTracks,
        loading,
        permission,
        productCountRemaining,
        editCountRemaining,
        expandedTracks,
        milestoneStatus,

        // Feedback modal
        showFeedbackModal,
        selectedFeedbackItem,
        feedbackType,
        feedbackReason,
        setShowFeedbackModal,
        setSelectedFeedbackItem,
        setFeedbackReason,

        // Download modal
        showDownloadModal,
        selectedTrackIds,
        isDownloading,
        setShowDownloadModal,
        setSelectedTrackIds,

        // Delete confirm
        showDeleteConfirm,
        trackToDelete,
        isDeleting,
        setShowDeleteConfirm,
        setTrackToDelete,
        handleConfirmDeleteTrack,

        // Complete milestone confirm
        showCompleteConfirm,
        isCompleting,
        setShowCompleteConfirm,
        handleOpenCompleteConfirm,
        handleConfirmCompleteMilestone,

        // Player
        playingTrackId,
        isPlaying,
        isMuted,
        currentTime,
        duration,
        volume,
        playbackSpeed,
        isLooping,
        audioRef,

        // Handlers
        toggleTrackExpand,
        playTrack,
        togglePlayPause,
        toggleMute,
        handleTimeUpdate,
        handleSeek,
        handleAudioEnded,
        setVolume,
        setPlaybackSpeed,
        toggleLoop,
        handleOpenFeedbackModal,
        handleSubmitFeedback,
        handleAcceptDelivery,
        handleViewDetail,
        handleOpenDownloadModal,
        handleToggleTrackSelection,
        handleSelectAllTracks,
        handleDeselectAllTracks,
        handleDownloadZip,
        handleDeleteTrack,

        // Permissions
        canAcceptDelivery,
        canRejectDelivery,
        canRequestEditDelivery,
        canCompleteMilestone,
        canDeleteTrack,

        // Complete project confirm
        showCompleteProjectConfirm,
        isCompletingProject,
        setShowCompleteProjectConfirm,
        handleConfirmCompleteProject,
    } = useClientRoom(milestoneId, projectId);

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
        chatType: 'CLIENT',
    });

    // Logic để hiển thị button chat:
    // - Nếu chưa có group chat: chỉ Owner mới thấy để tạo group chat
    // - Nếu đã có group chat: tất cả đều thấy
    const shouldShowChatButton = groupChats.length > 0 || permission?.role?.projectRole === 'OWNER';

    // Kiểm tra xem có ít nhất 1 track trong cột mốc
    // Yêu cầu mới: chỉ cần có track là hiển thị nút "Hoàn thành cột mốc"
    const hasDeliveredTracks = clientTracks.length > 0;

    // State cho Description Modal
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

    if (!milestoneId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
                <div className="text-center text-white">
                    <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
                    <h2 className="text-2xl font-bold mb-2">Thiếu milestoneId</h2>
                    <p className="text-gray-400">Vui lòng truy cập từ trang workspace</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen w-full pt-12"
        >
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
                playingTrack={clientTracks.find((item) => item.track.id === playingTrackId) || null}
            />

            <main className="relative z-10 max-w-7xl mx-auto p-6 md:p-10 text-white pb-24">
                {/* Header Section - Cosmic Design */}
                <div className="mb-12 relative">
                    {/* Title Section */}
                    <div className="flex-1 flex items-center justify-center relative">
                        {/* Decorative stars/particles effect */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-0 left-1/4 w-1 h-1 bg-cyan-400 rounded-full opacity-60"></div>
                            <div className="absolute top-0 right-1/3 w-1.5 h-1.5 bg-green-400 rounded-full opacity-70"></div>
                            <div className="absolute bottom-0 left-1/3 w-1 h-1 bg-cyan-300 rounded-full opacity-50"></div>
                            <div className="absolute bottom-0 right-1/4 w-1 h-1 bg-green-300 rounded-full opacity-65"></div>
                        </div>

                        {/* Main Title with Music Icon */}
                        <div className="relative inline-flex items-center gap-3 mb-4">
                            <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400">
                                Phòng Khách Hàng
                            </h1>
                        </div>
                    </div>

                    {/* Subtitle row + Stats + Action button on the same line */}
                    <div className="mt-2 flex flex-col gap-4 md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                        {/* Stats Section - Left on desktop */}
                        {permission?.clientDelivery?.canViewProductCountRemaining && (
                            <div className="order-2 md:order-1 flex flex-col gap-1 text-[10px] text-slate-300 md:justify-self-start">
                                <div className="flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="relative h-2 w-2 rounded-full bg-cyan-300" />
                                    </span>
                                    <span className="text-gray-400">Làm mới</span>
                                    <span className="text-xs font-semibold text-cyan-300">
                                        {productCountRemaining}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="relative h-2 w-2 rounded-full bg-green-300" />
                                    </span>
                                    <span className="text-gray-400">Chỉnh sửa</span>
                                    <span className="text-xs font-semibold text-green-300">
                                        {editCountRemaining}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Subtitle - Center / middle */}
                        <div className="order-1 md:order-2 text-center md:text-center md:col-start-2 md:col-end-3">
                            <p className="text-gray-300 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed md:mx-auto">
                                Xem và phản hồi các sản phẩm được gửi từ <span className="text-cyan-400 font-semibold">Producer</span>. Chỉ <span className="text-green-400 font-semibold">CLIENT</span> và <span className="text-cyan-400 font-semibold">OBSERVER</span> được xem.
                            </p>
                        </div>

                        {/* Action Button - Right on desktop */}
                        <div className="order-3 flex items-center justify-center md:justify-end md:justify-self-end">
                            {canCompleteMilestone && milestoneStatus !== 'COMPLETED' && hasDeliveredTracks ? (
                                <button
                                    onClick={handleOpenCompleteConfirm}
                                    className="group relative flex items-center text-xs md:text-sm font-semibold text-green-300"
                                    title="Chấp nhận hoàn thành cột mốc này. Email thông báo sẽ được gửi cho chủ dự án."
                                >
                                    <span className="relative inline-flex items-center">
                                        {/* Rocket orbiting around the label */}
                                        <span className="header-rocket-orbit">
                                            <span className="header-rocket-sat">
                                                <CheckCircle
                                                    size={16}
                                                    className="text-green-300"
                                                />
                                            </span>
                                        </span>
                                        <span className="whitespace-nowrap px-6">
                                            Hoàn thành cột mốc
                                        </span>
                                    </span>
                                </button>
                            ) : milestoneStatus === 'COMPLETED' && clientTracks.length > 0 ? (
                                <button
                                    onClick={handleOpenDownloadModal}
                                    className="group relative flex items-center text-xs md:text-sm font-semibold text-cyan-300"
                                    title="Tải về các track bản gốc dưới dạng file ZIP"
                                >
                                    <span className="relative inline-flex items-center">
                                        {/* Rocket orbiting around the label */}
                                        <span className="header-rocket-orbit">
                                            <span className="header-rocket-sat">
                                                <Download
                                                    size={16}
                                                    className="text-cyan-300"
                                                />
                                            </span>
                                        </span>
                                        <span className="whitespace-nowrap px-6">
                                            Tải sản phẩm về
                                        </span>
                                    </span>
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {/* Completion Status Message - Below subtitle row */}
                    {milestoneStatus === 'COMPLETED' && (
                        <div className="mt-4 p-4 bg-green-900/20 border border-green-700/50 rounded-lg max-w-2xl mx-auto">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={24} className="text-green-400" />
                                <div>
                                    <h3 className="text-lg font-semibold text-green-300">
                                        Cột mốc đã hoàn thành
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Cột mốc này đã được chấp nhận hoàn thành. Bạn có thể tải về các sản phẩm bản gốc.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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
                <div className="relative z-10 px-2 pt-0 pb-0">

                    {loading ? (
                        <div className="text-center py-12">
                            <Loader size={40} className="animate-spin mx-auto mb-4 text-cyan-400" />
                            <p className="text-gray-400">Đang tải tracks...</p>
                        </div>
                    ) : clientTracks.length === 0 ? (
                        <div className="text-center py-12">
                            <FileAudio size={64} className="mx-auto mb-4 text-gray-600" />
                            <p className="text-gray-400 mb-4">Chưa có track nào được upload</p>
                            <p className="text-gray-500 text-sm">
                                Producer sẽ gửi sản phẩm cho bạn xem và phản hồi
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {buildClientTrackTree(clientTracks).map((node) => (
                                <ClientTrackTreeNodeComponent
                                    key={node.item.track.id}
                                    node={node}
                                    expandedTracks={expandedTracks}
                                    playingTrackId={playingTrackId}
                                    isPlaying={isPlaying}
                                    onToggleExpand={toggleTrackExpand}
                                    onPlay={playTrack}
                                    onViewDetail={handleViewDetail}
                                    canAcceptDelivery={canAcceptDelivery}
                                    canRejectDelivery={canRejectDelivery}
                                    canRequestEditDelivery={canRequestEditDelivery}
                                    onOpenFeedbackModal={handleOpenFeedbackModal}
                                    onAcceptDelivery={handleAcceptDelivery}
                                    productCountRemaining={productCountRemaining}
                                    editCountRemaining={editCountRemaining}
                                    canDeleteTrack={canDeleteTrack}
                                    onDeleteTrack={handleDeleteTrack}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Audio Player (Hidden, controlled programmatically) */}
                <audio
                    ref={audioRef}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleAudioEnded}
                    className="hidden"
                />

                {/* Mini Player (Fixed Bottom) */}
                <MiniPlayer
                    playingTrack={clientTracks.find((item) => item.track.id === playingTrackId) || null}
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

                {/* Feedback Modal */}
                <FeedbackModal
                    show={showFeedbackModal}
                    feedbackType={feedbackType}
                    selectedItem={selectedFeedbackItem}
                    feedbackReason={feedbackReason}
                    onClose={() => {
                        setShowFeedbackModal(false);
                        setSelectedFeedbackItem(null);
                        setFeedbackReason('');
                    }}
                    onReasonChange={setFeedbackReason}
                    onSubmit={handleSubmitFeedback}
                />

                {/* Download Modal */}
                <DownloadModal
                    show={showDownloadModal}
                    clientTracks={clientTracks}
                    selectedTrackIds={selectedTrackIds}
                    isDownloading={isDownloading}
                    onClose={() => {
                        setShowDownloadModal(false);
                        setSelectedTrackIds(new Set());
                    }}
                    onToggleTrackSelection={handleToggleTrackSelection}
                    onSelectAll={handleSelectAllTracks}
                    onDeselectAll={handleDeselectAllTracks}
                    onDownload={handleDownloadZip}
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
                                    <h3 className="text-2xl font-bold text-white">
                                        Xóa Track
                                    </h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setTrackToDelete(null);
                                    }}
                                    disabled={isDeleting}
                                    className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <p className="text-gray-300 text-lg mb-2">
                                Bạn có chắc chắn muốn xóa track:
                            </p>
                            <p className="text-white font-semibold text-xl mb-6 bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                                "{trackToDelete.track.name}"
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
                                    className="flex-1 px-4 py-3 bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirmDeleteTrack}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

                {/* Complete Milestone Confirm Dialog */}
                {showCompleteConfirm && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 border border-green-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_25px_rgba(34,197,94,0.3)]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/50">
                                        <CheckCircle size={28} className="text-green-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">
                                        Hoàn thành cột mốc
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setShowCompleteConfirm(false)}
                                    disabled={isCompleting}
                                    className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <p className="text-gray-300 text-lg mb-2">
                                Bạn có chắc chắn muốn chấp nhận hoàn thành cột mốc này?
                            </p>
                            <p className="text-gray-400 text-sm mb-4">
                                Sau khi chấp nhận, email thông báo sẽ được gửi cho chủ dự án và bạn có thể tải về các sản phẩm bản gốc.
                            </p>
                            <p className="text-green-400 text-sm mb-6">
                                ⚠️ Hành động này sẽ đánh dấu cột mốc là đã hoàn thành.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCompleteConfirm(false)}
                                    disabled={isCompleting}
                                    className="flex-1 px-4 py-3 bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirmCompleteMilestone}
                                    disabled={isCompleting}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isCompleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            Xác nhận
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Complete Project Confirm Dialog - hiển thị sau khi hoàn thành cột mốc cuối cùng */}
                <ConfirmModal
                    show={showCompleteProjectConfirm}
                    title="Xác nhận hoàn thành dự án"
                    message="Bạn xác nhận dự án này đã hoàn thành toàn bộ? Sau khi xác nhận, thông tin trạng thái dự án sẽ được cập nhật."
                    confirmText="Xác nhận hoàn thành"
                    cancelText="Hủy"
                    confirmButtonClass="bg-sky-600 hover:bg-sky-500"
                    onClose={() => setShowCompleteProjectConfirm(false)}
                    onConfirm={handleConfirmCompleteProject}
                    isProcessing={isCompletingProject}
                />

                {/* Fixed Action Buttons - Bottom Left Corner */}
                {!isDescriptionModalOpen && (
                    <div className="fixed bottom-24 left-12 z-[10000] flex flex-col gap-4">
                        {/* Description Modal Button */}
                        {(permission?.role?.projectRole === 'OWNER' || 
                          permission?.role?.projectRole === 'CLIENT' ||
                          permission?.role?.projectRole === 'OBSERVER') && (
                            <button
                                onClick={() => setIsDescriptionModalOpen(true)}
                                className="group relative flex items-center justify-center transition-all duration-300"
                                title="Xem mô tả cột mốc"
                            >
                                {/* Orbital Rotating Ring */}
                                <div className="absolute -inset-2 rounded-2xl border border-dashed border-cyan-400/40 animate-spin-slow group-hover:animate-spin group-hover:border-cyan-400/70"></div>

                                {/* Pulsing Ring Animation */}
                                <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/40 animate-pulse-ring"></div>

                                {/* Tech Frame */}
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
                                <span className="sr-only">Mô tả cột mốc</span>
                            </button>
                        )}

                        {/* Milestone Chat Button */}
                        {shouldShowChatButton && (
                            <MilestoneChatButton onClick={handleChatClick} />
                        )}
                    </div>
                )}

                {/* Description Modal */}
                <DescriptionModal
                    isOpen={isDescriptionModalOpen}
                    onClose={() => setIsDescriptionModalOpen(false)}
                    projectId={Number(projectId)}
                    milestoneId={Number(milestoneId)}
                    initialScope="EXTERNAL"
                />

                {/* Create Group Chat Modal */}
                <CreateMilestoneGroupChatModal
                    isOpen={showCreateChatModal}
                    onClose={() => setShowCreateChatModal(false)}
                    projectId={projectId || ''}
                    milestoneId={milestoneId || ''}
                    milestoneDetail={chatMilestoneDetail}
                    onGroupChatCreated={handleGroupChatCreated}
                    filterType="CLIENT"
                />
            </main>
        </div>
    );
}