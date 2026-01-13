// ẩn hiện chat
import React from "react";
import ChatPanel from "./chat/ChatPanel";
import LiveTrackNotesPanel from "./music/LiveTrackNotesPanel";
import type { ChatMessage, JoinRequestNotification, TypingIndicator, TrackNote, NotePermissionResponse, RoomType } from "../../../types/session";

interface SessionSidebarProps {
  showSidebar: boolean;
  messages: ChatMessage[];
  typingUsers: TypingIndicator[];
  currentUserName: string;
  currentUserId: number;
  chatCount: number;
  onSendMessage: (message: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  joinRequests: JoinRequestNotification[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  isProcessingRequest: boolean;

  // Mode switcher
  mode: 'chat' | 'notes';

  // Track Notes Props
  trackNotesProps?: {
    trackId: number | null;
    roomType: RoomType;
    sessionId?: string;
    currentTime?: number;
    notes: TrackNote[];
    permission: NotePermissionResponse | null;
    loading: boolean;
    submitting: boolean;
    isWsConnected: boolean;
    onSeek?: (time: number) => void;
    onAddNote: (content: string, time: number) => Promise<boolean | void>;
    onUpdateNote: (noteId: number, content: string) => Promise<boolean | void>;
    onDeleteNote: (noteId: number) => Promise<void>;
    onClose?: () => void;
  };
}

const SessionSidebar: React.FC<SessionSidebarProps> = ({
  showSidebar,
  messages,
  typingUsers,
  currentUserName,
  currentUserId,
  chatCount: _chatCount,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  joinRequests,
  onApproveRequest,
  onRejectRequest,
  isProcessingRequest,
  mode,
  trackNotesProps,
}) => {
  if (!showSidebar) return null;

  return (
    <div className="w-[30%] flex-shrink-0 flex flex-col gap-4 overflow-hidden">
      {/* Chat Content */}
      <div className="flex-1 min-h-0 relative rounded-2xl overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#0B0E1E]/90 backdrop-blur-xl"></div>

        {/* Holographic Border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-purple-500/40 p-[1px] -z-10">
          <div className="w-full h-full rounded-2xl bg-[#0B0E1E]/90"></div>
        </div>

        {/* Glass morphism overlay */}
        <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-xl pointer-events-none"></div>

        {/* Vinyl Groove Pattern Background */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none rounded-2xl"
          style={{
            background: `
              repeating-conic-gradient(
                from 0deg at 50% 50%,
                transparent 0deg,
                rgba(168, 85, 247, 0.08) 0.5deg,
                transparent 1deg,
                transparent 2deg
              )
            `,
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex-1 min-h-0 overflow-hidden relative w-full h-full">
            {mode === 'chat' ? (
              <ChatPanel
                messages={messages}
                typingUsers={typingUsers}
                currentUserName={currentUserName}
                currentUserId={currentUserId}
                onSendMessage={onSendMessage}
                onTypingStart={onTypingStart}
                onTypingStop={onTypingStop}
                joinRequests={joinRequests}
                onApproveRequest={onApproveRequest}
                onRejectRequest={onRejectRequest}
                isProcessingRequest={isProcessingRequest}
              />
            ) : (
              trackNotesProps && <LiveTrackNotesPanel {...trackNotesProps} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSidebar;

