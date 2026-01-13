// src/pages/project/live-room/video/LocalVideoPlayer.tsx

import React, { useEffect, useRef, useState } from 'react';
import { VideoOff, Mic, MicOff } from 'lucide-react';
import type { ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

interface LocalVideoPlayerProps {
  videoTrack: ICameraVideoTrack | null;
  audioTrack?: IMicrophoneAudioTrack | null;
  isVideoEnabled: boolean;
  userName?: string;
  isAudioEnabled?: boolean;
}

const LocalVideoPlayer: React.FC<LocalVideoPlayerProps> = ({
  videoTrack,
  audioTrack,
  isVideoEnabled,
  userName = 'You',
  isAudioEnabled = true
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // 🎤 Voice activity detection

  useEffect(() => {
    let mounted = true;

    const setupVideo = async () => {
      if (videoTrack && videoRef.current && isVideoEnabled) {
        try {
          console.log('🎥 Playing video track for:', userName);

          // Clear any existing content
          if (videoRef.current) {
            videoRef.current.innerHTML = '';
          }

          // Play the video
          await videoTrack.play(videoRef.current);

          if (mounted) {
            setIsVideoReady(true);
            console.log('✅ Video ready for:', userName);
          }
        } catch (error) {
          console.error('❌ Failed to play video track:', error);
          setIsVideoReady(false);
        }
      } else {
        setIsVideoReady(false);
        console.log('📹 Video disabled for:', userName);
      }
    };

    setupVideo();

    return () => {
      mounted = false;
      setIsVideoReady(false);

      // Stop video track when component unmounts
      if (videoTrack && videoRef.current) {
        try {
          videoTrack.stop();
          console.log('🛑 Stopped video track for:', userName);
        } catch (error) {
          console.error('Failed to stop video track:', error);
        }
      }
    };
  }, [videoTrack, isVideoEnabled, userName]);

  // 🎤 Voice Activity Detection for local user
  useEffect(() => {
    if (audioTrack && isAudioEnabled) {
      try {
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
        console.error('❌ Failed to detect voice activity:', error);
      }
    } else {
      setIsSpeaking(false);
    }
  }, [audioTrack, isAudioEnabled]);

  return (
    <div className={`relative w-full h-full bg-gray-900 rounded-xl overflow-hidden transition-all duration-200 border border-gray-700/50 ${isSpeaking && isAudioEnabled
        ? 'scale-[1.02]'
        : ''
      }`}>
      {/* Inner border glow when speaking */}
      {isSpeaking && isAudioEnabled && (
        <div className="absolute inset-0 border-4 border-green-400 rounded-xl pointer-events-none z-20 shadow-[inset_0_0_30px_rgba(34,197,94,0.8),inset_0_0_60px_rgba(34,197,94,0.4)]" />
      )}
      {/* Video or Placeholder */}
      {isVideoEnabled && videoTrack ? (
        <div className="relative w-full h-full">
          {/* Video Container */}
          <div
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror effect applied directly
          />

          {/* Loading Overlay */}
          {!isVideoReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90 backdrop-blur-sm">
              <div className="text-center text-white">
                <div className="relative mx-auto mb-2 w-8 h-8">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md"></div>
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full relative z-10"></div>
                </div>
                <p className="text-sm text-gray-300">Loading camera...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Camera Off State
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-xl">
            {userName.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-white font-semibold mb-2">{userName}</h3>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <VideoOff size={14} />
            Camera is off
          </div>
        </div>
      )}

      {/* Bottom Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-white text-sm font-medium">{userName}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Status */}
            <div className={`p-1 rounded-full ${isAudioEnabled ? 'bg-green-600/30' : 'bg-red-600/30'}`}>
              {isAudioEnabled ? (
                <Mic size={12} className="text-green-400" />
              ) : (
                <MicOff size={12} className="text-red-400" />
              )}
            </div>

            {/* You Badge */}
            <div className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-bold">
              YOU
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalVideoPlayer;

