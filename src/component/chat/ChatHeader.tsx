"use client";

import React from "react";
import { ConversationCreationResponse, ConnectionStatus } from "@/types/chat";
import { WebSocketStatusCompact } from "./WebSocketStatus";

interface ChatHeaderProps {
    conversation: ConversationCreationResponse | undefined;
    connectionStatus: ConnectionStatus;
    isOtherUserOnline?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    conversation,
    connectionStatus,
    isOtherUserOnline = false,
}) => {
    if (!conversation) {
        return (
            <></>
        );
    }
    const displayName = conversation.conversationName || 'Unknown';
    const displayInfo = `${conversation.participantInfo?.length || 0} participants`;
    const displayInitial = displayName.charAt(0).toUpperCase();


    return (
        <div className="h-16 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-border-color/60 flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="relative">
                    {conversation.conversationAvatar ? (
                        <img
                            src={conversation.conversationAvatar}
                            alt={displayName}
                            className="w-11 h-11 rounded-full object-cover shadow-sm ring-2 ring-white/50 dark:ring-purple-500/30"
                        />
                    ) : (
                        <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-600 dark:to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-white/50 dark:ring-purple-500/30">
                            {displayInitial}
                        </div>
                    )}
                    {isOtherUserOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 dark:bg-green-400 rounded-full border-2 border-white dark:border-dark-surface shadow-sm"></div>
                    )}
                </div>
                <div>
                    <h2 className="font-semibold text-gray-900 dark:text-text-primary text-lg">
                        {displayName}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-text-secondary font-medium">
                        {displayInfo} • {isOtherUserOnline ? 'Active now' : 'Offline'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* WebSocket Connection Status */}
                <WebSocketStatusCompact
                    connectionStatus={connectionStatus}
                    className="animate-pulse"
                />

                <button
                    className="p-2 rounded-lg bg-gray-50 dark:bg-dark-bg/50 hover:bg-gray-100 dark:hover:bg-dark-bg/80 text-gray-600 dark:text-text-secondary hover:text-gray-700 dark:hover:text-accent transition-colors duration-150 border border-gray-200/50 dark:border-border-color/50"
                    title="Voice call"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                </button>

                <button
                    className="p-2 rounded-lg bg-gray-50 dark:bg-dark-bg/50 hover:bg-gray-100 dark:hover:bg-dark-bg/80 text-gray-600 dark:text-text-secondary hover:text-gray-700 dark:hover:text-accent transition-colors duration-150 border border-gray-200/50 dark:border-border-color/50"
                    title="More options"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
