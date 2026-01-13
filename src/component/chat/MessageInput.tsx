"use client";

import React, { useState, useRef, useEffect } from "react";
import { PaperAirplaneIcon, FaceSmileIcon } from "@heroicons/react/24/outline";
import { ConnectionStatus } from "@/types/chat";
import { FilePreview as FilePreviewType } from "@/types/file";
import { QuickFilePicker } from "./FilePicker";
import { FilePreviewList } from "./FilePreview";
import { ApiService } from "@/services/chatService";
import toast from 'react-hot-toast';

interface MessageInputProps {
    conversationId: string;
    onSendMessage: (message: string, mediaAttachments?: { mediaUrl: string; mediaName: string; mediaSize: number; mediaType: string; displayOrder?: number }[]) => void;
    connectionStatus: ConnectionStatus;
    disabled?: boolean;
    placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    conversationId,
    onSendMessage,
    connectionStatus,
    disabled = false,
    placeholder = "Type a message..."
}) => {
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FilePreviewType[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    }, [message]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const hasMessage = message.trim();
        const hasFiles = selectedFiles.length > 0;

        if ((!hasMessage && !hasFiles) || disabled || !connectionStatus.isConnected || isUploading) {
            return;
        }

        try {
            setIsUploading(true);

            let mediaAttachments: { mediaUrl: string; mediaName: string; mediaSize: number; mediaType: string; displayOrder?: number }[] = [];
            if (hasFiles) {
                const filesToUpload = selectedFiles.map(f => f.file);
                const validation = ApiService.validateFiles(filesToUpload);

                if (!validation.isValid) {
                    const errorMessage = validation.errors.join('\n');
                    throw new Error(errorMessage);
                }

                const filesWithUploadState = selectedFiles.map(file => ({
                    ...file,
                    isUploading: true,
                    uploadProgress: 0
                }));
                setSelectedFiles(filesWithUploadState);
                const uploadResults = await ApiService.uploadFilesAsyncWithProgress(conversationId, filesToUpload, (progress) => {
                    setSelectedFiles(prev => prev.map((file, index) => ({
                        ...file,
                        uploadProgress: progress[index]?.progress || 0,
                        isUploading: progress[index]?.status === 'uploading'
                    })));
                });

                mediaAttachments = uploadResults.map((result, index) => ({
                    mediaUrl: result.url,
                    mediaName: result.name,
                    mediaSize: result.size,
                    mediaType: result.contentType,
                    displayOrder: result.displayOrder || index + 1
                }));
            }
            onSendMessage(message.trim(), hasFiles ? mediaAttachments : undefined);

            if (selectedFiles.length > 0) {
                const fileCount = selectedFiles.length;
                const successMessage = fileCount === 1
                    ? `File uploaded successfully`
                    : `${fileCount} files uploaded successfully`;

                toast.success(successMessage, {
                    duration: 3000,
                });
            }

            setMessage("");
            setSelectedFiles([]);

            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } catch (error) {
            const errorMessage = 'Please choice file less than or equal 100MB';

            toast.error(errorMessage);

            setSelectedFiles(prev => prev.map(file => ({
                ...file,
                isUploading: false,
                error: 'Upload failed'
            })));
        } finally {
            setIsUploading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !isUploading) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleFilesSelected = (files: FilePreviewType[]) => {
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const handleRemoveFile = (fileId: string) => {
        setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const handleFileError = (error: string) => {
        toast.error(error);
    };



    const handleEmojiSelect = (emoji: string) => {
        setMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
        textareaRef.current?.focus();
    };

    const quickEmojis = ['😀', '😂', '😍', '🥰', '😊', '👍', '❤️', '🔥', '💯', '🎉'];

    const canSend = (message.trim() || selectedFiles.length > 0) && connectionStatus.isConnected && !disabled && !isUploading;

    return (
        <div className="border-t border-gray-200/60 dark:border-border-color/60 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl">
            {!connectionStatus.isConnected && (
                <div className="px-4 pt-3 pb-2">
                    <div className="p-3 bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-xl backdrop-blur-sm">
                        <div className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2 font-medium">
                            <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full animate-pulse"></div>
                            {connectionStatus.reconnectAttempts > 0
                                ? `Reconnecting... (${connectionStatus.reconnectAttempts})`
                                : 'Connection lost. Trying to reconnect...'
                            }
                        </div>
                    </div>
                </div>
            )}

            {selectedFiles.length > 0 && (
                <div className="px-4 pt-3 pb-2 max-h-32 overflow-y-auto">
                    <FilePreviewList
                        files={selectedFiles}
                        onRemoveFile={handleRemoveFile}
                    />
                </div>
            )}

            {showEmojiPicker && (
                <div className="mb-4 p-4 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm border border-gray-200/60 dark:border-border-color/60 rounded-2xl shadow-sm">
                    <div className="flex flex-wrap gap-2">
                        {quickEmojis.map((emoji, index) => (
                            <button
                                key={index}
                                onClick={() => handleEmojiSelect(emoji)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-500/20 rounded-xl transition-all duration-200 text-xl hover:scale-110"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="px-4 pb-4 pt-2">
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-dark-bg/50 rounded-2xl border border-gray-200/60 dark:border-border-color/60 focus-within:border-purple-400 dark:focus-within:border-accent focus-within:bg-white dark:focus-within:bg-dark-surface transition-all">
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <QuickFilePicker
                            onFilesSelected={handleFilesSelected}
                            onError={handleFileError}
                            disabled={disabled || !connectionStatus.isConnected || isUploading}
                        />

                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            disabled={disabled || !connectionStatus.isConnected || isUploading}
                            className={`p-1.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${showEmojiPicker
                                ? 'text-purple-600 dark:text-accent bg-purple-100 dark:bg-purple-500/20'
                                : 'text-gray-600 dark:text-text-secondary hover:text-purple-600 dark:hover:text-accent hover:bg-purple-100 dark:hover:bg-purple-500/20'
                                }`}
                            title="Add emoji"
                        >
                            <FaceSmileIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 min-w-0">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={disabled ? "Select a conversation to start chatting" : placeholder}
                            disabled={disabled || !connectionStatus.isConnected || isUploading}
                            rows={1}
                            className="flex-1 min-w-0 bg-transparent border-0 resize-none focus:outline-none text-gray-800 dark:text-text-primary placeholder:text-gray-500 dark:placeholder:text-text-secondary leading-relaxed text-sm"
                            style={{
                                minHeight: '24px',
                                maxHeight: '96px'
                            }}
                        />

                        <button
                            type="submit"
                            disabled={!canSend}
                            className={`flex-shrink-0 p-2 rounded-lg transition-all duration-150 ${canSend
                                ? 'bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-600 dark:to-indigo-600 hover:from-purple-600 hover:to-blue-700 dark:hover:from-purple-700 dark:hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                                : 'bg-gray-300 dark:bg-dark-bg text-gray-500 dark:text-text-secondary cursor-not-allowed'
                                }`}
                            title={
                                !connectionStatus.isConnected
                                    ? 'Disconnected'
                                    : isUploading
                                        ? 'Uploading...'
                                        : 'Send message'
                            }
                        >
                            {isUploading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <PaperAirplaneIcon className="h-5 w-5" />
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
