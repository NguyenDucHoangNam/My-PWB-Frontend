// src/pages/project/live-room/music/QueueLibrary.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Music, ChevronRight, ChevronDown, Folder, FolderOpen, Building2, Users } from 'lucide-react';
import { formatDuration } from '../../../../utils/formatDuration';
import type { Track } from '../../../../types/music';

interface QueueLibraryProps {
  queue: Track[];
  currentTrack: Track | null;
  isOwner: boolean;
  onPlay: (track: Track) => void;
}

interface GroupedTracks {
  [milestoneTitle: string]: {
    INTERNAL: Track[];
    CLIENT: Track[];
  };
}

const QueueLibrary: React.FC<QueueLibraryProps> = ({ 
  queue,
  currentTrack,
  isOwner,
  onPlay
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set()); // Format: "milestoneTitle-roomType"

  // Group tracks by milestone (artist) and roomType
  const groupedTracks: GroupedTracks = React.useMemo(() => {
    const grouped: GroupedTracks = {};
    
    queue.forEach(track => {
      const milestoneTitle = track.artist || 'Unknown';
      const roomType = track.roomType || 'INTERNAL';
      
      if (!grouped[milestoneTitle]) {
        grouped[milestoneTitle] = {
          INTERNAL: [],
          CLIENT: []
        };
      }
      
      if (roomType === 'INTERNAL') {
        grouped[milestoneTitle].INTERNAL.push(track);
      } else {
        grouped[milestoneTitle].CLIENT.push(track);
      }
    });
    
    return grouped;
  }, [queue]);

  // Filter milestones based on search query
  const filteredMilestones = React.useMemo(() => {
    const milestoneTitles = Object.keys(groupedTracks);
    
    if (!searchQuery) return milestoneTitles;
    
    const query = searchQuery.toLowerCase();
    return milestoneTitles.filter(milestoneTitle => {
      const milestone = groupedTracks[milestoneTitle];
      return (
        milestoneTitle.toLowerCase().includes(query) ||
        milestone.INTERNAL.some(t => t.title.toLowerCase().includes(query)) ||
        milestone.CLIENT.some(t => t.title.toLowerCase().includes(query))
      );
    });
  }, [groupedTracks, searchQuery]);

  const toggleMilestone = (milestoneTitle: string) => {
    setExpandedMilestones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(milestoneTitle)) {
        newSet.delete(milestoneTitle);
        // Also collapse all rooms in this milestone
        setExpandedRooms(prevRooms => {
          const newRooms = new Set(prevRooms);
          newRooms.delete(`${milestoneTitle}-INTERNAL`);
          newRooms.delete(`${milestoneTitle}-CLIENT`);
          return newRooms;
        });
      } else {
        newSet.add(milestoneTitle);
      }
      return newSet;
    });
  };

  const toggleRoom = (milestoneTitle: string, roomType: 'INTERNAL' | 'CLIENT') => {
    const roomKey = `${milestoneTitle}-${roomType}`;
    setExpandedRooms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roomKey)) {
        newSet.delete(roomKey);
      } else {
        newSet.add(roomKey);
      }
      return newSet;
    });
  };

  const isMilestoneExpanded = (milestoneTitle: string) => expandedMilestones.has(milestoneTitle);
  const isRoomExpanded = (milestoneTitle: string, roomType: 'INTERNAL' | 'CLIENT') => 
    expandedRooms.has(`${milestoneTitle}-${roomType}`);

  const isCurrentTrack = (trackId: number) => {
    return currentTrack?.id === trackId;
  };

  if (queue.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <Music size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">Danh sách phát trống</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/50 flex-shrink-0">
        <h4 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
          <Music size={14} />
          Danh sách phát ({queue.length})
        </h4>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm cột mốc hoặc bài nhạc..."
            className="w-full bg-gray-700/50 text-white text-sm px-3 py-2 pl-9 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-purple-500/50 
                     placeholder-gray-500 transition-all"
          />
        </div>
      </div>

      {/* Folder Tree View */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filteredMilestones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Không tìm thấy cột mốc nào</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredMilestones.map((milestoneTitle) => {
              const isExpanded = isMilestoneExpanded(milestoneTitle);
              const milestone = groupedTracks[milestoneTitle];
              const totalTracks = milestone.INTERNAL.length + milestone.CLIENT.length;
              
              return (
                <div key={milestoneTitle} className="mb-1">
                  {/* Milestone Folder */}
                  <button
                    onClick={() => toggleMilestone(milestoneTitle)}
                    className="w-full px-3 py-2.5 rounded-lg hover:bg-gray-700/20 transition-all flex items-center gap-2 text-left group"
                  >
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                    )}
                    {isExpanded ? (
                      <FolderOpen size={18} className="text-purple-400 flex-shrink-0" />
                    ) : (
                      <Folder size={18} className="text-gray-500 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {milestoneTitle}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {totalTracks} bài nhạc
                      </p>
                    </div>
                  </button>

                  {/* Rooms inside milestone */}
                  {isExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {/* Internal Room Folder */}
                      {milestone.INTERNAL.length > 0 && (
                        <div>
                          <button
                            onClick={() => toggleRoom(milestoneTitle, 'INTERNAL')}
                            className="w-full px-3 py-2 rounded-lg hover:bg-blue-600/10 transition-all flex items-center gap-2 text-left group"
                          >
                            {isRoomExpanded(milestoneTitle, 'INTERNAL') ? (
                              <ChevronDown size={14} className="text-blue-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight size={14} className="text-blue-400 flex-shrink-0" />
                            )}
                            {isRoomExpanded(milestoneTitle, 'INTERNAL') ? (
                              <FolderOpen size={16} className="text-blue-400 flex-shrink-0" />
                            ) : (
                              <Folder size={16} className="text-blue-500 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                            )}
                            <Building2 size={14} className="text-blue-400 flex-shrink-0" />
                            <span className="text-sm text-blue-400 font-medium">
                              Phòng nội bộ
                            </span>
                            <span className="text-xs text-gray-500 ml-auto">
                              ({milestone.INTERNAL.length})
                            </span>
                          </button>

                          {/* Tracks inside internal room */}
                          {isRoomExpanded(milestoneTitle, 'INTERNAL') && (
                            <div className="ml-6 mt-1 space-y-1">
                              {milestone.INTERNAL.map((track) => {
                                const isCurrent = isCurrentTrack(track.id);
                                
                                return (
                                  <motion.div
                                    key={track.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`group px-3 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                                      isCurrent
                                        ? 'bg-purple-600/20 border border-purple-500/30'
                                        : 'bg-gray-800/30 hover:bg-gray-700/40'
                                    }`}
                                    onClick={() => isOwner && onPlay(track)}
                                  >
                                    <Music size={14} className={`flex-shrink-0 ${isCurrent ? 'text-purple-400' : 'text-blue-400'}`} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-white truncate">
                                        {track.title}
                                      </p>
                                      <p className="text-xs text-gray-400 truncate">
                                        {track.version || ''} {track.version ? '•' : ''} {formatDuration(track.duration)}
                                        {track.voiceTagEnabled && (
                                          <span className="ml-2 text-purple-400">🎤</span>
                                        )}
                                      </p>
                                    </div>
                                    {isCurrent && (
                                      <div className="flex-shrink-0">
                                        <motion.div
                                          animate={{ scale: [1, 1.2, 1] }}
                                          transition={{ duration: 1, repeat: Infinity }}
                                          className="w-2 h-2 bg-purple-400 rounded-full"
                                        />
                                      </div>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Client Room Folder */}
                      {milestone.CLIENT.length > 0 && (
                        <div>
                          <button
                            onClick={() => toggleRoom(milestoneTitle, 'CLIENT')}
                            className="w-full px-3 py-2 rounded-lg hover:bg-purple-600/10 transition-all flex items-center gap-2 text-left group"
                          >
                            {isRoomExpanded(milestoneTitle, 'CLIENT') ? (
                              <ChevronDown size={14} className="text-purple-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight size={14} className="text-purple-400 flex-shrink-0" />
                            )}
                            {isRoomExpanded(milestoneTitle, 'CLIENT') ? (
                              <FolderOpen size={16} className="text-purple-400 flex-shrink-0" />
                            ) : (
                              <Folder size={16} className="text-purple-500 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
                            )}
                            <Users size={14} className="text-purple-400 flex-shrink-0" />
                            <span className="text-sm text-purple-400 font-medium">
                              Phòng khách hàng
                            </span>
                            <span className="text-xs text-gray-500 ml-auto">
                              ({milestone.CLIENT.length})
                            </span>
                          </button>

                          {/* Tracks inside client room */}
                          {isRoomExpanded(milestoneTitle, 'CLIENT') && (
                            <div className="ml-6 mt-1 space-y-1">
                              {milestone.CLIENT.map((track) => {
                                const isCurrent = isCurrentTrack(track.id);
                                
                                return (
                                  <motion.div
                                    key={track.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`group px-3 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                                      isCurrent
                                        ? 'bg-purple-600/20 border border-purple-500/30'
                                        : 'bg-gray-800/30 hover:bg-gray-700/40'
                                    }`}
                                    onClick={() => isOwner && onPlay(track)}
                                  >
                                    <Music size={14} className={`flex-shrink-0 ${isCurrent ? 'text-purple-400' : 'text-purple-400'}`} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-white truncate">
                                        {track.title}
                                      </p>
                                      <p className="text-xs text-gray-400 truncate">
                                        {track.version || ''} {track.version ? '•' : ''} {formatDuration(track.duration)}
                                        {track.voiceTagEnabled && (
                                          <span className="ml-2 text-purple-400">🎤</span>
                                        )}
                                      </p>
                                    </div>
                                    {isCurrent && (
                                      <div className="flex-shrink-0">
                                        <motion.div
                                          animate={{ scale: [1, 1.2, 1] }}
                                          transition={{ duration: 1, repeat: Infinity }}
                                          className="w-2 h-2 bg-purple-400 rounded-full"
                                        />
                                      </div>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show message if no tracks in both rooms */}
                      {milestone.INTERNAL.length === 0 && milestone.CLIENT.length === 0 && (
                        <div className="ml-6 px-3 py-2 text-xs text-gray-500">
                          Chưa có bài nhạc
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueLibrary;

