"use client";

import React from "react";
import { ConnectionStatus } from "@/types/chat";
import { webSocketService } from "@/libs/websocket";

interface WebSocketStatusProps {
    connectionStatus: ConnectionStatus;
    className?: string;
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
    connectionStatus,
    className = ""
}) => {
    const handleReconnect = () => {
        webSocketService.reconnect();
    };

    if (connectionStatus.isConnected) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Connected</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                {connectionStatus.reconnectAttempts > 0
                    ? `Reconnecting... (${connectionStatus.reconnectAttempts})`
                    : 'Disconnected'
                }
            </span>
            <button
                onClick={handleReconnect}
                className="text-xs text-purple-600 dark:text-accent hover:text-purple-700 dark:hover:text-purple-400 font-medium underline ml-1"
                title="Click to reconnect"
            >
                Retry
            </button>
        </div>
    );
};

// Compact version for header
export const WebSocketStatusCompact: React.FC<WebSocketStatusProps> = ({
    connectionStatus,
    className = ""
}) => {
    const handleReconnect = () => {
        webSocketService.reconnect();
    };

    if (connectionStatus.isConnected) {
        return (
            <div className={`flex items-center ${className}`} title="WebSocket Connected">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
            </div>
        );
    }

    return (
        <button
            onClick={handleReconnect}
            className={`flex items-center gap-1 p-1.5 rounded-lg bg-red-50 dark:bg-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-150 border border-red-200/50 dark:border-red-500/30 ${className}`}
            title={`WebSocket ${connectionStatus.reconnectAttempts > 0 ? 'Reconnecting...' : 'Disconnected'} - Click to reconnect`}
        >
            <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        </button>
    );
};
