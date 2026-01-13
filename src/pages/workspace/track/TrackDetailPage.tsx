import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Loader, Music, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useTrackDetail } from '../../../component/hooks/useTrack/useTrackDetail';
import { useTrackComments } from '../../../component/hooks/useTrackComment/useTrackComments';
import { useTrackPlayer } from '../../../component/hooks/useTrack/useTrackPlayer';
import { useTrackCommentActions } from '../../../component/hooks/useTrackComment/useTrackCommentActions';
import { useTrackCommentPopup } from '../../../component/hooks/useTrackComment/useTrackCommentPopup';
import { type TrackCommentResponse } from '../../../services/commentService';
import logoPWB from '../../../assets/image/logo2.png?url';
import { useAuth } from '@/contexts/AuthContext';
import { useCosmicToast } from '@/component/toast/CosmicToastProvider';

// Import new components (now in same directory)
import AudioPlayer from './AudioPlayer';
import Waveform from './CanvasWaveform';
import CommentTimeline from './CommentTimeline';
import CreateCommentPopup from './CreateCommentPopup';
import CommentsPanel from './CommentsPanel';
import AnimatedBackground from '@/component/background/AnimatedBackground';
import { TrackCenterCircleVisualizer } from './TrackCenterCircleVisualizer';
import TrackNotesPanel from '../../../component/workspace/TrackNotesPanel';

