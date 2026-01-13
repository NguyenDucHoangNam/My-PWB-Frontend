import type { TrackDetailResponse } from '../services/trackService';

export interface UploadProgress {
    trackId?: number;
    phase: 'creating' | 'uploading' | 'finalizing' | 'processing' | 'done' | 'error';
    progress: number;
    message: string;
    error?: string;
}

export interface TrackTreeNode {
    track: TrackDetailResponse;
    children: TrackTreeNode[];
    level: number;
}

export interface TrackTreeNodeComponentProps {
    node: TrackTreeNode;
    expandedTracks: Set<number>;
    playingTrackId: number | null;
    isPlaying: boolean;
    onToggleExpand: (trackId: number) => void;
    onPlay: (track: TrackDetailResponse) => void;
    onUploadVersion: (track: TrackDetailResponse) => void;
    onViewDetail: (track: TrackDetailResponse) => void;
    canApproveTrackStatus?: boolean;
    onStatusChange?: (track: TrackDetailResponse, status: 'INTERNAL_DRAFT' | 'INTERNAL_APPROVED' | 'INTERNAL_REJECTED') => void;
    onViewRejectReason?: (track: TrackDetailResponse) => void;
    canSendTrackToClient?: boolean;
    onSendToClient?: (track: TrackDetailResponse) => void;
    sentToClientTrackIds?: Set<number>;
    canDeleteTrack?: boolean;
    onDeleteTrack?: (track: TrackDetailResponse) => void;
    canDownloadTrack?: boolean;
    onDownloadTrack?: (track: TrackDetailResponse) => void;
    isOwner?: boolean;
    onManageDownloadPermission?: (track: TrackDetailResponse) => void;
}

