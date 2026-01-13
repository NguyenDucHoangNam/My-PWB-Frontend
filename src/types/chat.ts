export interface ParticipantInfoDetailResponse {
    userId: string;
    username: string;
    avatar: string | null;
}

export enum ConversationType {
    PRIVATE = 'PRIVATE',
    GROUP = 'GROUP'
}

export enum MilestoneChatType {
    INTERNAL = 'INTERNAL',
    CLIENT = 'CLIENT'
}

export interface ConversationCreationRequest {
    participantIds: string[];
    conversationType: ConversationType;
    conversationName?: string;
    conversationAvatar?: string;
}

export interface ConversationCreationResponse {
    id: string;
    conversationType: "PRIVATE" | "GROUP";
    participantHash: string;
    conversationAvatar: string | null;
    conversationName: string;
    participantInfo: ParticipantInfoDetailResponse[];
    createdAt: string;
    milestoneChatType?: "INTERNAL" | "CLIENT"; // Chỉ có giá trị khi là group chat của milestone
}

export interface ChatMessage {
    id: string;
    tempId?: string;
    conversationId: string;
    me: boolean;
    username?: string; // Backend field for sender username
    content: string;
    status: "SENDING" | "SENT";
    createdAt: string;
    read?: boolean; // Backend uses 'read' not 'isRead'
    mediaUrl?: string[]; // Keep for backward compatibility
    mediaAttachments?: MediaAttachment[]; // New field from backend
    messageType?: "TEXT" | "FILE";
}

import { MediaAttachment, MessageType } from './file';

export interface ChatRequest {
    conversationId: string;
    sender?: string;
    content: string;
    tempId?: string; // Optional - BE will generate if not provided
    mediaAttachments?: MediaAttachment[];
    messageType: MessageType;
}

export interface ApiResponse<T> {
    code: number;
    result: T;
    message?: string;
}

export interface PageResponse<T> {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
    content: T[];
    last: boolean
}

export interface ConnectionStatus {
    isConnected: boolean;
    reconnectAttempts: number;
}
