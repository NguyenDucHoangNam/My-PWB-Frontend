"use client";

import React from "react";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface DeleteConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    conversationName: string;
    isDeleting?: boolean;
}

export const DeleteConversationModal: React.FC<DeleteConversationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    conversationName,
    isDeleting = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
                className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all border border-gray-200/50 dark:border-border-color/50">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg/50 transition-colors border border-gray-200/50 dark:border-border-color/50"
                        disabled={isDeleting}
                    >
                        <XMarkIcon className="w-5 h-5 text-gray-400 dark:text-text-secondary" />
                    </button>

                    <div className="p-6">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-500/20 rounded-full">
                            <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 dark:text-text-primary text-center mb-2">
                            Delete Conversation
                        </h3>

                        <p className="text-gray-600 dark:text-text-secondary text-center mb-6 leading-relaxed">
                            Are you sure you want to delete the conversation with{" "}
                            <span className="font-semibold text-gray-900 dark:text-text-primary">"{conversationName}"</span>?
                            <br />
                            <span className="text-sm text-red-600 dark:text-red-400 mt-2 block">
                                This action cannot be undone and all messages will be permanently deleted.
                            </span>
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 text-gray-700 dark:text-text-secondary bg-gray-100 dark:bg-dark-bg/50 hover:bg-gray-200 dark:hover:bg-dark-bg/80 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200/50 dark:border-border-color/50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
