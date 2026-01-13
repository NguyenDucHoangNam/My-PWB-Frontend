import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  aiContextService,
  type RelevantGuide,
  AuthenticationRequiredError,
} from "../../services/aiContextService";
import { useCosmicToast } from "../../component/toast/CosmicToastProvider";
import { useNavigate } from "react-router-dom";
import { LoginPromptModal } from "../ai/LoginPromptModal";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  relevantGuides?: RelevantGuide[];
  suggestedActions?: string[];
  intent?: string;
  confidence?: number;
}

const FloatingAssistant: React.FC = () => {
  const { showToast } = useCosmicToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi là AI Assistant của Producer Workbench. Tôi có thể giúp bạn điều gì hôm nay?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentPage, setCurrentPage] = useState(window.location.pathname);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Track current page changes
    const handleLocationChange = () => {
      setCurrentPage(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // Load conversation history from Redis on mount (only if authenticated)
  useEffect(() => {
    const loadHistory = async () => {
      // ✅ Check authentication before loading history
      if (!aiContextService.isAuthenticated()) {
        console.log("⏭️ Skipping history load - user not authenticated");
        return;
      }

      try {
        const response = await aiContextService.getHistory();

        if (response.result && response.result.messages.length > 0) {
          // Convert backend messages to frontend Message format
          const loadedMessages: Message[] = response.result.messages.map(
            (msg, idx) => ({
              id: `history-${idx}`,
              text: msg.content,
              sender: msg.role === "user" ? "user" : "ai",
              timestamp: new Date(),
            })
          );

          // Prepend welcome message, then history
          setMessages([
            {
              id: "welcome",
              text: "Xin chào! Tôi là AI Assistant của Producer Workbench. Tôi có thể giúp bạn điều gì hôm nay?",
              sender: "ai",
              timestamp: new Date(),
            },
            ...loadedMessages,
          ]);

          console.log(
            `📜 Loaded ${loadedMessages.length} messages from history`
          );
        }
      } catch (error) {
        // ✅ Handle authentication error
        if (error instanceof AuthenticationRequiredError) {
          console.log("⏭️ Authentication required for history - skipping");
          return;
        }
        console.warn("Failed to load history:", error);
        // Keep default welcome message on error
      }
    };

    loadHistory();
  }, []); // Run once on mount

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    const userQuery = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      // ✅ Simplified request - backend auto-manages conversation memory via Redis
      const response = await aiContextService.getGuidance({
        query: userQuery,
        currentPage,
        includeRelatedGuides: true,
        maxGuides: 3,
      });

      // ✅ Backend returns code 200 for success (ApiResponse default)
      if (response.result && response.result.answer) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.result.answer,
          sender: "ai",
          timestamp: new Date(),
          relevantGuides: response.result.relevantGuides || undefined,
          suggestedActions: response.result.suggestedActions || undefined,
          intent: response.result.intent,
          confidence: response.result.confidence,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(response.message || "Failed to get AI response");
      }
    } catch (error: any) {
      console.error("AI Error:", error);

      // ✅ Handle authentication error first
      if (error instanceof AuthenticationRequiredError) {
        setIsOpen(false);
        setShowLoginModal(true);
        return;
      }

      // Enhanced error messages
      let errorMessage = "Không thể kết nối với AI. Vui lòng thử lại!";
      if (error.response?.status === 401) {
        errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        setIsOpen(false);
        setShowLoginModal(true);
      } else if (error.response?.status === 500) {
        errorMessage =
          "Hệ thống AI tạm thời không khả dụng. Vui lòng thử lại sau.";
      }

      showToast(errorMessage, "error");
      const errorMsgObj: Message = {
        id: (Date.now() + 1).toString(),
        text: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau một chút.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsgObj]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
                .horizontal-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(90deg, rgba(168,85,247,0.5), rgba(236,72,153,0.5));
                }
            `}</style>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-[360px] h-[520px] rounded-2xl flex flex-col overflow-hidden relative border border-purple-500/30 shadow-[0_0_40px_rgba(160,50,255,0.2)]"
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
                      Producer Workbench AI Assistant
                    </h3>
                    <p className="text-xs text-purple-300 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                      Online
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-purple-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-3">
                    <div
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl backdrop-blur-sm border ${
                          message.sender === "user"
                            ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-tr-none border-pink-400/20 shadow-lg"
                            : "bg-white/10 text-gray-100 rounded-tl-none border-purple-400/10 shadow-md"
                        }`}
                      >
                        {message.sender === "ai" ? (
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
                                    onClick={() =>
                                      setSelectedImage(props.src || "")
                                    }
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
                          <p className="text-sm leading-relaxed">
                            {message.text}
                          </p>
                        )}
                        <span className="text-[9px] opacity-50 mt-1 block">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Suggested Actions */}
                    {message.sender === "ai" &&
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
                                  <span className="relative z-10">
                                    {action}
                                  </span>
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

              {/* Input Area */}
              <div className="relative z-10 p-4 border-t border-white/10 bg-white/5">
                <div className="relative flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask the universe..."
                    className="w-full bg-[#0f1016]/60 border border-purple-500/20 rounded-xl py-2 pl-3 pr-10 text-xs text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder-purple-400/40"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="absolute right-1.5 p-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 text-white rounded-lg transition-all shadow-[0_0_10px_rgba(200,100,255,0.3)]"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 horizontal-scrollbar">
                  {[
                    "Làm sao để tạo dự án?",
                    "Hướng dẫn login",
                    "Quản lý workspace",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInputValue(suggestion);
                      }}
                      className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-purple-500/40 text-[10px] text-purple-200 hover:text-white transition-all flex items-center gap-1 group"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-pink-400 group-hover:text-pink-300" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              // ✅ Check authentication before opening chatbot
              if (!aiContextService.isAuthenticated()) {
                setShowLoginModal(true);
                return;
              }
              setIsOpen(true);
            }}
            className="w-16 h-16 rounded-full shadow-[0_0_25px_rgba(160,50,255,0.4)] flex items-center justify-center transition-all duration-300 relative overflow-hidden group bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white"
          >
            {/* Button Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

            <Bot className="w-8 h-8 relative z-10 animate-pulse" />

            {/* Tooltip Label */}
            <div className="absolute right-full mr-4 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-[0_0_15px_rgba(160,50,255,0.3)]">
              Ask AI
            </div>
          </motion.button>
        )}
      </div>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl"
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
              {/* Close Button - Top Right */}
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

              {/* Download/Actions Bar (Optional) */}
              <div className="absolute -bottom-16 left-0 right-0 flex items-center justify-center gap-3">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-sm font-medium shadow-lg">
                  Click outside to close
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {
          setShowLoginModal(false);
          navigate("/login", { state: { from: window.location.pathname } });
        }}
      />
    </>
  );
};

export default FloatingAssistant;
