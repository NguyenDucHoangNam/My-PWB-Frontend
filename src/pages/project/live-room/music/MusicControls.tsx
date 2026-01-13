import React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX
} from 'lucide-react';

interface MusicControlsProps {
  isOwner: boolean;
  isPlaying: boolean;
  volume: number;
  hasCurrentTrack: boolean;
  onTogglePlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onVolumeChange: (volume: number) => void;
  hasNext: boolean;
  hasPrevious: boolean;
  trackTitle?: string;
  trackArtist?: string;
  trackCover?: string;
}

const MusicControls: React.FC<MusicControlsProps> = ({
  isOwner,
  isPlaying,
  volume,
  hasCurrentTrack,
  onTogglePlayPause,
  onPrevious,
  onNext,
  onVolumeChange,
  hasNext,
  hasPrevious,
  trackTitle,
  trackArtist,
  trackCover
}) => {
  return (
    <div className="w-full px-6 py-3 bg-black/80 backdrop-blur-xl border-t border-purple-500/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 rounded-b-none md:rounded-2xl">

      {/* 1. Track Info (Left) */}
      <div className="flex items-center gap-4 w-full md:w-1/3 min-w-0">
        <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900 border border-white/10 shadow-lg ${isPlaying ? 'ring-2 ring-purple-500/30' : ''}`}>
          {trackCover ? (
            <img src={trackCover} alt={trackTitle} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-gray-800">
              <div className={`w-2 h-2 bg-purple-500 rounded-full ${isPlaying ? 'animate-ping' : ''}`} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-white font-bold text-sm truncate leading-tight mb-0.5 group relative cursor-help" title={trackTitle}>
            {trackTitle || "Chưa có bài nhạc"}
          </h4>
          <p className="text-gray-400 text-xs truncate font-medium hover:text-purple-300 transition-colors">
            {trackArtist || "----"}
          </p>
        </div>
      </div>

      {/* 2. Playback Controls (Center) */}
      <div className="flex items-center justify-center gap-6 w-full md:w-auto flex-shrink-0">
        <motion.button
          whileHover={hasCurrentTrack && (isOwner || hasPrevious) ? { scale: 1.1 } : {}}
          whileTap={hasCurrentTrack && (isOwner || hasPrevious) ? { scale: 0.95 } : {}}
          onClick={onPrevious}
          disabled={!hasCurrentTrack || (!isOwner && hasPrevious)}
          className={`p-2 rounded-full transition-all ${hasCurrentTrack && (isOwner || hasPrevious) ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-700 cursor-not-allowed'}`}
        >
          <SkipBack size={22} />
        </motion.button>

        <motion.button
          whileHover={hasCurrentTrack ? { scale: 1.05 } : {}}
          whileTap={hasCurrentTrack ? { scale: 0.95 } : {}}
          onClick={onTogglePlayPause}
          disabled={!hasCurrentTrack}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg shadow-purple-500/20 border border-purple-500/30 ${hasCurrentTrack
              ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white hover:shadow-purple-500/40'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed border-gray-700'
            }`}
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </motion.button>

        <motion.button
          whileHover={hasCurrentTrack && (isOwner || hasNext) ? { scale: 1.1 } : {}}
          whileTap={hasCurrentTrack && (isOwner || hasNext) ? { scale: 0.95 } : {}}
          onClick={onNext}
          disabled={!hasCurrentTrack || (!isOwner && hasNext)}
          className={`p-2 rounded-full transition-all ${hasCurrentTrack && (isOwner || hasNext) ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-700 cursor-not-allowed'}`}
        >
          <SkipForward size={22} />
        </motion.button>
      </div>

      {/* 3. Volume (Right) */}
      <div className="flex items-center gap-3 w-full md:w-1/3 justify-end group">
        <button
          onClick={() => onVolumeChange(volume > 0 ? 0 : 0.7)}
          className="text-gray-400 group-hover:text-white transition-colors"
        >
          {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden relative group/slider">
          <div
            className="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all duration-75"
            style={{ width: `${volume * 100}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value) / 100)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicControls;
