// src/pages/project/live-room/music/WaveSurferPlayer.tsx

import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { motion } from "framer-motion";
import { Music, Radio } from "lucide-react";
import type { TrackNote } from "../../../../types/session";

interface WaveSurferPlayerProps {
  audioUrl?: string;
  audioElement?: HTMLAudioElement | null;
  currentTime?: number;
  duration?: number;
  onSeek?: (time: number) => void;
  className?: string;
  height?: number;
  // Notes prop deprecated - using WaveformMarkers overlay instead
  notes?: TrackNote[];
}

const WaveSurferPlayer: React.FC<WaveSurferPlayerProps> = ({
  audioUrl,
  audioElement,
  currentTime = 0,
  duration = 0,
  onSeek,
  className = "",
  height = 64,
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const audioSrc = audioUrl || audioElement?.src || "";
  const isHls = audioSrc?.endsWith('.m3u8');

  useEffect(() => {
    // Skip WaveSurfer initialization for HLS streams (not supported)
    if (isHls) {
      setIsLoading(false);
      setIsReady(false);
      return;
    }

    if (!waveformRef.current || !audioSrc) return;

    // If we have audioUrl, use it directly; otherwise use audioElement
    if (!audioElement && !audioUrl) return;

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }

    const waveHeight =
      height === 0 ? waveformRef.current.offsetHeight : height;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      ...(audioUrl ? { url: audioUrl } : audioElement ? { media: audioElement } : {}),
      height: waveHeight,
      barWidth: 2,
      barGap: 1,
      barRadius: 3,
      cursorWidth: 3,
      normalize: true,
      interact: true,
      hideScrollbar: true,

      // 🔥 GLOW COLOR STYLE
      waveColor: "rgba(139, 92, 246, 0.20)",
      progressColor: "rgba(216, 70, 239, 1)", // neon hồng + tím
      cursorColor: "#ff2bd1",
    });

    wavesurferRef.current = ws;

    ws.on("ready", () => {
      setIsReady(true);
      setIsLoading(false);
    });

    ws.on("interaction", (seekTime: number) => {
      onSeek?.(seekTime);
    });

    return () => ws.destroy();
  }, [audioElement, audioUrl, audioSrc, height, isHls]);

  // Sync time
  useEffect(() => {
    if (!wavesurferRef.current || !isReady || !duration) return;

    const ws = wavesurferRef.current;
    const wsTime = ws.getCurrentTime();

    if (Math.abs(wsTime - currentTime) > 0.4) {
      ws.seekTo(currentTime / duration);
    }
  }, [currentTime, duration, isReady]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative w-full h-full ${className}`}
    >
      {/* --- ENERGY GLOW BACKLIGHT --- */}
      <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-purple-500/20 blur-3xl animate-pulse-slow" />
      </div>

      {/* --- MOVING NEON BORDER --- */}
      <div className="absolute inset-0 rounded-xl border border-fuchsia-400/40 animate-borderFlow pointer-events-none" />

      {/* --- WAVEFORM --- */}
      <div
        ref={waveformRef}
        className="relative w-full h-full rounded-xl overflow-hidden z-10"
        style={{ minHeight: height === 0 ? "100%" : `${height}px` }}
      />

      {/* --- GRADIENT LIGHT SWEEP --- */}
      <div className="absolute inset-0 pointer-events-none rounded-xl mix-blend-screen overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-lightSweep" />
      </div>

      {(isLoading || isHls) && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-md rounded-xl z-20">
          {isHls ? (
            <div className="flex flex-col items-center gap-3 px-6 py-4">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full"></div>
                <Radio className="w-12 h-12 text-purple-400 relative z-10" />
              </div>
              <div className="text-center">
                <p className="text-purple-300 font-semibold text-base mb-1">Đang phát HLS stream</p>
                <p className="text-gray-400 text-xs">Streaming audio đang được phát</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 py-4">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-blue-600/30 border border-purple-500/30 flex items-center justify-center relative z-10 shadow-lg shadow-purple-500/20">
                  <Music className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-purple-300 font-semibold text-base mb-1">Chưa có bài nhạc</p>
                <p className="text-gray-400 text-xs">Hãy chọn nhạc từ danh sách để phát</p>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default WaveSurferPlayer;
