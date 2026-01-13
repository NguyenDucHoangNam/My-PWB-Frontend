// src/pages/project/live-room/LiveSessionHeader.tsx

import React, { useState } from "react";
import { Video, Users, Wifi, Radio, Sidebar } from "lucide-react";
import SessionControls from "../controls/SessionControls";
import MembersDropdown from "./MembersDropdown";

interface LiveSessionHeaderProps {
  sessionTitle?: string;
  sessionType?: string;
  participants: any[];
  currentUserId: number;
  onlineCount: number;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onLeave: () => void | Promise<void>;
  isHost: boolean;
  sessionId?: string;
  currentUserName: string;
  isConnected: boolean;
  showSidebar: boolean;
  onToggleSidebar: () => void;
}

const ConnectionStatus: React.FC<{
  isConnected: boolean;
  participantCount: number;
}> = ({ isConnected, participantCount }) => (
  <div className="flex items-center gap-3">
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold relative"
      style={{
        backgroundColor: isConnected ? "#dc2626" : "#6b7280",
        color: "white",
      }}
    >
      <div className="absolute inset-0 rounded-full bg-red-500/20 blur-md pointer-events-none"></div>
      <Radio size={14} className="relative z-10" />
      <span className="relative z-10">LIVE</span>
    </div>

    {isConnected && (
      <div className="flex items-center gap-1.5 bg-green-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold border border-green-400/30 shadow-[0_0_12px_rgba(34,197,94,0.5)]">
        <Wifi size={12} />
        Đã kết nối
      </div>
    )}

    <div className="flex items-center gap-1.5 text-gray-300 text-sm">
      <Users size={14} className="text-purple-400" />
      <span>{participantCount} online</span>
    </div>
  </div>
);

const LiveSessionHeader: React.FC<LiveSessionHeaderProps> = ({
  sessionTitle,
  sessionType,
  participants,
  currentUserId,
  onlineCount,
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  onLeave,
  isHost,
  sessionId,
  currentUserName,
  isConnected,
  showSidebar,
  onToggleSidebar,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-[100] bg-[#0B0E1E]/90 backdrop-blur-xl border-b border-purple-500/40 rounded-b-2xl shadow-2xl px-4 py-3 flex items-center justify-between">
      {/* Holographic Border */}
      <div className="absolute inset-0 rounded-b-2xl bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-purple-500/40 p-[1px] -z-10">
        <div className="w-full h-full rounded-b-2xl bg-[#0B0E1E]/90"></div>
      </div>

      {/* Glass morphism overlay */}
      <div className="absolute inset-0 rounded-b-2xl bg-white/5 backdrop-blur-xl pointer-events-none"></div>

      {/* Left: Session info */}
      <div className="flex items-center gap-3 min-w-0 relative z-10">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md"></div>
          <Video
            className="text-purple-400 relative z-10 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
            size={20}
          />
        </div>
        <div className="flex flex-col truncate">
          <h1 className="text-white text-base font-extrabold truncate drop-shadow-lg">
            {sessionTitle || "Phiên Làm Việc"}
          </h1>
          <p className="text-purple-300 text-xs lowercase tracking-wide truncate">
            {sessionType?.replace("_", " ")}
          </p>
        </div>
      </div>

      {/* Members Dropdown */}
      <div className="relative z-10 w-48 overflow-visible">
        {/* Hover wrapper */}
        <div
          className="relative"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-purple-500/30 bg-[#0B0E1E]/80 backdrop-blur-md flex items-center gap-2 cursor-pointer group rounded-t-2xl hover:bg-[#0B0E1E]/90 transition-colors">
            <Users size={14} className="text-purple-400" />
            <h3 className="text-white font-semibold text-xs tracking-wide">
              Thành viên
            </h3>
            <span className="ml-auto bg-purple-600/80 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold border border-purple-400/30">
              {onlineCount}
            </span>
          </div>

          {/* Dropdown List */}
          {open && (
            <div
              className="absolute top-full left-0 w-64 mt-2 z-[9999]"
            >
              <div className="bg-[#0B0E1E]/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl space-y-2 border border-purple-500/40">
                {/* Holographic Border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-purple-500/40 p-[1px] -z-10">
                  <div className="w-full h-full rounded-2xl bg-[#0B0E1E]/95"></div>
                </div>
                <div className="relative z-10">
                  <MembersDropdown
                    participants={participants}
                    currentUserId={currentUserId}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Session controls */}
      <div className="flex-shrink-0 relative z-10 w-full max-w-lg mx-4 mr-[50px]">
        <div className="relative rounded-2xl flex justify-center">
          <SessionControls
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            onToggleVideo={onToggleVideo}
            onToggleAudio={onToggleAudio}
            onLeave={onLeave}
            isHost={isHost}
            sessionId={sessionId}
            currentUserId={currentUserId}
            username={currentUserName}
          />
        </div>
      </div>

      {/* Right: Sidebar toggle + connection status */}
      <div className="flex items-center gap-3 relative z-10">
        <ConnectionStatus
          isConnected={isConnected}
          participantCount={onlineCount}
        />
        <button
          onClick={onToggleSidebar}
          className="flex items-center gap-2 bg-purple-600/70 hover:bg-purple-500/80 text-white px-3 py-1.5 rounded-lg backdrop-blur-md transition-all text-xs font-semibold shadow-lg border border-purple-400/30"
        >
          <Sidebar size={14} />
          {showSidebar ? "Ẩn" : "Hiện"}
        </button>
      </div>
    </div>
  );
};

export default LiveSessionHeader;
