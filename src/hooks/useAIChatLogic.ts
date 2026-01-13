import { useState, useEffect, useCallback } from 'react';
import { aiContextService, AuthenticationRequiredError } from '@/services/aiContextService';
import { useNavigate } from 'react-router-dom';
import { useCosmicToast } from '@/component/toast/CosmicToastProvider';
import { ChatMessage } from '@/types/chatDock';

export const useAIChatLogic = () => {
    const { showToast } = useCosmicToast();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [currentPage] = useState(window.location.pathname);

    // Load conversation history from Redis on mount
    useEffect(() => {
        const loadHistory = async () => {
            if (!aiContextService.isAuthenticated()) {
                console.log('⏭️ Skipping AI history load - user not authenticated');
                return;
            }

            try {
                const response = await aiContextService.getHistory();

                if (response.result && response.result.messages.length > 0) {
                    const loadedMessages: ChatMessage[] = response.result.messages.map((msg, idx) => ({
                        id: `history-${idx}`,
                        text: msg.content,
                        senderId: msg.role === 'user' ? 'me' : 'ai-cosmic',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }));

                    setMessages(loadedMessages);
                    console.log(`📜 Loaded ${loadedMessages.length} AI messages from history`);
                }
            } catch (error) {
                if (error instanceof AuthenticationRequiredError) {
                    console.log('⏭️ Authentication required for AI history - skipping');
                    return;
                }
                console.warn('Failed to load AI history:', error);
            }
        };

        loadHistory();
    }, []);

    // Send message to AI
    const sendMessage = useCallback(async (text: string) => {
        // Add user message
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            senderId: 'me',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        try {
            const response = await aiContextService.getGuidance({
                query: text,
                currentPage,
                includeRelatedGuides: true,
                maxGuides: 3,
            });

            if (response.result && response.result.answer) {
                const aiMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    senderId: 'ai-cosmic',
                    text: response.result.answer,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    suggestedActions: response.result.suggestedActions ?? undefined,
                    relevantGuides: response.result.relevantGuides ?? undefined
                };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                throw new Error(response.message || 'Failed to get AI response');
            }
        } catch (error: any) {
            console.error('AI Error:', error);

            if (error instanceof AuthenticationRequiredError) {
                showToast('Bạn cần đăng nhập để sử dụng AI Assistant', 'error');
                setTimeout(() => {
                    navigate('/login', { state: { from: window.location.pathname } });
                }, 500);
                return;
            }

            let errorMessage = 'Không thể kết nối với AI. Vui lòng thử lại!';
            if (error.response?.status === 401) {
                errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
                setTimeout(() => {
                    navigate('/login', { state: { from: window.location.pathname } });
                }, 1500);
            } else if (error.response?.status === 500) {
                errorMessage = 'Hệ thống AI tạm thời không khả dụng. Vui lòng thử lại sau.';
            }

            showToast(errorMessage, 'error');
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                senderId: 'ai-cosmic',
                text: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau một chút.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    }, [currentPage, navigate, showToast]);

    return {
        messages,
        sendMessage,
        isTyping
    };
};
