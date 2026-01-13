// src/pages/project/live-room/music/MusicPlayer.tsx
// Chính

import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  List,
  StickyNote,
  X,
} from "lucide-react";
import { useMusicPlayer } from "../../../../component/hooks/useMusicPlayer";
import NowPlaying from "./NowPlaying";
import MusicControls from "./MusicControls";
import WaveSurferPlayer from "./WaveSurferPlayer";
import QueueLibrary from "./QueueLibrary";
import WaveformMarkers from "./WaveformMarkers";
import StaticWaveform from "./StaticWaveform";
import type { TrackNote } from "../../../../types/session";

interface MusicPlayerProps {
  sessionId: string;
  isOwner: boolean;
  currentUserId?: number; // Add currentUserId
  centered?: boolean; // New prop for centered layout
  onMilestonesReady?: (milestones: any[]) => void; // Callback to expose milestones
  onQueueReady?: (queue: any[]) => void; // Callback to expose queue
  onPlayTrack?: (playFn: (track: any) => void) => void; // Callback to expose play function

  // New props for Sidebar integration
  trackNotes?: TrackNote[];
  onToggleNotes?: () => void;
  onTrackChange?: (track: any) => void;
  onTimeUpdate?: (time: number) => void;
  onSeekReady?: (seekFn: (time: number) => void) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  sessionId,
  isOwner,
  currentUserId,
  centered = false,
  onQueueReady,
  onPlayTrack,
  trackNotes = [], // Default empty
  onToggleNotes,
  onTrackChange,
  onTimeUpdate,
  onSeekReady,
  onMilestonesReady,
}) => {
  // State for queue visibility
  const [showQueue, setShowQueue] = useState(false);

  // Internal notes state removed in favor of props
  // const [trackNotes, setTrackNotes] = useState<TrackNote[]>([]);
  // const [showNotes, setShowNotes] = useState(false); // Also removed

  // ✅ Memoize onError callback to prevent useEffect cleanup
  const handleError = useCallback((error: string) => {
    console.error("Music player error:", error);
  }, []);

  const {
    playbackState,
    milestones,
    play,
    togglePlayPause,
    seek,
    next,
    previous,
    setVolume,
    audioRef,
  } = useMusicPlayer({
    sessionId,
    isOwner,
    currentUserId, // Pass currentUserId
    onError: handleError,
  });

  const { currentTrack, isPlaying, currentTime, duration, volume, queue } =
    playbackState;

  // Expose milestones to parent
  useEffect(() => {
    if (milestones && onMilestonesReady) {
      onMilestonesReady(milestones);
    }
  }, [milestones, onMilestonesReady]);

  // Expose queue to parent
  useEffect(() => {
    if (queue && onQueueReady) {
      onQueueReady(queue);
    }
  }, [queue, onQueueReady]);

  // Expose play function to parent
  useEffect(() => {
    if (onPlayTrack) {
      onPlayTrack(play);
    }
  }, [play, onPlayTrack]);

  // Notify parent of track change
  useEffect(() => {
    if (onTrackChange && currentTrack) {
      onTrackChange(currentTrack);
    }
  }, [currentTrack?.id, onTrackChange]);

  // Notify parent of time update
  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(currentTime);
    }
  }, [currentTime, onTimeUpdate]);

  // Expose seek function to parent when ready
  useEffect(() => {
    if (onSeekReady) {
      onSeekReady(seek);
    }
  }, [onSeekReady, seek]);

  // Check if has next/previous tracks
  const hasNext = useMemo(() => {
    if (!currentTrack) return false;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    return currentIndex !== -1 && currentIndex < queue.length - 1;
  }, [currentTrack, queue]);

  const hasPrevious = useMemo(() => {
    if (!currentTrack) return false;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    return currentIndex > 0;
  }, [currentTrack, queue]);

  // Keyboard shortcuts (moved after all variables are declared)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          isOwner && togglePlayPause();
          break;
        case "arrowleft":
          e.preventDefault();
          if (isOwner && audioRef.current) {
            seek(Math.max(0, currentTime - 5));
          }
          break;
        case "arrowright":
          e.preventDefault();
          if (isOwner && audioRef.current) {
            seek(Math.min(duration, currentTime + 5));
          }
          break;
        case "arrowup":
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case "n":
          e.preventDefault();
          isOwner && hasNext && next();
          break;
        case "p":
          e.preventDefault();
          isOwner && hasPrevious && previous();
          break;
        case "m":
          e.preventDefault();
          setVolume(volume > 0 ? 0 : 0.7);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    isOwner,
    togglePlayPause,
    currentTime,
    duration,
    volume,
    hasNext,
    hasPrevious,
    next,
    previous,
    seek,
    setVolume,
    audioRef,
  ]);

  if (centered) {
    // Full-screen waveform layout with overlays
    const audioSrc = currentTrack?.hlsPlaybackUrl || currentTrack?.url || "";
    const isHls = audioSrc?.endsWith('.m3u8');

    return (
      <div className="h-full flex overflow-hidden relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Waveform Container - Resizes when queue opens */}
        <div
          className={`flex-1 relative transition-all duration-300 flex items-center justify-center pb-24`}
        >
          {/* Waveform - Maximized size */}
          <div
            className={`relative w-full h-full transition-all duration-500 rounded-2xl px-4 pt-4 ${isPlaying ? "drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]" : ""
              }`}
          >
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none z-20 rounded-2xl" />

            {/* Blur effect for unplayed portion */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10"
              style={{
                backdropFilter: "blur(0px)",
                WebkitBackdropFilter: "blur(0px)",
              }}
            />

            {/* Use StaticWaveform for HLS streams to show full track at once */}
            {isHls && currentTrack ? (
              <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20">
                <StaticWaveform
                  progress={duration > 0 ? currentTime / duration : 0}
                  className="w-full h-full"
                  barCount={150}
                  color="rgba(139, 92, 246, 0.3)"
                  progressColor="rgba(216, 70, 239, 1)"
                  onSeek={(percent) => seek(percent * (duration || 1))}
                />
              </div>
            ) : (
              <WaveSurferPlayer
                audioUrl={currentTrack?.hlsPlaybackUrl || currentTrack?.url}
                audioElement={audioRef.current}
                currentTime={currentTime}
                duration={duration}
                onSeek={(time) => seek(time)}
                className="w-full h-full rounded-2xl"
                height={0} // Will use container height
                notes={[]} // Disable internal markers, using overlay instead
              />
            )}

            {/* Markers Overlay - Visible for both HLS and WaveSurfer */}
            <WaveformMarkers
              notes={trackNotes}
              duration={duration}
              onSeek={seek}
            />


          </div>



          {/* Track Notes Panel removed - moved to Sidebar */}



          {/* Bottom Controls Bar - Enhanced glass morphism */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-between px-6 py-3 border-t border-purple-500/20 shadow-2xl">

            {/* LEFT: Track Info - Expanded width */}
            <div className="flex items-center gap-4 flex-[1.5] min-w-0 mr-4">
              {currentTrack ? (
                <>
                  <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900 border border-white/10 shadow-lg ${isPlaying ? 'ring-2 ring-purple-500/30' : ''}`}>
                    {currentTrack.coverUrl ? (
                      <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-gray-800">
                        <Music className="w-5 h-5 text-purple-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-bold text-xs truncate hover:text-purple-300 transition-colors cursor-default leading-tight mb-0.5" title={currentTrack.title}>
                      {currentTrack.title}
                    </h4>
                    <p className="text-gray-400 text-[10px] truncate hover:text-white transition-colors cursor-default">
                      {currentTrack.artist}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-sm italic">Chưa có bài nhạc</div>
              )}
            </div>

            {/* CENTER: Controls & Seek */}
            <div className="flex flex-col items-center gap-2 flex-[2] max-w-2xl px-4">

              {/* Playback Buttons */}
              <div className="flex items-center gap-6">
                {/* Previous */}
                <button
                  onClick={(e) => { e.stopPropagation(); previous(); }}
                  disabled={!currentTrack || (!isOwner && hasPrevious)}
                  className={`text-gray-400 hover:text-white transition-all transform active:scale-95 ${!currentTrack ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Bài trước"
                >
                  <SkipBack size={24} />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
                  disabled={!currentTrack}
                  className={`relative z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white text-black hover:scale-105 active:scale-95 shadow-lg shadow-white/20 ${!currentTrack ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                </button>

                {/* Next */}
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  disabled={!currentTrack || (!isOwner && hasNext)}
                  className={`text-gray-400 hover:text-white transition-all transform active:scale-95 ${!currentTrack ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Bài tiếp theo"
                >
                  <SkipForward size={24} />
                </button>
              </div>

              {/* Seek Bar & Time */}
              <div className="w-full flex items-center gap-3 text-xs font-mono text-gray-400">
                <span className="min-w-[40px] text-right">
                  {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, "0")}
                </span>

                <div className="flex-1 h-px bg-white/10 mx-2" />

                <span className="min-w-[40px]">
                  {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* RIGHT: Volume & Queue */}
            <div className="flex items-center justify-end gap-4 flex-1 min-w-0 pl-4">
              <div className="flex items-center gap-2 group">
                <button
                  onClick={onToggleNotes}
                  className="p-2 rounded-lg transition-all relative text-gray-400 hover:text-white hover:bg-white/10"
                  title="Ghi chú"
                >
                  <StickyNote size={20} className={trackNotes.length > 0 ? "text-yellow-400" : ""} />
                  {trackNotes.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
                  )}
                </button>
                <div className="w-px h-6 bg-white/10 mx-1" /> {/* Divider */}

                <button
                  onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden relative">
                  <div
                    className="absolute h-full bg-white rounded-full group-hover:bg-purple-400 transition-colors"
                    style={{ width: `${volume * 100}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume * 100}
                    onChange={(e) => setVolume(parseFloat(e.target.value) / 100)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Queue Toggle */}
              <button
                onClick={() => setShowQueue(!showQueue)}
                className={`p-2 rounded-lg transition-all relative ${showQueue
                  ? "text-purple-400 bg-purple-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                title="Danh sách phát"
              >
                <List size={20} />
                {queue.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {queue.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Queue Overlay Panel - Enhanced */}
        {showQueue && (
          <div
            className="w-96 max-h-[calc(100vh-6rem)] bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 backdrop-blur-2xl z-50 border-l border-purple-500/20 flex flex-col flex-shrink-0 shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Queue Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex-shrink-0">
              <h3 className="text-white font-bold text-xl flex items-center gap-3">
                <List className="w-6 h-6 text-purple-400" />
                Danh sách phát
                <span className="text-sm text-purple-400 font-normal">
                  ({queue.length})
                </span>
              </h3>
              <button
                onClick={() => setShowQueue(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Close queue"
              >
                <X size={22} />
              </button>
            </div>

            {/* Queue Library */}
            <div className="flex-1 overflow-hidden">
              <QueueLibrary
                queue={queue}
                currentTrack={currentTrack}
                isOwner={isOwner}
                onPlay={play}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Compact sidebar layout
  return (
    <div className="h-full flex flex-col p-3 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Now Playing - Compact */}
      <NowPlaying track={currentTrack} isPlaying={isPlaying} />

      {/* Controls - Compact */}
      <MusicControls
        isOwner={isOwner}
        isPlaying={isPlaying}
        volume={volume}
        hasCurrentTrack={!!currentTrack}
        onTogglePlayPause={togglePlayPause}
        onPrevious={previous}
        onNext={next}
        onVolumeChange={setVolume}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />

      {/* Queue Section - Compact */}
      {queue.length > 0 && (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col mt-3">
          <h3 className="text-gray-400 text-xs font-semibold mb-2 flex items-center gap-2 flex-shrink-0">
            <span className="text-purple-400">🎵</span>
            Hàng đợi ({queue.length} bài)
          </h3>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-1.5">
              {queue.map((track) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${currentTrack?.id === track.id
                    ? "bg-purple-500/20 border-purple-500/50"
                    : "bg-gray-800/40 border-gray-700/30 hover:border-purple-500/30"
                    }`}
                  onClick={() => isOwner && play(track)}
                >
                  <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">
                      {track.title}
                    </p>
                    <p className="text-gray-400 text-[10px] truncate">
                      {track.artist}
                    </p>
                  </div>
                  {currentTrack?.id === track.id && (
                    <div className="flex-shrink-0">
                      <span className="text-purple-400 text-xs">▶</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;

