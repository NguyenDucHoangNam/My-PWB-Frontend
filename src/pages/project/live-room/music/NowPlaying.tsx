import React from 'react';
import { motion } from 'framer-motion';
import { Music, Disc } from 'lucide-react';
import type { Track } from '../../../../types/music';

interface NowPlayingProps {
  track: Track | null;
  isPlaying: boolean;
}

const NowPlaying: React.FC<NowPlayingProps> = ({ track, isPlaying }) => {
  if (!track) {
    return (
      <div className="px-4 py-6 flex flex-col items-center justify-center text-gray-400">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-gradient-to-br from-purple-700 via-pink-600 to-blue-600 rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
        >
          <Music size={36} className="text-gray-200" />
        </motion.div>
        <p className="text-sm text-gray-200">Chưa có bài nhạc</p>
        <p className="text-xs text-gray-400 mt-1">Chọn bài để phát</p>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 bg-black/30 backdrop-blur-md rounded-2xl border border-purple-700/30 shadow-lg flex items-center gap-4">
      {/* Album Art */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.6)]"
      >
        <div className="w-full h-full bg-gradient-to-br from-purple-700/20 via-pink-500/20 to-blue-500/20 flex items-center justify-center rounded-xl">
          {track.coverUrl ? (
            <img
              src={track.coverUrl}
              alt={track.title}
              className={`w-full h-full object-cover rounded-xl ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
            />
          ) : (
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 6, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
            >
              <Disc size={48} className="text-purple-400" />
            </motion.div>
          )}
        </div>

        {/* Playing Indicator */}
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-white rounded-full"
            />
            PLAY
          </motion.div>
        )}
      </motion.div>

      {/* Track Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <h3 className="text-white font-bold text-sm truncate drop-shadow-lg">{track.title}</h3>
        <p className="text-purple-300 text-xs truncate drop-shadow-sm">{track.artist}</p>

        {/* Metadata Badges */}
        <div className="flex gap-2 mt-1">
          {track.genre && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-purple-700/30 text-purple-300 rounded-full shadow-[0_0_5px_rgba(168,85,247,0.6)]">
              {track.genre}
            </span>
          )}
          {track.bpm && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-700/30 text-blue-300 rounded-full shadow-[0_0_5px_rgba(59,130,246,0.6)]">
              {track.bpm} BPM
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;

