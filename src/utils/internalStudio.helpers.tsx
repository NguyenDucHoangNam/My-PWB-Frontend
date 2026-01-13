import { Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import type { TrackDetailResponse } from '../services/trackService';
import type { TrackTreeNode } from '../types/internalStudio';

export const formatDuration = (seconds?: number | null): string => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const getProcessingStatusBadge = (status: TrackDetailResponse['processingStatus']) => {
    switch (status) {
        case 'UPLOADING':
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/50">
                    <Clock size={12} />
                    Đang chờ upload
                </span>
            );
        case 'PROCESSING':
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 animate-pulse">
                    <Loader size={12} className="animate-spin" />
                    Đang xử lý
                </span>
            );
        case 'READY':
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/50">
                    <CheckCircle size={12} />
                    Sẵn sàng
                </span>
            );
        case 'FAILED':
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/50">
                    <XCircle size={12} />
                    Lỗi
                </span>
            );
        default:
            return null;
    }
};

export const getTrackStatusBadge = (
    status: TrackDetailResponse['status'],
    rejectionReason?: string | null,
    onRejectClick?: () => void
) => {
    switch (status) {
        case 'INTERNAL_DRAFT':
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-500/50">
                    <Clock size={12} />
                    Bản nháp
                </span>
            );
        case 'INTERNAL_APPROVED':
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/50">
                    <CheckCircle size={12} />
                    Đã duyệt
                </span>
            );
        case 'INTERNAL_REJECTED':
            return (
                <button
                    onClick={onRejectClick}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30 hover:border-red-400 transition-colors cursor-pointer"
                    title={rejectionReason ? 'Click để xem lý do từ chối' : 'Click để xem chi tiết'}
                >
                    <XCircle size={12} />
                    Đã từ chối
                </button>
            );
        default:
            return null;
    }
};

// Compact status badges for horizontal row layout
export const getCompactProcessingStatusBadge = (status: TrackDetailResponse['processingStatus']) => {
    switch (status) {
        case 'UPLOADING':
            return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-blue-300 border border-blue-500/50 rounded">
                    <Clock size={8} />
                    Upload
                </span>
            );
        case 'PROCESSING':
            return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-yellow-300 border border-yellow-500/50 rounded animate-pulse">
                    <Loader size={8} className="animate-spin" />
                    Xử lý
                </span>
            );
        case 'READY':
            return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-green-300 border border-green-500/50 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Sẵn sàng
                </span>
            );
        case 'FAILED':
            return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-red-300 border border-red-500/50 rounded">
                    <XCircle size={8} />
                    Lỗi
                </span>
            );
        default:
            return null;
    }
};

export const getCompactTrackStatusBadge = (
    status: TrackDetailResponse['status'],
    onRejectClick?: () => void
) => {
    switch (status) {
        case 'INTERNAL_DRAFT':
            return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-gray-300 border border-gray-500/50 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    Nháp
                </span>
            );
        case 'INTERNAL_APPROVED':
            return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-green-300 border border-green-500/50 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Đã duyệt
                </span>
            );
        case 'INTERNAL_REJECTED':
            return (
                <button
                    onClick={onRejectClick}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-red-300 border border-red-500/50 rounded hover:bg-red-500/20 transition-colors cursor-pointer"
                    title="Click để xem lý do từ chối"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Từ chối
                </button>
            );
        default:
            return null;
    }
};

