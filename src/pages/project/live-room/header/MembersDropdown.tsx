// thành viên trong phòng

import React from "react";
import { Video, VideoOff, Mic, MicOff } from "lucide-react";
import type { ParticipantRole } from "../../../../types/session";

export interface Participant {
  userId: number;
  userName: string;
  userEmail?: string;
  participantRole: ParticipantRole;
  isOnline: boolean;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  joinedAt?: string;
  leftAt?: string;
}

interface MembersDropdownProps {
  participants: Participant[];
  currentUserId: number;
}

const MembersDropdown: React.FC<MembersDropdownProps> = ({
  participants,
  currentUserId,
}) => {
  const onlineCount = participants.filter((p) => p.isOnline).length;

  return (
    <div
      className="relative h-full flex flex-col rounded-2xl overflow-hidden 
                    bg-[#0B0E1E]/90 backdrop-blur-xl shadow-2xl"
    >
      {/* Holographic Border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-purple-500/40 p-[1px] -z-10 pointer-events-none">
        <div className="w-full h-full rounded-2xl bg-[#0B0E1E]/90"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 border-b border-purple-500/30 bg-[#0B0E1E]/80 backdrop-blur-md flex flex-col gap-1">
        <h3 className="text-white font-bold text-lg tracking-wide">
          Người tham gia
        </h3>
        <p className="text-gray-400 text-sm">
          {onlineCount} đang online / {participants.length} tổng
        </p>
      </div>

      {/* Participants List */}
      <div className="relative z-10 flex-1 overflow-y-auto p-2 space-y-2">
        {participants.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Chưa có người tham gia</p>
          </div>
        ) : (
          participants.map((participant) => (
            <div
              key={participant.userId}
              className="group relative flex items-center gap-3 p-3 bg-[#0B0E1E]/80 rounded-xl 
                         border border-purple-500/30 shadow-md shadow-purple-600/20
                         hover:shadow-purple-400/50 hover:border-purple-400/50 transition-all duration-300"
              style={{
                clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
              }}
            >
              {/* Left Gradient Border */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-cyan-500 to-purple-500 group-hover:from-purple-400 group-hover:via-cyan-400 group-hover:to-purple-400 transition-all duration-300"></div>

              {/* Avatar */}
              <div className="relative z-10">
                <div
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500
                                flex items-center justify-center text-white font-bold text-lg shadow-inner"
                >
                  {participant.userName.charAt(0).toUpperCase()}
                </div>
                {participant.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 z-10">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium truncate">
                    {participant.userName}
                    {participant.userId === currentUserId && (
                      <span className="text-xs text-gray-400 ml-2">(Bạn)</span>
                    )}
                  </p>
                  {(participant.participantRole === "OWNER" ||
                    participant.participantRole === "COLLABORATOR") && (
                    <span className="px-2 py-0.5 bg-yellow-500/80 text-white text-xs rounded-full font-semibold">
                      {participant.participantRole === "OWNER"
                        ? "HOST"
                        : "COLLAB"}
                    </span>
                  )}
                </div>

                {/* Status + Video/Audio */}
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-300 flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        participant.isOnline
                          ? "bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]"
                          : "bg-gray-600"
                      }`}
                    ></span>
                    {participant.isOnline ? "Đang online" : "Offline"}
                  </p>

                  {participant.isOnline && (
                    <div className="flex items-center gap-1">
                      {participant.videoEnabled ? (
                        <Video className="w-3 h-3 text-green-400" />
                      ) : (
                        <VideoOff className="w-3 h-3 text-gray-500" />
                      )}
                      {participant.audioEnabled ? (
                        <Mic className="w-3 h-3 text-green-400" />
                      ) : (
                        <MicOff className="w-3 h-3 text-gray-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Optional actions */}
              {participant.userId !== currentUserId && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    className="p-1 hover:bg-gray-700 rounded"
                    aria-label="Tùy chọn người dùng"
                  >
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 p-3 border-t border-purple-500/30 bg-[#0B0E1E]/80 backdrop-blur-md text-center">
        <p className="text-xs text-gray-400">Cập nhật theo thời gian thực</p>
      </div>

    </div>
  );
};

export default MembersDropdown;

