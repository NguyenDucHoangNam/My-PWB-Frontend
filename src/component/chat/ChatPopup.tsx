// ChatPopup - Extracted from GlobalChatWidget
// Reusable chat window UI component for rendering in dock or standalone

import { useRef } from 'react';
import { X, Minus, UserPlus } from 'lucide-react';
import { ChatMessage, ConnectionStatus } from '@/types/chat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatPopupProps {
    // Conversation info
    conversationId: string;
    conversationName: string;
    conversationAvatar: string | null;
    conversationType: 'PRIVATE' | 'GROUP';

    // Messages
    messages: ChatMessage[];
    loading: boolean;
    loadingMore: boolean;
    pagination: { currentPage: number; totalPages: number; hasMore: boolean };

    // Connection & status
    connectionStatus: ConnectionStatus;
    isOnline: boolean;

    // UI state
    isMinimized: boolean;
    unreadCount: number;
    scrollPaddingBottom?: number;

    // Callbacks
    onClose: () => void;
    onMinimize: () => void;
    onSendMessage: (text: string, mediaAttachments?: { mediaUrl: string; mediaName: string; mediaSize: number; mediaType: string; displayOrder?: number }[]) => void;
    onLoadMore: (page: number) => void;
    onAddMembers?: () => void;
}

export const ChatPopup: React.FC<ChatPopupProps> = ({
    conversationId,
    conversationName,
    conversationAvatar,
    conversationType,
    messages,
    loading,
    loadingMore,
    pagination,
    connectionStatus,
    isOnline,
    isMinimized,
    unreadCount,
    scrollPaddingBottom = 96,
    onClose,
    onMinimize,
    onSendMessage,
    onLoadMore,
    onAddMembers
}) => {
    const chatScrollRef = useRef<HTMLDivElement | null>(null);
    const inputContainerRef = useRef<HTMLDivElement | null>(null);
    const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

    // Minimized bubble
    if (isMinimized) {
        return (
            <div className="relative group">
                <button
                    onClick={onMinimize}
                    className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-dark-surface shadow-lg hover:scale-110 transition-transform"
                >
                    {conversationAvatar ? (
                        <img
                            src={conversationAvatar}
                            alt={conversationName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {conversationName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </button>

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-[18px] text-center shadow-md">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}

                <button
                    onClick={onClose}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-700 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-gray-900"
                >
                    <X size={12} />
                </button>
            </div>
        );
    }

    // Full window (reusing exact GlobalChatWidget UI)
    return (
        <div className="w-[360px] max-w-[92vw]" role="dialog" aria-label="Hộp thoại chat">
            <div className="bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] border border-gray-200/70 dark:border-border-color/70 overflow-hidden transition-all transform animate-[chatIn_180ms_ease-out]">
                {/* Header */}
                <div className="relative z-20 flex items-center justify-between px-3 py-2 border-b border-gray-200/70 dark:border-border-color/70 bg-white dark:bg-dark-surface select-none">
                    <div className="flex items-center gap-2">
                        <img
                            src={conversationAvatar || "https://i.pravatar.cc/200"}
                            alt={conversationName}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-text-primary leading-4 truncate max-w-[220px]">
                                {conversationName}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                <span className="text-[11px] text-gray-600 dark:text-text-secondary">
                                    {isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {conversationType === 'GROUP' && onAddMembers && (
                            <button
                                onClick={onAddMembers}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg/60 text-gray-600 dark:text-text-secondary transition-colors"
                                aria-label="Thêm thành viên"
                                title="Thêm thành viên vào nhóm"
                            >
                                <UserPlus size={16} />
                            </button>
                        )}
                        <button
                            onClick={() => onMinimize()}
                            className="relative p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg/60 text-gray-600 dark:text-text-secondary transition-colors"
                            aria-label="Thu nhỏ"
                        >
                            <Minus size={16} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] leading-4 text-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg/60 text-gray-600 dark:text-text-secondary transition-colors"
                            aria-label="Đóng"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="h-[440px] max-h-[70vh] flex flex-col overflow-hidden">
                    <div
                        ref={chatScrollRef}
                        className="flex-1 min-h-0 overflow-y-auto"
                        style={{ paddingBottom: `${scrollPaddingBottom}px` }}
                    >
                        <MessageList
                            messages={messages}
                            loading={loading}
                            hasMoreMessages={pagination.hasMore}
                            onLoadMore={() => {
                                if (!loadingMore && pagination.hasMore) {
                                    onLoadMore(pagination.currentPage + 1);
                                }
                            }}
                            loadingMore={loadingMore}
                            hasSelectedConversation={!!conversationId}
                        />
                        <div ref={bottomSentinelRef} />
                    </div>

                    {/* Input */}
                    {conversationId && (
                        <div ref={inputContainerRef} className="flex-shrink-0 border-t border-gray-200/70 dark:border-border-color/70 bg-white dark:bg-dark-surface p-2">
                            <MessageInput
                                conversationId={conversationId}
                                onSendMessage={onSendMessage}
                                connectionStatus={connectionStatus}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
