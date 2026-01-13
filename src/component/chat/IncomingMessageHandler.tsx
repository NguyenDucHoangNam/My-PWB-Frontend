/**
 * IncomingMessageHandler
 * Component xử lý tin nhắn đến: phát âm thanh, hiện badge, và tự động mở chat window
 * 
 * Logic:
 * 1. Chat window đang mở (không minimize) → Sync tin nhắn vào ChatDockManager
 * 2. Chat window đang minimize (icon nhỏ) → Phát âm thanh + hiện badge đỏ trên icon + badge Header + sync tin nhắn
 * 3. Chat window chưa mở → Phát âm thanh + tự động mở chat window
 * 
 * Quan trọng: Component này xử lý TẤT CẢ tin nhắn đến, không phụ thuộc vào 
 * conversation hiện tại của GlobalChatWidget. Điều này cho phép xử lý nhiều 
 * chat windows đồng thời.
 */

import { useEffect, useCallback, useRef } from 'react';
import { webSocketService } from '@/libs/websocket';
import { notificationSoundService } from '@/services/notificationSoundService';
import { ChatMessage } from '@/types/chat';
import { ApiService } from '@/services/chatService';

// Track conversations: 'open' = window đang mở, 'minimized' = window đang minimize
const conversationStates = new Map<string, 'open' | 'minimized'>();

// Export functions to manage conversation states
export const setConversationState = (conversationId: string, state: 'open' | 'minimized') => {
    conversationStates.set(conversationId, state);
    console.log('📩 Set conversation state:', conversationId, state);
};

export const removeConversationState = (conversationId: string) => {
    conversationStates.delete(conversationId);
    console.log('📩 Removed conversation state:', conversationId);
};

export const getConversationState = (conversationId: string): 'open' | 'minimized' | null => {
    return conversationStates.get(conversationId) || null;
};

export const isConversationWindowOpen = (conversationId: string): boolean => {
    return conversationStates.has(conversationId);
};