// Helper function to format time
const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Avatar component for track owner
function TrackOwnerAvatar({
    avatarUrl,
    userName
}: {
    avatarUrl?: string | null;
    userName: string;
}) {
    const [imageError, setImageError] = useState(false);

    if (avatarUrl && !imageError) {
        return (
            <img
                src={avatarUrl}
                alt={userName}
                className="w-40 h-40 rounded-2xl object-cover border-2 border-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white text-5xl font-bold border-2 border-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            {userName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
        </div>
    );
}

export default function TrackDetailPage() {
    const { trackId } = useParams<{ trackId: string }>();
    const [searchParams] = useSearchParams();
    const { userRole } = useAuth();
    const { showToast } = useCosmicToast();

    // Check if this is Client Room mode
    const deliveryId = searchParams.get('deliveryId');
    const isClientRoomMode = !!deliveryId;
    const projectId = searchParams.get('projectId') || sessionStorage.getItem('currentProjectId');
    const isAdminViewOnlyClientRoom = isClientRoomMode && userRole === 'ADMIN';

    // Hooks
    const { track, loading, permission } = useTrackDetail(trackId, isClientRoomMode, deliveryId, projectId);
    const {
        comments,
        statistics,
        loadingComments,
        commentsApiAvailable,
        expandedCommentIds,
        setExpandedCommentIds,
        loadComments,
        loadStatistics,
        loadRepliesForComment,
        reloadExpandedReplies,
    } = useTrackComments(trackId, isClientRoomMode, deliveryId);
    const {
        isPlaying,
        setIsPlaying,
        isMuted,
        currentTime,
        duration,
        volume,
        audioPlayerRef,
        handlePlayPause,
        handleMuteToggle,
        handleVolumeChange,
        handleTimeUpdate,
        handleEnded,
        handleSeek,
    } = useTrackPlayer();
    const {
        showCommentPopup,
        popupTimestamp,
        popupPosition,
        highlightedCommentId,
        handleCreateCommentAtTime,
        handleCommentClick: handleCommentClickPopup,
        closePopup,
    } = useTrackCommentPopup();
    const { handleCommentSubmit, handleReply, handleEdit, handleDelete, handleUpdateStatus } =
        useTrackCommentActions(
            trackId,
            isClientRoomMode,
            deliveryId,
            loadComments,
            loadStatistics,
            loadRepliesForComment,
            reloadExpandedReplies,
            isPlaying,
            currentTime,
            audioPlayerRef,
            setIsPlaying
        );

    // Load comments and statistics AFTER track is loaded
    useEffect(() => {
        // Chỉ load khi track đã load xong và không còn loading
        if (!loading && track && trackId) {
            loadComments();
            loadStatistics();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, track, trackId]); // loadComments và loadStatistics là useCallback ổn định, không cần thêm vào deps

    // Get audio element from AudioPlayer ref for visualizer
    const audioElementRef = useRef<HTMLAudioElement | null>(null);

    const [audioElementVersion, setAudioElementVersion] = useState(0);
    
    // Callback to receive audio element from AudioPlayer
    const handleAudioElementReady = (audioElement: HTMLAudioElement | null) => {
        if (audioElementRef.current !== audioElement) {
            audioElementRef.current = audioElement;
            // Trigger re-render to update visualizer when audio element changes
            setAudioElementVersion(v => v + 1);
        }
    };

    // Comment click handler
    const handleCommentClick = (comment: TrackCommentResponse) => {
        handleCommentClickPopup(comment, handleSeek);
    };

    // Timestamp click handler
    const handleTimestampClick = (timestamp: number) => {
        handleSeek(timestamp);
    };

    // Comment submit wrapper
    const handleCommentSubmitWrapper = async (content: string) => {
        if (isAdminViewOnlyClientRoom) {
            showToast('Admin chỉ được xem, không thể bình luận trong phòng khách hàng.', 'error');
            return;
        }
        await handleCommentSubmit(content, popupTimestamp);
        closePopup();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
                <Loader size={48} className="animate-spin text-purple-400" />
            </div>
        );
    }

    if (!track) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
                <div className="text-center text-white">
                    <Music size={48} className="mx-auto mb-4 text-red-400" />
                    <h2 className="text-2xl font-bold">Track không tồn tại</h2>
                </div>
            </div>
        );
    }

    // Check permissions based on mode
    const isOwner = isClientRoomMode
        ? permission?.clientDelivery?.canUpdateClientRoomCommentStatus ?? false
        : true; // TODO: Replace with actual ownership check for Internal Room

    return (
        <div className="relative min-h-screen w-full pt-12 overflow-hidden">
            <AnimatedBackground />

            {/* Center Circle Visualizer - 3D Audio Visualization */}
            <TrackCenterCircleVisualizer
                audioRef={audioElementRef}
                isPlaying={isPlaying}
                playingTrack={track}
                audioElementVersion={audioElementVersion}
            />

            <main className="relative z-10 max-w-7xl mx-auto p-6 md:p-10 text-white">
                {/* Track Header Info - Horizontal Layout */}
                <div className="mb-12">
                    <div className="flex items-start gap-6">
                        {/* Avatar with glow effect and Play button */}
                        <div className="relative flex-shrink-0 group">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/50 via-pink-500/50 to-orange-500/50 blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                            <div className="relative">
                                <TrackOwnerAvatar
                                    avatarUrl={track.userAvatarUrl}
                                    userName={track.userName}
                                />
                                {/* Play button overlay - Glass effect */}
                                <button
                                    onClick={handlePlayPause}
                                    disabled={track.processingStatus !== 'READY' || !track.hlsPlaybackUrl}
                                    className={`absolute bottom-2 right-2 w-14 h-14 rounded-full flex items-center justify-center transition-all z-10 group/play ${track.processingStatus === 'READY' && track.hlsPlaybackUrl
                                        ? isPlaying
                                            ? 'bg-gradient-to-br from-purple-600 to-purple-700 backdrop-blur-sm border-2 border-purple-400/60 text-white shadow-lg shadow-purple-500/50 cursor-pointer hover:scale-110'
                                            : 'bg-white/10 backdrop-blur-sm border-2 border-purple-400/30 text-white/30 cursor-pointer hover:bg-gradient-to-br hover:from-purple-600 hover:to-purple-700 hover:text-white hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-110'
                                        : 'bg-gray-700/30 text-gray-500/30 cursor-not-allowed border-2 border-gray-600/30'
                                        }`}
                                >
                                    {isPlaying ? (
                                        <Pause size={24} className="opacity-100 transition-opacity" />
                                    ) : (
                                        <Play size={24} className="ml-1 group-hover/play:opacity-100 opacity-30 transition-opacity" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Track info */}
                        <div className="flex-1 min-w-0">
                            {/* User info badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 mb-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm text-gray-300">
                                <span className="font-medium text-purple-300">{track.userName}</span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-400">Phiên bản {track.version}</span>
                            </div>

                            {/* Track title with gradient */}
                            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent leading-tight">
                                {track.name}
                            </h1>

                            {/* Description */}
                            {track.description && (
                                <p className="text-gray-300 text-base md:text-lg mb-4 leading-relaxed">
                                    {track.description}
                                </p>
                            )}
                        </div>

                        {/* Logo PWB */}
                        <div className="flex-shrink-0 hidden md:block">
                            <div className="relative group">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-orange-500/30 blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                                <img
                                    src={logoPWB}
                                    alt="Producer Workbench"
                                    className="relative w-32 h-32 rounded-full object-contain p-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audio Player - Hidden, only for audio logic */}
                <div className="hidden">
                    <AudioPlayer
                        ref={audioPlayerRef}
                        hlsUrl={
                            track.processingStatus === 'READY' ? (track.hlsPlaybackUrl || null) : null
                        }
                        isPlaying={isPlaying}
                        isMuted={isMuted}
                        volume={volume}
                        currentTime={currentTime}
                        duration={duration}
                        onPlayPause={handlePlayPause}
                        onMuteToggle={handleMuteToggle}
                        onVolumeChange={handleVolumeChange}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleEnded}
                        onAudioElementReady={handleAudioElementReady}
                    />
                </div>

                {/* Waveform + Comment Timeline */}
                <div className="bg-black/30 backdrop-blur-md border border-purple-800/50 rounded-xl shadow-lg overflow-hidden mb-8">
                    <div className="p-6 pb-0">
                        <Waveform
                            duration={duration || track.duration || 0}
                            currentTime={currentTime}
                            onSeek={handleSeek}
                            height={128}
                        />
                    </div>
                    <CommentTimeline
                        comments={comments}
                        duration={duration || track.duration || 0}
                        onCommentClick={handleCommentClick}
                        onCreateCommentAtTime={(timestamp) =>
                            handleCreateCommentAtTime(timestamp)
                        }
                    />
                    {/* Time display, Progress bar, and Volume controls */}
                    <div className="px-6 py-4 border-t border-purple-800/30 flex items-center gap-4">
                        {/* Time display */}
                        <div className="flex items-center gap-3 text-sm font-mono flex-shrink-0">
                            <span className="text-purple-400 font-semibold min-w-[3rem]">
                                {formatTime(currentTime)}
                            </span>
                            <span className="text-gray-600">/</span>
                            <span className="text-gray-400 min-w-[3rem]">
                                {formatTime(duration)}
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div className="flex-1 flex items-center">
                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                step="0.1"
                                value={currentTime}
                                onChange={(e) => handleSeek(Number(e.target.value))}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                style={{
                                    background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${
                                        duration ? (currentTime / duration) * 100 : 0
                                    }%, rgb(55, 65, 81) ${duration ? (currentTime / duration) * 100 : 0}%, rgb(55, 65, 81) 100%)`,
                                }}
                            />
                        </div>

                        {/* Volume controls */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <button
                                onClick={handleMuteToggle}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                style={{
                                    background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${volume * 100
                                        }%, rgb(55, 65, 81) ${volume * 100}%, rgb(55, 65, 81) 100%)`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                {/* {statistics && (
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 backdrop-blur-md border border-purple-700/50 rounded-xl p-6 shadow-lg">
                            <div className="text-4xl font-bold text-purple-400 mb-2">
                                {statistics.totalComments}
                            </div>
                            <div className="text-sm text-gray-400 uppercase tracking-wide">
                                Total Comments
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 backdrop-blur-md border border-yellow-700/50 rounded-xl p-6 shadow-lg">
                            <div className="text-4xl font-bold text-yellow-400 mb-2">
                                {statistics.pendingComments}
                            </div>
                            <div className="text-sm text-gray-400 uppercase tracking-wide">
                                Pending
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-md border border-blue-700/50 rounded-xl p-6 shadow-lg">
                            <div className="text-4xl font-bold text-blue-400 mb-2">
                                {statistics.inProgressComments}
                            </div>
                            <div className="text-sm text-gray-400 uppercase tracking-wide">
                                In Progress
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 backdrop-blur-md border border-green-700/50 rounded-xl p-6 shadow-lg">
                            <div className="text-4xl font-bold text-green-400 mb-2">
                                {statistics.resolvedComments}
                            </div>
                            <div className="text-sm text-gray-400 uppercase tracking-wide">
                                Resolved
                            </div>
                        </div>
                    </div>
                )} */}

                {/* Track Notes Panel */}
                {track && trackId && (
                    <div className="mb-8">
                        <TrackNotesPanel
                            trackId={parseInt(trackId)}
                            roomType={isClientRoomMode ? 'CLIENT' : 'INTERNAL'}
                            currentTime={currentTime}
                            onSeek={handleSeek}
                        />
                    </div>
                )}

                {/* Comments Panel */}
                <CommentsPanel
                    comments={comments}
                    statistics={statistics}
                    loading={loadingComments}
                    isOwner={!isAdminViewOnlyClientRoom && isOwner}
                    highlightedCommentId={highlightedCommentId}
                    onReply={
                        isAdminViewOnlyClientRoom
                            ? () => showToast('Admin chỉ được xem, không thể bình luận trong phòng khách hàng.', 'error')
                            : handleReply
                    }
                    onEdit={
                        isAdminViewOnlyClientRoom
                            ? () => showToast('Admin chỉ được xem, không thể chỉnh sửa bình luận trong phòng khách hàng.', 'error')
                            : handleEdit
                    }
                    onDelete={
                        isAdminViewOnlyClientRoom
                            ? () => showToast('Admin chỉ được xem, không thể xóa bình luận trong phòng khách hàng.', 'error')
                            : handleDelete
                    }
                    onUpdateStatus={
                        isAdminViewOnlyClientRoom
                            ? () => showToast('Admin chỉ được xem, không thể đổi trạng thái bình luận trong phòng khách hàng.', 'error')
                            : handleUpdateStatus
                    }
                    onTimestampClick={handleTimestampClick}
                    onLoadReplies={loadRepliesForComment}
                    apiAvailable={commentsApiAvailable}
                    expandedCommentIds={expandedCommentIds}
                    onExpandedIdsChange={setExpandedCommentIds}
                />
            </main>

            {/* Create Comment Popup */}
            {showCommentPopup && !isAdminViewOnlyClientRoom && (
                <CreateCommentPopup
                    timestamp={popupTimestamp}
                    onSubmit={handleCommentSubmitWrapper}
                    onCancel={closePopup}
                    position={popupPosition}
                />
            )}
        </div>
    );
}
