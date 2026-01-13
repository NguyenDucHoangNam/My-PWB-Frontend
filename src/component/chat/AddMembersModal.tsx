"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ParticipantInfoDetailResponse } from "@/types/chat";
import { ApiService } from "@/services/chatService";
import milestoneService from "@/services/milestoneService";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { UserPlus } from "lucide-react";
import toast from 'react-hot-toast';

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

interface AddMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: string;
    existingMemberIds: (string | number)[];
    onMembersAdded?: (updatedConversation: any) => void;
    projectId?: number;
    milestoneId?: number;
}

export const AddMembersModal: React.FC<AddMembersModalProps> = ({
    isOpen,
    onClose,
    conversationId,
    existingMemberIds,
    onMembersAdded,
    projectId,
    milestoneId
}) => {
    const [selectedUsers, setSelectedUsers] = useState<ParticipantInfoDetailResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<ParticipantInfoDetailResponse[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    useEffect(() => {
        if (isOpen) {
            setSelectedUsers([]);
            setSearchQuery("");
            setSearchResults([]);
        }
    }, [isOpen]);

    const searchUsers = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            let results: ParticipantInfoDetailResponse[] = [];
            
            // Nếu có projectId và milestoneId, dùng API search milestone
            if (projectId && milestoneId) {
                const milestoneUsers = await milestoneService.searchUsersForMilestoneChat(
                    projectId,
                    milestoneId,
                    query.trim()
                );
                // Convert AvailableProjectMemberResponse to ParticipantInfoDetailResponse
                results = milestoneUsers.map(user => ({
                    userId: String(user.userId),
                    username: user.userName,
                    avatar: user.userEmail ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userName || user.userEmail)}&background=6366f1&color=fff` : null
                }));
            } else {
                // Dùng API search global như cũ
                results = await ApiService.searchUsers(query.trim());
            }
            
            setSearchResults(results);
        } catch (error) {
            setSearchResults([]);
            toast.error("Không thể tìm kiếm người dùng");
        } finally {
            setIsSearching(false);
        }
    }, [projectId, milestoneId]);

    useEffect(() => {
        searchUsers(debouncedSearchQuery);
    }, [debouncedSearchQuery, searchUsers]);

    // Filter out existing members and already selected users
    const filteredSearchResults = useMemo(() => {
        return searchResults.filter(result => {
            // Exclude existing members
            if (existingMemberIds.some(id => String(id) === String(result.userId))) {
                return false;
            }
            // Exclude already selected users
            if (selectedUsers.some(selected => selected.userId === result.userId)) {
                return false;
            }
            return true;
        });
    }, [searchResults, existingMemberIds, selectedUsers]);

    const handleUserSelect = useCallback((participant: ParticipantInfoDetailResponse) => {
        if (selectedUsers.some(selected => selected.userId === participant.userId)) {
            return;
        }

        setSelectedUsers(prev => [...prev, participant]);
        setSearchQuery("");
        setSearchResults([]);
    }, [selectedUsers]);

    const handleUserRemove = useCallback((userId: string) => {
        setSelectedUsers(prev => prev.filter(user => user.userId !== userId));
    }, []);

    const handleAddMembers = async () => {
        if (selectedUsers.length === 0) {
            toast.error("Vui lòng chọn ít nhất một thành viên");
            return;
        }

        setIsAdding(true);
        try {
            const memberIds = selectedUsers.map(user => Number(user.userId));
            const updatedConversation = await ApiService.addMembersToGroup(conversationId, memberIds);

            toast.success(`Đã thêm ${selectedUsers.length} thành viên vào nhóm!`);

            if (onMembersAdded) {
                onMembersAdded(updatedConversation);
            }

            onClose();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Không thể thêm thành viên vào nhóm";
            toast.error(errorMessage);
        } finally {
            setIsAdding(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
            <div className="bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden border border-gray-200/50 dark:border-border-color/50">
                <div className="relative flex items-center justify-center p-4 border-b border-gray-200/60 dark:border-border-color/60">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-text-primary">Thêm thành viên</h2>
                    <button
                        onClick={onClose}
                        className="absolute right-4 w-9 h-9 bg-gray-100 dark:bg-dark-bg/50 hover:bg-gray-200 dark:hover:bg-dark-bg/80 rounded-full flex items-center justify-center transition-colors text-gray-600 dark:text-text-secondary hover:text-gray-800 dark:hover:text-text-primary border border-gray-200/50 dark:border-border-color/50"
                        disabled={isAdding}
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {selectedUsers.length > 0 && (
                        <div className="p-6 pb-4">
                            <div className="bg-purple-50 dark:bg-purple-500/20 rounded-lg p-3 border border-purple-200 dark:border-purple-500/30">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                                        Đã chọn ({selectedUsers.length})
                                    </h3>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.map(user => (
                                        <div
                                            key={user.userId}
                                            className="flex items-center gap-2 bg-white dark:bg-dark-surface/80 px-3 py-2 rounded-full border border-purple-200 dark:border-purple-500/30 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors group"
                                        >
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.username}
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-sm font-medium text-gray-900 dark:text-text-primary">{user.username}</span>
                                            <button
                                                onClick={() => handleUserRemove(user.userId)}
                                                className="w-5 h-5 bg-gray-200 dark:bg-dark-bg hover:bg-red-500 dark:hover:bg-red-600 text-gray-500 dark:text-text-secondary hover:text-white rounded-full flex items-center justify-center transition-all ml-1"
                                                disabled={isAdding}
                                            >
                                                <XMarkIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col border-t border-gray-200/60 dark:border-border-color/60">
                        <div className="p-6 pb-4">
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-text-primary">Tìm kiếm thành viên</h3>
                                <p className="text-xs text-gray-500 dark:text-text-secondary mt-1">Tìm và thêm người vào nhóm của bạn</p>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tìm kiếm người dùng..."
                                    className="w-full pl-10 pr-4 py-3 border-0 bg-gray-50 dark:bg-dark-bg/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-accent focus:bg-white dark:focus:bg-dark-bg transition-all text-gray-900 dark:text-text-primary placeholder-gray-500 dark:placeholder-text-secondary"
                                    disabled={isAdding}
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="w-5 h-5 text-gray-400 dark:text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                {isSearching && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <div className="w-4 h-4 border-2 border-purple-500/30 dark:border-accent/30 border-t-purple-500 dark:border-t-accent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                            {isSearching ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="w-8 h-8 border-2 border-purple-500/30 dark:border-accent/30 border-t-purple-500 dark:border-t-accent rounded-full animate-spin"></div>
                                    <p className="text-sm text-gray-500 dark:text-text-secondary mt-3">Đang tìm kiếm...</p>
                                </div>
                            ) : filteredSearchResults.length > 0 ? (
                                <div className="space-y-2">
                                    {filteredSearchResults.map(participant => (
                                        <button
                                            key={participant.userId}
                                            onClick={() => handleUserSelect(participant)}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-bg/50 hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:border-purple-200 dark:hover:border-purple-500/30 border border-transparent transition-all text-left group"
                                            disabled={isAdding}
                                        >
                                            {participant.avatar ? (
                                                <img
                                                    src={participant.avatar}
                                                    alt={participant.username}
                                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50 dark:ring-purple-500/30"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-600 rounded-full flex items-center justify-center text-white font-medium ring-2 ring-white/50 dark:ring-purple-500/30">
                                                    {participant.username.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-text-primary">{participant.username}</p>
                                                <p className="text-xs text-gray-500 dark:text-text-secondary">Nhấn để thêm vào nhóm</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-border-color group-hover:border-purple-500 dark:group-hover:border-accent group-hover:bg-purple-500 dark:group-hover:bg-accent flex items-center justify-center transition-all">
                                                <UserPlus className="w-4 h-4 text-transparent group-hover:text-white" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : searchQuery.trim() && !isSearching ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200/50 dark:border-border-color/50">
                                        <svg className="w-8 h-8 text-gray-400 dark:text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-text-secondary">Không tìm thấy người dùng "{searchQuery}"</p>
                                    <p className="text-xs text-gray-400 dark:text-text-secondary mt-1">Thử tìm kiếm với từ khóa khác</p>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200/50 dark:border-border-color/50">
                                        <UserPlus className="w-8 h-8 text-gray-400 dark:text-text-secondary" />
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-text-secondary">Tìm kiếm người để thêm</p>
                                    <p className="text-xs text-gray-400 dark:text-text-secondary mt-1">Nhập tên để bắt đầu</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xl border-t border-gray-200/60 dark:border-border-color/60">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 dark:border-border-color text-gray-700 dark:text-text-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors font-medium"
                            disabled={isAdding}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleAddMembers}
                            disabled={isAdding || selectedUsers.length === 0}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-600 dark:to-indigo-600 hover:from-purple-600 hover:to-blue-700 dark:hover:from-purple-700 dark:hover:to-indigo-700 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-dark-bg disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
                        >
                            {isAdding ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Đang thêm...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Thêm thành viên
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-text-secondary">
                            {selectedUsers.length === 0 ? 'Chọn ít nhất một thành viên để thêm' :
                                `Đã chọn ${selectedUsers.length} thành viên`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

