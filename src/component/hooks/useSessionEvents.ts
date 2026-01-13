// src/component/hooks/useSessionEvents.ts

import { useCallback } from 'react';
import type { 
  WebSocketEvent, 
  UseSessionEventsProps
} from '../../types/session';

export const useSessionEvents = ({
  sessionId,
  currentUserId,
  setParticipants,
  addSystemMessage,
  addChatMessage,
  handleTypingStart,
  handleTypingStop,
  handleLeave
}: UseSessionEventsProps) => {
  
  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    const eventType = event.eventType || event.type;
    const eventData = event.payload || event.data || event;
    
    switch (eventType) {
      case 'PARTICIPANT_JOINED':
      case 'PARTICIPANT_EVENT':
        if (eventData?.action === 'JOINED' || eventType === 'PARTICIPANT_JOINED') {
          setParticipants(prev => {
            const exists = prev.find(p => p.userId === eventData.userId);
            if (exists) return prev.map(p => 
              p.userId === eventData.userId ? { ...p, isOnline: true } : p
            );
            
            return [...prev, {
              userId: eventData.userId,
              userName: eventData.userName,
              userAvatarUrl: eventData.userAvatarUrl,
              participantRole: eventData.role || 'OBSERVER',
              isOnline: true,
              audioEnabled: false,
              videoEnabled: false,
              canShareAudio: true,
              canShareVideo: true,
              canControlPlayback: false
            }];
          });
          
          addSystemMessage(`${eventData.userName} joined the session`);
        }
        break;

      case 'PARTICIPANT_LEFT':
        if (eventData?.userId) {
          setParticipants(prev => prev.filter(p => p.userId !== eventData.userId));
          addSystemMessage(`${eventData.userName} left the session`);
          handleTypingStop(eventData.userId);
        }
        break;

      case 'TYPING_START':
        if (eventData?.userId !== currentUserId) {
          handleTypingStart(eventData.userId, eventData.userName);
        }
        break;

      case 'TYPING_STOP':
        handleTypingStop(eventData?.userId);
        break;

      default:
        break;
    }
  }, [sessionId, currentUserId, setParticipants, addSystemMessage, addChatMessage, handleTypingStart, handleTypingStop, handleLeave]);

  return { handleWebSocketEvent };
};
