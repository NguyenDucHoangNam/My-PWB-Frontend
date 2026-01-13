// src/component/hooks/useWebSocket.ts

import { useEffect, useRef } from 'react';
import websocketService from '../../services/websocketService';
import type { WebSocketEvent } from '../../types/session';

interface UseWebSocketProps {
  sessionId: string;
  token: string;
  userId: number;
  onEvent: (event: WebSocketEvent) => void;
  onChatMessage: (chatMessage: any) => void;  // ✅ Direct chat handler
}

export const useWebSocket = ({ 
  sessionId, 
  token, 
  userId,
  onEvent,
  onChatMessage
}: UseWebSocketProps) => {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const unsubscribeChatRef = useRef<(() => void) | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || !token || !userId || isConnectedRef.current) return;

    const initWebSocket = async () => {
      try {
        await websocketService.connect(
          token,
          userId,
          sessionId,
          () => {
            isConnectedRef.current = true;
            
            // 1. Session events (participants, typing, system)
            const unsubscribeSession = websocketService.subscribeToSession(sessionId, onEvent);
            unsubscribeRef.current = unsubscribeSession;

            // 2. Chat messages separately
            const unsubscribeChat = websocketService.subscribeToChat(sessionId, onChatMessage);
            unsubscribeChatRef.current = unsubscribeChat;
          },
          (error) => {
            console.error('❌ WebSocket connection failed:', error);
            isConnectedRef.current = false;
          }
        );
      } catch (error) {
        console.error('❌ WebSocket initialization failed:', error);
      }
    };

    initWebSocket();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (unsubscribeChatRef.current) {
        unsubscribeChatRef.current();
        unsubscribeChatRef.current = null;
      }
      if (isConnectedRef.current) {
        websocketService.gracefulDisconnect(sessionId);
      }
      isConnectedRef.current = false;
    };
  }, [sessionId, token, userId]);

  const sendMessage = (message: string) => {
    if (websocketService.isConnected()) {
      websocketService.sendChatMessage(sessionId, message);
    }
  };

  return { sendMessage };
};
