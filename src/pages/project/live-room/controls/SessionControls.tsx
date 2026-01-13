// src/pages/project/live-room/controls/SessionControls.tsx

import React from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Crown } from "lucide-react";
import websocketService from "../../../../services/websocketService";

interface SessionControlsProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onLeave: () => void | Promise<void>;
  isHost?: boolean;
  // ✅ Add for broadcasting state
  sessionId?: string;
  currentUserId?: number;
  username?: string;
  className?: string;
}

const IconButton: React.FC<{
  active?: boolean;
  danger?: boolean;
  title: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ active, danger, title, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={[
        "relative h-12 w-12 rounded-full flex items-center justify-center",
        "backdrop-blur-md border transition-all duration-300 shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-purple-400/60",
        "hover:scale-105 active:scale-95",
        danger
          ? "bg-red-600/90 hover:bg-red-500 text-white border-red-400/40 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
          : active
          ? "bg-gray-700/80 hover:bg-gray-600 text-white border-gray-500/40 shadow-[0_0_12px_rgba(107,114,128,0.5)]"
          : "bg-red-600/90 hover:bg-red-700 text-white border-red-400/40 shadow-[0_0_12px_rgba(239,68,68,0.5)]",
      ].join(" ")}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
      <div className="relative z-10">{children}</div>
      <span className="sr-only">{title}</span>
    </button>
  );
};

const Pill: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div
    className={[
      "bg-gray-800/80 border border-gray-600/40",
      "rounded-full px-3 py-1 text-xs font-bold text-yellow-300",
      "backdrop-blur-md",
      className,
    ].filter(Boolean).join(" ")}
  >
    {children}
  </div>
);

const SessionControls: React.FC<SessionControlsProps> = ({
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  onLeave,
  isHost = false,
  sessionId,
  currentUserId,
  username,
}) => {
  const handleLeave = async () => {
    await onLeave();
  };

  // ✅ Handle video toggle with broadcast
  const handleToggleVideo = () => {
    onToggleVideo(); // Agora action first

    // Broadcast state to others
    if (sessionId && currentUserId && username) {
      websocketService.sendParticipantState(sessionId, {
        userId: currentUserId,
        username,
        hasVideo: !isVideoEnabled, // Will be toggled
        hasAudio: isAudioEnabled,
        action: "TOGGLE_VIDEO",
      });
    }
  };

  // ✅ Handle audio toggle with broadcast
  const handleToggleAudio = () => {
    onToggleAudio(); // Agora action first

    // Broadcast state to others
    if (sessionId && currentUserId && username) {
      websocketService.sendParticipantState(sessionId, {
        userId: currentUserId,
        username,
        hasVideo: isVideoEnabled,
        hasAudio: !isAudioEnabled, // Will be toggled
        action: "TOGGLE_AUDIO",
      });
    }
  };

  return (
    <div className="relative flex items-center gap-2 px-3 py-2 rounded-full overflow-hidden bg-[#0B0E1E]/80 backdrop-blur-xl border border-purple-500/40 shadow-2xl">
      {/* Holographic Border */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-purple-500/40 p-[1px] -z-10">
        <div className="w-full h-full rounded-full bg-[#0B0E1E]/80"></div>
      </div>

      {/* Glass morphism overlay */}
      <div className="absolute inset-0 rounded-full bg-white/5 backdrop-blur-xl pointer-events-none"></div>

      {/* Glow aura */}
      <div className="absolute -inset-3 bg-purple-600/20 blur-2xl rounded-full pointer-events-none"></div>

      {/* MIC */}
      <IconButton
        active={isAudioEnabled}
        title={isAudioEnabled ? "Tắt mic" : "Bật mic"}
        onClick={handleToggleAudio}
        className="quantum-btn p-1.5"
      >
        {isAudioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
      </IconButton>

      {/* CAMERA */}
      <IconButton
        active={isVideoEnabled}
        title={isVideoEnabled ? "Tắt camera" : "Bật camera"}
        onClick={handleToggleVideo}
        className="quantum-btn p-1.5"
      >
        {isVideoEnabled ? <Video size={16} /> : <VideoOff size={16} />}
      </IconButton>

      {/* LEAVE */}
      <IconButton
        danger
        title="Rời phòng"
        onClick={handleLeave}
        className="quantum-btn-danger p-1.5"
      >
        <PhoneOff size={16} />
      </IconButton>

      {/* HOST BADGE */}
      {isHost && (
        <Pill className="relative overflow-hidden text-sm px-2 py-0.5 border border-yellow-400/30 shadow-[0_0_12px_rgba(234,179,8,0.5)]">
          <div className="absolute inset-0 rounded-full bg-yellow-500/10 pointer-events-none"></div>
          <div className="flex items-center gap-1 relative z-10">
            <Crown
              size={14}
              className="text-yellow-300 drop-shadow-[0_0_4px_rgba(255,224,0,0.8)]"
            />
            <span>Host</span>
          </div>
        </Pill>
      )}
    </div>
  );
};

export default SessionControls;

