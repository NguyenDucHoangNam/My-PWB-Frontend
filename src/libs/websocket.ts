import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { ChatRequest, ChatMessage, ConnectionStatus, ConversationCreationResponse } from "@/types/chat";
import { SystemNotification } from "@/types/notification";

export interface ConversationUpdateEvent {
    type: 'CONVERSATION_CREATED' | 'CONVERSATION_UPDATED' | 'CONVERSATION_DELETED';
    conversation: ConversationCreationResponse;
    userId?: string;
    timestamp: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export class WebSocketService {
    private static instance: WebSocketService;
    private stompClient: Client | null = null;
    private messageSubscription: StompSubscription | null = null;
    private conversationSubscription: StompSubscription | null = null;
    private notificationSubscription: StompSubscription | null = null;
    private statusSubscriptions: Map<string, StompSubscription> = new Map();
    private connectionStatus: ConnectionStatus = { isConnected: false, reconnectAttempts: 0 };
    // Support multiple message handlers for different components
    private messageHandlers: Set<(message: ChatMessage) => void> = new Set();
    private statusChangeHandlers: Set<(status: ConnectionStatus) => void> = new Set();
    private conversationUpdateHandlers: Set<(event: ConversationUpdateEvent) => void> = new Set();
    private notificationHandlers: Set<(notification: SystemNotification) => void> = new Set();
    // Remember last listeners to support manual reconnects from UI components
    private lastOnMessage: ((message: ChatMessage) => void) | null = null;
    private lastOnStatusChange: ((status: ConnectionStatus) => void) | null = null;
    private lastOnConversationUpdate: ((event: ConversationUpdateEvent) => void) | null = null;
    // private _lastOnNotification: ((notification: SystemNotification) => void) | null = null;

    static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    connect(
        onMessage: (message: ChatMessage) => void,
        onStatusChange?: (status: ConnectionStatus) => void,
        onConversationUpdate?: (event: ConversationUpdateEvent) => void
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            // Add handlers to sets (support multiple handlers)
            this.messageHandlers.add(onMessage);
            if (onStatusChange) {
                this.statusChangeHandlers.add(onStatusChange);
            }
            if (onConversationUpdate) {
                this.conversationUpdateHandlers.add(onConversationUpdate);
            }

            // Cache last callbacks for future reconnect attempts
            this.lastOnMessage = onMessage;
            this.lastOnStatusChange = onStatusChange || null;
            this.lastOnConversationUpdate = onConversationUpdate || null;

            // If already connected, just subscribe (don't unsubscribe existing subscription)
            if (this.stompClient && this.stompClient.connected) {
                console.log('🔄 WebSocket already connected, adding message handler...');

                // Update connection status to reflect that we're connected
                this.connectionStatus = { isConnected: true, reconnectAttempts: 0 };
                onStatusChange?.(this.connectionStatus);
                this.statusChangeHandlers.forEach(handler => handler(this.connectionStatus));

                // Only subscribe if we don't have a subscription yet
                if (!this.messageSubscription) {
                    // Subscribe with message handler that calls all registered handlers
                    this.messageSubscription = this.stompClient.subscribe("/user/queue/messages", (message: IMessage) => {
                        try {
                            console.log('💬 Received chat message:', message.body);
                            const chatMessage: ChatMessage = JSON.parse(message.body);
                            // Call all registered message handlers
                            this.messageHandlers.forEach(handler => {
                                try {
                                    handler(chatMessage);
                                } catch (error) {
                                    console.error('❌ Error in message handler:', error);
                                }
                            });
                        } catch (error) {
                            console.error('❌ Failed to parse chat message:', error);
                        }
                    });
                }

                // Only subscribe to conversation updates if we don't have a subscription yet
                if (onConversationUpdate && !this.conversationSubscription) {
                    this.conversationSubscription = this.stompClient.subscribe("/user/queue/conversation-updates", (message: IMessage) => {
                        try {
                            console.log('🔄 Received conversation update:', message.body);
                            const conversationEvent: ConversationUpdateEvent = JSON.parse(message.body);
                            // Call all registered conversation update handlers
                            this.conversationUpdateHandlers.forEach(handler => {
                                try {
                                    handler(conversationEvent);
                                } catch (error) {
                                    console.error('❌ Error in conversation update handler:', error);
                                }
                            });
                        } catch (error) {
                            console.error('❌ Failed to parse conversation update:', error);
                        }
                    });
                }

                console.log('✅ Message handler updated');
                resolve();
                return;
            }

            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                const error = new Error('No access token found');
                reject(error);
                return;
            }

            // ✅ Use direct WebSocket like the successful live session service
            // Add token to query string since WebSocket API doesn't support custom headers
            const baseWsUrl = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws/websocket';
            const wsUrl = `${baseWsUrl}?token=${encodeURIComponent(accessToken)}`;

            let hasResolved = false;

            try {
                this.stompClient = new Client({
                    // ✅ Direct WebSocket factory (no SockJS)
                    webSocketFactory: () => {

                        const ws = new WebSocket(wsUrl);

                        // ✅ WebSocket event logging
                        ws.onopen = (event) => {
                            console.log('✅ Chat WebSocket opened successfully!', event);
                        };

                        ws.onclose = (event) => {
                            console.log('🔌 Chat WebSocket closed:', event.code, event.reason);
                        };

                        ws.onerror = (event) => {
                            console.error('❌ Chat WebSocket error:', event);
                        };

                        ws.onmessage = (event) => {
                            console.log('📨 Chat WebSocket raw message:', event.data);
                        };

                        return ws;
                    },

                    connectHeaders: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    reconnectDelay: 5000,
                    // ✅ Optimize heartbeat for ALB (ALB idle timeout is 60s default, max 4000s)
                    // Send heartbeat every 30s to keep connection alive (50% of 60s timeout for safety)
                    heartbeatIncoming: 30000,  // Receive heartbeat from server every 30s
                    heartbeatOutgoing: 30000,  // Send heartbeat to server every 30s (CRITICAL for ALB)

                    onConnect: (frame) => {
                        console.log('✅ Chat WebSocket connected successfully', frame);
                        this.connectionStatus = { isConnected: true, reconnectAttempts: 0 };
                        onStatusChange?.(this.connectionStatus);

                        // ✅ Subscribe to chat messages (call all handlers)
                        this.messageSubscription = this.stompClient?.subscribe("/user/queue/messages", (message: IMessage) => {
                            try {
                                console.log('💬 Received chat message:', message.body);
                                const chatMessage: ChatMessage = JSON.parse(message.body);
                                // Call all registered message handlers
                                this.messageHandlers.forEach(handler => {
                                    try {
                                        handler(chatMessage);
                                    } catch (error) {
                                        console.error('❌ Error in message handler:', error);
                                    }
                                });
                            } catch (error) {
                                console.error('❌ Failed to parse chat message:', error);
                            }
                        }) || null;

                        // ✅ Subscribe to conversation updates (call all handlers)
                        this.conversationSubscription = this.stompClient?.subscribe("/user/queue/conversation-updates", (message: IMessage) => {
                            try {
                                console.log('🔄 Received conversation update:', message.body);
                                const conversationEvent: ConversationUpdateEvent = JSON.parse(message.body);
                                // Call all registered conversation update handlers
                                this.conversationUpdateHandlers.forEach(handler => {
                                    try {
                                        handler(conversationEvent);
                                    } catch (error) {
                                        console.error('❌ Error in conversation update handler:', error);
                                    }
                                });
                            } catch (error) {
                                console.error('❌ Failed to parse conversation update:', error);
                            }
                        }) || null;

                        // ✅ Subscribe to notifications (call all handlers)
                        if (!this.notificationSubscription) {
                            this.notificationSubscription = this.stompClient?.subscribe("/user/queue/notifications", (message: IMessage) => {
                                try {
                                    console.log('🔔 Received notification:', message.body);
                                    const notification: SystemNotification = JSON.parse(message.body);
                                    // Call all registered notification handlers
                                    this.notificationHandlers.forEach(handler => {
                                        try {
                                            handler(notification);
                                        } catch (error) {
                                            console.error('❌ Error in notification handler:', error);
                                        }
                                    });
                                } catch (error) {
                                    console.error('❌ Failed to parse notification:', error);
                                }
                            }) || null;
                        }

                        if (!hasResolved) {
                            hasResolved = true;
                            resolve();
                        }
                    },

                    onStompError: (frame: any) => {
                        console.error('🔴 Chat STOMP Error:', frame);
                        this.connectionStatus = {
                            isConnected: false,
                            reconnectAttempts: this.connectionStatus.reconnectAttempts + 1
                        };
                        onStatusChange?.(this.connectionStatus);
                        this.statusChangeHandlers.forEach(handler => handler(this.connectionStatus));

                        if (!hasResolved) {
                            hasResolved = true;
                            reject(new Error('STOMP connection failed'));
                        }
                    },

                    onWebSocketError: (event: any) => {
                        console.error('🔴 Chat WebSocket Error:', event);
                        this.connectionStatus = {
                            isConnected: false,
                            reconnectAttempts: this.connectionStatus.reconnectAttempts + 1
                        };
                        onStatusChange?.(this.connectionStatus);
                        this.statusChangeHandlers.forEach(handler => handler(this.connectionStatus));

                        if (!hasResolved) {
                            hasResolved = true;
                            reject(new Error('WebSocket connection failed'));
                        }
                    },

                    onWebSocketClose: (event: any) => {
                        console.warn('🟡 Chat WebSocket Closed:', event);
                        this.connectionStatus = { isConnected: false, reconnectAttempts: 0 };
                        onStatusChange?.(this.connectionStatus);
                        this.statusChangeHandlers.forEach(handler => handler(this.connectionStatus));
                    },

                    onDisconnect: (frame) => {
                        console.log('🔌 Chat STOMP disconnected:', frame);
                        this.connectionStatus = { isConnected: false, reconnectAttempts: 0 };
                        onStatusChange?.(this.connectionStatus);
                        this.statusChangeHandlers.forEach(handler => handler(this.connectionStatus));
                    }
                });

                // ✅ Connection timeout
                const timeout = setTimeout(() => {
                    if (!hasResolved) {
                        console.error('❌ Chat WebSocket connection timeout');
                        hasResolved = true;
                        reject(new Error('Connection timeout'));
                    }
                }, 15000);

                // Clear timeout on success
                const originalOnConnect = this.stompClient.onConnect;
                this.stompClient.onConnect = (frame) => {
                    clearTimeout(timeout);
                    if (originalOnConnect) originalOnConnect(frame);
                };

                console.log('🚀 Activating Chat STOMP client...');
                this.stompClient.activate();

            } catch (error) {
                console.error('🔴 Failed to activate Chat WebSocket:', error);
                if (!hasResolved) {
                    hasResolved = true;
                    reject(error);
                }
            }
        });
    }

    // Allow UI to request a reconnect using the last known callbacks
    reconnect(): Promise<void> {
        // Increase reconnect attempts and notify listeners
        this.connectionStatus = {
            isConnected: false,
            reconnectAttempts: (this.connectionStatus.reconnectAttempts || 0) + 1
        };
        this.lastOnStatusChange?.(this.connectionStatus);

        // Clean up and re-connect
        this.disconnect();
        if (!this.lastOnMessage) {
            return Promise.reject(new Error('No previous WebSocket listeners to reconnect with'));
        }
        return this.connect(
            this.lastOnMessage,
            this.lastOnStatusChange || undefined,
            this.lastOnConversationUpdate || undefined
        );
    }

    // Remove a message handler (call this when component unmounts)
    removeMessageHandler(handler: (message: ChatMessage) => void): void {
        this.messageHandlers.delete(handler);
    }

    // Remove a status change handler
    removeStatusChangeHandler(handler: (status: ConnectionStatus) => void): void {
        this.statusChangeHandlers.delete(handler);
    }

    // Remove a conversation update handler
    removeConversationUpdateHandler(handler: (event: ConversationUpdateEvent) => void): void {
        this.conversationUpdateHandlers.delete(handler);
    }

    // Subscribe to notifications
    subscribeToNotifications(onNotification: (notification: SystemNotification) => void): () => void {
        this.notificationHandlers.add(onNotification);
        // this._lastOnNotification = onNotification;

        // If already connected, subscribe immediately
        if (this.stompClient && this.stompClient.connected && !this.notificationSubscription) {
            this.notificationSubscription = this.stompClient.subscribe("/user/queue/notifications", (message: IMessage) => {
                try {
                    console.log('🔔 Received notification:', message.body);
                    const notification: SystemNotification = JSON.parse(message.body);
                    this.notificationHandlers.forEach(handler => {
                        try {
                            handler(notification);
                        } catch (error) {
                            console.error('❌ Error in notification handler:', error);
                        }
                    });
                } catch (error) {
                    console.error('❌ Failed to parse notification:', error);
                }
            });
        }

        // Return unsubscribe function
        return () => {
            this.notificationHandlers.delete(onNotification);
        };
    }

    // Remove notification handler
    removeNotificationHandler(handler: (notification: SystemNotification) => void): void {
        this.notificationHandlers.delete(handler);
    }

    disconnect(): void {
        console.log('🔌 Disconnecting Chat WebSocket...');

        if (this.stompClient) {
            this.messageSubscription?.unsubscribe();
            this.conversationSubscription?.unsubscribe();
            this.notificationSubscription?.unsubscribe();
            // Unsubscribe all status subscriptions
            this.statusSubscriptions.forEach((sub) => sub.unsubscribe());
            this.statusSubscriptions.clear();
            this.messageSubscription = null;
            this.conversationSubscription = null;
            this.notificationSubscription = null;
            this.stompClient.deactivate();
            this.stompClient = null;
        }
        // Clear all handlers
        this.messageHandlers.clear();
        this.statusChangeHandlers.clear();
        this.conversationUpdateHandlers.clear();
        this.notificationHandlers.clear();
        this.connectionStatus = { isConnected: false, reconnectAttempts: 0 };
        console.log('✅ Chat WebSocket disconnected');
    }

    sendMessage(request: ChatRequest): boolean {
        if (!this.stompClient?.connected) {
            console.warn('⚠️ Cannot send chat message - WebSocket not connected');
            return false;
        }

        try {
            console.log('📤 Sending chat message:', request);
            this.stompClient.publish({
                destination: "/app/chat",
                body: JSON.stringify(request),
            });
            return true;
        } catch (error) {
            console.error('❌ Failed to send chat message:', error);
            return false;
        }
    }

    notifyGroupCreation(conversationId: string, groupName: string, participantIds: string[]): boolean {
        if (!this.stompClient?.connected) {
            console.warn('⚠️ Cannot notify group creation - WebSocket not connected');
            return false;
        }

        try {
            const payload = {
                conversationId,
                groupName,
                participantIds,
                timestamp: Date.now()
            };

            console.log('📤 Notifying group creation:', payload);
            this.stompClient.publish({
                destination: "/app/conversation/group-created",
                body: JSON.stringify(payload),
            });
            return true;
        } catch (error) {
            console.error('❌ Failed to notify group creation:', error);
            return false;
        }
    }

    markAsRead(conversationId: string, messageId: string): boolean {
        if (!this.stompClient?.connected) {
            console.warn('⚠️ Cannot mark as read - WebSocket not connected');
            return false;
        }

        try {
            console.log('📤 Marking message as read:', { conversationId, messageId });
            this.stompClient.publish({
                destination: `/app/chat/${conversationId}/read/${messageId}`,
                body: '',
            });
            return true;
        } catch (error) {
            console.error('❌ Failed to mark as read:', error);
            return false;
        }
    }

    getConnectionStatus(): ConnectionStatus {
        return { ...this.connectionStatus };
    }

    isConnected(): boolean {
        return this.stompClient?.connected || false;
    }

    // Subscribe to user status change for a conversation
    subscribeToUserStatus(
        conversationId: string,
        onStatus: (payload: { userEmail: string; isOnline: boolean }) => void
    ): () => void {
        if (!this.stompClient?.connected) {
            console.warn('⚠️ Cannot subscribe to status - WebSocket not connected');
            return () => { };
        }

        const destination = `/topic/conversation/${conversationId}/status`;
        // Clean old sub if exists
        const existing = this.statusSubscriptions.get(destination);
        existing?.unsubscribe();

        const sub = this.stompClient.subscribe(destination, (message: IMessage) => {
            try {
                console.log('📡 Raw status message received:', message.body);
                const evt = JSON.parse(message.body);
                console.log('📡 Parsed status event:', evt);
                if (evt?.payload && typeof evt.payload.userEmail === 'string') {
                    console.log('📡 Calling onStatus callback:', { userEmail: evt.payload.userEmail, isOnline: !!evt.payload.isOnline });
                    onStatus({ userEmail: evt.payload.userEmail, isOnline: !!evt.payload.isOnline });
                } else {
                    console.warn('⚠️ Status message missing payload or userEmail:', evt);
                }
            } catch (e) {
                console.error('❌ Failed to parse status message:', e, 'Raw body:', message.body);
            }
        });

        console.log('✅ Subscribed to status updates for conversation:', conversationId, 'destination:', destination);

        this.statusSubscriptions.set(destination, sub);
        return () => {
            sub.unsubscribe();
            this.statusSubscriptions.delete(destination);
        };
    }
}

// Export singleton instance
export const webSocketService = WebSocketService.getInstance();