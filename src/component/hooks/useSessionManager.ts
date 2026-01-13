// src/component/hooks/useSessionManager.ts

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  joinSession, 
  leaveSession, 
  getSession, 
  getSessionParticipants 
} from '../../services/sessionApi';
import websocketService from '../../services/websocketService';
import type { Session, JoinSessionResponse, Participant } from '../../types/session';

export const useSessionManager = (sessionId: string | undefined, skipAutoJoin: boolean = false) => {
  const navigate = useNavigate();
  
  const [session, setSession] = useState<Session | null>(null);
  const [joinData, setJoinData] = useState<JoinSessionResponse | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isConnected, setIsConnected] = useState(false); // ✅ Add WebSocket connection state
  const [authToken, setAuthToken] = useState<string | null>(null);

  const fetchParticipants = useCallback(async (sid: string) => {
    try {
      const data = await getSessionParticipants(sid);
      setParticipants(data);
    } catch (err) {
      console.error('Failed to fetch participants:', err);
    }
  }, []);

  const handleLeave = useCallback(async () => {
    try {
      if (sessionId) {
        await leaveSession(sessionId);
      }
      navigate(-1);
    } catch (err) {
      console.error('Leave session error:', err);
      navigate(-1);
    }
  }, [sessionId, navigate]);

  const initSession = useCallback(async () => {
    if (!sessionId) {
      setError('Session ID is required');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setError('Please login to join session');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAuthToken(token);
      
      // ✅ Get session details first
      const sessionData = await getSession(sessionId);
      setSession(sessionData);
      
      // ✅ Get current user ID from session (single source of truth)
      const userId = sessionData.currentUserId;
      if (!userId) {
        throw new Error('User ID not found in session data');
      }
      
      setCurrentUserId(userId);
      console.log('👤 Current user ID:', userId);

      // ✅ Connect WebSocket first (for both Owner and Member)
      await websocketService.connect(
        token,
        userId,
        sessionId,
        () => {
          console.log('✅ WebSocket connected for user:', userId);
          setIsConnected(true);
        },
        (error) => {
          console.error('❌ WebSocket connection failed:', error);
          setError('Failed to connect to live session');
        }
      );
      
      // ✅ SKIP auto-join if member needs approval (but WebSocket is connected)
      if (skipAutoJoin) {
        console.log('⏸️ Skipping auto-join - waiting for approval');
        setLoading(false);
        return;
      }
      
      // ✅ Join session và get Agora credentials (Owner/Host flow)
      const joinResponse = await joinSession(sessionId);
      setJoinData(joinResponse);
      
      // ✅ Validate join response
      if (!joinResponse.appId || !joinResponse.token || !joinResponse.channelName) {
        throw new Error('Invalid join response - missing credentials');
      }

      // Mark as joined
      setIsJoined(true);
      
      // Load participants
      await fetchParticipants(sessionId);

      setLoading(false);
      
    } catch (err: any) {
      console.error('Session initialization failed:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication failed. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 404) {
        setError('Session not found or has ended.');
        setTimeout(() => navigate(-1), 2000);
      } else {
        setError(err.response?.data?.message || err.message || 'Cannot join session');
      }
      setLoading(false);
    }
  }, [sessionId, skipAutoJoin, fetchParticipants, navigate]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // ✅ Manual join method (called after approval)
  const manualJoin = useCallback(async () => {
    if (!sessionId || isJoined) {
      console.warn('⚠️ Cannot manual join - no session ID or already joined');
      return;
    }

    try {
      console.log('🚀 Manual joining session after approval...');
      
      const joinResponse = await joinSession(sessionId);
      
      // ✅ Validate response structure
      if (!joinResponse || !joinResponse.appId || !joinResponse.token) {
        throw new Error('Invalid join response from server');
      }
      
      setJoinData(joinResponse);
      
      // ✅ Use currentUserId already set from session data
      console.log('✅ Join data received:', {
        appId: joinResponse.appId,
        channel: joinResponse.channelName,
        uid: joinResponse.uid
      });

      setIsJoined(true);
      
      await fetchParticipants(sessionId);
      
      console.log('✅ Manual join successful');
    } catch (err: any) {
      console.error('❌ Manual join failed:', err);
      
      // ✅ Cleanup state on error
      setIsJoined(false);
      setJoinData(null);
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to join session';
      setError(errorMessage);
      
      // ✅ Throw error so parent can handle (e.g., show retry button)
      throw new Error(errorMessage);
    }
  }, [sessionId, isJoined, fetchParticipants]);

  // ✅ Periodic participants refresh (optional)
  useEffect(() => {
    if (!isJoined || !sessionId) return;

    const interval = setInterval(() => {
      fetchParticipants(sessionId);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isJoined, sessionId, fetchParticipants]);

  return {
    session,
    joinData,
    currentUserId,      // ✅ Từ join response uid
    participants,
    setParticipants,
    loading,
    error,
    isJoined,
    isConnected,        // ✅ NEW: WebSocket connection state
    authToken,
    handleLeave,
    manualJoin,         // ✅ NEW: Manual join method
    refreshParticipants: () => sessionId ? fetchParticipants(sessionId) : Promise.resolve()
  };
};
