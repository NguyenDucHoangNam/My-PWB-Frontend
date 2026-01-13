// src/component/hooks/useAgoraRTC.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import type {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  UID
} from 'agora-rtc-sdk-ng';

interface UseAgoraRTCProps {
  appId: string;
  channel: string;
  token: string;
  uid: UID;
}

interface RemoteUser {
  uid: UID;
  videoTrack?: IRemoteVideoTrack;
  audioTrack?: IRemoteAudioTrack;
  hasVideo: boolean;
  hasAudio: boolean;
}

export const useAgoraRTC = ({ appId, channel, token, uid }: UseAgoraRTCProps) => {
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const isInitializedRef = useRef(false);
  const tracksCreatedRef = useRef(false);

  // ✅ Stable event handlers
  const handleUserPublished = useCallback(async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
    try {
      await clientRef.current?.subscribe(user, mediaType);

      setRemoteUsers((prev) => {
        const existingUser = prev.find((u) => u.uid === user.uid);
        if (existingUser) {
          return prev.map((u) =>
            u.uid === user.uid
              ? {
                  ...u,
                  videoTrack: mediaType === 'video' ? user.videoTrack : u.videoTrack,
                  audioTrack: mediaType === 'audio' ? user.audioTrack : u.audioTrack,
                  hasVideo: mediaType === 'video' || u.hasVideo,
                  hasAudio: mediaType === 'audio' || u.hasAudio
                }
              : u
          );
        }
        return [
          ...prev,
          {
            uid: user.uid,
            videoTrack: mediaType === 'video' ? user.videoTrack : undefined,
            audioTrack: mediaType === 'audio' ? user.audioTrack : undefined,
            hasVideo: mediaType === 'video',
            hasAudio: mediaType === 'audio'
          }
        ];
      });
    } catch (err) {
      console.error('Failed to handle user published:', err);
    }
  }, []);

  const handleUserUnpublished = useCallback((user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
    setRemoteUsers((prev) =>
      prev.map((u) =>
        u.uid === user.uid
          ? {
              ...u,
              videoTrack: mediaType === 'video' ? undefined : u.videoTrack,
              audioTrack: mediaType === 'audio' ? undefined : u.audioTrack,
              hasVideo: mediaType === 'video' ? false : u.hasVideo,
              hasAudio: mediaType === 'audio' ? false : u.hasAudio
            }
          : u
      )
    );
  }, []);

  const handleUserJoined = useCallback((user: IAgoraRTCRemoteUser) => {
    console.log('User joined:', user.uid);
  }, []);

  const handleUserLeft = useCallback((user: IAgoraRTCRemoteUser) => {
    setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
  }, []);

  // ✅ Initialize Agora once
  useEffect(() => {
    if (!appId || !channel || !token || isInitializedRef.current) return;

    const initAgora = async () => {
      try {
        console.log('🎥 Initializing Agora...');
        AgoraRTC.setLogLevel(4);

        // Create client
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        // Register events
        client.on('user-published', handleUserPublished);
        client.on('user-unpublished', handleUserUnpublished);
        client.on('user-joined', handleUserJoined);
        client.on('user-left', handleUserLeft);

        // Join channel
        await client.join(appId, channel, token, uid);
        console.log('✅ Joined channel');

        // Create tracks
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        // Publish tracks
        await client.publish([audioTrack, videoTrack]);
        console.log('✅ Published tracks');

        setIsJoined(true);
        isInitializedRef.current = true;
        tracksCreatedRef.current = true;

      } catch (err: any) {
        console.error('❌ Agora initialization error:', err);
        setError(err.message || 'Failed to initialize Agora');
      }
    };

    initAgora();

    // Cleanup on unmount
    return () => {
      if (isInitializedRef.current) {
        console.log('🧹 Cleaning up Agora...');
        
        if (localVideoTrack && tracksCreatedRef.current) {
          localVideoTrack.close();
          setLocalVideoTrack(null);
        }
        if (localAudioTrack && tracksCreatedRef.current) {
          localAudioTrack.close();
          setLocalAudioTrack(null);
        }
        if (clientRef.current) {
          clientRef.current.leave().catch(console.error);
          clientRef.current = null;
        }
        
        isInitializedRef.current = false;
        tracksCreatedRef.current = false;
      }
    };
  }, [appId, channel, token, uid, handleUserPublished, handleUserUnpublished, handleUserJoined, handleUserLeft]);

  // ✅ Toggle functions - standalone, không depend vào useEffect
  const toggleVideo = useCallback(async () => {
    if (!localVideoTrack || !tracksCreatedRef.current) {
      console.warn('Video track not ready');
      return;
    }
    
    try {
      const newState = !isVideoEnabled;
      await localVideoTrack.setEnabled(newState);
      setIsVideoEnabled(newState);
      console.log(`📹 Video ${newState ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error('Failed to toggle video:', err);
    }
  }, [localVideoTrack, isVideoEnabled]);

  const toggleAudio = useCallback(async () => {
    if (!localAudioTrack || !tracksCreatedRef.current) {
      console.warn('Audio track not ready');
      return;
    }
    
    try {
      const newState = !isAudioEnabled;
      await localAudioTrack.setEnabled(newState);
      setIsAudioEnabled(newState);
      console.log(`🎤 Audio ${newState ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error('Failed to toggle audio:', err);
    }
  }, [localAudioTrack, isAudioEnabled]);

  const leaveChannel = useCallback(async () => {
    try {
      console.log('🚪 Leaving Agora channel...');
      
      // Close tracks first
      if (localVideoTrack && tracksCreatedRef.current) {
        localVideoTrack.close();
        setLocalVideoTrack(null);
      }
      if (localAudioTrack && tracksCreatedRef.current) {
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }
      
      // Leave channel
      if (clientRef.current && isInitializedRef.current) {
        await clientRef.current.leave();
        clientRef.current = null;
      }
      
      // Reset state
      setIsJoined(false);
      setRemoteUsers([]);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      isInitializedRef.current = false;
      tracksCreatedRef.current = false;
      
      console.log('✅ Left channel successfully');
    } catch (err) {
      console.error('❌ Failed to leave channel:', err);
    }
  }, [localVideoTrack, localAudioTrack]);

  return {
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    isJoined,
    isVideoEnabled,
    isAudioEnabled,
    error,
    toggleVideo,
    toggleAudio,
    leaveChannel
  };
};