export const IncomingMessageHandler: React.FC = () => {
    const isHandlerRegisteredRef = useRef(false);

    // Handle incoming message
    const handleIncomingMessage = useCallback(async (message: ChatMessage) => {
        console.log('📩 IncomingMessageHandler received message:', {
            me: message.me,
            tempId: message.tempId,
            status: message.status,
            conversationId: message.conversationId,
            content: message.content?.substring(0, 30)
        });

        const conversationId = message.conversationId;
        if (!conversationId) {
            console.log('📩 Message has no conversationId');
            return;
        }

        const windowState = getConversationState(conversationId);

        // For own messages (me === true): just sync to the window, no notification
        // This handles the case when user sends message from a window that is not GlobalChatWidget's active conversation
        if (message.me === true) {
            if (windowState) {
                console.log('📩 Syncing own message to window');
                window.dispatchEvent(new CustomEvent('syncIncomingMessage', {
                    detail: { conversationId, message }
                }));
            }
            return;
        }

        // Ignore SENDING status for messages from others
        if (message.tempId && message.status === 'SENDING') {
            console.log('📩 Ignoring sending message');
            return;
        }
        console.log('🔔 New message - window state:', windowState);

        // Case 1: Window đang mở (không minimize) → Dispatch message để sync vào ChatDockManager
        if (windowState === 'open') {
            console.log('📩 Chat window is open, syncing message to dock');
            // Dispatch message để ChatDockManager cập nhật tin nhắn
            window.dispatchEvent(new CustomEvent('syncIncomingMessage', {
                detail: { conversationId, message }
            }));
            return;
        }

        // Case 2: Window đang minimize → Phát âm thanh + hiện badge + sync message
        if (windowState === 'minimized') {
            console.log('🔔 Chat window is minimized, playing sound and showing badge');
            await notificationSoundService.playNotificationSound();

            // Sync message to minimized window so it shows when un-minimized
            window.dispatchEvent(new CustomEvent('syncIncomingMessage', {
                detail: { conversationId, message }
            }));

            // Update unread badge on Header
            window.dispatchEvent(new CustomEvent('newUnreadMessage', {
                detail: { conversationId, message }
            }));

            // Update unread count on minimized chat icon
            window.dispatchEvent(new CustomEvent('incrementWindowUnread', {
                detail: { conversationId }
            }));
            return;
        }

        // Case 3: Window chưa mở → Phát âm thanh + tự động mở
        console.log('🔔 No chat window, playing sound and auto-opening');
        await notificationSoundService.playNotificationSound();

        // Update unread badge on Header
        window.dispatchEvent(new CustomEvent('newUnreadMessage', {
            detail: { conversationId, message }
        }));

        try {
            const conversations = await ApiService.getConversations();
            const conversation = conversations.find(c => c.id === conversationId);
            
            if (conversation) {
                const displayName = conversation.conversationName || 
                    (conversation.participantInfo?.[0]?.username || 'Chat');
                
                const avatar = conversation.conversationAvatar || 
                    conversation.participantInfo?.[0]?.avatar || null;

                // Open chat window
                window.dispatchEvent(new CustomEvent('openUserChatWindow', {
                    detail: {
                        conversationId: conversation.id,
                        conversationName: displayName,
                        conversationAvatar: avatar,
                        conversationType: conversation.conversationType,
                        participants: conversation.participantInfo || [],
                        chatMessages: [message]
                    }
                }));

                // Setup GlobalChatWidget for WebSocket sync
                window.dispatchEvent(new CustomEvent('setupGlobalChatForConversation', {
                    detail: { conversationId }
                }));

                console.log('✅ Chat window opened for:', displayName);
            }
        } catch (error) {
            console.error('Failed to open chat window:', error);
        }
    }, []);

    // Register global message handler when component mounts
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.log('📩 No token, skipping message handler registration');
            return;
        }

        // Avoid double registration
        if (isHandlerRegisteredRef.current) {
            console.log('📩 Handler already registered, skipping');
            return;
        }

        console.log('📩 Registering global incoming message handler');
        isHandlerRegisteredRef.current = true;

        // Add message handler to WebSocket service
        // If already connected, this just adds the handler
        // If not connected, it will connect first
        webSocketService.connect(
            handleIncomingMessage,
            undefined,
            undefined
        ).then(() => {
            console.log('✅ Incoming message handler registered successfully');
        }).catch(error => {
            console.error('Failed to register incoming message handler:', error);
            isHandlerRegisteredRef.current = false;
        });

        return () => {
            console.log('📩 Removing global incoming message handler');
            webSocketService.removeMessageHandler(handleIncomingMessage);
            isHandlerRegisteredRef.current = false;
        };
    }, [handleIncomingMessage]);

    // Listen for window open/close/minimize events
    useEffect(() => {
        const handleWindowOpen = (event: CustomEvent) => {
            const { conversationId } = event.detail || {};
            if (conversationId) {
                setConversationState(conversationId, 'open');
            }
        };

        const handleWindowStateChange = (event: CustomEvent) => {
            const { conversationId, isMinimized } = event.detail || {};
            if (conversationId) {
                setConversationState(conversationId, isMinimized ? 'minimized' : 'open');
            }
        };

        const handleWindowClose = (event: CustomEvent) => {
            const { conversationId } = event.detail || {};
            if (conversationId) {
                removeConversationState(conversationId);
            }
        };

        window.addEventListener('openUserChatWindow' as any, handleWindowOpen);
        window.addEventListener('chatWindowStateChange' as any, handleWindowStateChange);
        window.addEventListener('closeUserChatWindow' as any, handleWindowClose);

        return () => {
            window.removeEventListener('openUserChatWindow' as any, handleWindowOpen);
            window.removeEventListener('chatWindowStateChange' as any, handleWindowStateChange);
            window.removeEventListener('closeUserChatWindow' as any, handleWindowClose);
        };
    }, []);

    // This component doesn't render anything
    return null;
};

export default IncomingMessageHandler;
