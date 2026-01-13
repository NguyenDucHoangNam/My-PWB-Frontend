import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Minimize2, Bot, Sparkles, Loader2, Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatWindowData } from '@/types/chatDock';

interface ChatWindowProps {
    windowData: ChatWindowData;
    onClose: (id: string) => void;
    onMinimize: (id: string) => void;
    onSendMessage: (windowId: string, text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    windowData,
    onClose,
    onMinimize,
    onSendMessage
}) => {
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isAI = windowData.role === 'ai';

    useEffect(() => {
        if (!windowData.isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [windowData.messages, windowData.isMinimized]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        onSendMessage(windowData.id, inputText);
        setInputText('');
    };

    // --- MINIMIZED STATE (Bubble) ---
    if (windowData.isMinimized) {
        return (
            <div className="relative group">
                <button
                    onClick={() => onMinimize(windowData.id)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 transition-transform hover:scale-105
                        ${isAI
                            ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 border-purple-400 text-white shadow-purple-500/50'
                            : 'bg-[#1e1e2e] border-gray-600'
                        }`}
                >
                    {isAI ? (
                        <Bot size={24} />
                    ) : (
                        <img
                            src={windowData.avatar || 'https://ui-avatars.com/api/?name=' + windowData.name}
                            alt={windowData.name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    )}

                    {/* Unread Badge */}
                    {windowData.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#13141c]">
                            {windowData.unreadCount}
                        </span>
                    )}
                </button>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                    {windowData.name}
                </div>

                {/* Close Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose(windowData.id);
                    }}
                    className="absolute -top-2 -left-2 w-5 h-5 bg-gray-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                >
                    <X size={12} />
                </button>
            </div>
        );
    }

    // --- MAXIMIZED STATE (Full Window) ---
    return (
        <div className="w-[360px] max-w-[92vw]" role="dialog" aria-label="Hộp thoại chat">
        <div className="flex flex-col h-[500px] bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] border border-gray-200/70 dark:border-border-color/70 overflow-hidden transition-all transform animate-[chatIn_180ms_ease-out]">
            {/* Header */}
            <div
                className="relative z-20 flex items-center justify-between px-3 py-2 border-b border-gray-200/70 dark:border-border-color/70 bg-white dark:bg-dark-surface select-none"
            >
                <div className="flex items-center gap-2">
                    {isAI ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                            <Bot size={18} />
                        </div>
                    ) : (
                        <img
                            src={windowData.avatar || 'https://ui-avatars.com/api/?name=' + windowData.name}
                            alt={windowData.name}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    )}

                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-text-primary leading-4 truncate max-w-[220px]">
                            {windowData.name}
                            {isAI && <Sparkles size={10} className="inline ml-1 text-yellow-400" />}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className={`w-2 h-2 rounded-full ${windowData.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                            <span className="text-[11px] text-gray-600 dark:text-text-secondary">
                                {isAI ? 'AI Assistant' : (windowData.status === 'online' ? 'Đang hoạt động' : 'Ngoại tuyến')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onMinimize(windowData.id)}
                        className="relative p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg/60 text-gray-600 dark:text-text-secondary transition-colors"
                        aria-label="Thu nhỏ"
                    >
                        <Minimize2 size={16} />
                        {windowData.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] leading-4 text-center">
                                {windowData.unreadCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => onClose(windowData.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg/60 text-gray-600 dark:text-text-secondary transition-colors"
                        aria-label="Đóng"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Messages Body */}
            <div className="h-[440px] max-h-[70vh] flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                {windowData.messages.length === 0 && isAI && (
                    <div className="text-center text-gray-500 dark:text-gray-400 text-xs mt-10 px-4">
                        <div className="w-16 h-16 bg-purple-500/10 dark:bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-400 dark:text-purple-300">
                            <Sparkles size={32} />
                        </div>
                        Xin chào! Tôi là AI Assistant của Producer Workbench. Tôi có thể giúp bạn điều gì hôm nay?
                    </div>
                )}

                {windowData.messages.map((msg) => {
                    const isMe = msg.senderId === 'me';
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm break-words
                                    ${isMe
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm shadow-sm'
                                        : isAI
                                            ? 'bg-white dark:bg-dark-surface text-gray-900 dark:text-text-primary border border-gray-200 dark:border-purple-500/30 rounded-bl-sm shadow-sm'
                                            : 'bg-white dark:bg-dark-surface text-gray-900 dark:text-text-primary border border-gray-200 dark:border-border-color rounded-bl-sm shadow-sm'
                                    }
                                `}
                            >
                                {isAI && !isMe ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </div>
                                ) : (
                                    msg.text
                                )}
                                <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {msg.timestamp}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {windowData.isTyping && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-border-color px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-2 shadow-sm">
                            <Loader2 size={14} className="animate-spin text-purple-500 dark:text-purple-400" />
                            <span className="text-gray-600 dark:text-gray-400 text-xs">Đang nhập...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSend} className="flex-shrink-0 border-t border-gray-200/70 dark:border-border-color/70 bg-white dark:bg-dark-surface p-2">
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-dark-bg/50 rounded-2xl border border-gray-200/60 dark:border-border-color/60 focus-within:border-purple-400 dark:focus-within:border-accent focus-within:bg-white dark:focus-within:bg-dark-surface transition-all">
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button type="button" className="p-1.5 rounded-xl text-gray-600 dark:text-text-secondary hover:text-purple-600 dark:hover:text-accent hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all">
                            <Paperclip size={18} />
                        </button>
                    </div>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 min-w-0 bg-transparent border-0 focus:outline-none text-gray-800 dark:text-text-primary placeholder:text-gray-500 dark:placeholder:text-text-secondary text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className={`flex-shrink-0 p-2 rounded-lg transition-all duration-150 ${
                            inputText.trim()
                                ? 'bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-600 dark:to-indigo-600 hover:from-purple-600 hover:to-blue-700 dark:hover:from-purple-700 dark:hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                                : 'bg-gray-300 dark:bg-dark-bg text-gray-500 dark:text-text-secondary cursor-not-allowed'
                        }`}
                        title="Send message"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
        </div>
    );
};