// Glass Tag style badges (Cosmic Audio Data Center)
export const getGlassProcessingStatus = (status: TrackDetailResponse['processingStatus']) => {
    switch (status) {
        case 'UPLOADING':
            return (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-sky-200 bg-[#020617]/90 border border-sky-600/40 rounded-full">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400/40 opacity-70" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-400" />
                    </span>
                    Đang tải
                </span>
            );
        case 'PROCESSING':
            return (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-100 bg-[#020617]/90 border border-amber-500/40 rounded-full">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/40 opacity-70" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400" />
                    </span>
                    <Loader size={12} className="animate-spin text-amber-300" />
                    Đang xử lý
                </span>
            );
        case 'READY':
            return (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-100 bg-[#020617]/90 border border-emerald-500/40 rounded-full">
                    <span className="inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                    Sẵn sàng
                </span>
            );
        case 'FAILED':
            return (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-100 bg-[#020617]/90 border border-rose-500/45 rounded-full">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400/40 opacity-70" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-400" />
                    </span>
                    Lỗi
                </span>
            );
        default:
            return null;
    }
};

export const getGlassTrackStatus = (
    status: TrackDetailResponse['status'],
    onRejectClick?: () => void
) => {
    switch (status) {
        case 'INTERNAL_DRAFT':
            return (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#020617]/90 border border-slate-500/40 rounded-full">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-300/40 opacity-60" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-slate-300" />
                    </span>
                    Bản nháp
                </span>
            );
        case 'INTERNAL_APPROVED':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-300 bg-transparent border border-sky-400/70 rounded-full">
                    <CheckCircle size={13} className="text-sky-300" />
                    <span className="tracking-wide uppercase">
                        Đã duyệt
                    </span>
                </span>
            );
        case 'INTERNAL_REJECTED':
            return (
                <button
                    onClick={onRejectClick}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-100 bg-[#020617]/90 border border-rose-500/45 rounded-full hover:bg-rose-900/40 transition-all cursor-pointer"
                    title="Click để xem lý do từ chối"
                >
                    <span className="relative flex h-3 w-3 mr-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400/40 opacity-70" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-400" />
                    </span>
                    Đã từ chối
                </button>
            );
        default:
            return null;
    }
};

export const buildTrackTree = (tracks: TrackDetailResponse[]): TrackTreeNode[] => {
    // Group tracks by rootTrackId
    const grouped = tracks.reduce((acc, track) => {
        const rootId = track.rootTrackId || track.id; // Fallback cho track cũ
        if (!acc[rootId]) {
            acc[rootId] = [];
        }
        acc[rootId].push(track);
        return acc;
    }, {} as Record<number, TrackDetailResponse[]>);

    const result: TrackTreeNode[] = [];

    // Với mỗi group, build tree dựa trên parentTrackId
    Object.values(grouped).forEach(groupTracks => {
        const trackMap = new Map<number, TrackTreeNode>();

        // Tạo nodes
        groupTracks.forEach(track => {
            trackMap.set(track.id, {
                track,
                children: [],
                level: 0,
            });
        });

        // Build tree hierarchy
        const roots: TrackTreeNode[] = [];
        groupTracks.forEach(track => {
            const node = trackMap.get(track.id)!;
            
            if (track.parentTrackId === null) {
                // Root node
                roots.push(node);
            } else {
                // Child node
                const parentNode = trackMap.get(track.parentTrackId);
                if (parentNode) {
                    node.level = parentNode.level + 1;
                    parentNode.children.push(node);
                } else {
                    // Parent không tìm thấy, coi như root
                    roots.push(node);
                }
            }
        });

        // Sort children by version
        const sortChildren = (nodes: TrackTreeNode[]) => {
            nodes.sort((a, b) => {
                const versionA = parseFloat(a.track.version.replace(/[^\d.]/g, '')) || 0;
                const versionB = parseFloat(b.track.version.replace(/[^\d.]/g, '')) || 0;
                return versionA - versionB;
            });
            nodes.forEach(node => sortChildren(node.children));
        };

        roots.sort((a, b) => {
            const versionA = parseFloat(a.track.version.replace(/[^\d.]/g, '')) || 0;
            const versionB = parseFloat(b.track.version.replace(/[^\d.]/g, '')) || 0;
            return versionA - versionB;
        });
        roots.forEach(node => sortChildren(node.children));

        result.push(...roots);
    });

    return result;
};

