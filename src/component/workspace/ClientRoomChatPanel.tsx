"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { UserPlus, MessageCircle, MessageCirclePlus } from "lucide-react";
import { ChatMessage, ConnectionStatus, ConversationCreationResponse, ParticipantInfoDetailResponse } from "@/types/chat";
import { ApiService } from "@/services/chatService";
import { webSocketService } from "@/libs/websocket";
import { MessageList } from "../chat/MessageList";
import { MessageInput } from "../chat/MessageInput";
import { AddMembersModal } from "../chat/AddMembersModal";
import { createChatRequest, sortMessagesByTime } from "@/utils/messageUtils";
import toast from "react-hot-toast";
import milestoneService, { MilestoneDetailResponse } from "../../services/milestoneService";

interface ClientRoomChatPanelProps {
    milestoneId?: number;
    milestoneTitle?: string;
    onCommentClick?: (timestamp: number) => void;
    projectId?: number;
    milestoneDetail?: MilestoneDetailResponse | null;
    onCreateGroupChat?: () => void;
}

export const ClientRoomChatPanel: React.FC<ClientRoomChatPanelProps> = ({
    milestoneId,
    milestoneTitle: _milestoneTitle,
    onCommentClick: _onCommentClick,
    projectId,
    milestoneDetail: _milestoneDetail,
    onCreateGroupChat
}) => {
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversation, setConversation] = useState<ConversationCreationResponse | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pagination, setPagination] = useState<{ currentPage: number; totalPages: number; hasMore: boolean }>({
        currentPage: 1,
        totalPages: 1,
        hasMore: false
    });
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        isConnected: false,
        reconnectAttempts: 0
    });
    const [participants, setParticipants] = useState<ParticipantInfoDetailResponse[]>([]);
    const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const inputContainerRef = useRef<HTMLDivElement | null>(null);
    const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

    // Fetch client group chat for milestone
    useEffect(() => {
        const findClientGroupChat = async () => {
            if (!projectId || !milestoneId) return;

            try {
                setLoading(true);
                // Call API to get CLIENT group chats for this milestone
                const conversations = await milestoneService.getGroupChatsForMilestone(
                    projectId,
                    milestoneId,
                    'CLIENT'
                );

                // Get the first CLIENT group chat (should be only one)
                const clientChat = conversations.length > 0 ? conversations[0] : null;

                if (clientChat) {
                    setConversation(clientChat);
                    setConversationId(clientChat.id);
                    setParticipants(clientChat.participantInfo || []);
                    await loadMessages(clientChat.id, 1, false);
                } else {
                    // No client group chat found, but don't show error - just show empty state
                    setConversation(null);
                    setConversationId(null);
                }
            } catch (error) {
                console.error("Error finding client group chat:", error);
                // Don't show error toast - just show empty state with create button
                setConversation(null);
                setConversationId(null);
            } finally {
                setLoading(false);
            }
        };

        findClientGroupChat();
    }, [projectId, milestoneId]);

    // Load messages
    const loadMessages = useCallback(async (convId: string, page: number = 1, append: boolean = false) => {
        try {
            if (!append) setLoading(true); else setLoadingMore(true);
            const pageData = await ApiService.getMessages(convId, page);
            setMessages(prev => {
                if (append) {
                    const combined = [...pageData.content, ...prev];
                    return sortMessagesByTime(combined);
                }
                return sortMessagesByTime(pageData.content);
            });
            setPagination({
                currentPage: pageData.page,
                totalPages: pageData.totalPages,
                hasMore: pageData.page < pageData.totalPages
            });
        } catch (e) {
            console.error("Error loading messages:", e);
            toast.error("Không thể tải tin nhắn");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // WebSocket message handler
    const handleWebSocketMessage = useCallback((message: ChatMessage) => {
        console.log('📨 ClientRoomChatPanel received WebSocket message:', {
            messageConversationId: message.conversationId,
            currentConversationId: conversationId,
            messageId: message.id,
            tempId: message.tempId,
            me: message.me,
            content: message.content
        });

        if (!conversationId || message.conversationId !== conversationId) {
            console.log('⏭️ Message skipped - conversationId mismatch');
            return;
        }

        setMessages(prev => {
            const updated = [...prev];
            if (message.tempId && message.me) {
                const tempIdx = updated.findIndex(m => m.tempId === message.tempId);
                if (tempIdx !== -1) {
                    updated[tempIdx] = {
                        ...updated[tempIdx],
                        ...message,
                        tempId: message.tempId,
                        id: message.id || updated[tempIdx].id,
                        status: message.status || updated[tempIdx].status
                    };
                    return sortMessagesByTime(updated);
                }
                const tempMessage: ChatMessage = { ...message, id: message.tempId };
                return sortMessagesByTime([...updated, tempMessage]);
            }
            if (message.tempId && !message.me) {
                return updated;
            }
            const byIdIdx = updated.findIndex(m => m.id === message.id);
            if (byIdIdx === -1) {
                return sortMessagesByTime([...updated, message]);
            } else {
                updated[byIdIdx] = { ...updated[byIdIdx], ...message };
                return sortMessagesByTime(updated);
            }
        });
    }, [conversationId]);

    // Ensure WebSocket connected
    useEffect(() => {
        if (!conversationId) return;

        if (webSocketService.isConnected()) {
            setConnectionStatus({ isConnected: true, reconnectAttempts: 0 });
        }

        webSocketService.connect(handleWebSocketMessage, setConnectionStatus)
            .then(() => {
                console.log('✅ WebSocket ready for client room chat');
            })
            .catch((error) => {
                console.error('❌ Failed to connect/update WebSocket:', error);
            });

        // Cleanup: remove handler when component unmounts or conversationId changes
        return () => {
            webSocketService.removeMessageHandler(handleWebSocketMessage);
            webSocketService.removeStatusChangeHandler(setConnectionStatus);
        };
    }, [conversationId, handleWebSocketMessage]);

    // Auto scroll to latest message
    useEffect(() => {
        if (!conversationId) return;
        const el = scrollRef.current;
        if (!el) return;
        const isNearBottom = () => el.scrollHeight - el.scrollTop - el.clientHeight < 120;
        const t = setTimeout(() => {
            try {
                if (isNearBottom()) {
                    bottomSentinelRef.current?.scrollIntoView({ block: 'end' });
                }
            } catch { }
        }, 120);
        return () => clearTimeout(t);
    }, [conversationId, messages.length]);

    // Update MessageList bottom spacing based on input height
    useEffect(() => {
        if (!conversationId) return;
        const updateBottom = () => {
            const inputHeight = inputContainerRef.current?.offsetHeight || 96;
            const messageListContainer = scrollRef.current?.querySelector('[class*="absolute"]') as HTMLElement;
            if (messageListContainer) {
                messageListContainer.style.bottom = `${inputHeight}px`;
            }
        };
        updateBottom();
        const resizeObserver = new ResizeObserver(updateBottom);
        if (inputContainerRef.current) {
            resizeObserver.observe(inputContainerRef.current);
        }
        window.addEventListener('resize', updateBottom);
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateBottom);
        };
    }, [conversationId]);

    // Send message
    const handleSendMessage = useCallback(async (
        messageContent: string,
        mediaAttachments?: { mediaUrl: string; mediaName: string; mediaSize: number; mediaType: string; displayOrder?: number }[]
    ) => {
        if (!conversationId) return;
        try {
            if (!connectionStatus.isConnected) {
                await webSocketService.connect(handleWebSocketMessage, setConnectionStatus);
            }
            const uploadedFiles = mediaAttachments?.map(a => ({
                url: a.mediaUrl,
                name: a.mediaName,
                size: a.mediaSize,
                type: a.mediaType,
                displayOrder: a.displayOrder
            }));
            const request = createChatRequest(conversationId, messageContent, uploadedFiles);
            console.log('📤 ClientRoomChatPanel sending message:', {
                conversationId,
                content: messageContent,
                hasMedia: !!mediaAttachments && mediaAttachments.length > 0,
                request
            });
            const ok = webSocketService.sendMessage(request);
            if (!ok) {
                console.error('❌ Failed to send message via WebSocket');
                toast.error("Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối.");
            } else {
                console.log('✅ Message sent successfully via WebSocket');
            }
        } catch {
            toast.error("Không thể kết nối máy chủ chat");
        }
    }, [conversationId, connectionStatus.isConnected, handleWebSocketMessage]);

    // Check if conversation is GROUP type
    const isGroupChat = conversation?.conversationType === 'GROUP';

    if (!conversationId && !loading) {
        return (
            <div className="bg-black/30 backdrop-blur-md border border-purple-800/50 rounded-xl shadow-lg p-6 h-full flex flex-col max-h-[90vh]">
                <h3 className="text-2xl font-bold text-purple-300 mb-4 flex-shrink-0">Thảo luận</h3>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <MessageCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Không tìm thấy group chat với khách hàng</p>
                        {projectId && milestoneId && onCreateGroupChat && (
                            <button
                                onClick={onCreateGroupChat}
                                className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 mx-auto"
                                title="Tạo group chat cho cột mốc"
                            >
                                <MessageCirclePlus size={18} />
                                Tạo Group Chat
                            </button>
                        )}
                        {(!projectId || !milestoneId || !onCreateGroupChat) && (
                            <p className="text-sm text-gray-500 mt-2">
                                Vui lòng tạo group chat với khách hàng khi tạo cột mốc
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black/30 backdrop-blur-md border border-purple-800/50 rounded-xl shadow-lg flex flex-col overflow-hidden relative" style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}>
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-purple-800/50 bg-black/40 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessageCircle className="w-6 h-6 text-purple-300" />
                        <div>
                            <h3 className="text-xl font-bold text-purple-300">
                                {conversation?.conversationName || "Group Chat với Khách hàng"}
                            </h3>
                            {isGroupChat && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Nhóm • {participants.length} thành viên
                                </p>
                            )}
                        </div>
                    </div>
                    {isGroupChat && (
                        <button
                            onClick={() => setIsAddMembersModalOpen(true)}
                            className="p-2 rounded-lg hover:bg-purple-800/50 text-purple-300 transition-colors"
                            title="Thêm thành viên vào nhóm"
                            aria-label="Thêm thành viên"
                        >
                            <UserPlus size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages List */}
            <div
                className="flex-1 min-h-0 relative"
                ref={scrollRef}
            >
                <MessageList
                    messages={messages}
                    loading={loading}
                    hasMoreMessages={pagination.hasMore}
                    onLoadMore={() => {
                        if (conversationId && pagination.hasMore && !loadingMore) {
                            const next = pagination.currentPage + 1;
                            loadMessages(conversationId, next, true);
                        }
                    }}
                    loadingMore={loadingMore}
                    hasSelectedConversation={!!conversationId}
                />
                <div ref={bottomSentinelRef} />
            </div>

            {/* Message Input */}
            {conversationId && (
                <div
                    className="flex-shrink-0 border-t border-purple-800/50 bg-black/40 mt-auto"
                    ref={inputContainerRef}
                >
                    <MessageInput
                        conversationId={conversationId}
                        onSendMessage={handleSendMessage}
                        connectionStatus={connectionStatus}
                        placeholder="Nhập tin nhắn..."
                    />
                </div>
            )}

            {/* Add Members Modal */}
            {conversationId && isGroupChat && (
                <AddMembersModal
                    isOpen={isAddMembersModalOpen}
                    onClose={() => setIsAddMembersModalOpen(false)}
                    conversationId={conversationId}
                    existingMemberIds={participants.map(p => p.userId)}
                    projectId={projectId}
                    milestoneId={milestoneId}
                    onMembersAdded={async (updatedConversation: ConversationCreationResponse) => {
                        setConversation(updatedConversation);
                        setParticipants(updatedConversation.participantInfo || []);
                        // Refresh conversations to get updated list
                        try {
                            const conversations = await ApiService.getConversations();
                            const updated = conversations.find(c => c.id === conversationId);
                            if (updated) {
                                setConversation(updated);
                                setParticipants(updated.participantInfo || []);
                            }
                        } catch (error) {
                            console.error("Error refreshing conversations:", error);
                        }
                    }}
                />
            )}
        </div>
    );
};

