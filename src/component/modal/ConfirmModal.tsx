import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    show: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClass?: string;
    icon?: React.ReactNode;
    onClose: () => void;
    onConfirm: () => void;
    isProcessing?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    show,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    confirmButtonClass = 'bg-red-600 hover:bg-red-500',
    icon,
    onClose,
    onConfirm,
    isProcessing = false,
}) => {
    if (!show) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-black/90 backdrop-blur-lg border border-red-700/50 rounded-xl shadow-2xl w-full max-w-md animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-red-800/50">
                    <div className="flex items-center gap-3">
                        {icon || (
                            <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/50">
                                <AlertTriangle size={24} className="text-red-400" />
                            </div>
                        )}
                        <h3 className="text-2xl font-bold text-white">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="p-1 rounded-lg hover:bg-gray-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-300 text-lg mb-6">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className={`flex-1 px-4 py-3 ${confirmButtonClass} text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

