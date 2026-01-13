// src/pages/project/live-room/video/RemoteVideoPlayer.tsx

import React, { useEffect, useRef, useState } from 'react';
import { VideoOff, Mic, MicOff, WifiOff } from 'lucide-react';
import type { IRemoteVideoTrack, IRemoteAudioTrack, UID } from 'agora-rtc-sdk-ng';

interface RemoteVideoPlayerProps {
  uid: UID;
  videoTrack?: IRemoteVideoTrack;
  audioTrack?: IRemoteAudioTrack;
  hasVideo: boolean;
  userName?: string;
  isOnline?: boolean;
  hasAudio?: boolean;
}

const RemoteVideoPlayer: React.FC<RemoteVideoPlayerProps> = ({
  uid,
  videoTrack,
  audioTrack,
  hasVideo,
  userName = `User ${uid}`,
  isOnline = true,
  hasAudio = true
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // 🎤 Voice activity detection

  useEffect(() => {
    let mounted = true;

    const setupVideo = async () => {
      if (videoTrack && videoRef.current && hasVideo) {
        try {
          console.log('🎥 Playing remote video for:', userName);

          // Clear existing content
          if (videoRef.current) {
            videoRef.current.innerHTML = '';
          }

          // Play remote video
          videoTrack.play(videoRef.current);

          if (mounted) {
            setIsVideoReady(true);
            console.log('✅ Remote video ready for:', userName);
          }
        } catch (error) {
          console.error('❌ Failed to play remote video:', error);
          setIsVideoReady(false);
        }
      } else {
        setIsVideoReady(false);
        console.log('📹 Remote video disabled for:', userName);
      }
    };

    setupVideo();

    return () => {
      mounted = false;
      setIsVideoReady(false);
    };
  }, [videoTrack, hasVideo, userName]);

  // ✅ CRITICAL FIX: Play audio track + Voice Activity Detection
  useEffect(() => {
    if (audioTrack && hasAudio) {
      try {
        console.log('🔊 Playing remote audio for:', userName);
        audioTrack.play();
        console.log('✅ Remote audio started for:', userName);

        // 🎤 Voice Activity Detection
        const volumeInterval = setInterval(() => {
          try {
            const volume = audioTrack.getVolumeLevel();
            // Threshold: 0.1 = speaking detected
            setIsSpeaking(volume > 0.1);
          } catch (err) {
            // Ignore volume check errors
          }
        }, 100); // Check every 100ms

        return () => {
          clearInterval(volumeInterval);
          setIsSpeaking(false);
        };
      } catch (error) {
        console.error('❌ Failed to play remote audio:', error);
      }
    } else {
      setIsSpeaking(false);
    }

    return () => {
      if (audioTrack) {
        try {
          audioTrack.stop();
          console.log('🛑 Stopped remote audio for:', userName);
        } catch (error) {
          console.error('Failed to stop remote audio:', error);
        }
      }
    };
  }, [audioTrack, hasAudio, userName]);

  return (
    <div className={`relative w-full h-full bg-gray-900 rounded-xl overflow-hidden transition-all duration-200 border border-gray-700/50 ${isSpeaking && hasAudio
        ? 'scale-[1.02]'
        : ''
      }`}>
      {/* Inner border glow when speaking */}
      {isSpeaking && hasAudio && (
        <div className="absolute inset-0 border-4 border-green-400 rounded-xl pointer-events-none z-20 shadow-[inset_0_0_30px_rgba(34,197,94,0.8),inset_0_0_60px_rgba(34,197,94,0.4)]" />
      )}
      {/* Video or Placeholder */}
      {hasVideo && videoTrack ? (
        <div className="relative w-full h-full">
          {/* Video Container */}
          <div
            ref={videoRef}
            className="w-full h-full object-cover"
          />

          {/* Loading Overlay */}
          {!isVideoReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90 backdrop-blur-sm">
              <div className="text-center text-white">
                <div className="relative mx-auto mb-2 w-8 h-8">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md"></div>
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full relative z-10"></div>
                </div>
                <p className="text-sm text-gray-300">Loading video...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Camera Off State
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          {!isOnline ? (
            // Offline State
            <>
              <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-xl opacity-50">
                {userName.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-gray-500 font-semibold mb-2">{userName}</h3>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <WifiOff size={14} />
                Offline
              </div>
            </>
          ) : (
            // Camera Off but Online
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-xl">
                {userName.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-white font-semibold mb-2">{userName}</h3>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <VideoOff size={14} />
                Camera is off
              </div>
            </>
          )}
        </div>
      )}

      {/* Bottom Overlay - Only show if online */}
      {isOnline && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">{userName}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Audio Status - Small indicator */}
              <div className={`p-1 rounded-full ${hasAudio ? 'bg-green-600/30' : 'bg-red-600/30'}`}>
                {hasAudio ? (
                  <Mic size={12} className="text-green-400" />
                ) : (
                  <MicOff size={12} className="text-red-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status Indicator */}
      {!isOnline && (
        <div className="absolute top-3 right-3 bg-red-500/20 border border-red-500/40 p-2 rounded-lg backdrop-blur-sm">
          <WifiOff size={16} className="text-red-400" />
        </div>
      )}
    </div>
  );
};

export default RemoteVideoPlayer;

