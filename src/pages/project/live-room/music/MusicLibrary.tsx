// src/pages/project/live-room/music/MusicLibrary.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Music, Lock, Building2, Users, ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { formatDuration } from '../../../../utils/formatDuration';
import type { Track } from '../../../../types/music';
import type { MilestoneWithTracksResponse, SessionTrackResponse } from '../../../../types/session';

interface MusicLibraryProps {
  isOwner: boolean;
  currentQueue: Track[];
  milestones: MilestoneWithTracksResponse[];
  onAdd: (track: Track) => void;
}

const MusicLibrary: React.FC<MusicLibraryProps> = ({ 
  isOwner, 
  currentQueue,
  milestones,
  onAdd 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMilestones, setExpandedMilestones] = useState<Set<number>>(new Set());
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set()); // Format: "milestoneId-roomType"

  const filteredMilestones = milestones.filter(milestone => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      milestone.title.toLowerCase().includes(query) ||
      milestone.description?.toLowerCase().includes(query) ||
      milestone.internalTracks.some(t => t.trackName.toLowerCase().includes(query)) ||
      milestone.clientTracks.some(t => t.trackName.toLowerCase().includes(query))
    );
  });

  const toggleMilestone = (milestoneId: number) => {
    setExpandedMilestones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(milestoneId)) {
        newSet.delete(milestoneId);
        // Also collapse all rooms in this milestone
        setExpandedRooms(prevRooms => {
          const newRooms = new Set(prevRooms);
          newRooms.delete(`${milestoneId}-INTERNAL`);
          newRooms.delete(`${milestoneId}-CLIENT`);
          return newRooms;
        });
      } else {
        newSet.add(milestoneId);
      }
      return newSet;
    });
  };

  const toggleRoom = (milestoneId: number, roomType: 'INTERNAL' | 'CLIENT') => {
    const roomKey = `${milestoneId}-${roomType}`;
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

  const isMilestoneExpanded = (milestoneId: number) => expandedMilestones.has(milestoneId);
  const isRoomExpanded = (milestoneId: number, roomType: 'INTERNAL' | 'CLIENT') => 
    expandedRooms.has(`${milestoneId}-${roomType}`);

  const convertTrackToTrack = (sessionTrack: SessionTrackResponse, milestoneTitle: string): Track => {
    return {
      id: sessionTrack.trackId,
      title: sessionTrack.trackName,
      artist: milestoneTitle,
      duration: sessionTrack.duration,
      url: sessionTrack.hlsPlaybackUrl,
      hlsPlaybackUrl: sessionTrack.hlsPlaybackUrl,
      roomType: sessionTrack.roomType,
      voiceTagEnabled: sessionTrack.voiceTagEnabled,
      version: sessionTrack.version
    };
  };

  const isInQueue = (trackId: number) => {
    return currentQueue.some(t => t.id === trackId);
  };

  if (!isOwner) {
    return (
      <div className="px-4 py-6 text-center text-gray-500">
        <Lock size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">Chỉ chủ phòng có thể thêm bài</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/50 flex-shrink-0">
        <h4 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
          <Music size={14} />
          Thư viện nhạc
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
            {filteredMilestones.map((milestone) => {
              const isExpanded = isMilestoneExpanded(milestone.id);
              const totalTracks = milestone.internalTracks.length + milestone.clientTracks.length;
              
              return (
                <div key={milestone.id} className="mb-1">
                  {/* Milestone Folder */}
                  <button
                    onClick={() => toggleMilestone(milestone.id)}
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
                        {milestone.title}
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
                      {milestone.internalTracks.length > 0 && (
                        <div>
                          <button
                            onClick={() => toggleRoom(milestone.id, 'INTERNAL')}
                            className="w-full px-3 py-2 rounded-lg hover:bg-blue-600/10 transition-all flex items-center gap-2 text-left group"
                          >
                            {isRoomExpanded(milestone.id, 'INTERNAL') ? (
                              <ChevronDown size={14} className="text-blue-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight size={14} className="text-blue-400 flex-shrink-0" />
                            )}
                            {isRoomExpanded(milestone.id, 'INTERNAL') ? (
                              <FolderOpen size={16} className="text-blue-400 flex-shrink-0" />
                            ) : (
                              <Folder size={16} className="text-blue-500 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                            )}
                            <Building2 size={14} className="text-blue-400 flex-shrink-0" />
                            <span className="text-sm text-blue-400 font-medium">
                              Phòng nội bộ
                            </span>
                            <span className="text-xs text-gray-500 ml-auto">
                              ({milestone.internalTracks.length})
                            </span>
                          </button>

                          {/* Tracks inside internal room */}
                          {isRoomExpanded(milestone.id, 'INTERNAL') && (
                            <div className="ml-6 mt-1 space-y-1">
                              {milestone.internalTracks.map((track) => {
                                const trackObj = convertTrackToTrack(track, milestone.title);
                                const inQueue = isInQueue(trackObj.id);
                                
                                return (
                                  <motion.div
                                    key={track.trackId}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`group px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                      inQueue
                                        ? 'bg-green-600/10 border border-green-500/20'
                                        : 'bg-gray-800/30 hover:bg-gray-700/40'
                                    }`}
                                  >
                                    <Music size={14} className="text-blue-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-white truncate">
                                        {track.trackName}
                                      </p>
                                      <p className="text-xs text-gray-400 truncate">
                                        {track.version} • {formatDuration(track.duration)}
                                        {track.voiceTagEnabled && (
                                          <span className="ml-2 text-purple-400">🎤</span>
                                        )}
                                      </p>
                                    </div>
                                    <motion.button
                                      whileHover={{ scale: inQueue ? 1 : 1.1 }}
                                      whileTap={{ scale: inQueue ? 1 : 0.9 }}
                                      onClick={() => !inQueue && onAdd(trackObj)}
                                      disabled={inQueue}
                                      className={`p-1.5 rounded-full transition-all flex-shrink-0 ${
                                        inQueue
                                          ? 'bg-green-600/20 text-green-400 cursor-default'
                                          : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                                      }`}
                                    >
                                      {inQueue ? (
                                        <span className="text-xs font-bold">✓</span>
                                      ) : (
                                        <Plus size={14} />
                                      )}
                                    </motion.button>
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Client Room Folder */}
                      {milestone.clientTracks.length > 0 && (
                        <div>
                          <button
                            onClick={() => toggleRoom(milestone.id, 'CLIENT')}
                            className="w-full px-3 py-2 rounded-lg hover:bg-purple-600/10 transition-all flex items-center gap-2 text-left group"
                          >
                            {isRoomExpanded(milestone.id, 'CLIENT') ? (
                              <ChevronDown size={14} className="text-purple-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight size={14} className="text-purple-400 flex-shrink-0" />
                            )}
                            {isRoomExpanded(milestone.id, 'CLIENT') ? (
                              <FolderOpen size={16} className="text-purple-400 flex-shrink-0" />
                            ) : (
                              <Folder size={16} className="text-purple-500 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
                            )}
                            <Users size={14} className="text-purple-400 flex-shrink-0" />
                            <span className="text-sm text-purple-400 font-medium">
                              Phòng khách hàng
                            </span>
                            <span className="text-xs text-gray-500 ml-auto">
                              ({milestone.clientTracks.length})
                            </span>
                          </button>

                          {/* Tracks inside client room */}
                          {isRoomExpanded(milestone.id, 'CLIENT') && (
                            <div className="ml-6 mt-1 space-y-1">
                              {milestone.clientTracks.map((track) => {
                                const trackObj = convertTrackToTrack(track, milestone.title);
                                const inQueue = isInQueue(trackObj.id);
                                
                                return (
                                  <motion.div
                                    key={track.trackId}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`group px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                      inQueue
                                        ? 'bg-green-600/10 border border-green-500/20'
                                        : 'bg-gray-800/30 hover:bg-gray-700/40'
                                    }`}
                                  >
                                    <Music size={14} className="text-purple-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-white truncate">
                                        {track.trackName}
                                      </p>
                                      <p className="text-xs text-gray-400 truncate">
                                        {track.version} • {formatDuration(track.duration)}
                                        {track.voiceTagEnabled && (
                                          <span className="ml-2 text-purple-400">🎤</span>
                                        )}
                                      </p>
                                    </div>
                                    <motion.button
                                      whileHover={{ scale: inQueue ? 1 : 1.1 }}
                                      whileTap={{ scale: inQueue ? 1 : 0.9 }}
                                      onClick={() => !inQueue && onAdd(trackObj)}
                                      disabled={inQueue}
                                      className={`p-1.5 rounded-full transition-all flex-shrink-0 ${
                                        inQueue
                                          ? 'bg-green-600/20 text-green-400 cursor-default'
                                          : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
                                      }`}
                                    >
                                      {inQueue ? (
                                        <span className="text-xs font-bold">✓</span>
                                      ) : (
                                        <Plus size={14} />
                                      )}
                                    </motion.button>
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show message if no tracks in both rooms */}
                      {milestone.internalTracks.length === 0 && milestone.clientTracks.length === 0 && (
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

export default MusicLibrary;

