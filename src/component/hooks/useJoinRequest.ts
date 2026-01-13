// src/component/hooks/useJoinRequest.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '../../services/websocketService';
import type { JoinRequestResponse } from '../../types/session';

interface UseJoinRequestProps {
  sessionId: string;
  enabled?: boolean; // ✅ Add enabled flag
  onJoinSuccess?: () => void;
  onJoinError?: (error: string) => void;
  onCancel?: () => void; // ✅ Add cancel callback
}

export const useJoinRequest = ({ 
  sessionId,
  enabled = true, // ✅ Default true
  onJoinSuccess, 
  onJoinError,
  onCancel // ✅ Add
}: UseJoinRequestProps) => {
  const [isWaiting, setIsWaiting] = useState(false);
  const [response, setResponse] = useState<JoinRequestResponse | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Subscribe to join response
  useEffect(() => {
    if (!enabled) return; // ✅ Subscribe when enabled, not when waiting

    console.log('📥 Member subscribing to join response...');

    const unsubscribe = websocketService.subscribeToJoinResponse((joinResponse: JoinRequestResponse) => {
      console.log('📨 Member received join response:', joinResponse);
      
      setResponse(joinResponse);
      setIsWaiting(false); // ✅ Stop waiting immediately

      if (joinResponse.approved && joinResponse.shouldCallJoinAPI) {
        // ✅ Validate response structure before proceeding
        if (!joinResponse.sessionId || !joinResponse.requestId) {
          console.error('❌ Invalid join response structure:', joinResponse);
          setError('Invalid approval response from server');
          return;
        }
        
        // ✅ Call success callback - parent will handle actual join
        console.log('✅ Join request approved - calling success callback');
        if (onJoinSuccess) {
          onJoinSuccess();
        }
      } else if (!joinResponse.approved) {
        const reason = joinResponse.reason || 'Join request was declined';
        setError(reason);
        if (onJoinError) {
          onJoinError(reason);
        }
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [enabled, sessionId, onJoinSuccess, onJoinError]); // ✅ Remove isWaiting from deps

  // Send join request
  const sendRequest = useCallback(() => {
    if (!sessionId) {
      console.error('❌ Cannot send join request: no session ID');
      setError('No session ID provided');
      return;
    }

    console.log('🙋 Member sending join request for session:', sessionId);
    
    try {
      websocketService.sendJoinRequest(sessionId);
      setIsWaiting(true);
      setResponse(null);
      setError(null);
      
      // Generate temporary request ID (backend will replace with real one)
      const tempRequestId = `temp-${Date.now()}`;
      setRequestId(tempRequestId);
    } catch (err: any) {
      console.error('❌ Failed to send join request:', err);
      setError('Failed to send join request');
      setIsWaiting(false);
    }
  }, [sessionId]);

  // Cancel join request
  const cancelRequest = useCallback(() => {
    if (!requestId || !sessionId) {
      console.warn('⚠️ Cannot cancel: no request ID or session ID');
      return;
    }

    console.log('🚫 Member cancelling join request:', requestId);
    
    websocketService.sendCancelRequest(sessionId, requestId);
    setIsWaiting(false);
    setRequestId(null);
    setResponse(null);
    setError(null);

    // ✅ Call onCancel callback
    if (onCancel) {
      onCancel();
    }
  }, [requestId, sessionId, onCancel]);

  // Retry after rejection/timeout
  const retry = useCallback(() => {
    setResponse(null);
    setError(null);
    sendRequest();
  }, [sendRequest]);

  return {
    isWaiting,
    response,
    requestId,
    error,
    sendRequest,
    cancelRequest,
    retry
  };
};
