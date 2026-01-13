import { useState } from 'react';
import {
    Play,
    ChevronRight,
    ChevronDown,
    CheckCircle,
    MessageCircle,
    ThumbsDown,
    Edit3,
    Trash2,
    User,
    Layers,
} from 'lucide-react';
import {
    formatDuration,
    formatFileSize,
    formatDate,
    getGlassDeliveryStatus,
} from '../../../utils/clientRoom.helpers';
import { type ClientTrackTreeNodeComponentProps } from '../../../types/clientRoom';

export const ClientTrackTreeNodeComponent: React.FC<ClientTrackTreeNodeComponentProps> = ({
    node,
    expandedTracks,
    playingTrackId,
    isPlaying,
    onToggleExpand,
    onPlay,
    onViewDetail,
    canAcceptDelivery,
    canRejectDelivery,
    canRequestEditDelivery,
    onOpenFeedbackModal,
    onAcceptDelivery,
    productCountRemaining,
    editCountRemaining,
    canDeleteTrack = false,
    onDeleteTrack,
}) => {
    const { item, children, level } = node;
    const { track, delivery } = item;
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
                        className={`h-full border-l ${
                            isHovered || isPlayingThis
                                ? 'border-cyan-400/70 shadow-[0_0_4px_rgba(6,182,212,0.4)]' 
                                : 'border-gray-600/40'
                        }`}
                        style={{
                            background: isHovered || isPlayingThis
                                ? 'linear-gradient(to bottom, rgba(6,182,212,0.6), rgba(34,211,238,0.6), transparent)'
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
                            className={`w-2.5 h-2.5 rotate-45 bg-gradient-to-br from-cyan-400/80 via-green-400/80 to-cyan-400/80 rounded-sm ${
                                isHovered 
                                    ? 'shadow-[0_0_8px_rgba(34,211,238,0.5)] scale-110' 
                                    : 'shadow-[0_0_4px_rgba(34,211,238,0.4)]'
                            }`}
                        />
                    </div>
                </div>
            )}

            {/* Main Module Shell - spaceship panel */}
            <div
                className={`relative flex flex-col ${isRoot ? 'ml-0' : 'ml-8'} mb-1 rounded-2xl bg-[#050816]/70 backdrop-blur-2xl overflow-hidden shadow-[0_0_0_1px_rgba(15,23,42,0.8),0_18px_45px_rgba(0,0,0,0.9)] ${
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
                    <div className="absolute left-0 bottom-0 h-3 w-8 border-l border-b border-green-400/50 rounded-bl-2xl" />
                    <div className="absolute right-0 bottom-0 h-3 w-8 border-r border-b border-green-400/40 rounded-br-2xl" />
                </div>

                {/* Top status rail */}
                <div className="pointer-events-none absolute left-6 right-6 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent opacity-70" />

                {/* Nebula Background Gradient */}
                <div 
                    className={`absolute inset-0 pointer-events-none ${
                        isHovered ? 'opacity-20' : 'opacity-10'
                    }`}
                    style={{
                        background: isRoot
                            ? 'radial-gradient(ellipse at top left, rgba(34,211,238,0.3), transparent 50%), radial-gradient(ellipse at bottom right, rgba(16,185,129,0.3), transparent 50%)'
                            : 'radial-gradient(ellipse at center, rgba(34,211,238,0.2), transparent 70%)',
                    }}
                />

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
                    className="absolute left-14 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full opacity-20 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(34,211,238,0.4), transparent 70%)',
                        filter: 'blur(20px)',
                    }}
                />

                {/* Tầng 1: Thông Tin & Trạng Thái */}
                <div className="relative flex items-center justify-between px-4 py-2 gap-3 z-10">
                    {/* Left: Play + Title + Meta */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Physical Play Button */}
                        <div className="relative flex-shrink-0">
                            <button
                                onClick={() => onPlay(item)}
                                className={`relative w-12 h-12 rounded-full flex items-center justify-center ${
                                    isPlayingThis
                                        ? 'bg-[#0a0a0f] border border-cyan-400/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_0_12px_rgba(34,211,238,0.3)]'
                                        : isHovered
                                        ? 'bg-[#0f0f15] border border-cyan-400/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_0_8px_rgba(34,211,238,0.2)]'
                                        : 'bg-[#0a0a0f] border border-gray-600/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]'
                                }`}
                            >
                                {isPlayingThis ? (
                                    <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 via-slate-900 to-green-400 shadow-[0_0_14px_rgba(34,211,238,0.8)]">
                                        <div className="absolute inset-1 rounded-full bg-slate-950/90 border border-slate-700/80" />
                                        <div className="absolute inset-[35%] rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                                        <div className="absolute left-1/2 top-0 h-1 w-[2px] -translate-x-1/2 bg-cyan-300/80 rounded-full shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                                    </div>
                                ) : (
                                    <Play size={18} className="text-cyan-300 ml-0.5 drop-shadow-[0_0_4px_rgba(34,211,238,0.6)]" />
                                )}
                            </button>
                        </div>

                        {/* Title & Meta Block */}
                        <div className="flex-1 min-w-0 relative">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3
                                        onClick={() => onViewDetail(item)}
                                        className="flex items-center gap-2 text-xl md:text-2xl font-extrabold cursor-pointer truncate tracking-tight"
                                    >
                                        <span className="relative inline-flex items-center max-w-[14rem] md:max-w-[22rem]">
                                            <span className="truncate bg-gradient-to-r from-cyan-200 via-green-200 to-cyan-200 bg-clip-text text-transparent">
                                                {track.name}
                                            </span>
                                            {/* Small orbit underline */}
                                            <span className="pointer-events-none absolute -bottom-1 left-0 right-0 h-px rounded-full bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
                                            <span className="ml-1 h-[2px] w-6 rounded-full bg-gradient-to-r from-cyan-300 to-green-400" />
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
                                    {/* Expand Button next to version */}
                                    {hasChildren && (
                                        <button
                                            onClick={() => onToggleExpand(track.id)}
                                            className={`relative flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-cyan-200 border border-cyan-400/40 bg-transparent ${
                                                isExpanded ? 'bg-cyan-500/15 shadow-[0_0_14px_rgba(34,211,238,0.6)]' : ''
                                            }`}
                                            title={isExpanded ? 'Thu gọn phiên bản' : 'Mở rộng phiên bản'}
                                        >
                                            {isExpanded ? (
                                                <ChevronDown size={13} className="text-cyan-200" />
                                            ) : (
                                                <ChevronRight size={13} className="text-cyan-200" />
                                            )}
                                        </button>
                                    )}
                                </div>
                                
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-semibold">
                                        <User size={14} className="opacity-80" />
                                        <span className="truncate">
                                            {delivery.sentByName || 'Người gửi không xác định'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                        <span className="truncate">
                                            {timeAndSize}
                                        </span>
                                        <span className="text-slate-500">
                                            {formatDate(delivery.sentAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Status Glass Tags */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 text-xs">
                        {getGlassDeliveryStatus(delivery.status)}
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

                {/* Notes Section */}
                {((delivery.status === 'DELIVERED' && delivery.note) ||
                    ((delivery.status === 'REJECTED' || delivery.status === 'REQUEST_EDIT' || delivery.status === 'ACCEPTED') && delivery.note)) && (
                    <div className="relative px-4 py-2 z-10">
                        {delivery.status === 'DELIVERED' && delivery.note && (
                            <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-lg p-3">
                                <div className="text-xs text-cyan-400 mb-1 font-semibold">
                                    Ghi chú từ Producer:
                                </div>
                                <p className="text-sm text-white">{delivery.note}</p>
                            </div>
                        )}
                        {(delivery.status === 'REJECTED' || delivery.status === 'REQUEST_EDIT' || delivery.status === 'ACCEPTED') && delivery.note && (
                            <div
                                className={`${
                                    delivery.status === 'REJECTED'
                                        ? 'bg-red-900/20 border-red-700/50'
                                        : delivery.status === 'REQUEST_EDIT'
                                        ? 'bg-yellow-900/20 border-yellow-700/50'
                                        : 'bg-blue-900/20 border-blue-700/50'
                                } border rounded-lg p-3`}
                            >
                                <div
                                    className={`text-xs mb-1 font-semibold ${
                                        delivery.status === 'REJECTED'
                                            ? 'text-red-400'
                                            : delivery.status === 'REQUEST_EDIT'
                                            ? 'text-yellow-400'
                                            : 'text-blue-400'
                                    }`}
                                >
                                    {delivery.status === 'REJECTED'
                                        ? 'Lý do từ chối:'
                                        : delivery.status === 'REQUEST_EDIT'
                                        ? 'Yêu cầu chỉnh sửa:'
                                        : 'Ghi chú chấp nhận:'}
                                </div>
                                <p className="text-sm text-white">{delivery.note}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Tầng 2: Action Deck - Distinct Background (extra compact) */}
                <div className="relative px-3 py-1 flex items-center justify-between gap-1.5 z-10 bg-white/3 backdrop-blur-sm">
                    {/* Left: subtle tagline */}
                    <div className="hidden md:flex items-center text-[10px] text-slate-500 font-medium tracking-wide">
                        <span className="uppercase text-slate-400/80 mr-1">PWB</span>
                        <span className="text-slate-500/80 italic">"Đốt cháy sân khấu, không đốt cháy cuộc đời."</span>
                    </div>

                    {/* Right: All Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => onViewDetail(item)}
                            className="px-3 py-1.5 bg-orange-600/20 text-orange-300 text-sm font-semibold rounded-lg border border-orange-500/40 flex items-center gap-1.5 backdrop-blur-sm shadow-[0_0_8px_rgba(251,146,60,0.2)]"
                            title="Xem chi tiết và Phản Hồi"
                        >
                            <MessageCircle size={14} />
                            Phản Hồi
                        </button>
                        {/* Action Buttons - Chỉ hiển thị khi status = DELIVERED */}
                        {delivery.status === 'DELIVERED' &&
                            (canAcceptDelivery || canRejectDelivery || canRequestEditDelivery) && (
                                <>
                                    {/* Nút Chấp nhận - Không cần check quota, reason optional */}
                                    {canAcceptDelivery && (
                                        <button
                                            onClick={() => onAcceptDelivery(item)}
                                            className="px-3 py-1.5 bg-green-600/20 text-green-300 text-sm font-semibold rounded-lg border border-green-500/40 flex items-center gap-1.5 backdrop-blur-sm shadow-[0_0_8px_rgba(34,197,94,0.2)]"
                                            title="Chấp nhận sản phẩm (không trừ quota)"
                                        >
                                            <CheckCircle size={14} />
                                            Chấp nhận
                                        </button>
                                    )}
                                    {/* Nút Từ chối - Cần check quota, reason optional */}
                                    {canRejectDelivery && (
                                        <button
                                            onClick={() =>
                                                onOpenFeedbackModal(item, 'REJECTED')
                                            }
                                            disabled={productCountRemaining <= 0}
                                            className="px-3 py-1.5 bg-red-600/20 text-red-300 text-sm font-semibold rounded-lg border border-red-500/40 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                                            title={
                                                productCountRemaining <= 0
                                                    ? 'Đã hết lượt yêu cầu làm mới'
                                                    : 'Yêu cầu làm mới (trừ 1 lượt sản phẩm)'
                                            }
                                        >
                                            <ThumbsDown size={14} />
                                            Làm mới
                                        </button>
                                    )}
                                    {/* Nút Yêu cầu chỉnh sửa - Cần check quota, reason bắt buộc */}
                                    {canRequestEditDelivery && (
                                        <button
                                            onClick={() =>
                                                onOpenFeedbackModal(item, 'REQUEST_EDIT')
                                            }
                                            disabled={editCountRemaining <= 0}
                                            className="px-3 py-1.5 bg-yellow-600/20 text-yellow-300 text-sm font-semibold rounded-lg border border-yellow-500/40 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm shadow-[0_0_8px_rgba(234,179,8,0.2)]"
                                            title={
                                                editCountRemaining <= 0
                                                    ? 'Đã hết lượt yêu cầu chỉnh sửa'
                                                    : 'Yêu cầu chỉnh sửa sản phẩm (trừ 1 lượt chỉnh sửa)'
                                            }
                                        >
                                            <Edit3 size={14} />
                                            Chỉnh sửa
                                        </button>
                                    )}
                                </>
                            )}
                        {/* Delete Button - Chỉ hiển thị khi có quyền và track chưa được chấp nhận */}
                        {canDeleteTrack && onDeleteTrack && delivery.status !== 'ACCEPTED' && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDeleteTrack(item);
                                }}
                                className="px-3 py-1.5 bg-red-600/20 text-red-300 text-sm font-semibold rounded-lg border border-red-500/40 flex items-center gap-1.5 backdrop-blur-sm shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                                title="Xóa track này"
                            >
                                <Trash2 size={14} />
                                Xóa
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Horizontal Circuit Trace (from node to card) */}
            {!isRoot && (
                <div 
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-8 h-px border-t ${
                        isHovered || isPlayingThis
                            ? 'border-cyan-400/70 shadow-[0_0_4px_rgba(6,182,212,0.4)]' 
                            : 'border-gray-600/40'
                    }`}
                    style={{
                        background: isHovered || isPlayingThis
                            ? 'linear-gradient(to right, rgba(6,182,212,0.6), rgba(34,211,238,0.6))'
                            : 'linear-gradient(to right, rgba(75,85,99,0.3), transparent)',
                    }}
                />
            )}

            {/* Version Children */}
            {hasChildren && isExpanded && (
                <div className="relative ml-8 mt-2">
                    {/* Vertical Circuit Trace connecting to children */}
                    <div 
                        className={`absolute left-0 top-0 bottom-0 w-px border-l ${
                            isHovered || isPlayingThis
                                ? 'border-cyan-400/70 shadow-[0_0_4px_rgba(6,182,212,0.4)]' 
                                : 'border-gray-600/40'
                        }`}
                        style={{
                            background: isHovered || isPlayingThis
                                ? 'linear-gradient(to bottom, rgba(6,182,212,0.6), rgba(34,211,238,0.6), transparent)'
                                : 'linear-gradient(to bottom, rgba(75,85,99,0.3), transparent)',
                        }}
                    />
                    
                    {children.map((childNode) => (
                        <div key={childNode.item.track.id} className="relative">
                            <ClientTrackTreeNodeComponent
                                node={childNode}
                                expandedTracks={expandedTracks}
                                playingTrackId={playingTrackId}
                                isPlaying={isPlaying}
                                onToggleExpand={onToggleExpand}
                                onPlay={onPlay}
                                onViewDetail={onViewDetail}
                                canAcceptDelivery={canAcceptDelivery}
                                canRejectDelivery={canRejectDelivery}
                                canRequestEditDelivery={canRequestEditDelivery}
                                onOpenFeedbackModal={onOpenFeedbackModal}
                                onAcceptDelivery={onAcceptDelivery}
                                productCountRemaining={productCountRemaining}
                                editCountRemaining={editCountRemaining}
                                canDeleteTrack={canDeleteTrack}
                                onDeleteTrack={onDeleteTrack}
                            />
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};
