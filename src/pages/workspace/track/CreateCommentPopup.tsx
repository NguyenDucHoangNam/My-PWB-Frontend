import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';

interface CreateCommentPopupProps {
    timestamp: number;
    onSubmit: (content: string) => void;
    onCancel: () => void;
    position?: { x: number; y: number };
}

export default function CreateCommentPopup({
    timestamp,
    onSubmit,
    onCancel,
    position,
}: CreateCommentPopupProps) {
    const [content, setContent] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        textareaRef.current?.focus();   
    }, []);

    const handleSubmit = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (content.trim()) {
            onSubmit(content.trim());
            setContent('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onCancel();
                }}
            />

            {/* Popup */}
            <div
                className="fixed z-50 w-96 bg-gray-900 border border-orange-500/50 rounded-lg shadow-2xl p-4"
                style={
                    position
                        ? {
                              left: Math.min(position.x, window.innerWidth - 400),
                              top: Math.min(position.y, window.innerHeight - 200),
                          }
                        : {
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                          }
                }
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">💬</span>
                        </div>
                        <div>
                            <div className="text-white font-semibold text-sm">
                                Comment tại thời điểm
                            </div>
                            <div className="text-orange-400 font-mono text-xs">
                                @ {formatTime(timestamp)}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập nội dung comment... (Ctrl+Enter để gửi)"
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                />

                {/* Actions */}
                <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-gray-500">
                        Ctrl+Enter để gửi, Esc để hủy
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onCancel();
                            }}
                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!content.trim()}
                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                            <Send size={14} />
                            Gửi
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

