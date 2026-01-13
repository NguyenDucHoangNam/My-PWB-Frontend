import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { X, Minus, UserPlus } from "lucide-react";
import { ChatMessage, ConnectionStatus, ParticipantInfoDetailResponse, ConversationCreationResponse } from "@/types/chat";
import { ApiService } from "@/services/chatService";
import { webSocketService } from "@/libs/websocket";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { createChatRequest, sortMessagesByTime } from "@/utils/messageUtils";
import toast from "react-hot-toast";
import { AddMembersModal } from "./AddMembersModal";

interface GlobalChatWidgetProps {
}

export const GlobalChatWidget: React.FC<GlobalChatWidgetProps> = () => {
    // Sidebar state (list conversations)
    const [showSidebar, setShowSidebar] = useState(false);
    const [conversations, setConversations] = useState<ConversationCreationResponse[]>([]);
    const [conversationsLoading, setConversationsLoading] = useState(false);

    // Chat popup state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatConversationId, setChatConversationId] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatLoadingMore, setChatLoadingMore] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const [chatPagination, setChatPagination] = useState<{ currentPage: number; totalPages: number; hasMore: boolean }>({ currentPage: 1, totalPages: 1, hasMore: false });
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ isConnected: false, reconnectAttempts: 0 });
    const [isMinimized, setIsMinimized] = useState(false);
    const chatScrollRef = useRef<HTMLDivElement | null>(null);
    const inputContainerRef = useRef<HTMLDivElement | null>(null);
    const [scrollPaddingBottom, setScrollPaddingBottom] = useState<number>(96);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
    const [chatOnlineUsers, setChatOnlineUsers] = useState<Record<string, boolean>>({});
    const chatStatusUnsubscribeRef = useRef<(() => void) | undefined>(undefined);
    const currentUserEmailRef = useRef<string | null>(null);
    const [chatParticipants, setChatParticipants] = useState<ParticipantInfoDetailResponse[]>([]);
    const [currentConversationName, setCurrentConversationName] = useState<string>("");
    const [currentConversationAvatar, setCurrentConversationAvatar] = useState<string | null>(null);
    const [currentConversationType, setCurrentConversationType] = useState<"PRIVATE" | "GROUP" | null>(null);
    const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);

    const normalizeOnlineFlag = (value: unknown): boolean => {
        return value === true || value === "true" || value === 1 || value === "1";
    };

    const getCurrentUserEmail = useCallback((): string | null => {
        if (currentUserEmailRef.current !== null) {
            return currentUserEmailRef.current;
        }
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return null;
            const parts = token.split('.');
            if (parts.length < 2) return null;
            const decoded = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            const email = decoded?.email || decoded?.sub || null;
            currentUserEmailRef.current = email;
            return email;
        } catch (error) {
            console.warn('Failed to decode current user email from token', error);
            return null;
        }
    }, []);

    // Get current user ID from JWT token (no API call needed)
    const getCurrentUserId = useCallback((): string | null => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return null;
            const parts = token.split('.');
            if (parts.length < 2) return null;
            const decoded = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            // Try common JWT claims for user ID
            const userId = decoded?.userId || decoded?.user_id || decoded?.id || decoded?.sub;
            return userId ? String(userId) : null;
        } catch (error) {
            console.warn('Failed to decode current user ID from token', error);
            return null;
        }
    }, []);

    // Load conversations
    const loadConversations = useCallback(async () => {
        try {
            setConversationsLoading(true);
            const data = await ApiService.getConversations();
            setConversations(data);
        } catch (error) {
            console.error("Error loading conversations:", error);
            toast.error("Không thể tải danh sách cuộc trò chuyện");
        } finally {
            setConversationsLoading(false);
        }
    }, []);

    // Load chat messages
    const loadChatMessages = useCallback(async (conversationId: string, page: number = 1, append: boolean = false) => {
        try {
            if (!append) setChatLoading(true); else setChatLoadingMore(true);
            const pageData = await ApiService.getMessages(conversationId, page);
            const newMessages = append
                ? sortMessagesByTime([...pageData.content, ...chatMessages])
                : sortMessagesByTime(pageData.content);

            setChatMessages(newMessages);
            setChatPagination({ currentPage: pageData.page, totalPages: pageData.totalPages, hasMore: pageData.page < pageData.totalPages });
            return newMessages; // Return loaded messages
        } catch (e) {
            setChatError("Không thể tải tin nhắn");
            return [];
        } finally {
            setChatLoading(false);
            setChatLoadingMore(false);
        }
    }, [chatMessages]);

    // Open sidebar when clicking message icon
    const handleOpenSidebar = useCallback(() => {
        setShowSidebar(true);
        loadConversations();
    }, [loadConversations]);

    // Open chat with a specific user (create conversation if needed)
    const openChatWithUser = useCallback(async (userId: string | number) => {
        try {
            setChatError(null);
            setChatLoading(true);

            // Create or get conversation with this user
            const conversation = await ApiService.createConversation([String(userId)]);

            // Set internal state for WebSocket message handling
            setChatConversationId(conversation.id);
            setChatParticipants(conversation.participantInfo || []);
            setCurrentConversationName(conversation.conversationName || "");
            setCurrentConversationAvatar(conversation.conversationAvatar);
            setCurrentConversationType(conversation.conversationType);
            setChatOnlineUsers({});

            // Load messages first and get the returned array
            const loadedMessages = await loadChatMessages(conversation.id, 1, false);

            // Then emit event to open in dock with loaded messages
            window.dispatchEvent(new CustomEvent('openUserChatWindow', {
                detail: {
                    conversationId: conversation.id,
                    conversationName: conversation.conversationName || "Chat",
                    conversationAvatar: conversation.conversationAvatar,
                    conversationType: conversation.conversationType,
                    participants: conversation.participantInfo || [],
                    chatMessages: loadedMessages // Pass loaded messages directly
                }
            }));

            // Close the GlobalChatWidget popup if it's open
            setIsChatOpen(false);
            setShowSidebar(false);
        } catch (error) {
            console.error("Error opening chat with user:", error);
            toast.error("Không thể mở cuộc trò chuyện");
        } finally {
            setChatLoading(false);
        }
    }, [loadChatMessages]);

    // Listen for open sidebar event
    useEffect(() => {
        const handleOpenSidebarEvent = () => {
            handleOpenSidebar();
        };

        window.addEventListener('openGlobalChatSidebar', handleOpenSidebarEvent);
        return () => {
            window.removeEventListener('openGlobalChatSidebar', handleOpenSidebarEvent);
        };
    }, [handleOpenSidebar]);

    // Listen for open chat with user event
    useEffect(() => {
        const handleOpenChatWithUser = (event: CustomEvent<{ userId: string | number }>) => {
            const { userId } = event.detail;
            openChatWithUser(userId);
        };

        window.addEventListener('openGlobalChatWithUser', handleOpenChatWithUser as EventListener);
        return () => {
            window.removeEventListener('openGlobalChatWithUser', handleOpenChatWithUser as EventListener);
        };
    }, [openChatWithUser]);

    // Listen for close user chat window event
    useEffect(() => {
        const handleCloseUserChat = (event: CustomEvent<{ conversationId: string }>) => {
            const { conversationId } = event.detail;

            // Only clear state if the closed conversation matches current one
            if (chatConversationId === conversationId) {
                setChatConversationId(null);
                setChatMessages([]);
                setChatParticipants([]);
                setCurrentConversationName("");
                setCurrentConversationAvatar(null);
                setCurrentConversationType(null);
            }
        };

        window.addEventListener('closeUserChatWindow', handleCloseUserChat as EventListener);
        return () => {
            window.removeEventListener('closeUserChatWindow', handleCloseUserChat as EventListener);
        };
    }, [chatConversationId]);

    // Listen for open chat with conversation ID event
    useEffect(() => {
        const handleOpenChatWithConversation = async (event: CustomEvent<{ conversationId: string }>) => {
            const { conversationId } = event.detail;
            // Load conversation details first
            try {
                const allConversations = await ApiService.getConversations();
                const conversation = allConversations.find(c => c.id === conversationId);
                if (conversation) {
                    setChatConversationId(conversationId);
                    setChatParticipants(conversation.participantInfo || []);
                    setCurrentConversationName(conversation.conversationName || "");
                    setCurrentConversationAvatar(conversation.conversationAvatar);
                    setCurrentConversationType(conversation.conversationType);
                    setIsChatOpen(true);
                    setIsMinimized(false);
                    setShowSidebar(false);
                    setChatOnlineUsers({});
                    await loadChatMessages(conversationId, 1, false);
                } else {
                    toast.error("Không tìm thấy cuộc trò chuyện");
                }
            } catch (error) {
                console.error("Error opening chat with conversation:", error);
                toast.error("Không thể mở cuộc trò chuyện");
            }
        };

        const eventHandler = (event: Event) => {
            const customEvent = event as CustomEvent<{ conversationId: string }>;
            handleOpenChatWithConversation(customEvent);
        };
        window.addEventListener('openGlobalChatWithConversation', eventHandler);
        return () => {
            window.removeEventListener('openGlobalChatWithConversation', eventHandler);
        };
    }, [loadChatMessages]);

    // Listen for setup chat (WebSocket only, no UI) - triggered by IncomingMessageHandler
    useEffect(() => {
        const handleSetupChatForConversation = async (event: CustomEvent<{ conversationId: string }>) => {
            const { conversationId } = event.detail;
            console.log('🔧 Setting up GlobalChatWidget for conversation (no UI):', conversationId);

            try {
                const allConversations = await ApiService.getConversations();
                const conversation = allConversations.find(c => c.id === conversationId);
                if (conversation) {
                    // Set internal state for WebSocket handling - but DON'T open UI
                    setChatConversationId(conversationId);
                    setChatParticipants(conversation.participantInfo || []);
                    setCurrentConversationName(conversation.conversationName || "");
                    setCurrentConversationAvatar(conversation.conversationAvatar);
                    setCurrentConversationType(conversation.conversationType);
                    setChatOnlineUsers({});

                    // Load messages (for sync with ChatDockManager)
                    await loadChatMessages(conversationId, 1, false);
                    console.log('✅ GlobalChatWidget setup complete for:', conversationId);
                }
            } catch (error) {
                console.error("Error setting up chat:", error);
            }
        };

        const eventHandler2 = (event: Event) => {
            const customEvent = event as CustomEvent<{ conversationId: string }>;
            handleSetupChatForConversation(customEvent);
        };
        window.addEventListener('setupGlobalChatForConversation', eventHandler2);
        return () => {
            window.removeEventListener('setupGlobalChatForConversation', eventHandler2);
        };
    }, [loadChatMessages]);

    // Handle conversation select from sidebar
    const handleConversationSelect = useCallback(async (conversationId: string) => {
        const conversation = conversations.find(c => c.id === conversationId);
        if (!conversation) return;

        // Helper to get display name
        const getDisplayName = () => {
            if (conversation.conversationName) return conversation.conversationName;
            if (conversation.participantInfo && conversation.participantInfo.length > 0) {
                return conversation.participantInfo[0].username || 'Unknown User';
            }
            return 'Chat';
        };

        // Helper to get avatar
        const getAvatar = () => {
            if (conversation.conversationAvatar) return conversation.conversationAvatar;
            if (conversation.participantInfo && conversation.participantInfo.length > 0) {
                const participant = conversation.participantInfo[0];
                return participant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.username)}`;
            }
            return null;
        };

        // Set internal state for WebSocket message handling FIRST
        setChatConversationId(conversationId);
        setChatParticipants(conversation.participantInfo || []);
        setCurrentConversationName(getDisplayName());
        setCurrentConversationAvatar(getAvatar());
        setCurrentConversationType(conversation.conversationType);
        setShowSidebar(false);
        setChatOnlineUsers({});

        // Load messages
        await loadChatMessages(conversationId, 1, false);

        // Get loaded messages from state (will be available after loadChatMessages)
        // Note: We can't directly use chatMessages here due to async state update
        // So we emit event and rely on subsequent userChatMessage events to sync
        window.dispatchEvent(new CustomEvent('openUserChatWindow', {
            detail: {
                conversationId: conversation.id,
                conversationName: getDisplayName(),
                conversationAvatar: getAvatar(),
                conversationType: conversation.conversationType,
                participants: conversation.participantInfo || []
            }
        }));
    }, [conversations, loadChatMessages]);

    // Sync initial loaded messages to dock window (after loadChatMessages completes)
    useEffect(() => {
        if (chatConversationId && chatMessages.length > 0) {
            // Emit full messages array to dock for sync
            window.dispatchEvent(new CustomEvent('userChatMessage', {
                detail: {
                    conversationId: chatConversationId,
                    chatMessages: chatMessages // Send full array
                }
            }));
        }
    }, [chatConversationId, chatMessages.length]); // Only when conversation changes or first load

    // WebSocket message handler
    const handleWebSocketMessage = useCallback((message: ChatMessage) => {
        if (!chatConversationId || message.conversationId !== chatConversationId) return;

        setChatMessages(prev => {
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
            const existingIdx = updated.findIndex(m =>
                (message.id && m.id === message.id) ||
                (message.tempId && m.tempId === message.tempId)
            );
            if (existingIdx !== -1) {
                updated[existingIdx] = {
                    ...updated[existingIdx],
                    ...message
                };
                return sortMessagesByTime(updated);
            }
            return sortMessagesByTime([...updated, message]);
        });

        // Emit full messages array to dock window for sync (after state update)
        // Use setTimeout to ensure state is updated first
        setTimeout(() => {
            setChatMessages(current => {
                window.dispatchEvent(new CustomEvent('userChatMessage', {
                    detail: {
                        conversationId: message.conversationId,
                        chatMessages: current
                    }
                }));
                return current;
            });
        }, 0);
    }, [chatConversationId]);

    // WebSocket connection management

    // Ensure WebSocket connected and update message handler when chat conversation is active
    // Keep WebSocket active even when popup is closed (for dock windows)
    useEffect(() => {
        if (!chatConversationId) {
            // Remove handlers when no active conversation
            webSocketService.removeMessageHandler(handleWebSocketMessage);
            webSocketService.removeStatusChangeHandler(setConnectionStatus);
            return;
        }

        // Sync connection status immediately if WebSocket is already connected
        if (webSocketService.isConnected()) {
            setConnectionStatus({ isConnected: true, reconnectAttempts: 0 });
        }

        // Connect or update message handler
        // If already connected from AuthContext, it will update subscription with new handler
        webSocketService.connect(handleWebSocketMessage, setConnectionStatus)
            .then(() => {
                console.log('✅ WebSocket ready for conversation:', chatConversationId);
            })
            .catch((error) => {
                console.error('❌ Failed to connect/update WebSocket:', error);
            });

        // Cleanup: remove handler when component unmounts or conversation changes
        return () => {
            webSocketService.removeMessageHandler(handleWebSocketMessage);
            webSocketService.removeStatusChangeHandler(setConnectionStatus);
        };
    }, [chatConversationId, handleWebSocketMessage]);

    // Auto scroll to latest message
    useEffect(() => {
        if (!isChatOpen) return;
        const el = chatScrollRef.current;
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
    }, [isChatOpen, chatMessages.length]);

    // Increase unread count when minimized
    useEffect(() => {
        if (!isChatOpen || chatMessages.length === 0) return;
        const el = chatScrollRef.current;
        const isUserNearBottom = () => {
            if (!el) return true;
            const threshold = 80;
            return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
        };
        if (isMinimized || !isUserNearBottom()) {
            setUnreadCount((n) => n + 1);
        }
    }, [chatMessages.length, isMinimized]);

    // Measure input container height
    useEffect(() => {
        if (!isChatOpen) return;
        const measure = () => {
            const h = inputContainerRef.current?.offsetHeight || 96;
            setScrollPaddingBottom(h + 40);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [isChatOpen]);

    // ESC to close popup
    useEffect(() => {
        if (!isChatOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsChatOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isChatOpen]);

    // Calculate partner online status
    const chatPartnerOnline = useMemo(() => {
        if (!chatConversationId) return false;
        const myUserId = getCurrentUserId();
        const myEmail = getCurrentUserEmail();

        // Normalize email for comparison (case-insensitive, trim)
        const normalizeEmail = (email: string | null | undefined): string | null => {
            if (!email) return null;
            return email.trim().toLowerCase();
        };
        const normalizedMyEmail = normalizeEmail(myEmail);

        if (chatParticipants.length > 0) {
            for (const participant of chatParticipants) {
                if (!participant) continue;
                // Filter out self by userId (most reliable)
                if (myUserId && participant.userId && String(participant.userId) === myUserId) continue;
                // Fallback: Filter out self by email (case-insensitive comparison)
                if (normalizedMyEmail && participant.username) {
                    const normalizedParticipantEmail = normalizeEmail(participant.username);
                    if (normalizedParticipantEmail === normalizedMyEmail) continue;
                }

                const partnerUsername = participant.username;
                const partnerUserId = participant.userId;
                const possibleKeys: string[] = [];
                if (partnerUsername) possibleKeys.push(partnerUsername);
                if (partnerUsername && !partnerUsername.includes('@')) {
                    possibleKeys.push(`${partnerUsername}@gmail.com`);
                }
                if (partnerUserId) {
                    possibleKeys.push(partnerUserId);
                    possibleKeys.push(String(partnerUserId));
                }

                const matchingKey = Object.keys(chatOnlineUsers).find(key => {
                    if (possibleKeys.includes(key)) return true;
                    if (partnerUsername && key.includes(partnerUsername)) return true;
                    return false;
                });

                if (matchingKey !== undefined) {
                    return chatOnlineUsers[matchingKey] === true;
                }
            }
        }

        const allKeys = Object.keys(chatOnlineUsers);
        const myEmailLower = myEmail?.toLowerCase() || '';
        const myEmailUsername = myEmailLower.split('@')[0];
        const partnerKey = allKeys.find(key => {
            const keyLower = key.toLowerCase();
            if (myEmailLower && keyLower === myEmailLower) return false;
            if (myEmailUsername && keyLower === myEmailUsername) return false;
            if (myEmailUsername && keyLower.includes(myEmailUsername)) {
                if (keyLower.startsWith(myEmailUsername + '@') || keyLower === myEmailUsername) {
                    return false;
                }
            }
            return true;
        });

        if (partnerKey !== undefined) {
            return chatOnlineUsers[partnerKey] === true;
        }

        return false;
    }, [chatConversationId, chatParticipants, chatOnlineUsers, getCurrentUserId, getCurrentUserEmail]);

    // Fetch initial online status
    useEffect(() => {
        if (!chatConversationId) {
            setChatOnlineUsers({});
            return;
        }

        const fetchStatus = async () => {
            if (!webSocketService.isConnected()) {
                let attempts = 0;
                const maxAttempts = 20;
                while (!webSocketService.isConnected() && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
            }

            try {
                const map = await ApiService.getOnlineStatus(chatConversationId);
                if (!map) {
                    setChatOnlineUsers({});
                    return;
                }
                const allStatus: Record<string, boolean> = {};
                Object.entries(map).forEach(([key, value]) => {
                    allStatus[key] = normalizeOnlineFlag(value);
                });
                setChatOnlineUsers(allStatus);
            } catch (error) {
                console.error('Failed to fetch initial online status:', error);
                setChatOnlineUsers({});
            }
        };

        fetchStatus();
        // Removed chatParticipants from dependencies to prevent infinite loops
        // chatParticipants is set when conversation is created/selected, not during status fetch
    }, [chatConversationId]);

    // Subscribe to status updates
    useEffect(() => {
        if (!isChatOpen || !chatConversationId) {
            chatStatusUnsubscribeRef.current?.();
            chatStatusUnsubscribeRef.current = undefined;
            return;
        }

        // If not connected, wait for connection or return early
        if (!connectionStatus.isConnected) {
            console.log('⏳ Waiting for WebSocket connection before subscribing to status updates...');
            return;
        }

        const allowedEmails = new Set<string>();
        chatParticipants.forEach(participant => {
            if (!participant) return;
            if (participant.username) {
                allowedEmails.add(participant.username);
                if (!participant.username.includes('@')) {
                    allowedEmails.add(`${participant.username}@gmail.com`);
                }
            }
            if (participant.userId) {
                allowedEmails.add(participant.userId);
                allowedEmails.add(String(participant.userId));
            }
        });

        chatStatusUnsubscribeRef.current?.();
        chatStatusUnsubscribeRef.current = webSocketService.subscribeToUserStatus(
            chatConversationId,
            ({ userEmail, isOnline }) => {
                console.log('📡 Received WebSocket status update:', { userEmail, isOnline, allowedEmails: Array.from(allowedEmails) });

                const isParticipant = allowedEmails.has(userEmail) ||
                    Array.from(allowedEmails).some(email => {
                        const emailLower = email.toLowerCase();
                        const userEmailLower = userEmail.toLowerCase();
                        // Match exact
                        if (emailLower === userEmailLower) return true;
                        // Match if userEmail contains email (e.g., "customer@gmail.com" contains "customer")
                        if (userEmailLower.includes(emailLower)) return true;
                        // Match if email contains userEmail (reverse)
                        if (emailLower.includes(userEmailLower)) return true;
                        // Match username part (before @)
                        const emailUsername = emailLower.split('@')[0];
                        const userEmailUsername = userEmailLower.split('@')[0];
                        if (emailUsername && userEmailUsername && emailUsername === userEmailUsername) return true;
                        return false;
                    });

                console.log('📡 Status update - isParticipant:', isParticipant, 'allowedEmails.size:', allowedEmails.size);

                if (isParticipant || allowedEmails.size === 0) {
                    setChatOnlineUsers(prev => {
                        // Only update if value actually changed to prevent unnecessary re-renders
                        const normalized = normalizeOnlineFlag(isOnline);
                        if (prev[userEmail] === normalized) {
                            console.log('📡 Status unchanged, skipping update');
                            return prev;
                        }
                        console.log('📡 Updating status:', { userEmail, isOnline: normalized, prev: prev[userEmail] });
                        return { ...prev, [userEmail]: normalized };
                    });
                } else {
                    console.log('⏭️ Skipping status update for non-participant:', userEmail);
                }
            }
        );

        return () => {
            chatStatusUnsubscribeRef.current?.();
            chatStatusUnsubscribeRef.current = undefined;
        };
    }, [isChatOpen, chatConversationId, connectionStatus.isConnected, chatParticipants]);

    // Re-fetch status when connection is restored (from disconnected to connected)
    useEffect(() => {
        if (!isChatOpen || !chatConversationId || !connectionStatus.isConnected) {
            return;
        }

        // Re-fetch status when connection is restored to ensure we have latest status
        const reFetchStatus = async () => {
            try {
                console.log('🔄 Re-fetching status after connection restored...');
                const map = await ApiService.getOnlineStatus(chatConversationId);
                if (map) {
                    const allStatus: Record<string, boolean> = {};
                    Object.entries(map).forEach(([key, value]) => {
                        allStatus[key] = normalizeOnlineFlag(value);
                    });
                    setChatOnlineUsers(allStatus);
                    console.log('✅ Status re-fetched:', allStatus);
                }
            } catch (error) {
                console.error('Failed to re-fetch status:', error);
            }
        };

        // Small delay to ensure backend has processed the connection
        const timeoutId = setTimeout(reFetchStatus, 500);
        return () => clearTimeout(timeoutId);
    }, [isChatOpen, chatConversationId, connectionStatus.isConnected]);

    // Send message
    const handleSendMessage = useCallback(async (messageContent: string, mediaAttachments?: { mediaUrl: string; mediaName: string; mediaSize: number; mediaType: string; displayOrder?: number }[]) => {
        if (!chatConversationId) return;
        try {
            if (!connectionStatus.isConnected) {
                await webSocketService.connect(handleWebSocketMessage, setConnectionStatus);
            }
            const uploadedFiles = mediaAttachments?.map(a => ({ url: a.mediaUrl, name: a.mediaName, size: a.mediaSize, type: a.mediaType, displayOrder: a.displayOrder }));
            const request = createChatRequest(chatConversationId, messageContent, uploadedFiles);
            const ok = webSocketService.sendMessage(request);
            if (!ok) setChatError("Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối.");
        } catch {
            setChatError("Không thể kết nối máy chủ chat");
        }
    }, [chatConversationId, connectionStatus.isConnected, handleWebSocketMessage]);

    // Generic send message function that can send to ANY conversation
    const sendMessageToConversation = useCallback(async (
        targetConversationId: string,
        messageContent: string,
        mediaAttachments?: { mediaUrl: string; mediaName: string; mediaSize: number; mediaType: string; displayOrder?: number }[]
    ) => {
        try {
            if (!webSocketService.isConnected()) {
                await webSocketService.connect(handleWebSocketMessage, setConnectionStatus);
            }
            const uploadedFiles = mediaAttachments?.map(a => ({
                url: a.mediaUrl,
                name: a.mediaName,
                size: a.mediaSize,
                type: a.mediaType,
                displayOrder: a.displayOrder
            }));
            const request = createChatRequest(targetConversationId, messageContent, uploadedFiles);
            const ok = webSocketService.sendMessage(request);
            if (!ok) {
                console.error("Failed to send message to conversation:", targetConversationId);
            }
            return ok;
        } catch (error) {
            console.error("Error sending message:", error);
            return false;
        }
    }, [handleWebSocketMessage]);

    // Listen for send message requests from ChatDockManager
    useEffect(() => {
        const handleSendFromDock = (event: CustomEvent) => {
            const { conversationId, text, attachments } = event.detail;

            // Allow sending to ANY conversation, not just the active one
            // This enables multi-window chat functionality
            if (conversationId && (text || attachments?.length > 0)) {
                sendMessageToConversation(conversationId, text || '', attachments);
            }
        };

        window.addEventListener('sendUserChatMessage' as any, handleSendFromDock);
        return () => window.removeEventListener('sendUserChatMessage' as any, handleSendFromDock);
    }, [sendMessageToConversation]);

    // Get partner name and avatar
    const partnerInfo = useMemo(() => {
        // For both GROUP and PRIVATE chats, use conversationName (already contains partner name for PRIVATE)
        // conversationName is set from API response and already represents the partner/group name
        return {
            name: currentConversationName || (currentConversationType === 'GROUP' ? "Group Chat" : "Chat"),
            avatar: currentConversationAvatar
        };
    }, [currentConversationName, currentConversationAvatar, currentConversationType]);

    // Sync partner online status to dock windows
    useEffect(() => {
        if (!chatConversationId) {
            return;
        }
        window.dispatchEvent(new CustomEvent('userChatStatusUpdate', {
            detail: { conversationId: chatConversationId, isOnline: chatPartnerOnline }
        }));
    }, [chatConversationId, chatPartnerOnline]);

    return (
        <>
            {/* Chat Popup */}
            {isChatOpen && (
                <div className="fixed bottom-6 right-6 z-[9999] w-[360px] max-w-[92vw]" role="dialog" aria-label="Hộp thoại chat">
                    <div className="bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] border border-gray-200/70 dark:border-border-color/70 overflow-hidden transition-all transform animate-[chatIn_180ms_ease-out]">
                        <div className="relative z-20 flex items-center justify-between px-3 py-2 border-b border-gray-200/70 dark:border-border-color/70 bg-white dark:bg-dark-surface select-none">
                            <div className="flex items-center gap-2">
                                <img
                                    src={partnerInfo.avatar || "https://i.pravatar.cc/200"}
                                    alt={partnerInfo.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-text-primary leading-4 truncate max-w-[220px]">
                                        {partnerInfo.name}
                                    </p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className={`w-2 h-2 rounded-full ${chatPartnerOnline ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                        <span className="text-[11px] text-gray-600 dark:text-text-secondary">
                                            {chatPartnerOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {currentConversationType === 'GROUP' && (
                                    <button
                                        onClick={() => setIsAddMembersModalOpen(true)}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg/60 text-gray-600 dark:text-text-secondary transition-colors"
                                        aria-label="Thêm thành viên"
                                        title="Thêm thành viên vào nhóm"
                                    >
                                        <UserPlus size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={() => { setIsMinimized(v => !v); setUnreadCount(0); }}
                                    className="relative p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg/60 text-gray-600 dark:text-text-secondary transition-colors"
                                    aria-label="Thu nhỏ"
                                >
                                    <Minus size={16} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] leading-4 text-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsChatOpen(false);
                                        setChatConversationId(null);
                                        setChatParticipants([]);
                                        setCurrentConversationType(null);
                                        setChatOnlineUsers({});
                                        chatStatusUnsubscribeRef.current?.();
                                        chatStatusUnsubscribeRef.current = undefined;
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg/60 text-gray-600 dark:text-text-secondary transition-colors"
                                    aria-label="Đóng"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <div className="h-[440px] max-h-[70vh] flex flex-col overflow-hidden">
                                <div
                                    ref={chatScrollRef}
                                    className="flex-1 min-h-0 overflow-y-auto"
                                    style={{ paddingBottom: `${scrollPaddingBottom}px` }}
                                >
                                    <MessageList
                                        messages={chatMessages}
                                        loading={chatLoading}
                                        hasMoreMessages={chatPagination.hasMore}
                                        onLoadMore={() => {
                                            if (!chatLoadingMore && chatPagination.hasMore) {
                                                loadChatMessages(chatConversationId!, chatPagination.currentPage + 1, true);
                                            }
                                        }}
                                        loadingMore={chatLoadingMore}
                                        hasSelectedConversation={!!chatConversationId}
                                    />
                                    <div ref={bottomSentinelRef} />
                                </div>

                                {chatConversationId && (
                                    <div ref={inputContainerRef} className="flex-shrink-0 border-t border-gray-200/70 dark:border-border-color/70 bg-white dark:bg-dark-surface p-2">
                                        <MessageInput
                                            conversationId={chatConversationId}
                                            onSendMessage={handleSendMessage}
                                            connectionStatus={connectionStatus}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {chatError && (
                            <div className="px-4 py-2 text-sm text-red-500 dark:text-red-400 border-t border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-b-2xl">
                                {chatError}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Members Modal */}
            {chatConversationId && (
                <AddMembersModal
                    isOpen={isAddMembersModalOpen}
                    onClose={() => setIsAddMembersModalOpen(false)}
                    conversationId={chatConversationId}
                    existingMemberIds={chatParticipants.map(p => p.userId)}
                    onMembersAdded={async (updatedConversation: ConversationCreationResponse) => {
                        // Update current conversation data
                        setChatParticipants(updatedConversation.participantInfo || []);
                        setCurrentConversationName(updatedConversation.conversationName || "");
                        setCurrentConversationAvatar(updatedConversation.conversationAvatar);
                        setCurrentConversationType(updatedConversation.conversationType);

                        // Refresh conversations list
                        await loadConversations();
                    }}
                />
            )}

            {/* Overlay when dropdown is open */}
            {showSidebar && (
                <div
                    className="fixed inset-0 z-[9997]"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Dropdown for conversations list - Facebook notification style */}
            {showSidebar && (
                <div className="fixed top-16 right-4 w-[360px] max-w-[90vw] z-[9998] bg-white dark:bg-dark-surface rounded-lg shadow-2xl border border-gray-200 dark:border-border-color flex flex-col max-h-[600px]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-border-color">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary">Chats</h2>
                        <button
                            onClick={() => setShowSidebar(false)}
                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg/60 text-gray-600 dark:text-text-secondary transition-colors"
                            aria-label="Đóng"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Conversations List - Compact */}
                    <div className="flex-1 overflow-y-auto max-h-[540px]">
                        {conversationsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
                            </div>
                        ) : (
                            conversations.map((conversation) => {
                                const displayName = conversation.conversationName ||
                                    (conversation.participantInfo && conversation.participantInfo.length > 0
                                        ? conversation.participantInfo[0].username
                                        : "Chat");
                                const avatar = conversation.conversationAvatar ||
                                    (conversation.participantInfo && conversation.participantInfo.length > 0
                                        ? conversation.participantInfo[0].avatar
                                        : null);
                                const isSelected = conversation.id === chatConversationId;
                                const getInitials = (name: string) => {
                                    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
                                };

                                return (
                                    <button
                                        key={conversation.id}
                                        onClick={() => {
                                            handleConversationSelect(conversation.id);
                                            setShowSidebar(false);
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-dark-bg/60 transition-colors ${isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                                            }`}
                                    >
                                        {/* Avatar - Smaller */}
                                        <div className="relative flex-shrink-0">
                                            {avatar ? (
                                                <img
                                                    src={avatar}
                                                    alt={displayName}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                                                    {getInitials(displayName)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Conversation Info - Compact */}
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className={`text-sm font-semibold truncate ${isSelected
                                                ? 'text-purple-600 dark:text-purple-400'
                                                : 'text-gray-900 dark:text-text-primary'
                                                }`}>
                                                {displayName}
                                            </p>
                                            {conversation.conversationType === 'GROUP' && (
                                                <p className="text-xs text-gray-500 dark:text-text-secondary mt-0.5">
                                                    Nhóm • {conversation.participantInfo?.length || 0} thành viên
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                </div>
            )}
        </>
    );
};

// Export a hook to open sidebar and chat with user
export const useGlobalChat = () => {
    const openSidebar = useCallback(() => {
        window.dispatchEvent(new CustomEvent('openGlobalChatSidebar'));
    }, []);

    const openChatWithUser = useCallback((userId: string | number) => {
        window.dispatchEvent(new CustomEvent('openGlobalChatWithUser', {
            detail: { userId }
        }));
    }, []);

    return { openSidebar, openChatWithUser };
};

