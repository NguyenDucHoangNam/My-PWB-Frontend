// Adapter for GlobalChatWidget to integrate with ChatDockManager
import { useCallback } from 'react';
import { openChatWindow } from '@/component/chat/ChatDockManager';
import { ChatWindowData } from '@/types/chatDock';
import { ConversationCreationResponse } from '@/types/chat';

export const useGlobalChatAdapter = () => {
    // Open user chat in dock
    const openUserChat = useCallback((conversation: ConversationCreationResponse) => {
        // Convert conversation to ChatWindowData
        const windowData: Omit<ChatWindowData, 'isMinimized' | 'unreadCount'> = {
            id: conversation.id,
            name: conversation.conversationName || getConversationDisplayName(conversation),
            role: 'user',
            avatar: conversation.conversationAvatar || getDefaultAvatar(conversation),
            status: 'online', // Will be updated by WebSocket
            messages: [],
            isTyping: false
        };

        openChatWindow(windowData);
    }, []);

    // Get display name for conversation
    const getConversationDisplayName = (conversation: ConversationCreationResponse): string => {
        if (conversation.conversationName) return conversation.conversationName;

        // For private chats, use participant name
        if (conversation.conversationType === 'PRIVATE' && conversation.participantInfo?.length > 0) {
            return conversation.participantInfo[0].username || 'Unknown User';
        }

        return 'Group Chat';
    };

    // Get default avatar for conversation
    const getDefaultAvatar = (conversation: ConversationCreationResponse): string => {
        if (conversation.participantInfo?.length > 0) {
            const firstParticipant = conversation.participantInfo[0];
            if (firstParticipant.avatar) return firstParticipant.avatar;

            // Generate avatar from username
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstParticipant.username)}&background=random`;
        }

        return `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.conversationName || 'Chat')}&background=random`;
    };

    return {
        openUserChat
    };
};
