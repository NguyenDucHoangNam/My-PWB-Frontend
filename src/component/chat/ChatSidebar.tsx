"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { MagnifyingGlassIcon, XMarkIcon, PaperAirplaneIcon, TrashIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { ChatMessage, ConversationCreationResponse, ParticipantInfoDetailResponse } from "@/types/chat";
import { ApiService } from "@/services/chatService";
import { DeleteConversationModal } from "./DeleteConversationModal";
import { CreateGroupModal } from "./CreateGroupModal";

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

interface ChatSidebarProps {
    conversations: ConversationCreationResponse[];
    selectedConversation: string | null;
    messages: Map<string, ChatMessage[]>;
    onConversationSelect: (conversationId: string) => void;
    onCreateConversation: (userId: string) => void;
    onDeleteConversation: (conversationId: string) => void;
    onRefreshConversations?: () => Promise<void>;
    loading?: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    conversations,
    selectedConversation,
    messages,
    onConversationSelect,
    onCreateConversation,
    onDeleteConversation,
    onRefreshConversations,
    loading = false
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<ParticipantInfoDetailResponse[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState<ConversationCreationResponse | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);



    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const searchUsers = useCallback(async (username: string) => {
        if (!username.trim()) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        setSearchLoading(true);

        try {
            const users = await ApiService.searchUsers(username);
            setSearchResults(users || []);
        } catch (error) {
            setSearchResults([]);
            setError("Không thể tìm kiếm người dùng. Vui lòng thử lại.");
        } finally {
            setSearchLoading(false);
        }
    }, []);

    useEffect(() => {
        if (debouncedSearchQuery.trim()) {
            setShowSearchResults(true);
            searchUsers(debouncedSearchQuery);
        } else {
            setSearchResults([]);
            setSearchLoading(false);
            setShowSearchResults(false);
        }
    }, [debouncedSearchQuery, searchUsers]);

    useEffect(() => {
        if (selectedConversation) {
            setSearchQuery('');
            setShowSearchResults(false);
            setSearchResults([]);
            setSearchLoading(false);
        }
    }, [selectedConversation]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim()) {
            setSearchLoading(true);
        } else {
            setSearchLoading(false);
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setSearchLoading(false);
        setShowSearchResults(false);
        inputRef.current?.focus();
    };

    const handleDeleteClick = (conversation: ConversationCreationResponse, e: React.MouseEvent) => {
        e.stopPropagation();
        setConversationToDelete(conversation);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!conversationToDelete) return;

