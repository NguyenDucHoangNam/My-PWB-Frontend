// src/component/hooks/useJoinApproval.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '../../services/websocketService';
import type { JoinRequestNotification } from '../../types/session';

interface UseJoinApprovalProps {
  sessionId: string;
  currentUserId: number; // ✅ Add currentUserId
  enabled?: boolean; // ✅ Add enabled flag
  onNewRequest?: (notification: JoinRequestNotification) => void;
  onNotification?: (notification: any) => void;
}

export const useJoinApproval = ({ 
  sessionId,
  currentUserId, // ✅ Add
  enabled = true, // ✅ Default true
  onNewRequest,
  onNotification 
}: UseJoinApprovalProps) => {
  const [pendingRequests, setPendingRequests] = useState<JoinRequestNotification[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const unsubscribeRequestsRef = useRef<(() => void) | null>(null);
  const unsubscribeNotificationsRef = useRef<(() => void) | null>(null);
  
  // ✅ Store callbacks in refs to avoid re-subscription when callbacks change
  const onNewRequestRef = useRef(onNewRequest);
  const onNotificationRef = useRef(onNotification);
  
  // ✅ Update refs when callbacks change (without re-subscribing)
  useEffect(() => {
    onNewRequestRef.current = onNewRequest;
    onNotificationRef.current = onNotification;
  }, [onNewRequest, onNotification]);

  // Subscribe to join requests
  useEffect(() => {
    if (!sessionId || !currentUserId || !enabled) {
      console.warn('⚠️ Skipping join request subscription - no session, user ID, or disabled');
      return;
    }

    // ✅ Check if already subscribed to avoid duplicate subscriptions
    if (unsubscribeRequestsRef.current) {
      console.log('⚠️ Already subscribed to join requests, skipping duplicate subscription...');
      return;
    }

    console.log('📥 Owner subscribing to join requests for session:', sessionId);

    const unsubscribeRequests = websocketService.subscribeToJoinRequests(
      (notification: JoinRequestNotification) => {
        console.log('🙋 Owner received join request:', notification);
        
        // Add to pending list
        setPendingRequests(prev => {
          // Check if already exists
          const exists = prev.find(r => r.requestId === notification.requestId);
          if (exists) {
            console.log('⚠️ Join request already exists:', notification.requestId);
            return prev;
          }
          
          console.log('✅ Adding new join request to pending list:', notification.requestId);
          return [...prev, notification];
        });

        // Play notification sound
        playNotificationSound();

        // ✅ Use ref to call callback (avoids stale closure and re-subscription)
        if (onNewRequestRef.current) {
          onNewRequestRef.current(notification);
        }
      }
    );

    unsubscribeRequestsRef.current = unsubscribeRequests;

    return () => {
      if (unsubscribeRequestsRef.current) {
        unsubscribeRequestsRef.current();
        unsubscribeRequestsRef.current = null;
      }
    };
  }, [sessionId, currentUserId, enabled]); // ✅ Removed onNewRequest from deps to prevent re-subscription

  // Subscribe to general notifications
  useEffect(() => {
    if (!sessionId || !currentUserId || !enabled) {
      console.warn('⚠️ Skipping notification subscription - no session, user ID, or disabled');
      return;
    }

    // ✅ Check if already subscribed to avoid duplicate subscriptions
    if (unsubscribeNotificationsRef.current) {
      console.log('⚠️ Already subscribed to notifications, skipping duplicate subscription...');
      return;
    }

    console.log('📥 Owner subscribing to notifications for session:', sessionId);

    const unsubscribeNotifications = websocketService.subscribeToNotifications(
      (notification: any) => {
        console.log('🔔 Owner received notification:', notification);
        
        // ✅ Use ref to call callback (avoids stale closure and re-subscription)
        if (onNotificationRef.current) {
          onNotificationRef.current(notification);
        }
      }
    );

    unsubscribeNotificationsRef.current = unsubscribeNotifications;

    return () => {
      if (unsubscribeNotificationsRef.current) {
        unsubscribeNotificationsRef.current();
        unsubscribeNotificationsRef.current = null;
      }
    };
  }, [sessionId, currentUserId, enabled]); // ✅ Removed onNotification from deps to prevent re-subscription

  // Approve request
  const approveRequest = useCallback(async (requestId: string) => {
    if (!sessionId || isProcessing) return;

    setIsProcessing(true);
    
    try {
      console.log('✅ Owner approving request:', requestId);
      
      websocketService.sendApproveJoin(sessionId, requestId);
      
      // Remove from pending list
      setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
      
      console.log('✅ Approve request sent successfully');
    } catch (error) {
      console.error('❌ Failed to approve request:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, isProcessing]);

  // Reject request
  const rejectRequest = useCallback(async (requestId: string, reason: string) => {
    if (!sessionId || isProcessing) return;

    setIsProcessing(true);
    
    try {
      console.log('❌ Owner rejecting request:', requestId, 'Reason:', reason);
      
      websocketService.sendRejectJoin(sessionId, requestId, reason);
      
      // Remove from pending list
      setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
      
      console.log('❌ Reject request sent successfully');
    } catch (error) {
      console.error('❌ Failed to reject request:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, isProcessing]);

  // Remove request from UI (for expired/cancelled)
  const removeRequest = useCallback((requestId: string) => {
    setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
  }, []);

  return {
    pendingRequests,
    isProcessing,
    approveRequest,
    rejectRequest,
    removeRequest
  };
};

// Helper: Play notification sound
function playNotificationSound() {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    console.log('🔔 Notification sound played');
  } catch (error) {
    console.warn('⚠️ Failed to play notification sound:', error);
  }
}
