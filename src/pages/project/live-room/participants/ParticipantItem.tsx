// src/pages/project/live-room/participants/ParticipantItem.tsx

import React from "react";
import type { Participant } from "../../../../types/session";

interface ParticipantItemProps {
  participant: Participant;
  currentUserId: number;
}

const ParticipantItem: React.FC<ParticipantItemProps> = ({
  participant,
  currentUserId,
}) => {
  return (
    <div
      className="flex items-center gap-3 p-3 bg-[#0B0E1E]/80 backdrop-blur-md rounded-xl border border-purple-500/30
                 shadow-md shadow-purple-600/20 hover:shadow-purple-400/50 hover:border-purple-400/50 transition-all duration-300 relative"
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
      }}
    >
      {/* Left Gradient Border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Glass morphism overlay */}
      <div className="absolute inset-0 rounded-xl bg-white/5 backdrop-blur-sm pointer-events-none"></div>

      <div className="relative z-10 flex items-center gap-3 w-full">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md"></div>
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 
                        flex items-center justify-center text-white font-bold text-lg shadow-inner relative z-10"
          >
            {participant.userName.charAt(0).toUpperCase()}
          </div>
          {participant.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-medium truncate">
              {participant.userName}
              {participant.userId === currentUserId && (
                <span className="text-xs text-gray-400 ml-2">(Bạn)</span>
              )}
            </p>

            {participant.participantRole === "OWNER" && (
              <span className="px-2 py-0.5 bg-yellow-500/80 text-white text-xs rounded-full font-semibold border border-yellow-400/30 shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                HOST
              </span>
            )}
          </div>
          <p className="text-xs text-gray-300 mt-0.5 flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                participant.isOnline
                  ? "bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]"
                  : "bg-gray-600"
              }`}
            ></span>
            {participant.isOnline ? "Đang online" : "Offline"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParticipantItem;