        try {
            setIsDeleting(true);
            await ApiService.deleteConversation(conversationToDelete.id);
            onDeleteConversation(conversationToDelete.id);
            setShowDeleteModal(false);
            setConversationToDelete(null);
        } catch (error) {
            setError("Không thể xóa cuộc trò chuyện. Vui lòng thử lại.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setConversationToDelete(null);
    };

    const handleCreateConversation = async (userId: string) => {
        try {
            await onCreateConversation(userId);
        } catch (error) {
            setError("Không thể tạo cuộc trò chuyện. Vui lòng thử lại.");
        }
    };

    const handleGroupCreated = async (conversationId: string) => {
        try {
            if (onRefreshConversations) {
                await onRefreshConversations();
            }

            onConversationSelect(conversationId);

        } catch (error) {
            console.error('❌ Failed to handle group creation:', error);
        } finally {
            setShowCreateGroupModal(false);
        }
    };

    return (
        <div className="w-80 h-screen bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl border-r border-gray-200/60 dark:border-border-color/60 flex flex-col">
            {error && (
                <div className="fixed top-4 left-4 bg-red-500 dark:bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 backdrop-blur-sm border border-red-400/20 dark:border-red-500/30">
                    <span className="text-sm font-medium">{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="text-white hover:text-red-200 dark:hover:text-red-300 ml-2 transition-colors"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="p-4 border-b border-gray-200/60 dark:border-border-color/60">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary">Chats</h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onRefreshConversations?.()}
                            className="p-2 text-gray-600 dark:text-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg/50 rounded-full transition-colors duration-150 border border-gray-200/50 dark:border-border-color/50"
                            title="Refresh Conversations"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setShowCreateGroupModal(true)}
                            className="p-2 text-purple-600 dark:text-accent hover:bg-purple-50 dark:hover:bg-purple-500/20 rounded-full transition-colors duration-150 border border-purple-200/50 dark:border-purple-500/30"
                            title="Create Group"
                        >
                            <UserGroupIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-text-secondary" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search Messenger"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-dark-bg/50 border-0 rounded-full focus:outline-none focus:bg-white dark:focus:bg-dark-bg focus:ring-2 focus:ring-purple-400 dark:focus:ring-accent transition-colors duration-150 text-sm placeholder-gray-500 dark:placeholder-text-secondary text-gray-900 dark:text-text-primary"
                    />
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg transition-colors duration-150"
                        >
                            <XMarkIcon className="h-4 w-4 text-gray-500 dark:text-text-secondary" />
                        </button>
                    )}
                </div>
            </div>

            {showSearchResults && (
                <div className="border-b border-gray-200/60 dark:border-border-color/60 bg-white/60 dark:bg-dark-surface/60 backdrop-blur-sm">
                    {searchLoading ? (
                        <div className="p-4 text-center">
                            <div className="inline-flex items-center gap-2 text-gray-500 dark:text-text-secondary">
                                <div className="w-4 h-4 border-2 border-purple-500/30 dark:border-accent/30 border-t-purple-500 dark:border-t-accent rounded-full animate-spin"></div>
                                <span className="text-sm">Searching...</span>
                            </div>
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-text-secondary">
                            <p className="text-sm">No users found for "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="max-h-60 overflow-y-auto">
                            {searchResults.map((user) => (
                                <div
                                    key={user.userId}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSearchQuery('');
                                        setShowSearchResults(false);
                                        setSearchResults([]);
                                        setSearchLoading(false);
                                        handleCreateConversation(user.userId);
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bg/50 cursor-pointer transition-colors"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-600 dark:to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg ring-2 ring-white/50 dark:ring-purple-500/30">
                                        {user.username?.charAt(0).toUpperCase() || "?"}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-text-primary text-sm">{user.username || "Unknown User"}</p>
                                        <p className="text-xs text-gray-500 dark:text-text-secondary">Start conversation</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center gap-3 text-gray-500 dark:text-text-secondary">
                            <div className="w-6 h-6 border-2 border-purple-500/30 dark:border-accent/30 border-t-purple-500 dark:border-t-accent rounded-full animate-spin"></div>
                            <span className="text-sm font-medium">Loading conversations...</span>
                        </div>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200/50 dark:border-border-color/50">
                            <svg className="w-8 h-8 text-gray-400 dark:text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 dark:text-text-primary font-medium mb-1">No conversations yet</p>
                        <p className="text-gray-400 dark:text-text-secondary text-sm">Search for users to start chatting</p>
                    </div>
                ) : (
                    conversations.map((conversation) => {
                        const conversationMessages = messages.get(conversation.id) || [];
                        const lastMessage = conversationMessages[conversationMessages.length - 1];

                        return (
                            <div
                                key={conversation.id}
                                className={`group relative flex items-start gap-3 px-4 py-4 cursor-pointer transition-all duration-200 hover:bg-gray-50/80 dark:hover:bg-dark-bg/50 ${selectedConversation === conversation.id
                                    ? "bg-purple-50/50 dark:bg-purple-500/20 border-r-2 border-purple-500 dark:border-accent"
                                    : ""
                                    }`}
                                onClick={() => onConversationSelect(conversation.id)}
                            >
                                <div className="relative flex-shrink-0 mt-0.5">
                                    {conversation.conversationAvatar ? (
                                        <img
                                            src={conversation.conversationAvatar}
                                            alt={conversation.conversationName || "Group"}
                                            className="w-11 h-11 rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-purple-500/30"
                                        />
                                    ) : (
                                        <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-600 dark:to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg ring-2 ring-white dark:ring-purple-500/30">
                                            {conversation.conversationName?.charAt(0).toUpperCase() || "?"}
                                        </div>
                                    )}
                                    {/* Presence badge will be wired later; avoid showing incorrect online state */}
                                    {/* <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full border-2 border-white dark:border-dark-surface"></div> */}
                                </div>

                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900 dark:text-text-primary text-sm truncate pr-2">
                                            {conversation.conversationName || "Unknown Conversation"}
                                        </h3>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {lastMessage && (
                                                <span className="text-xs text-gray-500 dark:text-text-secondary font-medium">
                                                    {(() => {
                                                        try {
                                                            const date = new Date(lastMessage.createdAt);
                                                            if (isNaN(date.getTime())) return '';
                                                            const hours = date.getHours();
                                                            const minutes = date.getMinutes().toString().padStart(2, '0');
                                                            const ampm = hours >= 12 ? 'PM' : 'AM';
                                                            const displayHours = hours % 12 || 12;
                                                            return `${displayHours}:${minutes} ${ampm}`;
                                                        } catch {
                                                            return '';
                                                        }
                                                    })()}
                                                </span>
                                            )}
                                            <button
                                                onClick={(e) => handleDeleteClick(conversation, e)}
                                                className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors duration-150 opacity-0 group-hover:opacity-100 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                                                title="Delete conversation"
                                            >
                                                <TrashIcon className="w-4.5 h-4.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {lastMessage && (
                                        <div className="flex items-center gap-1.5">
                                            {lastMessage.me && (
                                                <PaperAirplaneIcon className="h-3 w-3 text-purple-500 dark:text-accent flex-shrink-0" />
                                            )}
                                            <p className="text-sm text-gray-600 dark:text-text-secondary truncate leading-relaxed">
                                                {lastMessage.content}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <DeleteConversationModal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                conversationName={conversationToDelete?.conversationName || ""}
                isDeleting={isDeleting}
            />

            <CreateGroupModal
                isOpen={showCreateGroupModal}
                onClose={() => setShowCreateGroupModal(false)}
                onGroupCreated={handleGroupCreated}
                onRefreshConversations={onRefreshConversations}
            />
        </div>
    );
};