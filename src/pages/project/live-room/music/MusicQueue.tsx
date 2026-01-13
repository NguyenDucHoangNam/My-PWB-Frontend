// src/pages/project/live-room/music/MusicQueue.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music2, Clock } from 'lucide-react';
import type { Track } from '../../../../types/music';
import { formatDuration } from '../../../../utils/formatDuration';

interface MusicQueueProps {
  queue: Track[];
  currentTrack: Track | null;
  isOwner: boolean;
  onRemove: (trackId: number) => void;  // ✅ Changed to number
  onSelect: (track: Track) => void;
}

const MusicQueue: React.FC<MusicQueueProps> = ({
  queue,
  currentTrack,
  isOwner,
  onRemove,
  onSelect
}) => {
  if (queue.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <Music2 size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">Queue trống</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-2 border-b border-gray-700/50">
        <h4 className="text-white font-semibold text-sm flex items-center gap-2">
          <Music2 size={14} />
          Queue ({queue.length})
        </h4>
      </div>

      <div className="px-2 py-2">
        <AnimatePresence>
          {queue.map((track, index) => {
            const isCurrentTrack = track.id === currentTrack?.id;
            
            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative px-3 py-2 rounded-lg mb-1 transition-all cursor-pointer ${
                  isCurrentTrack
                    ? 'bg-purple-600/20 border border-purple-500/30'
                    : 'hover:bg-gray-700/30'
                }`}
                onClick={() => isOwner && onSelect(track)}
              >
                <div className="flex items-center gap-3">
                  {/* Track Number / Playing Indicator */}
                  <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                    {isCurrentTrack ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-2 h-2 bg-purple-500 rounded-full"
                      />
                    ) : (
                      <span className="text-xs text-gray-500">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isCurrentTrack ? 'text-purple-300' : 'text-white'
                    }`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {track.artist}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={10} />
                      {formatDuration(track.duration)}
                    </span>

                    {/* Remove Button - OWNER only */}
                    {isOwner && !isCurrentTrack && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(track.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/20 rounded transition-all"
                        aria-label="Remove from queue"
                      >
                        <X size={14} className="text-red-400" />
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Genre tag */}
                {track.genre && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded">
                      {track.genre}
                    </span>
                    {track.bpm && (
                      <span className="text-xs text-gray-500">
                        {track.bpm} BPM
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MusicQueue;

