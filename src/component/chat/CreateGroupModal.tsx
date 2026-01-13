"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { User } from "@/types/user";
import { ConversationType, ParticipantInfoDetailResponse } from "@/types/chat";
import { ApiService } from "@/services/chatService";
import { webSocketService } from "@/libs/websocket";
import { XMarkIcon } from "@heroicons/react/24/outline";
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

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGroupCreated: (conversationId: string) => void;
    onRefreshConversations?: () => Promise<void>;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
    isOpen,
    onClose,
    onGroupCreated,
    onRefreshConversations
}) => {
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<ParticipantInfoDetailResponse[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [groupAvatar, setGroupAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>("");
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState<{
        groupName?: string;
        participants?: string;
        avatar?: string;
    }>({});

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    useEffect(() => {
        if (isOpen) {
            setGroupName("");
            setSelectedUsers([]);
            setSearchQuery("");
            setSearchResults([]);
            setGroupAvatar(null);
            setAvatarPreview("");
            setIsUploadingAvatar(false);
            setUploadProgress(0);
            setErrors({});
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
            const results = await ApiService.searchUsers(query.trim());
            setSearchResults(results);
        } catch (error) {
            setSearchResults([]);
            toast.error("Failed to search users");
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        searchUsers(debouncedSearchQuery);
    }, [debouncedSearchQuery, searchUsers]);

    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const filteredSearchResults = useMemo(() => {
        return searchResults.filter(result =>
            !selectedUsers.some(selected => selected.id === result.userId)
        );
    }, [searchResults, selectedUsers]);

    const handleUserSelect = useCallback((participant: ParticipantInfoDetailResponse) => {
        const user: User = {
            id: participant.userId,
            username: participant.username,
            email: participant.username,
            avatar: participant.avatar || undefined
        };

        if (selectedUsers.some(selected => selected.id === user.id)) {
            return;
        }

        setSelectedUsers(prev => [...prev, user]);
        setSearchQuery("");
        setSearchResults([]);
        setErrors(prev => ({ ...prev, participants: undefined }));
    }, [selectedUsers]);

    const handleUserRemove = useCallback((userId: string) => {
        setSelectedUsers(prev => prev.filter(user => user.id !== userId));
    }, []);

    const handleAvatarChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, avatar: 'Please select an image file (PNG, JPG, JPEG)' }));
            toast.error('Please select an image file');
            event.target.value = '';
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, avatar: 'Image size must be less than 10MB' }));
            toast.error('Image size must be less than 10MB');
            event.target.value = '';
            return;
        }

        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
        }

        const previewUrl = URL.createObjectURL(file);

        setGroupAvatar(file);
        setAvatarPreview(previewUrl);
        setErrors(prev => ({ ...prev, avatar: undefined }));
    }, [avatarPreview]);

    const handleRemoveAvatar = useCallback(() => {
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
        }

        setGroupAvatar(null);
        setAvatarPreview("");
        setErrors(prev => ({ ...prev, avatar: undefined }));

        const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }, [avatarPreview]);

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!groupName.trim()) {
            newErrors.groupName = "Group name is required";
        } else if (groupName.trim().length > 100) {
            newErrors.groupName = "Group name cannot exceed 100 characters";
        }

        if (selectedUsers.length < 2) {
            newErrors.participants = "Group must have at least 2 other members";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateGroup = async () => {
        if (!validateForm()) return;

        setIsCreating(true);
        try {
            const participantIds = selectedUsers.map(user => user.id || (user as any).userId).filter(Boolean);

            let conversationAvatar: string | undefined;

            setIsUploadingAvatar(true);
            if (groupAvatar) {
                setUploadProgress(0);

                try {
                    const uploadResponse = await ApiService.uploadFilesSync(
                        [groupAvatar],
                        (progressEvent) => {
                            if (progressEvent.total) {
                                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                setUploadProgress(progress);
                            }
                        }
                    );

                    if (uploadResponse.length > 0) {
                        conversationAvatar = uploadResponse[0].url;
                    } else {
                        throw new Error("No file uploaded");
                    }
                } catch (uploadError: any) {
                    const errorMessage = uploadError.response?.data?.message || "Failed to upload group avatar";
                    toast.error(errorMessage);
                    return;
                } finally {
                    setIsUploadingAvatar(false);
                    setUploadProgress(0);
                }
            }

            const conversation = await ApiService.createConversation(
                participantIds,
                ConversationType.GROUP,
                groupName.trim(),
                conversationAvatar
            );

            // Notify other users via WebSocket about group creation
            webSocketService.notifyGroupCreation(
                conversation.id,
                groupName.trim(),
                participantIds
            );

            // Also refresh conversations to ensure sync
            if (onRefreshConversations) {
                try {
                    await onRefreshConversations();
                } catch (error) {
                    console.warn('Failed to refresh conversations after group creation:', error);
                }
            }

            toast.success(`Group "${groupName}" created successfully!`);
            onGroupCreated(conversation.id);
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create group");
        } finally {
            setIsCreating(false);
            setIsUploadingAvatar(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden border border-gray-200/50 dark:border-border-color/50">
                <div className="relative flex items-center justify-center p-4 border-b border-gray-200/60 dark:border-border-color/60">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-text-primary">Create Group</h2>
                    <button
                        onClick={onClose}
                        className="absolute right-4 w-9 h-9 bg-gray-100 dark:bg-dark-bg/50 hover:bg-gray-200 dark:hover:bg-dark-bg/80 rounded-full flex items-center justify-center transition-colors text-gray-600 dark:text-text-secondary hover:text-gray-800 dark:hover:text-text-primary border border-gray-200/50 dark:border-border-color/50"
                        disabled={isCreating}
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                {avatarPreview ? (
                                    <>
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-dark-surface shadow-lg ring-2 ring-purple-500/20 dark:ring-purple-500/30">
                                            <img
                                                src={avatarPreview}
                                                alt="Group avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveAvatar}
                                            className="absolute top-0 right-0 w-7 h-7 bg-gray-600 dark:bg-dark-bg hover:bg-gray-700 dark:hover:bg-dark-surface text-white rounded-full flex items-center justify-center transition-colors shadow-lg border-2 border-white dark:border-dark-surface z-10"
                                            disabled={isCreating}
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <div
                                        onClick={() => {
                                            if (fileInputRef.current) {
                                                fileInputRef.current.click();
                                            }
                                        }}
                                        className={`w-24 h-24 bg-gray-100 dark:bg-dark-bg/50 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-bg/80 transition-colors border-2 border-dashed border-gray-300 dark:border-border-color hover:border-purple-400 dark:hover:border-accent ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <svg className="w-8 h-8 text-gray-400 dark:text-text-secondary mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-xs text-gray-500 dark:text-text-secondary font-medium">Add Photo</span>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                    id="avatar-upload"
                                    disabled={isCreating}
                                    style={{ display: 'none' }}
                                />
                            </div>
                            {errors.avatar && (
                                <p className="text-xs text-red-500 dark:text-red-400 mt-2 text-center">{errors.avatar}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-text-primary mb-2">
                                Group Name <span className="text-red-500 dark:text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => {
                                    setGroupName(e.target.value);
                                    if (errors.groupName) {
                                        setErrors(prev => ({ ...prev, groupName: undefined }));
                                    }
                                }}
                                placeholder="Enter group name..."
                                className={`w-full px-4 py-3 border-0 bg-gray-50 dark:bg-dark-bg/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-accent focus:bg-white dark:focus:bg-dark-bg transition-all text-gray-900 dark:text-text-primary placeholder-gray-500 dark:placeholder-text-secondary ${errors.groupName ? 'ring-2 ring-red-500 dark:ring-red-400 bg-red-50 dark:bg-red-500/20' : ''}`}
                                disabled={isCreating}
                                maxLength={100}
                            />
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500 dark:text-text-secondary">{groupName.length}/100</span>
                                {errors.groupName && (
                                    <span className="text-xs text-red-500 dark:text-red-400">{errors.groupName}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {selectedUsers.length > 0 && (
                        <div className="px-6 pb-4">
                            <div className="bg-purple-50 dark:bg-purple-500/20 rounded-lg p-3 border border-purple-200 dark:border-purple-500/30">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                                        Selected Members ({selectedUsers.length})
                                    </h3>
                                    <div className="text-xs text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-500/30 px-2 py-1 rounded-full">
                                        {selectedUsers.length >= 2 ? '✓ Ready' : `Need ${2 - selectedUsers.length} more`}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.map(user => (
                                        <div
                                            key={user.id}
                                            className="flex items-center gap-2 bg-white dark:bg-dark-surface/80 px-3 py-2 rounded-full border border-purple-200 dark:border-purple-500/30 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors group"
                                        >
                                            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-text-primary">{user.username}</span>
                                            <button
                                                onClick={() => handleUserRemove(user.id)}
                                                className="w-5 h-5 bg-gray-200 dark:bg-dark-bg hover:bg-red-500 dark:hover:bg-red-600 text-gray-500 dark:text-text-secondary hover:text-white rounded-full flex items-center justify-center transition-all ml-1"
                                                disabled={isCreating}
                                            >
                                                <XMarkIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {errors.participants && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/20 p-2 rounded">{errors.participants}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col border-t border-gray-200/60 dark:border-border-color/60">
                        <div className="p-6 pb-4">
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-text-primary">Add Members</h3>
                                <p className="text-xs text-gray-500 dark:text-text-secondary mt-1">Search and add people to your group</p>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search users to add..."
                                    className="w-full pl-10 pr-4 py-3 border-0 bg-gray-50 dark:bg-dark-bg/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-accent focus:bg-white dark:focus:bg-dark-bg transition-all text-gray-900 dark:text-text-primary placeholder-gray-500 dark:placeholder-text-secondary"
                                    disabled={isCreating}
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
                                    <p className="text-sm text-gray-500 dark:text-text-secondary mt-3">Searching users...</p>
                                </div>
                            ) : filteredSearchResults.length > 0 ? (
                                <div className="space-y-2">
                                    {filteredSearchResults.map(participant => (
                                        <button
                                            key={participant.userId}
                                            onClick={() => handleUserSelect(participant)}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-bg/50 hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:border-purple-200 dark:hover:border-purple-500/30 border border-transparent transition-all text-left group"
                                            disabled={isCreating}
                                        >
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-600 rounded-full flex items-center justify-center text-white font-medium ring-2 ring-white/50 dark:ring-purple-500/30">
                                                {participant.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-text-primary">{participant.username}</p>
                                                <p className="text-xs text-gray-500 dark:text-text-secondary">Tap to add to group</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-border-color group-hover:border-purple-500 dark:group-hover:border-accent group-hover:bg-purple-500 dark:group-hover:bg-accent flex items-center justify-center transition-all">
                                                <svg className="w-4 h-4 text-transparent group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
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
                                    <p className="text-sm text-gray-500 dark:text-text-secondary">No users found for "{searchQuery}"</p>
                                    <p className="text-xs text-gray-400 dark:text-text-secondary mt-1">Try a different search term</p>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200/50 dark:border-border-color/50">
                                        <svg className="w-8 h-8 text-gray-400 dark:text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-text-secondary">Search for people to add</p>
                                    <p className="text-xs text-gray-400 dark:text-text-secondary mt-1">Type a name to get started</p>
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
                            disabled={isCreating || isUploadingAvatar}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateGroup}
                            disabled={isCreating || isUploadingAvatar || !groupName.trim() || selectedUsers.length < 2}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-600 dark:to-indigo-600 hover:from-purple-600 hover:to-blue-700 dark:hover:from-purple-700 dark:hover:to-indigo-700 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-dark-bg disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
                        >
                            {isUploadingAvatar ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Uploading...'}
                                </>
                            ) : isCreating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Creating Group...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Create Group
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-text-secondary">
                            {!groupName.trim() ? 'Enter a group name' :
                                selectedUsers.length < 2 ? `Add ${2 - selectedUsers.length} more member${2 - selectedUsers.length > 1 ? 's' : ''}` :
                                    '✓ Ready to create group'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
