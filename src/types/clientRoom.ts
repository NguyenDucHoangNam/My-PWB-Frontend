/**
 * Types cho ClientRoomPage
 */

import { type ClientTrackItem } from '../services/clientDeliveryService';

/**
 * Client track tree node interface
 */
export interface ClientTrackTreeNode {
    item: ClientTrackItem;
    children: ClientTrackTreeNode[];
    level: number;
}

/**
 * Props cho ClientTrackTreeNodeComponent
 */
export interface ClientTrackTreeNodeComponentProps {
    node: ClientTrackTreeNode;
    expandedTracks: Set<number>;
    playingTrackId: number | null;
    isPlaying: boolean;
    onToggleExpand: (trackId: number) => void;
    onPlay: (item: ClientTrackItem) => void;
    onViewDetail: (item: ClientTrackItem) => void;
    canAcceptDelivery: boolean;
    canRejectDelivery: boolean;
    canRequestEditDelivery: boolean;
    onOpenFeedbackModal: (item: ClientTrackItem, type: 'REJECTED' | 'REQUEST_EDIT') => void;
    onAcceptDelivery: (item: ClientTrackItem) => void;
    productCountRemaining: number;
    editCountRemaining: number;
    canDeleteTrack?: boolean;
    onDeleteTrack?: (item: ClientTrackItem) => void;
}

