"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChatMessage } from "@/types/chat";
import { getFileIcon, formatFileSize } from "@/types/file";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { LoadingSpinner } from "./LoadingSpinner";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';

interface MessageListProps {
    messages: ChatMessage[];
    loading?: boolean;
    hasMoreMessages?: boolean;
    onLoadMore?: () => void;
    loadingMore?: boolean;
    hasSelectedConversation?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
    messages,
    loading = false,
    hasMoreMessages = false,
    onLoadMore,
    loadingMore = false,
    hasSelectedConversation = false
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const prevMessageCountRef = useRef(0);
    const isLoadingMoreRef = useRef(false);
    const [isNearBottom, setIsNearBottom] = useState(true);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [previewModal, setPreviewModal] = useState<{
        isOpen: boolean;
        images: string[];
        initialIndex: number;
    }>({
        isOpen: false,
        images: [],
        initialIndex: 0
    });

    const scrollToBottomExact = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, []);

    useEffect(() => {
        if (messages.length === 0) {
            prevMessageCountRef.current = 0;
            return;
        }

        const currentCount = messages.length;
        const prevCount = prevMessageCountRef.current;

        if (prevCount === 0 && currentCount > 0) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
                setIsNearBottom(true);
            }, 200);
            prevMessageCountRef.current = currentCount;
            return;
        }

        const isNewMessages = currentCount > prevCount && !isLoadingMoreRef.current;

        if (isNewMessages && isNearBottom && messagesEndRef.current) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }

        prevMessageCountRef.current = currentCount;
    }, [messages.length, isNearBottom]);

    useEffect(() => {
        if (!loadingMore) {
            isLoadingMoreRef.current = false;
        }
    }, [loadingMore]);

    useEffect(() => {
        if (messages.length === 0) {
            setIsNearBottom(true);
            setShowScrollToBottom(false);
            prevMessageCountRef.current = 0;
            isLoadingMoreRef.current = false;
        }
    }, [messages.length]);



    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        // Use a tighter threshold so padding/spacers don't mark us as "near bottom"
        const remaining = scrollHeight - clientHeight - scrollTop;
        const nearBottom = remaining <= 12; // tighter tolerance so we only auto-scroll at true bottom

        setIsNearBottom(nearBottom);
        setShowScrollToBottom(!nearBottom);

        if (scrollTop < 100 && hasMoreMessages && !loadingMore) {
            isLoadingMoreRef.current = true;
            onLoadMore?.();
        }
    }, [hasMoreMessages, loadingMore, onLoadMore]);

    // Keep anchored to bottom when content grows (e.g., images/videos finish loading)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onMediaLoad = () => {
            if (isNearBottom) scrollToBottomExact();
        };

        const mediaEls = Array.from(container.querySelectorAll('img, video')) as (HTMLImageElement | HTMLVideoElement)[];
        mediaEls.forEach(el => {
            if (el instanceof HTMLImageElement) {
                if (!el.complete) el.addEventListener('load', onMediaLoad, { once: true });
            } else {
                if (el.readyState < 4) el.addEventListener('loadeddata', onMediaLoad, { once: true });
            }
        });

        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => {
                if (isNearBottom) scrollToBottomExact();
            });
            resizeObserver.observe(container);
        }

        return () => {
            mediaEls.forEach(el => {
                if (el instanceof HTMLImageElement) {
                    el.removeEventListener('load', onMediaLoad);
                } else {
                    el.removeEventListener('loadeddata', onMediaLoad);
                }
            });
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, [isNearBottom, messages.length, loadingMore, scrollToBottomExact]);

    // Ensure at bottom on first open (like Facebook)
    useEffect(() => {
        if (!hasSelectedConversation) return;
        if (messages.length === 0) return;
        if (prevMessageCountRef.current !== 0) return;

        requestAnimationFrame(() => {
            setTimeout(() => {
                scrollToBottomExact();
                setIsNearBottom(true);
                setShowScrollToBottom(false);
            }, 0);
        });
    }, [hasSelectedConversation, messages.length, scrollToBottomExact]);

    // Safety net when popup toggles
    useEffect(() => {
        if (!hasSelectedConversation) return;
        requestAnimationFrame(() => {
            scrollToBottomExact();
        });
    }, [hasSelectedConversation, scrollToBottomExact]);

    const formatTime = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return 'Invalid Date';

            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        } catch {
            return 'Invalid Date';
        }
    };

    const openImagePreview = (images: string[], initialIndex: number) => {
        setPreviewModal({
            isOpen: true,
            images,
            initialIndex
        });
    };

    const closeImagePreview = () => {
        setPreviewModal({
            isOpen: false,
            images: [],
            initialIndex: 0
        });
    };

    const scrollToBottomManually = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            setIsNearBottom(true);
            setShowScrollToBottom(false);
            prevMessageCountRef.current = messages.length;
        }
    };

    const extractFilename = (url: string, fallback: string): string => {
        try {
            const urlParts = url.split('/');
            const encodedFilename = urlParts[urlParts.length - 1];
            if (!encodedFilename) return fallback;

            // Decode and remove query parameters
            const decodedName = decodeURIComponent(encodedFilename).split('?')[0];
            return decodedName || fallback;
        } catch (e) {
            return fallback;
        }
    };

    const downloadFile = (url: string, filename?: string) => {
        try {
            // Simple direct download - works for most cases
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || url.split('/').pop() || 'download';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`${filename || 'File'} downloaded successfully!`, {
                duration: 3000,
            });
        } catch (error) {
            toast.error('Failed to download file. Please try again.');
        }
    };

    const renderMediaAttachments = (mediaUrls: string[] | undefined, mediaAttachments: any[] | undefined, isMe: boolean) => {
        // Handle both old format (mediaUrl) and new format (mediaAttachments)
        let attachments: { url: string; name?: string; size?: number; type?: string }[] = [];

        if (mediaAttachments && mediaAttachments.length > 0) {
            // New format from backend
            attachments = mediaAttachments.map(attachment => ({
                url: attachment.mediaUrl,
                name: attachment.mediaName,
                size: attachment.mediaSize,
                type: attachment.mediaType
            }));
        } else if (mediaUrls && mediaUrls.length > 0) {
            // Old format for backward compatibility
            attachments = mediaUrls.map(url => ({ url }));
        }

        if (attachments.length === 0) return null;

        const images: { url: string; name?: string; size?: number; type?: string }[] = [];
        const otherFiles: { url: string; name?: string; size?: number; type?: string }[] = [];

        attachments.forEach(attachment => {
            const isImage = attachment.type?.startsWith('image/') ||
                attachment.url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i);
            if (isImage) {
                images.push(attachment);
            } else {
                otherFiles.push(attachment);
            }
        });

        return (
            <div className="mt-2 space-y-2">
                {images.length > 0 && (
                    <div className={`rounded-lg overflow-hidden shadow-sm ${images.length === 1 ? 'max-w-64' : 'max-w-80'
                        }`}>
                        {images.length === 1 ? (
                            <div className="relative group">
                                <img
                                    src={images[0].url}
                                    alt="Attachment"
                                    className="w-full h-auto cursor-pointer hover:opacity-95 transition-opacity max-h-64 object-cover"
                                    onClick={() => openImagePreview(images.map(img => img.url), 0)}
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const fileName = images[0].name || extractFilename(images[0].url, `image-${Date.now()}.jpg`);
                                        downloadFile(images[0].url, fileName);
                                    }}
                                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                                    title="Download image"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ) : images.length === 2 ? (
                            <div className="grid grid-cols-2 gap-1">
                                {images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={image.url}
                                            alt={`Attachment ${index + 1}`}
                                            className="w-full h-32 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                            onClick={() => openImagePreview(images.map(img => img.url), index)}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const fileName = image.name || extractFilename(image.url, `image-${index + 1}-${Date.now()}.jpg`);
                                                downloadFile(image.url, fileName);
                                            }}
                                            className="absolute top-1 right-1 w-6 h-6 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                                            title="Download image"
                                        >
                                            <ArrowDownTrayIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : images.length === 3 ? (
                            <div className="grid grid-cols-2 gap-1 h-64">
                                <img
                                    src={images[0].url}
                                    alt="Attachment 1"
                                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                    onClick={() => openImagePreview(images.map(img => img.url), 0)}
                                />
                                <div className="grid grid-rows-2 gap-1">
                                    {images.slice(1).map((image, index) => (
                                        <img
                                            key={index + 1}
                                            src={image.url}
                                            alt={`Attachment ${index + 2}`}
                                            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                            onClick={() => openImagePreview(images.map(img => img.url), index + 1)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-1 h-64">
                                {images.slice(0, 3).map((image, index) => (
                                    <img
                                        key={index}
                                        src={image.url}
                                        alt={`Attachment ${index + 1}`}
                                        className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                        onClick={() => openImagePreview(images.map(img => img.url), index)}
                                    />
                                ))}
                                <div
                                    className="relative cursor-pointer hover:opacity-95 transition-opacity"
                                    onClick={() => openImagePreview(images.map(img => img.url), 3)}
                                >
                                    <img
                                        src={images[3].url}
                                        alt="Attachment 4"
                                        className="w-full h-full object-cover"
                                    />
                                    {images.length > 4 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="text-white font-semibold text-lg">
                                                +{images.length - 4}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {otherFiles.map((file, index) => {
                    const isVideo = file.type?.startsWith('video/') || file.url.match(/\.(mp4|webm|ogg|avi|mov)(\?|$)/i);

                    if (isVideo) {
                        return (
                            <div key={`video-${index}`} className="relative group rounded-lg overflow-hidden max-w-64 shadow-sm">
                                <video
                                    src={file.url}
                                    controls
                                    className="w-full h-auto rounded-lg max-h-48 object-cover"
                                    preload="metadata"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const fileName = file.name || extractFilename(file.url, `video-${index + 1}-${Date.now()}.mp4`);
                                        downloadFile(file.url, fileName);
                                    }}
                                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                                    title="Download video"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    }

                    const fileName = file.name || extractFilename(file.url, `File ${index + 1}`);
                    return (
                        <div
                            key={`file-${index}`}
                            className={`relative group flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-sm max-w-64 ${isMe ? 'bg-blue-50' : 'bg-gray-50'
                                }`}
                            onClick={() => downloadFile(file.url, fileName)}
                        >
                            <div className="text-xl">
                                {getFileIcon(file.type || 'application/octet-stream')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isMe ? 'text-blue-800' : 'text-gray-900'
                                    }`}>
                                    {fileName}
                                </p>
                                <p className={`text-xs ${isMe ? 'text-blue-600' : 'text-gray-500'
                                    }`}>
                                    {file.size ? formatFileSize(file.size) : 'Click to download'}
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    downloadFile(file.url, fileName);
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 ${isMe ? 'bg-blue-200 hover:bg-blue-300 text-blue-700' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                    }`}
                                title="Download file"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SENDING':
                return (
                    <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-100"></div>
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-200"></div>
                    </div>
                );
            case 'SENT':
                return <span className="text-slate-400 text-xs">✓</span>;
            case 'DELIVERED':
                return <span className="text-slate-500 text-xs">✓✓</span>;
            case 'READ':
                return <span className="text-blue-400 text-xs">✓✓</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 relative">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-100/30 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-pink-100/30 dark:bg-pink-500/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
                    <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-blue-100/30 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
                </div>

                <div className="text-center max-w-sm relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-purple-600/30 dark:to-indigo-600/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-purple-200/50 dark:border-purple-500/30">
                        <div className="w-8 h-8 border-2 border-purple-500/30 dark:border-accent/30 border-t-purple-500 dark:border-t-accent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-gray-800 dark:text-text-primary font-bold text-xl mb-3">Loading messages...</h3>
                    <p className="text-gray-600 dark:text-text-secondary leading-relaxed mb-4">Please wait while we fetch your conversation</p>
                </div>
            </div>
        );
    }

    if (messages.length === 0) {
        if (!hasSelectedConversation) {
            return (
                <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/40 dark:from-dark-bg dark:via-purple-900/20 dark:to-indigo-900/20">
                    <div className="absolute inset-0">
                        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-purple-400/8 dark:from-purple-500/20 to-indigo-400/8 dark:to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-pink-400/6 dark:from-pink-500/15 to-purple-400/6 dark:to-purple-500/15 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-blue-400/4 dark:from-blue-500/10 to-purple-400/4 dark:to-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

                        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-purple-400/20 dark:bg-purple-400/40 rounded-full animate-bounce animation-delay-500"></div>
                        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-pink-400/30 dark:bg-pink-400/50 rounded-full animate-bounce animation-delay-1500"></div>
                        <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-indigo-400/25 dark:bg-indigo-400/45 rounded-full animate-bounce animation-delay-2500"></div>
                    </div>

                    <div className="text-center max-w-2xl relative z-10">
                        <div className="relative mb-8">
                            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 dark:from-purple-600 dark:via-purple-700 dark:to-indigo-800 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform hover:scale-105 transition-all duration-500 hover:rotate-3 border border-purple-400/30 dark:border-purple-500/50">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                                <svg className="w-16 h-16 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div className="absolute inset-0 w-32 h-32 mx-auto bg-purple-500/20 dark:bg-purple-500/30 rounded-3xl blur-xl animate-pulse"></div>
                        </div>

                        <h1 className="text-4xl font-bold text-gray-800 dark:text-text-primary mb-4 bg-gradient-to-r from-gray-800 via-purple-800 to-indigo-800 dark:from-text-primary dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                            Welcome to Chat
                        </h1>
                        <p className="text-gray-600 dark:text-text-secondary text-lg leading-relaxed mb-8 max-w-lg mx-auto">
                            Select a conversation from the sidebar to start chatting, or search for users to begin a new conversation
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
                            <div className="group flex flex-col items-center p-6 rounded-2xl bg-white/60 dark:bg-dark-surface/60 backdrop-blur-sm border border-gray-200/50 dark:border-border-color/50 hover:bg-white/80 dark:hover:bg-dark-surface/80 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-text-primary mb-2">Secure & Private</h3>
                                <p className="text-sm text-gray-600 dark:text-text-secondary text-center leading-relaxed">End-to-end encrypted messages for complete privacy</p>
                            </div>

                            <div className="group flex flex-col items-center p-6 rounded-2xl bg-white/60 dark:bg-dark-surface/60 backdrop-blur-sm border border-gray-200/50 dark:border-border-color/50 hover:bg-white/80 dark:hover:bg-dark-surface/80 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-500 dark:from-purple-500 dark:to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-text-primary mb-2">Lightning Fast</h3>
                                <p className="text-sm text-gray-600 dark:text-text-secondary text-center leading-relaxed">Real-time messaging with instant delivery</p>
                            </div>

                            <div className="group flex flex-col items-center p-6 rounded-2xl bg-white/60 dark:bg-dark-surface/60 backdrop-blur-sm border border-gray-200/50 dark:border-border-color/50 hover:bg-white/80 dark:hover:bg-dark-surface/80 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-text-primary mb-2">Rich Media</h3>
                                <p className="text-sm text-gray-600 dark:text-text-secondary text-center leading-relaxed">Share photos, files, and more with ease</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex-1 flex items-center justify-center p-8 relative">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-100/30 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-pink-100/30 dark:bg-pink-500/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
                    <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-blue-100/30 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
                </div>

                <div className="text-center max-w-sm relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-purple-600/30 dark:to-indigo-600/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-purple-200/50 dark:border-purple-500/30">
                        <svg className="w-12 h-12 text-purple-500 dark:text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h3 className="text-gray-800 dark:text-text-primary font-bold text-xl mb-3">No messages yet</h3>
                    <p className="text-gray-600 dark:text-text-secondary leading-relaxed mb-4">Start the conversation by sending your first message!</p>
                    <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-text-secondary text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Messages are end-to-end encrypted</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="absolute left-0 right-0 top-0 bottom-24 overflow-y-auto overflow-x-hidden px-6 pb-2"
            onScroll={handleScroll}
        >
            <div className="min-h-full flex flex-col justify-end">
                {loadingMore && (
                    <div className="flex justify-center py-4">
                        <div className="flex items-center gap-2 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-gray-200/60 dark:border-border-color/60">
                            <LoadingSpinner size="sm" color="blue" />
                            <span className="text-sm text-gray-600 dark:text-text-secondary">Loading...</span>
                        </div>
                    </div>
                )}



                {messages.map((msg, index) => {
                    const isMe = msg.me;
                    const showTime = index === 0 || (
                        messages[index - 1] &&
                        Math.abs(new Date(msg.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime()) > 300000
                    );
                    return (
                        <div key={msg.id || msg.tempId || index} className="message-enter">
                            {showTime && (
                                <div className="flex justify-center mb-6">
                                    <span className="text-xs text-gray-500 dark:text-text-secondary bg-white/60 dark:bg-dark-surface/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/60 dark:border-border-color/60 shadow-sm">
                                        {formatTime(msg.createdAt)}
                                    </span>
                                </div>
                            )}

                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-1 last:mb-0 space-y-1`}>
                                {/* Show username for non-me messages in group chats */}
                                {!isMe && msg.username && (
                                    <div className="flex items-center gap-2 px-2">
                                        <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-blue-500 dark:from-purple-500 dark:to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                            {msg.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xs font-medium text-gray-600 dark:text-text-secondary">
                                            {msg.username}
                                        </span>
                                    </div>
                                )}

                                {msg.content && (
                                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 ${isMe
                                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-600 dark:to-indigo-600 text-white rounded-br-md'
                                        : 'bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm border border-gray-200/60 dark:border-border-color/60 text-gray-800 dark:text-text-primary rounded-bl-md'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                            {msg.content}
                                        </p>
                                        <div className={`flex items-center justify-end gap-2 mt-2 ${isMe ? 'text-purple-100 dark:text-purple-200' : 'text-gray-500 dark:text-text-secondary'
                                            }`}>
                                            <span className="text-xs font-medium">
                                                {formatTime(msg.createdAt)}
                                            </span>
                                            {isMe && getStatusIcon(msg.status || 'SENT')}
                                        </div>
                                    </div>
                                )}

                                {(msg.mediaUrl || msg.mediaAttachments) && (
                                    <div className="space-y-1">
                                        {renderMediaAttachments(msg.mediaUrl, msg.mediaAttachments, isMe)}
                                        {!msg.content && (
                                            <div className={`flex items-center ${isMe ? 'justify-end' : 'justify-start'} gap-2 px-2`}>
                                                <span className="text-xs text-slate-500 font-medium">
                                                    {formatTime(msg.createdAt)}
                                                </span>
                                                {isMe && getStatusIcon(msg.status || 'SENT')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {showScrollToBottom && (
                <button
                    onClick={scrollToBottomManually}
                    className="fixed bottom-28 right-6 w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-600 dark:to-indigo-600 hover:from-purple-600 hover:to-blue-700 dark:hover:from-purple-700 dark:hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-30 animate-bounce border border-purple-400/30 dark:border-purple-500/50"
                    title="Scroll to bottom"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </button>
            )}

            <ImagePreviewModal
                images={previewModal.images}
                initialIndex={previewModal.initialIndex}
                isOpen={previewModal.isOpen}
                onClose={closeImagePreview}
            />
        </div>
    );
};
