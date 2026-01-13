import { useState } from 'react';
import {
    Play,
    ChevronRight,
    ChevronDown,
    Send,
    Upload,
    Trash2,
    DownloadCloud,
    Shield,
    User,
    Layers,
} from 'lucide-react';
import type { TrackTreeNodeComponentProps } from '../../../types/internalStudio';
import { formatDuration, formatFileSize, getGlassProcessingStatus, getGlassTrackStatus } from '../../../utils/internalStudio.helpers';
import { Tooltip } from '../../../component/ui/Tooltip';
import { AudioWaveIcon } from '../../../component/ui/AudioWaveIcon';
import { FineLineWaveform } from '../../../component/ui/FineLineWaveform';
import { StarField } from '../../../component/ui/StarField';

export const TrackTreeNode: React.FC<TrackTreeNodeComponentProps> = ({
    node,
    expandedTracks,
    playingTrackId,
    isPlaying,
    onToggleExpand,
    onPlay,
    onUploadVersion,
    onViewDetail,
    canApproveTrackStatus = false,
    onStatusChange,
    onViewRejectReason,
    canSendTrackToClient = false,
    onSendToClient,
    sentToClientTrackIds = new Set(),
    canDeleteTrack = false,
    onDeleteTrack,
    canDownloadTrack = false,
    onDownloadTrack,
    isOwner = false,
    onManageDownloadPermission,
}) => {
    const { track, children, level } = node;
    const hasChildren = children.length > 0;
    const isExpanded = expandedTracks.has(track.id);
    const isRoot = level === 0;
    const isPlayingThis = playingTrackId === track.id && isPlaying;
    const [isHovered, setIsHovered] = useState(false);

    // Metadata
    const timeAndSize = [
        formatDuration(track.duration),
        formatFileSize(track.fileSize),
    ]
        .filter(Boolean)
        .join(' • ');

    return (
        <div 
            className="group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Thin Circuit Trace Line */}
            {!isRoot && (
                <div className="absolute left-0 top-0 bottom-0 w-px overflow-hidden">
                    <div 
                        className={`h-full border-l transition-all duration-300 ${
                            isHovered || isPlayingThis
                                ? 'border-cyan-400/70 shadow-[0_0_4px_rgba(6,182,212,0.4)]' 
                                : 'border-gray-600/40'
                        }`}
                        style={{
                            background: isHovered || isPlayingThis
                                ? 'linear-gradient(to bottom, rgba(6,182,212,0.6), rgba(139,92,246,0.6), transparent)'
                                : 'linear-gradient(to bottom, rgba(75,85,99,0.3), transparent)',
                        }}
                    />
                </div>
            )}

            {/* Enhanced Chip Neo with Sparkles */}
            {!isRoot && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
                    <div className="relative">
                        <div 
                            className={`w-2.5 h-2.5 rotate-45 bg-gradient-to-br from-purple-400/80 via-cyan-400/80 to-pink-400/80 rounded-sm transition-all duration-300 ${
                                isHovered 
                                    ? 'shadow-[0_0_8px_rgba(168,85,247,0.5)] scale-110' 
                                    : 'shadow-[0_0_4px_rgba(168,85,247,0.4)]'
                            }`}
                            style={{
                                animation: 'chip-pulse 3s ease-in-out infinite',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Main Module Shell - spaceship panel */}
            <div
                className={`relative flex flex-col ${isRoot ? 'ml-0' : 'ml-8'} mb-1 rounded-2xl bg-[#050816]/70 backdrop-blur-2xl transition-all duration-300 overflow-hidden shadow-[0_0_0_1px_rgba(15,23,42,0.8),0_18px_45px_rgba(0,0,0,0.9)] ${
                    isHovered || isPlayingThis ? 'shadow-[0_0_0_1px_rgba(56,189,248,0.7),0_20px_55px_rgba(15,23,42,0.95)]' : ''
                }`}
            >
                {/* Outer holo frame */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl border border-slate-700/70" />
                <div className="pointer-events-none absolute inset-[1px] rounded-[1.1rem] border border-slate-900/90" />

                {/* Corner brackets */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-0 top-0 h-3 w-8 border-l border-t border-cyan-400/60 rounded-tl-2xl" />
                    <div className="absolute right-0 top-0 h-3 w-8 border-r border-t border-cyan-400/40 rounded-tr-2xl" />
                    <div className="absolute left-0 bottom-0 h-3 w-8 border-l border-b border-purple-400/50 rounded-bl-2xl" />
                    <div className="absolute right-0 bottom-0 h-3 w-8 border-r border-b border-purple-400/40 rounded-br-2xl" />
                </div>

                {/* Top status rail */}
                <div className="pointer-events-none absolute left-6 right-6 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent opacity-70" />

                {/* Nebula Background Gradient */}
                <div 
                    className={`absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-300 ${
                        isHovered ? 'opacity-20' : ''
                    }`}
                    style={{
                        background: isRoot
                            ? 'radial-gradient(ellipse at top left, rgba(168,85,247,0.3), transparent 50%), radial-gradient(ellipse at bottom right, rgba(59,130,246,0.3), transparent 50%)'
                            : 'radial-gradient(ellipse at center, rgba(168,85,247,0.2), transparent 70%)',
                    }}
                />

                {/* Star Field */}
                <StarField count={isRoot ? 25 : 15} />

                {/* Noise/Grain Texture */}
                <div 
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        backgroundSize: '200px 200px',
                    }}
                />

                {/* Radial Gradient Bloom behind Play Button */}
                <div 
                    className="absolute left-14 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full opacity-20 pointer-events-none transition-opacity duration-300"
                    style={{
                        background: 'radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)',
                        filter: 'blur(20px)',
                    }}
                />

                {/* Tầng 1: Thông Tin & Trạng Thái */}
                <div className="relative flex items-center justify-between px-4 py-2 gap-3 z-10">
                    {/* Left: Play + Title + Meta */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Physical Play Button / Spinning Disc */}
                        <div className="relative flex-shrink-0">
                            <button
                                onClick={() => onPlay(track)}
                                disabled={track.processingStatus !== 'READY'}
                                className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    track.processingStatus === 'READY'
                                        ? isPlayingThis
                                            ? 'bg-[#0a0a0f] border border-cyan-400/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_0_12px_rgba(139,92,246,0.3)]'
                                            : isHovered
                                            ? 'bg-[#0f0f15] border border-purple-400/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_0_8px_rgba(168,85,247,0.2)]'
                                            : 'bg-[#0a0a0f] border border-gray-600/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] hover:border-purple-400/40 hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_0_8px_rgba(168,85,247,0.15)]'
                                        : 'bg-[#0a0a0f] border border-gray-600/30 text-gray-600 cursor-not-allowed shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]'
                                }`}
                            >
                                {isPlayingThis ? (
                                    <div
                                        className="relative w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-slate-900 to-cyan-400 shadow-[0_0_14px_rgba(129,140,248,0.8)]"
                                        style={{ animation: 'disc-spin 2.5s linear infinite' }}
                                    >
                                        <div className="absolute inset-1 rounded-full bg-slate-950/90 border border-slate-700/80" />
                                        <div className="absolute inset-[35%] rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(96,165,250,0.9)]" />
                                        <div className="absolute left-1/2 top-0 h-1 w-[2px] -translate-x-1/2 bg-cyan-300/80 rounded-full shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                                    </div>
                                ) : (
                                    <Play size={18} className="text-purple-300 ml-0.5 drop-shadow-[0_0_4px_rgba(139,92,246,0.6)]" />
                                )}
                            </button>
                            
                            {/* Slow Pulsing Sonar Ring when playing */}
                            {isPlayingThis && track.processingStatus === 'READY' && (
                                <div 
                                    className="absolute inset-0 rounded-full border border-cyan-400/40 pointer-events-none"
                                    style={{
                                        animation: 'sonar-pulse 3s ease-out infinite',
                                    }}
                                />
                            )}
                        </div>

                        {/* Title & Meta Block */}
                        <div className="flex-1 min-w-0 relative">
                            {/* Fine-Line Analog Waveform - Subtle behind title */}
                            <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none opacity-20">
                                <FineLineWaveform isPlaying={isPlayingThis} className="h-full w-full" />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3
                                        onClick={() => onViewDetail(track)}
                                        className="flex items-center gap-2 text-xl md:text-2xl font-extrabold cursor-pointer truncate tracking-tight"
                                    >
                                        <span className="relative inline-flex items-center max-w-[14rem] md:max-w-[22rem]">
                                            <span className="truncate bg-gradient-to-r from-fuchsia-200 via-violet-200 to-sky-200 bg-clip-text text-transparent hover:from-fuchsia-100 hover:via-violet-100 hover:to-sky-200 transition-colors">
                                                {track.name}
                                            </span>
                                            {/* Small orbit underline */}
                                            <span className="pointer-events-none absolute -bottom-1 left-0 right-0 h-px rounded-full bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
                                            <span className="ml-1 h-[2px] w-6 rounded-full bg-gradient-to-r from-cyan-300 to-purple-400" />
                                        </span>
                                        {track.version && (
                                            <span className="flex items-center gap-1 flex-shrink-0 text-[11px] font-semibold text-cyan-200/90">
                                                <Layers size={12} className="text-cyan-300" />
                                                <span className="uppercase tracking-wide">
                                                    v{track.version}
                                                </span>
                                            </span>
                                        )}
                                    </h3>
                                    {/* Expand Button next to version - orbit style */}
                                    {hasChildren && (
                                        <button
                                            onClick={() => onToggleExpand(track.id)}
                                            className={`relative flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-cyan-200 transition-all duration-300 border border-cyan-400/40 bg-transparent hover:bg-cyan-500/10 hover:shadow-[0_0_10px_rgba(34,211,238,0.45)] ${
                                                isExpanded ? 'bg-cyan-500/15 shadow-[0_0_14px_rgba(129,140,248,0.6)]' : ''
                                            }`}
                                            title={isExpanded ? 'Thu gọn phiên bản' : 'Mở rộng phiên bản'}
                                        >
                                            <span className="relative flex items-center justify-center">
                                                <span
                                                    className="absolute inset-0 rounded-full border border-cyan-400/40 opacity-60"
                                                />
                                                <span
                                                    className="absolute w-1 h-1 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(56,189,248,0.9)]"
                                                    style={{
                                                        transformOrigin: '150% 50%',
                                                        transform: 'translateX(-2px)',
                                                        animation: isExpanded ? 'orbit 1.4s linear infinite' : 'none',
                                                    }}
                                                />
                                                {isExpanded ? (
                                                    <ChevronDown size={13} className="text-cyan-200 relative" />
                                                ) : (
                                                    <ChevronRight size={13} className="text-cyan-200 relative" />
                                                )}
                                            </span>
                                        </button>
                                    )}
                                    {/* Audio Wave Icon */}
                                    <AudioWaveIcon isPlaying={isPlayingThis} />
                                </div>
                                
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-semibold">
                                        <User size={14} className="opacity-80" />
                                        <span className="truncate">
                                            {track.userName || 'Người tải không xác định'}
                                        </span>
                                        {track.voiceTagEnabled && (
                                            <span
                                                className="flex-shrink-0 text-cyan-400"
                                                title="Voice Tag"
                                            >
                                                🎤 Voice Tag
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                        <span className="truncate">
                                            {timeAndSize}
                                        </span>
                                        <div className="flex items-center gap-2 flex-shrink-0" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Status Glass Tags + Version Upload */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 text-xs">
                        {getGlassProcessingStatus(track.processingStatus)}
                        {getGlassTrackStatus(
                            track.status,
                            track.status === 'INTERNAL_REJECTED' && onViewRejectReason
                                ? () => onViewRejectReason(track)
                                : undefined
                        )}
                        {canApproveTrackStatus && (
                            <select
                                value={track.status}
                                onChange={(e) => {
                                    const newStatus = e.target.value as
                                        | 'INTERNAL_DRAFT'
                                        | 'INTERNAL_APPROVED'
                                        | 'INTERNAL_REJECTED';
                                    if (newStatus !== track.status) {
                                        onStatusChange?.(track, newStatus);
                                    }
                                }}
                                className="px-3 py-1.5 text-xs font-medium bg-[#020617]/90 border border-slate-600 text-slate-100 rounded-full cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-400/60 focus:border-emerald-400/60 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <option value="INTERNAL_DRAFT" className="bg-[#020617] text-slate-200">
                                    Bản nháp
                                </option>
                                <option value="INTERNAL_APPROVED" className="bg-[#020617] text-emerald-200">
                                    Đã duyệt
                                </option>
                                <option value="INTERNAL_REJECTED" className="bg-[#020617] text-rose-200">
                                    Đã từ chối
                                </option>
                            </select>
                        )}
                        {/* Upload new version - top right for quick access */}
                        <Tooltip content="Tải phiên bản mới lên">
                            <button
                                onClick={() => onUploadVersion(track)}
                                className="ml-1 w-7 h-7 rounded-full flex items-center justify-center text-sky-300 bg-white/5 border border-sky-500/40 hover:bg-sky-500/10 hover:border-sky-400/70 hover:text-sky-100 transition-all duration-200"
                            >
                                <Upload size={13} />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {/* Cosmic Divider between header and controls */}
                <div className="relative mx-5 mt-0.5 mb-0.5 h-2 overflow-hidden">
                    {/* Main thin line */}
                    <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-slate-500/40 to-transparent" />
                    {/* Left ticks */}
                    <div className="absolute left-1/5 inset-y-0 flex items-center gap-0.5">
                        <span className="w-[1px] h-2 bg-slate-500/60 rounded-full" />
                        <span className="w-[1px] h-3 bg-slate-400/70 rounded-full" />
                        <span className="w-[1px] h-2 bg-slate-500/60 rounded-full" />
                    </div>
                    {/* Right ticks */}
                    <div className="absolute right-1/5 inset-y-0 flex items-center gap-0.5">
                        <span className="w-[1px] h-2 bg-slate-500/60 rounded-full" />
                        <span className="w-[1px] h-3 bg-slate-400/70 rounded-full" />
                        <span className="w-[1px] h-2 bg-slate-500/60 rounded-full" />
                    </div>
                </div>

                {/* Tầng 2: Action Deck - Distinct Background (extra compact) */}
                <div className="relative px-3 py-1 flex items-center justify-between gap-1.5 z-10 bg-white/3 backdrop-blur-sm">
                    {/* Left: subtle tagline */}
                    <div className="hidden md:flex items-center text-[10px] text-slate-500 font-medium tracking-wide">
                        <span className="uppercase text-slate-400/80 mr-1">PWB</span>
                        <span className="text-slate-500/80 italic">“Đốt cháy sân khấu, không đốt cháy cuộc đời.”</span>
                    </div>

                    {/* Right: All Actions (without version upload) */}
                    <div className="flex items-center gap-2">
                        {sentToClientTrackIds.has(track.id) && (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 text-emerald-300 text-[10px] font-semibold">
                                <span
                                    className="relative inline-flex items-center justify-center h-3 w-3 overflow-visible"
                                    style={{
                                        animation: 'rocket-fly 1.8s ease-in-out infinite',
                                    }}
                                >
                                    {/* Exhaust trail */}
                                    <span
                                        className="absolute -left-1 h-[2px] w-1 rounded-full bg-emerald-400/60"
                                        style={{
                                            animation: 'rocket-exhaust 1.8s ease-out infinite',
                                        }}
                                    />
                                    <span
                                        className="absolute -left-2 h-[2px] w-1.5 rounded-full bg-emerald-400/30"
                                        style={{
                                            animation: 'rocket-exhaust 1.8s ease-out infinite',
                                            animationDelay: '0.12s',
                                        }}
                                    />
                                    {/* Rocket */}
                                    <span className="relative text-xs leading-none">🚀</span>
                                </span>
                                <span>Tín hiệu đã gửi</span>
                            </span>
                        )}
                        {onDownloadTrack && (
                            <Tooltip content={track.processingStatus !== 'READY' ? 'Track chưa sẵn sàng' : 'Tải xuống'}>
                                <button
                                    onClick={() => onDownloadTrack(track)}
                                    disabled={track.processingStatus !== 'READY'}
                                    className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 bg-transparent border border-gray-600/30 hover:bg-green-500/10 hover:border-green-400/50 hover:text-green-300 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed etched-icon"
                                >
                                    <DownloadCloud size={14} />
                                </button>
                            </Tooltip>
                        )}
                        {isOwner && onManageDownloadPermission && (
                            <Tooltip content="Quyền Download">
                                <button
                                    onClick={() => onManageDownloadPermission(track)}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 bg-transparent border border-gray-600/30 hover:bg-purple-500/10 hover:border-purple-400/50 hover:text-purple-300 transition-all duration-200 etched-icon"
                                >
                                    <Shield size={14} />
                                </button>
                            </Tooltip>
                        )}
                        {canSendTrackToClient && !sentToClientTrackIds.has(track.id) && (
                            <Tooltip
                                content={
                                    track.status !== 'INTERNAL_APPROVED'
                                        ? 'Track chưa được phê duyệt'
                                        : track.processingStatus !== 'READY'
                                        ? 'Track chưa sẵn sàng'
                                        : 'Gửi cho Client'
                                }
                            >
                                <button
                                    onClick={() => onSendToClient?.(track)}
                                    disabled={track.status !== 'INTERNAL_APPROVED' || track.processingStatus !== 'READY'}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 bg-transparent border border-gray-600/30 hover:bg-cyan-500/10 hover:border-cyan-400/50 hover:text-cyan-300 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed etched-icon"
                                >
                                <Send size={14} />
                                </button>
                            </Tooltip>
                        )}
                        {canDeleteTrack && onDeleteTrack && (
                            <Tooltip content="Xóa">
                                <button
                                    onClick={() => onDeleteTrack(track)}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 bg-transparent border border-gray-600/30 hover:bg-red-500/10 hover:border-red-400/50 hover:text-red-300 transition-all duration-200 etched-icon"
                                >
                                <Trash2 size={14} />
                                </button>
                            </Tooltip>
                        )}
                    </div>
                </div>
            </div>

            {/* Horizontal Circuit Trace (from node to card) */}
            {!isRoot && (
                <div 
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-8 h-px border-t transition-all duration-300 ${
                        isHovered || isPlayingThis
                            ? 'border-cyan-400/70 shadow-[0_0_4px_rgba(6,182,212,0.4)]' 
                            : 'border-gray-600/40'
                    }`}
                    style={{
                        background: isHovered || isPlayingThis
                            ? 'linear-gradient(to right, rgba(6,182,212,0.6), rgba(139,92,246,0.6))'
                            : 'linear-gradient(to right, rgba(75,85,99,0.3), transparent)',
                    }}
                />
            )}

            {/* Version Children */}
            {hasChildren && isExpanded && (
                <div className="relative ml-8 mt-2">
                    {/* Vertical Circuit Trace connecting to children */}
                    <div 
                        className={`absolute left-0 top-0 bottom-0 w-px border-l transition-all duration-300 ${
                            isHovered || isPlayingThis
                                ? 'border-cyan-400/70 shadow-[0_0_4px_rgba(6,182,212,0.4)]' 
                                : 'border-gray-600/40'
                        }`}
                        style={{
                            background: isHovered || isPlayingThis
                                ? 'linear-gradient(to bottom, rgba(6,182,212,0.6), rgba(139,92,246,0.6), transparent)'
                                : 'linear-gradient(to bottom, rgba(75,85,99,0.3), transparent)',
                        }}
                    />
                    
                    {children.map((childNode) => (
                        <div key={childNode.track.id} className="relative">
                            <TrackTreeNode
                                node={childNode}
                                expandedTracks={expandedTracks}
                                playingTrackId={playingTrackId}
                                isPlaying={isPlaying}
                                onToggleExpand={onToggleExpand}
                                onPlay={onPlay}
                                onUploadVersion={onUploadVersion}
                                onViewDetail={onViewDetail}
                                canApproveTrackStatus={canApproveTrackStatus}
                                onStatusChange={onStatusChange}
                                onViewRejectReason={onViewRejectReason}
                                canSendTrackToClient={canSendTrackToClient}
                                onSendToClient={onSendToClient}
                                sentToClientTrackIds={sentToClientTrackIds}
                                canDeleteTrack={canDeleteTrack}
                                onDeleteTrack={onDeleteTrack}
                                canDownloadTrack={canDownloadTrack}
                                onDownloadTrack={onDownloadTrack}
                                isOwner={isOwner}
                                onManageDownloadPermission={onManageDownloadPermission}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Error Message */}
            {track.errorMessage && (
                <div className="ml-8 px-4 py-2 bg-red-900/30 border-l-2 border-red-500/60 text-xs text-red-300 rounded-r backdrop-blur-sm shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                    ❌ {track.errorMessage}
                </div>
            )}

            {/* All Animations */}
            <style>{`
                @keyframes sonar-pulse {
                    0% {
                        opacity: 0.6;
                        transform: scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(1.5);
                    }
                }
                @keyframes disc-spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                @keyframes orbit {
                    0% {
                        transform: rotate(0deg) translateX(-2px);
                    }
                    100% {
                        transform: rotate(360deg) translateX(-2px);
                    }
                }
                @keyframes rocket-fly {
                    0% {
                        transform: translateX(0) translateY(0) rotate(-45deg) scale(0.9);
                        opacity: 0.15;
                    }
                    30% {
                        transform: translateX(2px) translateY(-1px) rotate(-45deg) scale(1);
                        opacity: 1;
                    }
                    60% {
                        transform: translateX(4px) translateY(-2px) rotate(-45deg) scale(1.02);
                        opacity: 0.85;
                    }
                    100% {
                        transform: translateX(6px) translateY(-3px) rotate(-45deg) scale(0.95);
                        opacity: 0.15;
                    }
                }
                @keyframes rocket-exhaust {
                    0% {
                        opacity: 0;
                        transform: translateX(0) scaleX(0.7);
                    }
                    30% {
                        opacity: 0.9;
                        transform: translateX(-1px) scaleX(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateX(-3px) scaleX(1.1);
                    }
                }
                .etched-icon {
                    position: relative;
                }
                .etched-icon::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    padding: 1px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.3));
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .etched-icon:hover::before {
                    opacity: 1;
                }
                .etched-icon:hover {
                    background: rgba(255,255,255,0.05);
                    box-shadow: inset 0 1px 2px rgba(0,0,0,0.3), 0 0 8px currentColor;
                }
            `}</style>
        </div>
    );
};
