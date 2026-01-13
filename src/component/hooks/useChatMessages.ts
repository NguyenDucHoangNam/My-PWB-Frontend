// src/component/hooks/useChatMessages.ts

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, TypingIndicator } from '../../types/session';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const typingTimeoutRef = useRef<Record<number, number>>({});

  const addMessage = useCallback((message: ChatMessage) => {
    if (!message.messageId || !message.content) {
      return;
    }

    setMessages(prev => {
      const exists = prev.find(m => m.messageId === message.messageId);
      if (exists) return prev;
      
      return [...prev, message];
    });
  }, []);

  const addSystemMessage = useCallback((content: string) => {
    const systemMessage: ChatMessage = {
      messageId: `system-${Date.now()}-${Math.random()}`,
      sessionId: '',
      senderId: 0,
      senderName: 'System',
      content,
      type: 'SYSTEM',
      timestamp: new Date().toISOString()
    };
    
    addMessage(systemMessage);
  }, [addMessage]);

  const handleTypingStart = useCallback((userId: number, userName: string) => {
    setTypingUsers(prev => {
      const exists = prev.find(t => t.userId === userId);
      if (exists) return prev;
      return [...prev, { userId, userName, isTyping: true }];
    });

    if (typingTimeoutRef.current[userId]) {
      window.clearTimeout(typingTimeoutRef.current[userId]);
    }
    
    typingTimeoutRef.current[userId] = window.setTimeout(() => {
      handleTypingStop(userId);
    }, 5000);
  }, []);

  const handleTypingStop = useCallback((userId: number) => {
    setTypingUsers(prev => prev.filter(t => t.userId !== userId));
    
    if (typingTimeoutRef.current[userId]) {
      window.clearTimeout(typingTimeoutRef.current[userId]);
      delete typingTimeoutRef.current[userId];
    }
  }, []);

  return {
    messages,
    typingUsers,
    addMessage,
    addSystemMessage,
    handleTypingStart,
    handleTypingStop,
    clearMessages: () => {
      setMessages([]);
      setTypingUsers([]);
    }
  };
};
