// Types for Unified Chat Dock System

export interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    tempId?: string;
    status?: 'sending' | 'sent' | 'failed';
    // AI-specific fields
    suggestedActions?: string[];
    relevantGuides?: Array<{
        id: string | number;
        title: string;
        content?: string;  // Made optional since API may not always include it
        category?: string; // Made optional since API may not always include it
        imageUrl?: string;
    }>;
}

export type WindowRole = 'user' | 'ai';
export type WindowStatus = 'online' | 'offline' | 'busy';

export interface ChatWindowData {
    id: string;
    name: string;
    role: WindowRole;
    avatar?: string;
    status?: WindowStatus;
    messages: ChatMessage[];
    chatMessages?: ChatMessage[]; // User chat messages from GlobalChatWidget
    isMinimized: boolean;
    unreadCount: number;
    isTyping?: boolean;
}

export interface ChatDockConfig {
    maxWindows: number;
    position: 'bottom-right' | 'bottom-left';
}
