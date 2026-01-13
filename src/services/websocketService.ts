// src/services/websocketService.ts

import { Client, type StompSubscription } from '@stomp/stompjs';

export class WebSocketService {
  private stompClient: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private currentUserId: number | null = null;
  private currentSessionId: string | null = null;

  connect(
    token: string,
    userId: number,
    sessionId: string,
    onConnected?: () => void,
    onError?: (error: any) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.currentUserId = userId;
      this.currentSessionId = sessionId;

      // ✅ Use direct WebSocket like Postman
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws/websocket';

      console.log('� Connecting to:', wsUrl);

      this.stompClient = new Client({
        // ✅ Option 2: Direct WebSocket connection (like Postman)
        webSocketFactory: () => {
          const ws = new WebSocket(wsUrl);

          ws.onopen = () => {
            console.log('✅ WebSocket opened');
          };

          ws.onclose = (event) => {
            if (!event.wasClean) {
              console.error('❌ WebSocket closed unexpectedly:', event.code, event.reason);
            }
          };

          ws.onerror = (event) => {
            console.error('❌ WebSocket error:', event);
          };

          return ws;
        },

        // ✅ STOMP headers (will be sent after WebSocket connection)
        connectHeaders: {
          'Authorization': `Bearer ${token}`,
          'userId': userId.toString(),
          'liveSessionId': sessionId
        },

        reconnectDelay: 5000,
        // ✅ Optimize heartbeat for ALB (ALB idle timeout is 60s default, max 4000s)
        // Send heartbeat every 30s to keep connection alive (50% of 60s timeout for safety)
        heartbeatIncoming: 30000,  // Receive heartbeat from server every 30s
        heartbeatOutgoing: 30000,  // Send heartbeat to server every 30s (CRITICAL for ALB)

        onConnect: () => {
          console.log('✅ STOMP connected');
          if (onConnected) onConnected();
          resolve();
        },

        onStompError: (frame: any) => {
          console.error('❌ STOMP Error:', frame.headers?.message || frame.body);
          const error = new Error(frame.headers?.message || 'STOMP error');
          if (onError) onError(error);
          reject(error);
        },

        onWebSocketError: () => {
          console.error('❌ WebSocket Error');
          const error = new Error('WebSocket connection error');
          if (onError) onError(error);
          reject(error);
        },

        onWebSocketClose: (event: any) => {
          if (!event.wasClean) {
            console.warn('🔌 Connection closed unexpectedly');
          }
        }
      });

      // ✅ Connection timeout
      const timeout = setTimeout(() => {
        console.error('❌ Connection timeout');
        if (this.stompClient) {
          this.stompClient.deactivate();
        }
        reject(new Error('WebSocket connection timeout'));
      }, 15000);

      // Clear timeout on success/error
      const originalOnConnect = this.stompClient.onConnect;
      this.stompClient.onConnect = (frame) => {
        clearTimeout(timeout);
        if (originalOnConnect) originalOnConnect(frame);
      };

      const originalOnError = this.stompClient.onStompError;
      this.stompClient.onStompError = (frame) => {
        clearTimeout(timeout);
        if (originalOnError) originalOnError(frame);
      };

      try {
        this.stompClient.activate();
      } catch (error) {
        clearTimeout(timeout);
        console.error('❌ Failed to activate STOMP client:', error);
        reject(error);
      }
    });
  }

  subscribeToSession(sessionId: string, callback: (event: any) => void): () => void {
    const destination = `/topic/session/${sessionId}`;

    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot subscribe - not connected');
      return () => { };
    }

    const subscription = this.stompClient.subscribe(destination, (message: any) => {
      try {
        const event = JSON.parse(message.body);
        callback(event);
      } catch (error) {
        console.error('❌ Failed to parse session event:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };
  }

  subscribeToChat(sessionId: string, callback: (chatMessage: any) => void): () => void {
    const destination = `/topic/session/${sessionId}/chat`;

    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot subscribe to chat - not connected');
      return () => { };
    }

    const subscription = this.stompClient.subscribe(destination, (message: any) => {
      try {
        const parsed = JSON.parse(message.body);
        let chatMessage = parsed;

        if (parsed.eventType === 'CHAT_MESSAGE' && parsed.payload) {
          chatMessage = parsed.payload;
        }

        callback(chatMessage);
      } catch (error) {
        console.error('❌ Failed to parse chat message:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };
  }

  sendChatMessage(sessionId: string, content: string, type: string = 'TEXT'): void {
    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot send chat - not connected');
      return;
    }

    this.stompClient.publish({
      destination: `/app/session/${sessionId}/chat`,
      body: JSON.stringify({ content, type }),
    });
  }

  sendTypingIndicator(sessionId: string, action: 'start' | 'stop'): void {
    if (!this.stompClient?.connected) return;
    this.stompClient.publish({
      destination: `/app/session/${sessionId}/typing`,
      body: JSON.stringify(action),
    });
  }

  // ==================== MUSIC PLAYER METHODS ====================

  subscribeToMusic(sessionId: string, callback: (event: any) => void): () => void {
    const destination = `/topic/session/${sessionId}/playback`;

    console.log('🎵 Subscribing to music topic:', destination, 'userId:', this.currentUserId);

    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot subscribe to music - not connected');
      return () => { };
    }

    const subscription = this.stompClient.subscribe(destination, (message: any) => {
      console.log('🎵 Raw message received on music topic:', message.body?.substring(0, 200));
      try {
        const event = JSON.parse(message.body);
        callback(event);
      } catch (error) {
        console.error('❌ Failed to parse music event:', error);
      }
    });

    console.log('✅ Successfully subscribed to music topic:', destination);
    this.subscriptions.set(destination, subscription);
    return () => {
      console.log('🔇 Unsubscribing from music topic:', destination);
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };
  }

  subscribeToParticipants(sessionId: string, callback: (event: any) => void): () => void {
    const destination = `/topic/session/${sessionId}/participants`;

    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot subscribe to participants - not connected');
      return () => { };
    }

    const subscription = this.stompClient.subscribe(destination, (message: any) => {
      try {
        const event = JSON.parse(message.body);
        callback(event);
      } catch (error) {
        console.error('❌ Failed to parse participant event:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };
  }

  // ==================== TRACK NOTES METHODS ====================

  subscribeToNotes(sessionId: string, callback: (event: any) => void): () => void {
    const destination = `/topic/session/${sessionId}/notes`;

    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot subscribe to notes - not connected');
      return () => { };
    }

    console.log('📝 Subscribing to notes:', destination);

    const subscription = this.stompClient.subscribe(destination, (message: any) => {
      try {
        const event = JSON.parse(message.body);
        console.log('📝 Received note event:', event);
        callback(event);
      } catch (error) {
        console.error('❌ Failed to parse note event:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };
  }

  sendParticipantState(sessionId: string, state: {
    userId: number;
    username: string;
    hasVideo: boolean;
    hasAudio: boolean;
    action: 'TOGGLE_VIDEO' | 'TOGGLE_AUDIO' | 'JOIN' | 'LEAVE';
  }): void {
    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot send participant state - not connected');
      return;
    }

    const event = {
      ...state,
      timestamp: new Date().toISOString(),
      sessionId
    };

    this.stompClient.publish({
      destination: `/app/session/${sessionId}/participant`,
      body: JSON.stringify(event),
    });
  }

  sendMusicEvent(sessionId: string, event: {
    action: 'PLAY' | 'PAUSE' | 'SEEK' | 'NEXT' | 'PREVIOUS' | 'STOP';
    trackId?: number;
    fileId?: number;
    fileName?: string;
    fileUrl?: string;
    position?: number;
    duration?: number;
    artist?: string;
    roomType?: 'INTERNAL' | 'CLIENT';
    voiceTagEnabled?: boolean;
    version?: string;
  }): void {
    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot send music event - not connected');
      return;
    }

    const eventWithUserId = {
      ...event,
      triggeredByUserId: this.currentUserId,
      timestamp: new Date().toISOString()
    };

    console.log('🎵 Sending music event:', {
      destination: `/app/session/${sessionId}/playback`,
      event: eventWithUserId,
      currentUserId: this.currentUserId,
      connected: this.stompClient?.connected
    });

    this.stompClient.publish({
      destination: `/app/session/${sessionId}/playback`,
      body: JSON.stringify(eventWithUserId),
    });

    console.log('✅ Music event sent successfully');
  }

  sendLeaveSignal(sessionId: string): void {
    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot send leave signal - not connected');
      return;
    }

    const leaveEvent = {
      type: 'USER_LEAVING',
      userId: this.currentUserId,
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      reason: 'BUTTON_CLICK'
    };

    this.stompClient.publish({
      destination: `/app/session/${sessionId}/leave`,
      body: JSON.stringify(leaveEvent),
    });
  }

  async gracefulDisconnect(sessionId?: string): Promise<void> {
    const targetSessionId = sessionId || this.currentSessionId;

    if (this.stompClient?.connected && targetSessionId) {
      try {
        this.sendLeaveSignal(targetSessionId);
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        // Silent fail
      }
    }

    this.disconnect();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.subscriptions.forEach((sub) => {
        sub.unsubscribe();
      });
      this.subscriptions.clear();

      this.stompClient.deactivate();
      this.stompClient = null;
      this.currentUserId = null;
      this.currentSessionId = null;
    }
  }

  isConnected(): boolean {
    return this.stompClient?.connected || false;
  }

  getConnectionInfo() {
    return {
      connected: this.isConnected(),
      userId: this.currentUserId,
      sessionId: this.currentSessionId,
      subscriptions: Array.from(this.subscriptions.keys()),
      stompState: this.stompClient?.state || 'INACTIVE'
    };
  }

  // ✅ DEBUG: Check if music subscription is active
  debugMusicSubscription(sessionId: string): void {
    const destination = `/topic/session/${sessionId}/playback`;
    const subscription = this.subscriptions.get(destination);
    console.log('🔍 DEBUG Music Subscription:', {
      destination,
      hasSubscription: !!subscription,
      allSubscriptions: Array.from(this.subscriptions.keys()),
      connected: this.isConnected(),
      userId: this.currentUserId,
      stompState: this.stompClient?.state
    });
  }

  // ==================== JOIN REQUEST METHODS ====================

  /**
   * Member: Send join request
   */
  sendJoinRequest(sessionId: string): void {
    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot send join request - not connected');
      return;
    }

    console.log('🙋 Sending join request for session:', sessionId);

    this.stompClient.publish({
      destination: `/app/session/${sessionId}/request-join`,
      body: JSON.stringify({}),
    });
  }

  /**
   * Owner: Subscribe to join requests
   */
  subscribeToJoinRequests(callback: (notification: any) => void): () => void {
    if (!this.currentUserId) {
      console.warn('⚠️ Cannot subscribe to join requests - no user ID');
      return () => { };
    }

    const destination = `/user/queue/join-requests`;

    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot subscribe to join requests - not connected');
      return () => { };
    }

    console.log('📥 Subscribing to join requests:', destination);

    const subscription = this.stompClient.subscribe(destination, (message: any) => {
      try {
        const notification = JSON.parse(message.body);
        console.log('🙋 Received join request notification:', notification);
        callback(notification);
      } catch (error) {
        console.error('❌ Failed to parse join request notification:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };
  }

  /**
   * Member: Subscribe to join response (approved/rejected)
   */
  subscribeToJoinResponse(callback: (response: any) => void): () => void {
    if (!this.currentUserId) {
      console.warn('⚠️ Cannot subscribe to join response - no user ID');
      return () => { };
    }

    const destination = `/user/queue/join-response`;

    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot subscribe to join response - not connected');
      return () => { };
    }

    console.log('📥 Subscribing to join response:', destination);

    const subscription = this.stompClient.subscribe(destination, (message: any) => {
      try {
        const response = JSON.parse(message.body);
        console.log('📨 Received join response:', response);
        callback(response);
      } catch (error) {
        console.error('❌ Failed to parse join response:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };
  }

  /**
   * Owner: Approve join request
   */
  sendApproveJoin(sessionId: string, requestId: string): void {
    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot approve join - not connected');
      return;
    }

    console.log('✅ Approving join request:', requestId);

    this.stompClient.publish({
      destination: `/app/session/${sessionId}/approve-join`,
      body: JSON.stringify({ requestId }),
    });
  }

  /**
   * Owner: Reject join request
   */
  sendRejectJoin(sessionId: string, requestId: string, reason: string): void {
    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot reject join - not connected');
      return;
    }

    console.log('❌ Rejecting join request:', requestId, 'Reason:', reason);

    this.stompClient.publish({
      destination: `/app/session/${sessionId}/reject-join`,
      body: JSON.stringify({ requestId, reason }),
    });
  }

  /**
   * Member: Cancel join request
   */
  sendCancelRequest(sessionId: string, requestId: string): void {
    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot cancel request - not connected');
      return;
    }

    console.log('🚫 Cancelling join request:', requestId);

    this.stompClient.publish({
      destination: `/app/session/${sessionId}/cancel-request`,
      body: JSON.stringify(requestId),
    });
  }

  /**
   * Get pending requests (optional, use REST API instead)
   */
  sendGetPendingRequests(sessionId: string): void {
    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot get pending requests - not connected');
      return;
    }

    this.stompClient.publish({
      destination: `/app/session/${sessionId}/get-pending-requests`,
      body: JSON.stringify({}),
    });
  }

  /**
   * Subscribe to pending requests list (optional)
   */
  subscribeToPendingRequests(callback: (requests: any[]) => void): () => void {
    if (!this.currentUserId) {
      console.warn('⚠️ Cannot subscribe to pending requests - no user ID');
      return () => { };
    }

    const destination = `/user/queue/pending-requests`;

    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot subscribe to pending requests - not connected');
      return () => { };
    }

    const subscription = this.stompClient.subscribe(destination, (message: any) => {
      try {
        const requests = JSON.parse(message.body);
        console.log('📋 Received pending requests:', requests);
        callback(requests);
      } catch (error) {
        console.error('❌ Failed to parse pending requests:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };
  }

  /**
   * Subscribe to general notifications
   */
  subscribeToNotifications(callback: (notification: any) => void): () => void {
    if (!this.currentUserId) {
      console.warn('⚠️ Cannot subscribe to notifications - no user ID');
      return () => { };
    }

    const destination = `/user/queue/notification`;

    if (!this.stompClient?.connected) {
      console.warn('⚠️ Cannot subscribe to notifications - not connected');
      return () => { };
    }

    const subscription = this.stompClient.subscribe(destination, (message: any) => {
      try {
        const notification = JSON.parse(message.body);
        console.log('🔔 Received notification:', notification);
        callback(notification);
      } catch (error) {
        console.error('❌ Failed to parse notification:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };
  }
}

const websocketService = new WebSocketService();

// ✅ DEBUG: Expose to window for debugging
(window as any).websocketService = websocketService;

export default websocketService;