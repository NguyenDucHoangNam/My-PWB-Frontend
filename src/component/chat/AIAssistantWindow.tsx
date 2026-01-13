// AIAssistantWindow - Extracted from FloatingAssistant
// Reusable AI chat window UI for dock with ALL features

import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Bot, Loader2, Minimize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface RelevantGuide {
  id: string | number;
  title: string;
  content?: string; // Made optional to match API response
  category?: string; // Made optional to match API response
  imageUrl?: string;
}

interface AIMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status?: string;
  relevantGuides?: RelevantGuide[];
  suggestedActions?: string[];
}

interface AIAssistantWindowProps {
  conversationId: string;
  messages: AIMessage[];
  isTyping: boolean;
  isMinimized: boolean;
  unreadCount?: number;
  onClose: () => void;
  onMinimize: () => void;
  onSendMessage: (text: string) => void;
}

export const AIAssistantWindow: React.FC<AIAssistantWindowProps> = ({
  messages,
  isTyping,
  isMinimized,
  unreadCount = 0,
  onClose,
  onMinimize,
  onSendMessage,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Minimized bubble
  if (isMinimized) {
    return (
      <div className="relative group">
        <motion.button
          onClick={onMinimize}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-110 transition-transform"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bot className="w-6 h-6 text-white" />
        </motion.button>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-[18px] text-center shadow-md">
            {unreadCount > 99 ? "99+" : unreadCount}
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

  // Full window with suggested actions
  return (
    <>
      <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, rgba(168,85,247,0.3), rgba(236,72,153,0.3));
                    border-radius: 10px;
                    border: 1px solid rgba(168,85,247,0.1);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, rgba(168,85,247,0.5), rgba(236,72,153,0.5));
                }
                .horizontal-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .horizontal-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }
                .horizontal-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(90deg, rgba(168,85,247,0.3), rgba(236,72,153,0.3));
                    border-radius: 10px;
                }
            `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-[360px] max-w-[92vw] h-[500px] max-h-[75vh] rounded-2xl flex flex-col overflow-hidden relative border border-purple-500/30 shadow-[0_0_40px_rgba(160,50,255,0.2)]"
      >
        {/* Background with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#130028]/95 via-[#240046]/90 to-[#2d0061]/95 backdrop-blur-xl z-0" />

        {/* Header */}
        <div className="relative z-10 p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(200,100,255,0.5)]">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
                Trợ lý AI của PWB 🚀
              </h3>
              <p className="text-xs text-purple-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onMinimize}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-purple-300 hover:text-white"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-purple-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-center text-purple-300 text-sm mt-10 px-4">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles size={32} className="text-purple-400" />
              </div>
              Xin chào! Tôi là AI Assistant của Producer Workbench. Tôi có thể
              giúp bạn điều gì hôm nay?
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="space-y-3">
              <div
                className={`flex ${
                  message.senderId === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl backdrop-blur-sm border ${
                    message.senderId === "me"
                      ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-tr-none border-pink-400/20 shadow-lg"
                      : "bg-white/10 text-gray-100 rounded-tl-none border-purple-400/10 shadow-md"
                  }`}
                >
                  {message.senderId !== "me" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          h2: ({ node, ...props }) => (
                            <h2
                              {...props}
                              className="text-sm font-bold mt-2 mb-1.5"
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              {...props}
                              className="text-xs font-semibold mt-1.5 mb-1"
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              {...props}
                              className="list-disc ml-3 my-1.5 space-y-0.5 text-sm"
                            />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol
                              {...props}
                              className="list-decimal ml-3 my-1.5 space-y-0.5 text-sm"
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p
                              {...props}
                              className="text-sm leading-relaxed my-1"
                            />
                          ),
                          img: ({ node, ...props }) => (
                            <img
                              {...props}
                              className="rounded-lg max-w-full h-auto my-3 border border-white/10 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                              loading="lazy"
                              alt={props.alt || "Guide image"}
                              onClick={() => {
                                const imgSrc = props.src || "";
                                if (imgSrc) {
                                  setSelectedImage(imgSrc);
                                }
                              }}
                            />
                          ),
                        }}
                      >
                        {message.text
                          .replace(/---FOLLOW_UP---[\s\S]*/g, "")
                          .trim()}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  )}
                  <span className="text-[9px] opacity-50 mt-1 block">
                    {message.timestamp}
                  </span>
                </div>
              </div>

              {/* Suggested Actions - FROM FLOATINGASSISTANT */}
              {message.senderId !== "me" &&
                message.suggestedActions &&
                message.suggestedActions.length > 0 && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] space-y-1.5">
                      <p className="text-[10px] text-purple-300/80 font-medium uppercase tracking-wide">
                        Gợi ý câu hỏi
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {message.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => setInputValue(action)}
                            className="group relative px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-400/20 hover:border-purple-400/40 text-[11px] text-purple-200 hover:text-white transition-all shadow-sm hover:shadow-md"
                          >
                            <span className="relative z-10">{action}</span>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-2 items-center backdrop-blur-sm">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                <span className="text-xs text-purple-300">
                  AI đang suy nghĩ...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area with Quick Suggestions */}
        <div className="relative z-10 p-4 border-t border-white/10 bg-white/5">
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi AI..."
              className="w-full bg-[#0f1016]/60 border border-purple-500/20 rounded-xl py-2 pl-3 pr-10 text-xs text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder-purple-400/40"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="absolute right-1.5 p-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 text-white rounded-lg transition-all shadow-[0_0_10px_rgba(200,100,255,0.3)]"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 horizontal-scrollbar">
            {[
              "Làm sao để tạo dự án?",
              "Hướng dẫn login",
              "Quản lý workspace",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInputValue(suggestion)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-purple-500/40 text-[10px] text-purple-200 hover:text-white transition-all flex items-center gap-1 group"
              >
                <Sparkles className="w-2.5 h-2.5 text-pink-400 group-hover:text-pink-300" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Image Lightbox Modal - Render via Portal */}
      {selectedImage &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl"
              onClick={() => setSelectedImage(null)}
            >
              {/* Animated Background Orbs */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div
                  className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
              </div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative max-w-6xl max-h-[95vh] p-6"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-4 -right-4 p-3 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full text-white transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] z-10 group"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* Image Container with Gradient Border */}
                <div className="relative p-1 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 shadow-2xl">
                  <div className="relative rounded-xl overflow-hidden bg-black">
                    <img
                      src={selectedImage}
                      alt="Enlarged view"
                      className="max-w-full max-h-[88vh] rounded-xl object-contain"
                    />
                    {/* Shine Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
