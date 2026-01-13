/**
 * Helper functions cho ClientRoomPage
 */

import { type ClientTrackItem } from '../services/clientDeliveryService';
import { type ClientTrackTreeNode } from '../types/clientRoom';

/**
 * Format duration in seconds to MM:SS format
 */
export const formatDuration = (seconds?: number | null): string => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format date string to Vietnamese locale format
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Get delivery status badge component (old style - kept for backward compatibility)
 */
export const getDeliveryStatusBadge = (status: 'DELIVERED' | 'REJECTED' | 'REQUEST_EDIT' | 'ACCEPTED') => {
    switch (status) {
        case 'DELIVERED':
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/50">
                    🟢 Đã gửi
                </span>
            );
        case 'ACCEPTED':
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/50">
                    ✅ Đã chấp nhận
                </span>
            );
        case 'REJECTED':
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/50">
                    🔴 Đã từ chối
                </span>
            );
        case 'REQUEST_EDIT':
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/50">
                    🟡 Yêu cầu sửa
                </span>
            );
        default:
            return null;
    }
};

/**
 * Get glass morphism delivery status badge (cosmic style)
 */
export const getGlassDeliveryStatus = (status: 'DELIVERED' | 'REJECTED' | 'REQUEST_EDIT' | 'ACCEPTED') => {
    switch (status) {
        case 'DELIVERED':
            return (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-100 bg-[#020617]/90 border border-emerald-500/40 rounded-full">
                    <span className="inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                    Đã gửi
                </span>
            );
        case 'ACCEPTED':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-transparent border border-cyan-400/70 rounded-full">
                    <span className="inline-flex h-3 w-3 rounded-full bg-cyan-400" />
                    <span className="tracking-wide uppercase">Đã chấp nhận</span>
                </span>
            );
        case 'REJECTED':
            return (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-100 bg-[#020617]/90 border border-rose-500/45 rounded-full">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400/40 opacity-70" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-400" />
                    </span>
                    Đã từ chối
                </span>
            );
        case 'REQUEST_EDIT':
            return (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-100 bg-[#020617]/90 border border-amber-500/40 rounded-full">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/40 opacity-70" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400" />
                    </span>
                    Yêu cầu sửa
                </span>
            );
        default:
            return null;
    }
};

/**
 * Build tree structure từ rootTrackId và parentTrackId
 */
export const buildClientTrackTree = (items: ClientTrackItem[]): ClientTrackTreeNode[] => {
    // Group items by rootTrackId
    const grouped = items.reduce((acc, item) => {
        const rootId = item.track.rootTrackId || item.track.id; // Fallback cho track cũ
        if (!acc[rootId]) {
            acc[rootId] = [];
        }
        acc[rootId].push(item);
        return acc;
    }, {} as Record<number, ClientTrackItem[]>);

    const result: ClientTrackTreeNode[] = [];

    // Với mỗi group, build tree dựa trên parentTrackId
    (Object.values(grouped) as ClientTrackItem[][]).forEach((groupItems: ClientTrackItem[]) => {
        const itemMap = new Map<number, ClientTrackTreeNode>();

        // Tạo nodes
        groupItems.forEach((item: ClientTrackItem) => {
            itemMap.set(item.track.id, {
                item,
                children: [],
                level: 0,
            });
        });

        // Build tree hierarchy
        const roots: ClientTrackTreeNode[] = [];
        groupItems.forEach((item: ClientTrackItem) => {
            const node = itemMap.get(item.track.id)!;
            
            if (item.track.parentTrackId === null) {
                // Root node
                roots.push(node);
            } else {
                // Child node
                const parentNode = itemMap.get(item.track.parentTrackId);
                if (parentNode) {
                    node.level = parentNode.level + 1;
                    parentNode.children.push(node);
                } else {
                    // Parent không tìm thấy, coi như root
                    roots.push(node);
                }
            }
        });

        // Sort children by version (trong cùng một tree)
        const sortChildren = (nodes: ClientTrackTreeNode[]) => {
            nodes.sort((a, b) => {
                const versionA = parseFloat(a.item.track.version.replace(/[^\d.]/g, '')) || 0;
                const versionB = parseFloat(b.item.track.version.replace(/[^\d.]/g, '')) || 0;
                return versionA - versionB;
            });
            nodes.forEach(node => sortChildren(node.children));
        };

        // Sort children trong tree theo version
        roots.forEach(node => sortChildren(node.children));

        result.push(...roots);
    });

    // Sort toàn bộ root tracks theo sentAt mới nhất (theo yêu cầu API)
    // Lấy sentAt từ delivery.sentAt hoặc item.sentAt (item.sentAt có thể là duplicate của delivery.sentAt)
    result.sort((a, b) => {
        const sentAtA = new Date(a.item.delivery.sentAt || a.item.sentAt).getTime();
        const sentAtB = new Date(b.item.delivery.sentAt || b.item.sentAt).getTime();
        return sentAtB - sentAtA; // Mới nhất trước
    });

    return result;
};

