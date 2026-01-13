// src/component/hooks/useMusicPlayer.ts

import { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import websocketService from '../../services/websocketService';
import { getSessionMilestones } from '../../services/sessionApi';
import type { Track, PlaybackState, MusicEvent } from '../../types/music';
import type { SessionTrackResponse, MilestoneWithTracksResponse } from '../../types/session';

interface UseMusicPlayerProps {
  sessionId: string;
  isOwner: boolean;
  currentUserId?: number; // Add currentUserId to identify self
  onError?: (error: string) => void;
}

export const useMusicPlayer = ({ sessionId, isOwner, currentUserId, onError }: UseMusicPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const hlsRef = useRef<Hls | null>(null); // HLS instance for .m3u8 files
  const lastErrorRef = useRef<string>(''); // Track last error to prevent spam
  const playPromiseRef = useRef<Promise<void> | null>(null); // Track play() promise
  const isRemoteCommandRef = useRef<boolean>(false); // Track if command is from remote
  const lastPlayCallRef = useRef<{ trackId: number; timestamp: number } | null>(null); // Track last play() call
  // Refs to store internal functions for direct access in handleMusicEvent
  const internalPlayRef = useRef<((track: Track, position?: number) => void) | null>(null);
  const internalPauseRef = useRef<(() => void) | null>(null);
  const internalSeekRef = useRef<((position: number) => void) | null>(null);
  const internalStopRef = useRef<(() => void) | null>(null);
  const currentTrackIdRef = useRef<number | null>(null); // ✅ FIX: Track current track ID to avoid stale closure
  const [milestones, setMilestones] = useState<MilestoneWithTracksResponse[]>([]);

  // ✅ Ref to access latest playbackState without adding it to dependencies
  // Initialized with empty state to match type
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    queue: [] // Will be loaded from API
  });

  const playbackStateRef = useRef<PlaybackState>(playbackState);

  // Sync ref with state
  useEffect(() => {
    playbackStateRef.current = playbackState;
  }, [playbackState]);

  // Convert SessionTrackResponse to Track format
  const convertTrackToTrack = useCallback((sessionTrack: SessionTrackResponse, milestoneTitle: string): Track => {
    return {
      id: sessionTrack.trackId,
      title: sessionTrack.trackName,
      artist: milestoneTitle, // Use milestone title as artist
      duration: sessionTrack.duration,
      url: sessionTrack.hlsPlaybackUrl, // Use HLS URL as primary URL
      hlsPlaybackUrl: sessionTrack.hlsPlaybackUrl,
      roomType: sessionTrack.roomType,
      voiceTagEnabled: sessionTrack.voiceTagEnabled,
      version: sessionTrack.version
    };
  }, []);

  // Load milestones and tracks from API - CHỈ OWNER CẦN GỌI API
  useEffect(() => {
    if (!sessionId || !isOwner) {
      // ✅ Member không cần gọi API, chỉ cần subscribe WebSocket
      console.log('👤 Member: Không cần gọi API, chỉ cần subscribe WebSocket để nhận events');
      return;
    }

    const loadMilestones = async () => {
      try {
        console.log('📥 Owner: Loading milestones and tracks for session:', sessionId);
        const response = await getSessionMilestones(sessionId);
        setMilestones(response.milestones);

        // Convert all tracks from milestones to Track format
        const allTracks: Track[] = [];
        response.milestones.forEach((milestone) => {
          // Add internal tracks
          milestone.internalTracks.forEach((track) => {
            allTracks.push(convertTrackToTrack(track, milestone.title));
          });
          // Add client tracks
          milestone.clientTracks.forEach((track) => {
            allTracks.push(convertTrackToTrack(track, milestone.title));
          });
        });

        console.log('✅ Owner: Loaded tracks from API:', allTracks.length, 'tracks');

        // Update queue with tracks from API
        setPlaybackState(prev => ({ ...prev, queue: allTracks }));
      } catch (error) {
        console.error('❌ Failed to load milestones:', error);
        onError?.('Failed to load tracks from server');
        // Set empty queue on error
        setPlaybackState(prev => ({ ...prev, queue: [] }));
      }
    };

    loadMilestones();
  }, [sessionId, isOwner, convertTrackToTrack, onError]);

  // ==================== AUDIO EVENT LISTENERS ====================

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setPlaybackState(prev => ({
        ...prev,
        currentTime: audio.currentTime
      }));
    };

    const handleLoadedMetadata = () => {
      console.log('📊 Audio metadata loaded, duration:', audio.duration);
      if (audio.duration && isFinite(audio.duration)) {
        setPlaybackState(prev => ({
          ...prev,
          duration: audio.duration
        }));
      }
    };

    // ✅ FIX: Also listen for durationchange (important for HLS streams)
    const handleDurationChange = () => {
      console.log('📊 Duration changed:', audio.duration);
      if (audio.duration && isFinite(audio.duration)) {
        setPlaybackState(prev => ({
          ...prev,
          duration: audio.duration
        }));
      }
    };

    const handleEnded = () => {
      // Auto play next track
      if (isOwner) {
        next();
      }
    };

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      const errorDetails = target.error;

      // 🛑 PREVENT INFINITE LOOP: Only log unique errors
      const errorKey = `${errorDetails?.code}-${target.src}`;
      if (lastErrorRef.current === errorKey) {
        return; // Skip duplicate errors
      }
      lastErrorRef.current = errorKey;

      let errorMessage = 'Failed to load audio track';
      if (errorDetails) {
        switch (errorDetails.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio loading aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error while loading audio';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Audio decoding error';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported or URL invalid';
            break;
        }
      }

      console.error('🚨 Audio error:', errorMessage, {
        code: errorDetails?.code,
        message: errorDetails?.message,
        src: target.src,
        currentTrack: playbackState.currentTrack
      });

      onError?.(errorMessage);
      setPlaybackState(prev => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange); // ✅ FIX: For HLS duration
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Set initial volume
    audio.volume = playbackState.volume;

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange); // ✅ FIX: Cleanup
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);

      // ✅ CRITICAL: Stop and cleanup audio when unmount
      audio.pause();
      // 🛡️ Use blob URL to avoid triggering error on empty src
      audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      audio.load(); // Force load the silent audio
      audio.currentTime = 0;
    };
  }, [isOwner, onError]);

  // ✅ Sync volume with audio element whenever it changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio.volume !== playbackState.volume) {
      console.log('🔊 Syncing volume to audio element:', playbackState.volume);
      audio.volume = playbackState.volume;
    }
  }, [playbackState.volume]);

  // ==================== WEBSOCKET SYNC ====================

  // Handle incoming music events from WebSocket
  const handleMusicEvent = useCallback((event: any) => {
    // Parse event - Backend may send different formats:
    // Format 1: { eventType: 'PLAYBACK_PLAY', payload: {...} }
    // Format 2: { action: 'PLAY', ... }
    // Format 3: { type: 'PLAYBACK_PLAY', data: {...} }
    const eventType = event.eventType || event.type || event.action;
    const payload = event.payload || event.data || event;
    const triggeredBy = payload.triggeredByUserId || event.triggeredByUserId;

    console.log('📨 Received music event:', {
      rawEvent: event,
      eventType,
      payload,
      triggeredBy,
      currentUserId,
      shouldIgnore: currentUserId && Number(triggeredBy) === Number(currentUserId)
    });

    // 🚫 Ignore events triggered by self to avoid echo/double processing
    // Use Number() to ensure type consistency (backend may send string or number)
    if (currentUserId && triggeredBy && Number(triggeredBy) === Number(currentUserId)) {
      console.log('🔇 Ignoring self-triggered music event:', eventType);
      return;
    }

    console.log('✅ Applying music event from other user:', eventType, payload);

    // Map PLAYBACK_* to action type, or use action directly
    let action = '';
    if (eventType) {
      action = eventType.replace('PLAYBACK_', '').toUpperCase();
    } else if (event.action) {
      action = event.action.toUpperCase();
    }

    if (!action) {
      console.warn('⚠️ Unknown event format, cannot determine action:', event);
      return;
    }

    switch (action) {
      case 'PLAY':
        const trackId = payload.trackId || payload.fileId;
        const trackUrl = payload.fileUrl || payload.url || payload.hlsPlaybackUrl;
        let position = payload.position || 0;
        let duration = payload.duration || 0;
        const fileName = payload.fileName || payload.title || 'Unknown Track';

        console.log('🎵 Processing PLAY event:', { trackId, trackUrl, position, duration, fileName, fullPayload: payload });

        // ✅ Member: Dùng fileUrl từ event để phát trực tiếp, không cần tìm trong queue
        if (!trackUrl || trackUrl.trim() === '') {
          console.error('❌ No fileUrl provided in PLAY event:', payload);
          return;
        }

        // ✅ Convert duration from milliseconds to seconds if needed (if > 1000, assume it's ms)
        if (duration > 1000) {
          duration = duration / 1000;
        }

        // ✅ Convert position from milliseconds to seconds if needed (if > 1000, assume it's ms)
        if (position > 1000) {
          position = position / 1000;
        }

        // ✅ Tạo track object từ event payload (member không có queue)
        const trackFromEvent: Track = {
          id: trackId || 0,
          title: fileName,
          artist: payload.artist || payload.triggeredByUserName || 'Unknown Artist',
          duration: duration,
          url: trackUrl,
          hlsPlaybackUrl: trackUrl,
          roomType: payload.roomType,
          voiceTagEnabled: payload.voiceTagEnabled,
          version: payload.version
        };

        console.log('✅ Created track from event payload:', trackFromEvent.title, 'URL:', trackUrl);

        // ✅ Update state immediately so UI shows the track
        // ⚠️ DO NOT update currentTrackIdRef here! Let internalPlay handle it
        // Otherwise internalPlay will always think it's the same track (resume path)
        setPlaybackState(prev => ({
          ...prev,
          currentTrack: trackFromEvent,
          isPlaying: true // Will be updated by internalPlay
        }));

        // ✅ Call internalPlay to start playback - use ref for direct access
        if (internalPlayRef.current) {
          // ✅ FIX: Add network latency compensation (~0.5s)
          const latencyCompensation = 0.5;
          const adjustedPosition = position + latencyCompensation;
          console.log('🎵 Calling internalPlay for remote track:', trackFromEvent.title, 'at position:', adjustedPosition, '(original:', position, ')');
          internalPlayRef.current(trackFromEvent, adjustedPosition);
        } else {
          // Fallback: try window controls if ref not ready yet
          setTimeout(() => {
            const controls = (window as any).audioPlayerControls;
            if (controls && controls.play) {
              console.log('🎵 Calling internalPlay via window for remote track:', trackFromEvent.title, 'at position:', position);
              controls.play(trackFromEvent, position);
            } else {
              console.error('❌ audioPlayerControls not available when trying to play');
            }
          }, 100);
        }
        break;

      case 'PAUSE':
        console.log('⏸️ Handling remote PAUSE event');
        // ✅ Use internalPause which handles playPromise and state
        if (internalPauseRef.current) {
          internalPauseRef.current();
        } else {
          // Fallback: direct pause if ref not ready
          try {
            if (audioRef.current) {
              audioRef.current.pause();
            }
          } catch (e) {
            console.error('❌ Error executing pause:', e);
          }
          setPlaybackState(prev => ({ ...prev, isPlaying: false }));
        }
        break;

      case 'SEEK':
        if (payload.position !== undefined) {
          // Convert position from milliseconds to seconds if needed
          const positionInSeconds = payload.position > 1000 ? payload.position / 1000 : payload.position;

          console.log('⏩ Handling remote SEEK event to:', positionInSeconds);

          // ✅ Use internalSeek which handles audio + state properly
          if (internalSeekRef.current) {
            internalSeekRef.current(positionInSeconds);
          } else {
            // Fallback: direct seek if ref not ready
            try {
              if (audioRef.current && Number.isFinite(positionInSeconds)) {
                audioRef.current.currentTime = positionInSeconds;
              }
            } catch (e) {
              console.error('❌ Error executing seek:', e);
            }
            setPlaybackState(prev => ({ ...prev, currentTime: positionInSeconds }));
          }
        }
        break;

      case 'STOP':
        console.log('⏹️ Handling remote STOP event');

        // ✅ Use internalStop which handles audio + state properly
        if (internalStopRef.current) {
          internalStopRef.current();
        } else {
          // Fallback: direct stop if ref not ready
          try {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          } catch (e) {
            console.error('❌ Error executing stop:', e);
          }
          setPlaybackState(prev => ({
            ...prev,
            isPlaying: false,
            currentTime: 0
          }));
        }
        break;

      case 'NEXT':
      case 'PREVIOUS':
        // Handled by next/previous functions
        break;

      default:
        console.warn('⚠️ Unknown music event action:', action, event);
    }
  }, [currentUserId]);

  // ✅ Use ref to keep stable reference to handleMusicEvent
  const handleMusicEventRef = useRef(handleMusicEvent);
  useEffect(() => {
    handleMusicEventRef.current = handleMusicEvent;
  }, [handleMusicEvent]);

  useEffect(() => {
    console.log('🎵 useMusicPlayer useEffect - sessionId:', sessionId, 'isOwner:', isOwner, 'currentUserId:', currentUserId);
    
    if (!sessionId) {
      console.warn('⚠️ useMusicPlayer: No sessionId, skipping subscription');
      return;
    }

    console.log('🎵 useMusicPlayer: Attempting to subscribe to music events...');
    
    // ✅ Check if WebSocket is connected
    if (!websocketService.isConnected()) {
      console.warn('⚠️ useMusicPlayer: WebSocket not connected yet, will retry...');
      
      // ✅ Retry subscription after a delay (wait for WebSocket to connect)
      const retryInterval = setInterval(() => {
        if (websocketService.isConnected()) {
          console.log('🎵 useMusicPlayer: WebSocket now connected, subscribing...');
          clearInterval(retryInterval);
          
          const unsubscribe = websocketService.subscribeToMusic(sessionId, (event: MusicEvent) => {
            handleMusicEventRef.current(event);
          });
          
          // Store unsubscribe function for cleanup
          (window as any).__musicUnsubscribe = unsubscribe;
        }
      }, 500); // Check every 500ms
      
      // Cleanup: stop retrying after 30 seconds
      const timeout = setTimeout(() => {
        clearInterval(retryInterval);
        console.error('❌ useMusicPlayer: Failed to subscribe after 30s');
      }, 30000);
      
      return () => {
        clearInterval(retryInterval);
        clearTimeout(timeout);
        if ((window as any).__musicUnsubscribe) {
          (window as any).__musicUnsubscribe();
          delete (window as any).__musicUnsubscribe;
        }
      };
    }
    
    // ✅ WebSocket already connected, subscribe immediately
    const unsubscribe = websocketService.subscribeToMusic(sessionId, (event: MusicEvent) => {
      handleMusicEventRef.current(event);
    });

    return unsubscribe;
  }, [sessionId, isOwner, currentUserId]); // ✅ Added isOwner and currentUserId to re-subscribe if they change

  // ==================== PLAYBACK CONTROLS ====================
  // Note: Chọn track mới chỉ owner được phép, nhưng điều khiển playback (play/pause/seek) tất cả participants đều được phép

  const play = useCallback((track?: Track) => {
    const audio = audioRef.current;
    const currentState = playbackStateRef.current; // Use Ref for latest state
    const targetTrack = track || currentState.currentTrack;

    // ✅ Phân biệt: Chọn track mới vs Resume track đang phát
    const isSelectingNewTrack = track && (
      !currentState.currentTrack ||
      track.id !== currentState.currentTrack.id
    );

    // Chọn track mới: chỉ owner được phép
    if (isSelectingNewTrack && !isOwner) {
      console.warn('⚠️ Only owner can select new track');
      onError?.('Chỉ chủ dự án mới có thể chọn bài hát mới để phát');
      return;
    }

    // Resume track đang phát: tất cả participants đều được phép
    // (Không cần kiểm tra isOwner)

    if (!targetTrack) {
      console.warn('⚠️ No track to play');
      return;
    }

    console.log('🎬 === PLAY CALLED ===', {
      trackId: targetTrack.id,
      title: targetTrack.title,
      url: targetTrack.url,
      hasPendingPlay: !!playPromiseRef.current,
      currentAudioSrc: audio.src,
      readyState: audio.readyState,
      paused: audio.paused
    });

    // 🛡️ DEBOUNCE: Prevent same track from being played multiple times within 500ms
    const now = Date.now();
    if (lastPlayCallRef.current &&
      lastPlayCallRef.current.trackId === targetTrack.id &&
      now - lastPlayCallRef.current.timestamp < 500) {
      console.warn('⚠️ Ignoring duplicate play() call (debounced)');
      return;
    }
    lastPlayCallRef.current = { trackId: targetTrack.id, timestamp: now };

    // Validate URL - Must not be empty
    if (!targetTrack.url || targetTrack.url.trim() === '') {
      console.error('❌ Invalid track URL:', targetTrack);
      onError?.('Invalid track URL');
      return;
    }

    // ✅ Allow both absolute URLs (http/https) AND relative paths (for local files)
    console.log('▶️ Playing track:', {
      id: targetTrack.id,
      title: targetTrack.title,
      url: targetTrack.url
    });

    // Reset last error to allow new errors
    lastErrorRef.current = '';

    // 🛡️ CRITICAL: Cancel any pending play before starting new one
    if (playPromiseRef.current) {
      console.log('⚠️ Canceling previous play promise...');
      audio.pause(); // This will abort the pending play() promise
      playPromiseRef.current = null;
    }

    // ✅ Check if URL is HLS (.m3u8)
    const isHlsUrl = targetTrack.url?.endsWith('.m3u8') || targetTrack.hlsPlaybackUrl?.endsWith('.m3u8');
    const hlsUrl = targetTrack.hlsPlaybackUrl || targetTrack.url;

    // ✅ FIX: Check isNewTrack by comparing track ID using REF (not state)
    // Because playbackState in useCallback has stale closure issue
    const isNewTrack = currentTrackIdRef.current !== targetTrack.id;

    // ✅ FIX: For HLS resume, we need to save current position BEFORE any changes
    const savedPosition = audio.currentTime;

    // ✅ FIX: Only cleanup HLS instance if playing a DIFFERENT track
    if (hlsRef.current && isNewTrack) {
      console.log('🧹 Cleaning up previous HLS instance (new track)');
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // ✅ FIX: HLS Resume - If resuming same HLS track, just call play() directly
    console.log('🔍 HLS Resume check:', {
      isNewTrack,
      isHlsUrl,
      hasHlsRef: !!hlsRef.current,
      savedPosition,
      currentTrackIdRef: currentTrackIdRef.current,
      targetTrackId: targetTrack.id
    });

    if (!isNewTrack && isHlsUrl && hlsRef.current) {
      console.log('▶️ Resuming HLS track from:', savedPosition);
      playPromiseRef.current = audio.play()
        .then(() => {
          playPromiseRef.current = null;
          console.log('✅ HLS resume successful');
          currentTrackIdRef.current = targetTrack.id; // ✅ Update ref
          setPlaybackState(prev => ({
            ...prev,
            currentTrack: targetTrack,
            isPlaying: true
          }));

          // Broadcast PLAY event for resume (with current position)
          if (!isRemoteCommandRef.current) {
            websocketService.sendMusicEvent(sessionId, {
              action: 'PLAY',
              trackId: targetTrack.id,
              fileId: targetTrack.id,
              fileName: targetTrack.title,
              fileUrl: targetTrack.url,
              position: savedPosition,
              duration: targetTrack.duration,
              artist: targetTrack.artist,
              roomType: targetTrack.roomType,
              voiceTagEnabled: targetTrack.voiceTagEnabled,
              version: targetTrack.version
            });
            console.log('✅ PLAY event sent (HLS resume)');
          }
        })
        .catch((err) => {
          playPromiseRef.current = null;
          if (err.name !== 'AbortError') {
            console.error('❌ HLS resume failed:', err);
            onError?.('Failed to resume HLS track');
          }
        });
      return; // Exit early for HLS resume
    }

    if (isNewTrack) {
      console.log('🔄 Setting up new track:', {
        url: targetTrack.url,
        isHls: isHlsUrl,
        hlsUrl
      });

      if (isHlsUrl && hlsUrl) {
        // Use HLS.js for .m3u8 files
        if (Hls.isSupported()) {
          console.log('📺 Using HLS.js for playback');
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true, // ✅ Enable for faster sync
            backBufferLength: 30, // Reduce back buffer
            maxBufferLength: 10, // Reduce max buffer for faster start
            maxMaxBufferLength: 30,
            xhrSetup: (xhr) => {
              xhr.withCredentials = false;
            },
          });

          hls.loadSource(hlsUrl);
          hls.attachMedia(audio);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('✅ HLS manifest parsed');
            audio.currentTime = 0;
            playPromiseRef.current = audio.play()
              .then(() => {
                playPromiseRef.current = null;
                console.log('✅ HLS playback started successfully');
                currentTrackIdRef.current = targetTrack.id; // ✅ Update ref
                setPlaybackState(prev => ({
                  ...prev,
                  currentTrack: targetTrack,
                  isPlaying: true
                }));

                // ✅ FIX: Broadcast PLAY event for HLS files
                // Previously this code was after "return" and never executed for HLS
                if (!isRemoteCommandRef.current) {
                  websocketService.sendMusicEvent(sessionId, {
                    action: 'PLAY',
                    trackId: targetTrack.id,
                    fileId: targetTrack.id,
                    fileName: targetTrack.title,
                    fileUrl: targetTrack.url,
                    position: 0,
                    duration: targetTrack.duration,
                    artist: targetTrack.artist,
                    roomType: targetTrack.roomType,
                    voiceTagEnabled: targetTrack.voiceTagEnabled,
                    version: targetTrack.version
                  });
                  console.log('✅ PLAY event sent (HLS)');
                }
              })
              .catch((err) => {
                playPromiseRef.current = null;
                console.error('❌ HLS play failed:', err);
                setPlaybackState(prev => ({
                  ...prev,
                  currentTrack: targetTrack,
                  isPlaying: false
                }));
                if (err.name !== 'AbortError') {
                  onError?.('Failed to play HLS track');
                }
              });
          });

          hls.on(Hls.Events.ERROR, (_event, data) => {
            console.error('❌ HLS error:', data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('🔄 Attempting to recover from network error');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('🔄 Attempting to recover from media error');
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('❌ Fatal HLS error, cannot recover');
                  hls.destroy();
                  onError?.('HLS playback error');
                  break;
              }
            }
          });

          hlsRef.current = hls;
          return; // Exit early, play() will be called in MANIFEST_PARSED event
        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari native HLS support
          console.log('📺 Using Safari native HLS support');
          audio.src = hlsUrl;
          audio.currentTime = 0;
        } else {
          console.error('❌ HLS not supported in this browser');
          onError?.('Trình duyệt không hỗ trợ phát HLS');
          return;
        }
      } else {
        // Regular audio file (mp3, wav, etc.)
        console.log('🎵 Using regular audio playback');
        audio.src = targetTrack.url;
        audio.currentTime = 0;
      }
    } else {
      console.log('▶️ Resuming same track from:', audio.currentTime);
    }

    console.log('▶️ Calling audio.play()...');
    // Start new play() and store promise
    playPromiseRef.current = audio.play()
      .then(() => {
        playPromiseRef.current = null;
        console.log('✅ Play started successfully');
        currentTrackIdRef.current = targetTrack.id; // ✅ Update ref
        // Update state AFTER successful play
        setPlaybackState(prev => ({
          ...prev,
          currentTrack: targetTrack,
          isPlaying: true
        }));
      })
      .catch((err) => {
        playPromiseRef.current = null;
        console.log('❌ Play promise rejected:', {
          name: err.name,
          message: err.message,
          isAbortError: err.name === 'AbortError'
        });
        // Update state on error
        setPlaybackState(prev => ({
          ...prev,
          currentTrack: targetTrack,
          isPlaying: false
        }));

        // Only log if not AbortError
        if (err.name !== 'AbortError') {
          console.error('❌ Failed to play track:', err);
          onError?.('Failed to play track');
        } else {
          console.log('⏸️ Play aborted (user paused)');
        }
      });

    // Broadcast to all participants (websocketService auto-adds triggeredByUserId)
    // ✅ Only broadcast if not a remote command (to avoid echo)
    if (!isRemoteCommandRef.current) {
      websocketService.sendMusicEvent(sessionId, {
        action: 'PLAY',
        trackId: targetTrack.id,
        fileId: targetTrack.id,      // ✅ Backend expects fileId
        fileName: targetTrack.title,  // ✅ For display
        fileUrl: targetTrack.url,    // ✅ For sync playback
        position: isNewTrack ? 0 : audio.currentTime, // ✅ Resume from current position if same track
        duration: targetTrack.duration, // ✅ Add duration for display
        artist: targetTrack.artist,    // ✅ Add artist info
        roomType: targetTrack.roomType, // ✅ Add room type
        voiceTagEnabled: targetTrack.voiceTagEnabled, // ✅ Add voice tag info
        version: targetTrack.version   // ✅ Add version info
      });
    }
  }, [isOwner, sessionId, onError]); // ✅ Removed playbackState.currentTrack to prevent re-creation loop

  const pause = useCallback(() => {
    // ✅ Tất cả participants đều có thể pause (không cần kiểm tra isOwner)

    console.log('⏸️ === PAUSE CALLED ===');
    const audio = audioRef.current;

    // 🛡️ CRITICAL: Wait for play() promise before pausing
    if (playPromiseRef.current) {
      console.log('⏸️ Waiting for play promise to resolve before pausing...');
      playPromiseRef.current
        .then(() => {
          console.log('⏸️ Play completed, now pausing');
          audio.pause();
        })
        .catch(() => {
          console.log('⏸️ Play failed, pausing anyway');
          audio.pause();
        })
        .finally(() => {
          playPromiseRef.current = null;
        });
    } else {
      console.log('⏸️ No pending play, pausing immediately');
      audio.pause();
    }

    setPlaybackState(prev => ({ ...prev, isPlaying: false }));

    websocketService.sendMusicEvent(sessionId, {
      action: 'PAUSE',
      position: audio.currentTime
    });
  }, [isOwner, sessionId]);

  const togglePlayPause = useCallback(() => {
    // ✅ Use ref to check current state freely without side effects in setState
    const currentState = playbackStateRef.current;

    if (currentState.isPlaying) {
      pause();
    } else {
      // Resume track đang phát: tất cả participants đều được phép
      if (currentState.currentTrack) {
        play(currentState.currentTrack); // Gọi play() với currentTrack (không phải track mới)
      } else {
        console.warn('⚠️ No track loaded. Please select a track first.');
        // Nếu không có track đang phát, chỉ owner mới có thể chọn track mới
        if (!isOwner) {
          onError?.('Chưa có bài nhạc đang phát. Chỉ chủ dự án có thể chọn bài hát mới.');
        }
      }
    }
  }, [play, pause, isOwner, onError]);

  const seek = useCallback((position: number) => {
    // ✅ Tất cả participants đều có thể seek (không cần kiểm tra isOwner)

    const audio = audioRef.current;
    audio.currentTime = position;

    setPlaybackState(prev => ({ ...prev, currentTime: position }));

    websocketService.sendMusicEvent(sessionId, {
      action: 'SEEK',
      position
    });
  }, [isOwner, sessionId]);

  const next = useCallback(() => {
    // ✅ Tất cả participants đều có thể next (nếu đã có track đang phát)
    const { currentTrack, queue } = playbackStateRef.current; // Use Ref!

    if (!currentTrack) {
      if (!isOwner) {
        onError?.('Chưa có bài nhạc đang phát. Chỉ chủ dự án có thể chọn bài hát mới.');
      }
      return;
    }

    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      const nextTrack = queue[currentIndex + 1];
      if (nextTrack) {
        // Next track trong queue: chỉ owner được phép (vì đây là chọn track mới)
        if (!isOwner) {
          onError?.('Chỉ chủ dự án mới có thể chọn bài hát mới để phát');
          return;
        }
        play(nextTrack);
      }
    }
  }, [play, isOwner, onError]);

  const previous = useCallback(() => {
    // ✅ Tất cả participants đều có thể previous (nếu đã có track đang phát)
    const { currentTrack, queue } = playbackState;
    if (!currentTrack) {
      if (!isOwner) {
        onError?.('Chưa có bài nhạc đang phát. Chỉ chủ dự án có thể chọn bài hát mới.');
      }
      return;
    }

    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      const prevTrack = queue[currentIndex - 1];
      if (prevTrack) {
        // Previous track trong queue: chỉ owner được phép (vì đây là chọn track mới)
        if (!isOwner) {
          onError?.('Chỉ chủ dự án mới có thể chọn bài hát mới để phát');
          return;
        }
        play(prevTrack);
      }
    }
  }, [playbackState, play, isOwner, onError]);

  const stop = useCallback(() => {
    // ✅ Tất cả participants đều có thể stop (không cần kiểm tra isOwner)

    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;

    setPlaybackState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0
    }));

    websocketService.sendMusicEvent(sessionId, {
      action: 'STOP'
    });
  }, [isOwner, sessionId]);

  const setVolume = useCallback((newVolume: number) => {
    const audio = audioRef.current;
    const clampedVolume = Math.max(0, Math.min(1, newVolume));

    console.log('🔊 Setting volume:', { from: audio.volume, to: clampedVolume });
    audio.volume = clampedVolume;
    setPlaybackState(prev => ({ ...prev, volume: clampedVolume }));

    // Volume is local only, không broadcast
  }, []);

  // ==================== QUEUE MANAGEMENT (OWNER ONLY) ====================

  const addToQueue = useCallback((track: Track) => {
    if (!isOwner) return;

    setPlaybackState(prev => ({
      ...prev,
      queue: [...prev.queue, track]
    }));
  }, [isOwner]);

  const removeFromQueue = useCallback((trackId: number) => {
    if (!isOwner) return;

    setPlaybackState(prev => ({
      ...prev,
      queue: prev.queue.filter(t => t.id !== trackId)
    }));
  }, [isOwner]);

  const clearQueue = useCallback(() => {
    if (!isOwner) return;

    setPlaybackState(prev => ({
      ...prev,
      queue: []
    }));
  }, [isOwner]);

  // ==================== EXPOSE WINDOW CONTROLS FOR REMOTE SYNC ====================

  // Internal play function (can be called by remote sync)
  const internalPlay = useCallback((track: Track, position: number = 0) => {
    const audio = audioRef.current;

    // Validate URL - Allow both absolute and relative paths
    if (!track.url || track.url.trim() === '') {
      console.error('❌ Invalid track URL (empty):', track.url);
      return;
    }

    console.log('🎵 Internal play:', track.title, 'at position:', position);

    // Reset error
    lastErrorRef.current = '';

    // Cancel any pending play
    if (playPromiseRef.current) {
      audio.pause();
      playPromiseRef.current = null;
    }

    // Set as remote command to avoid broadcasting
    isRemoteCommandRef.current = true;

    // Check if URL is HLS (.m3u8)
    const isHlsUrl = track.url?.endsWith('.m3u8') || track.hlsPlaybackUrl?.endsWith('.m3u8');
    const hlsUrl = track.hlsPlaybackUrl || track.url;

    // ✅ FIX: Check if same track already loaded (for resume case)
    const isSameTrack = currentTrackIdRef.current === track.id;

    console.log('🔍 internalPlay track check:', {
      currentTrackId: currentTrackIdRef.current,
      newTrackId: track.id,
      isSameTrack,
      isHlsUrl,
      hasHlsRef: !!hlsRef.current,
      position
    });

    // ✅ FIX: If same HLS track and HLS already loaded, just seek and play
    if (isSameTrack && isHlsUrl && hlsRef.current) {
      console.log('▶️ Internal HLS resume: seeking to', position, 'and playing');
      audio.currentTime = position;
      playPromiseRef.current = audio.play()
        .then(() => {
          playPromiseRef.current = null;
          console.log('✅ Internal HLS resume successful');
          setPlaybackState(prev => ({
            ...prev,
            currentTrack: track,
            isPlaying: true
          }));
          isRemoteCommandRef.current = false;
        })
        .catch((err) => {
          playPromiseRef.current = null;
          isRemoteCommandRef.current = false;
          if (err.name !== 'AbortError') {
            console.error('❌ Internal HLS resume failed:', err);
          }
        });
      return; // Exit early for HLS resume
    }

    // Cleanup previous HLS instance if exists (only for new track)
    if (hlsRef.current) {
      console.log('🧹 Cleaning up previous HLS instance for new track');
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHlsUrl && hlsUrl) {
      // Use HLS.js for .m3u8 files
      if (Hls.isSupported()) {
        console.log('📺 Internal play: Using HLS.js for playback');
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true, // ✅ Enable for faster sync
          backBufferLength: 30,
          maxBufferLength: 10,
          maxMaxBufferLength: 30,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          },
        });

        hls.loadSource(hlsUrl);
        hls.attachMedia(audio);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ Internal HLS manifest parsed');
          audio.currentTime = position;
          playPromiseRef.current = audio.play()
            .then(() => {
              playPromiseRef.current = null;
              console.log('✅ Internal HLS playback started');
              currentTrackIdRef.current = track.id; // ✅ Update ref
              setPlaybackState(prev => ({
                ...prev,
                currentTrack: track,
                isPlaying: true
              }));
              isRemoteCommandRef.current = false;
            })
            .catch((err) => {
              playPromiseRef.current = null;
              setPlaybackState(prev => ({
                ...prev,
                currentTrack: track,
                isPlaying: false
              }));
              isRemoteCommandRef.current = false;
              if (err.name !== 'AbortError') {
                console.error('❌ Internal HLS play failed:', err);
                onError?.('Failed to play HLS track');
              }
            });
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.error('❌ Internal HLS error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                onError?.('HLS playback error');
                isRemoteCommandRef.current = false;
                break;
            }
          }
        });

        hlsRef.current = hls;
        return; // Exit early, play() will be called in MANIFEST_PARSED event
      } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        console.log('📺 Internal play: Using Safari native HLS support');
        audio.src = hlsUrl;
        audio.currentTime = position;
        playPromiseRef.current = audio.play()
          .then(() => {
            playPromiseRef.current = null;
            console.log('✅ Internal remote playback started');
            currentTrackIdRef.current = track.id; // ✅ Update ref
            setPlaybackState(prev => ({
              ...prev,
              currentTrack: track,
              isPlaying: true
            }));
            isRemoteCommandRef.current = false;
          })
          .catch((err) => {
            playPromiseRef.current = null;
            setPlaybackState(prev => ({
              ...prev,
              currentTrack: track,
              isPlaying: false
            }));
            isRemoteCommandRef.current = false;
            if (err.name !== 'AbortError') {
              console.error('❌ Remote play failed:', err);
              onError?.('Failed to play track');
            }
          });
        return;
      } else {
        console.error('❌ HLS not supported in this browser');
        onError?.('Trình duyệt không hỗ trợ phát HLS');
        isRemoteCommandRef.current = false;
        return;
      }
    }

    // Regular audio file (mp3, wav, etc.)
    audio.src = track.url;
    audio.currentTime = position;

    playPromiseRef.current = audio.play()
      .then(() => {
        playPromiseRef.current = null;
        console.log('✅ Remote playback started');
        currentTrackIdRef.current = track.id; // ✅ Update ref
        setPlaybackState(prev => ({
          ...prev,
          currentTrack: track,
          isPlaying: true
        }));
      })
      .catch((err) => {
        playPromiseRef.current = null;
        setPlaybackState(prev => ({
          ...prev,
          currentTrack: track,
          isPlaying: false
        }));
        if (err.name !== 'AbortError') {
          console.error('❌ Remote play failed:', err);
          onError?.('Failed to play track');
        }
      })
      .finally(() => {
        isRemoteCommandRef.current = false;
      });
  }, [onError]);

  // Internal pause function
  const internalPause = useCallback(() => {
    const audio = audioRef.current;

    console.log('⏸️ Internal pause');
    isRemoteCommandRef.current = true;

    // 🛡️ Handle pending play promise properly
    if (playPromiseRef.current) {
      playPromiseRef.current
        .then(() => {
          audio.pause();
        })
        .catch(() => {
          // Play was aborted, still try to pause
          audio.pause();
        })
        .finally(() => {
          playPromiseRef.current = null;
          isRemoteCommandRef.current = false;
        });
    } else {
      audio.pause();
      isRemoteCommandRef.current = false;
    }

    setPlaybackState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  // Internal seek function
  const internalSeek = useCallback((position: number) => {
    const audio = audioRef.current;

    console.log('⏩ Internal seek to:', position);
    isRemoteCommandRef.current = true;

    audio.currentTime = position;
    setPlaybackState(prev => ({ ...prev, currentTime: position }));

    isRemoteCommandRef.current = false;
  }, []);

  // Internal stop function
  const internalStop = useCallback(() => {
    const audio = audioRef.current;

    console.log('⏹️ Internal stop');
    isRemoteCommandRef.current = true;

    audio.pause();
    audio.currentTime = 0;
    setPlaybackState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0
    }));

    isRemoteCommandRef.current = false;
  }, []);

  // ✅ Update refs whenever internal functions change
  useEffect(() => {
    internalPlayRef.current = internalPlay;
    internalPauseRef.current = internalPause;
    internalSeekRef.current = internalSeek;
    internalStopRef.current = internalStop;
  }, [internalPlay, internalPause, internalSeek, internalStop]);

  // Expose controls on window (like reference project)
  // ✅ Update controls whenever internal functions change
  useEffect(() => {
    (window as any).audioPlayerControls = {
      play: internalPlay,
      pause: internalPause,
      seekTo: internalSeek,
      stop: internalStop,
    };

    console.log('✅ audioPlayerControls exposed/updated on window', {
      hasPlay: !!internalPlay,
      hasPause: !!internalPause,
      hasSeek: !!internalSeek,
      hasStop: !!internalStop
    });

    return () => {
      delete (window as any).audioPlayerControls;
      console.log('🗑️ audioPlayerControls cleaned up');
    };
  }, [internalPlay, internalPause, internalSeek, internalStop]); // ✅ Update when functions change

  // ✅ CRITICAL: Cleanup audio and HLS when component unmounts (user leaves room)
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      console.log('🛑 useMusicPlayer unmounting - stopping audio');

      // Cleanup HLS
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Stop playback
      audio.pause();

      // Clear source to prevent memory leaks
      audio.src = '';
      audio.load();

      // Reset to beginning
      audio.currentTime = 0;
    };
  }, []);

  return {
    playbackState,
    milestones, // Export milestones for UI
    play,
    pause,
    togglePlayPause,
    seek,
    next,
    previous,
    stop,
    setVolume,
    addToQueue,
    removeFromQueue,
    clearQueue,
    audioRef
  };
};
