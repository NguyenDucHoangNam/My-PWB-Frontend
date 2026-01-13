// src/pages/project/live-room/chat/ChatPanel.tsx

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Clock, ArrowDown } from "lucide-react";
import type {
  ChatMessage,
  TypingIndicator,
  JoinRequestNotification,
} from "../../../../types/session";
import JoinRequestChatMessage from "./JoinRequestChatMessage";

interface ChatPanelProps {
  messages: ChatMessage[];
  typingUsers?: TypingIndicator[];
  currentUserName: string;
  currentUserId: number;
  onSendMessage: (message: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  // ✅ NEW: Join request props
  joinRequests?: JoinRequestNotification[];
  onApproveRequest?: (requestId: string) => void;
  onRejectRequest?: (requestId: string, reason: string) => void;
  isProcessingRequest?: boolean;
}

const MessageBubble: React.FC<{ message: ChatMessage; isOwn: boolean }> =
  React.memo(({ message, isOwn }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2 px-2`}
    >
      <div className={`max-w-[75%] ${isOwn ? "order-2" : "order-1"}`}>
        {/* Sender Info - Compact */}
        {!isOwn && message.type !== "SYSTEM" && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
              {message.senderName.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-300 text-xs font-medium truncate">
              {message.senderName}
            </span>
          </div>
        )}

        {/* Message Content - Compact */}
        <div
          className={`relative ${
            message.type === "SYSTEM"
              ? "bg-amber-500/15 text-amber-200 text-center py-1.5 px-3 rounded-full border border-amber-500/25 text-xs"
              : isOwn
              ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl rounded-br-md shadow-md px-3 py-2"
              : "bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-2xl rounded-bl-md shadow-md px-3 py-2 border border-gray-600/30"
          }`}
        >
          <p className="break-words leading-relaxed text-sm whitespace-pre-wrap overflow-hidden">
            {message.content}
          </p>

          {/* Timestamp - Compact */}
          {message.type !== "SYSTEM" && (
            <div
              className={`flex items-center gap-1 mt-0.5 ${
                isOwn ? "justify-end" : "justify-start"
              }`}
            >
              <Clock size={8} className="opacity-60 flex-shrink-0" />
              <span
                className={`text-xs opacity-70 ${
                  isOwn ? "text-purple-100" : "text-gray-300"
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  ));

const TypingIndicator: React.FC<{ users: TypingIndicator[] }> = ({ users }) => {
  if (users.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex items-center gap-2 px-3 py-2 mx-3 mb-2 bg-purple-500/10 rounded-lg border border-purple-500/20"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            className="w-1 h-1 bg-purple-400 rounded-full"
          />
        ))}
      </div>
      <span className="text-xs text-purple-300">
        {users[0].userName} đang gõ...
      </span>
    </motion.div>
  );
};

// ✅ Scroll to bottom button
const ScrollToBottomButton: React.FC<{
  onClick: () => void;
  show: boolean;
}> = ({ onClick, show }) => {
  if (!show) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={onClick}
      className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg z-10 backdrop-blur-sm border border-purple-500/30"
    >
      <ArrowDown size={14} />
    </motion.button>
  );
};

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  typingUsers = [],
  currentUserName,
  currentUserId,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  joinRequests = [],
  onApproveRequest,
  onRejectRequest,
  isProcessingRequest = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<number | undefined>(undefined);

  // ✅ Virtual scrolling - chỉ show 30 messages gần nhất
  const recentMessages = useMemo(() => {
    return messages.slice(-30);
  }, [messages]);

  const chatMessageCount = useMemo(() => {
    return messages.filter((m) => m.type !== "SYSTEM").length;
  }, [messages]);

  // ✅ Auto scroll với scroll detection
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 100;

    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowScrollButton(false);
    } else {
      setShowScrollButton(true);
    }
  }, [recentMessages, typingUsers]);

  // ✅ Scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  }, []);

  // Focus management
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(timer);
  }, []);

  // Typing handler
  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);

      if (value.trim() && !isTyping) {
        setIsTyping(true);
        onTypingStart?.();
      }

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }

      if (value.trim()) {
        typingTimeoutRef.current = window.setTimeout(() => {
          setIsTyping(false);
          onTypingStop?.();
        }, 1500);
      } else if (isTyping) {
        setIsTyping(false);
        onTypingStop?.();
      }
    },
    [isTyping, onTypingStart, onTypingStop]
  );

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    onSendMessage(text);
    setInputValue("");
    setIsTyping(false);
    onTypingStop?.();

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    setTimeout(() => {
      inputRef.current?.focus();
      scrollToBottom(); // Auto scroll after sending
    }, 50);
  }, [inputValue, onSendMessage, onTypingStop, scrollToBottom]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 100) + "px";
    }
  }, [inputValue]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900/70 via-gray-800/60 to-gray-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-lg shadow-purple-500/30 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between bg-gray-900/50 backdrop-blur-md rounded-t-2xl border-b border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xs text-white animate-pulse">
            💬
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Chat</h3>
            <p className="text-gray-400 text-xs">
              {chatMessageCount} tin nhắn
              {typingUsers.length > 0 && ` • ${typingUsers.length} đang gõ`}
              {joinRequests.length > 0 && (
                <span className="text-yellow-400">
                  {" "}
                  • {joinRequests.length} yêu cầu chờ
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Join request badge */}
          {joinRequests.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="bg-yellow-600/40 text-yellow-300 text-xs px-2 py-1 rounded-full border border-yellow-500/50 font-semibold flex items-center gap-1 shadow-yellow-500/30 shadow-md"
              >
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🙋
                </motion.span>
                {joinRequests.length}
              </motion.div>
            </motion.div>
          )}

          {/* Message count badge */}
          {chatMessageCount > 0 && (
            <div className="bg-purple-600/20 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-500/30 shadow-purple-500/20 shadow-md">
              {chatMessageCount}
            </div>
          )}
        </div>
      </div>

      {/* Join requests section */}
      <AnimatePresence>
        {joinRequests.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 border-b border-yellow-500/30 bg-gradient-to-r from-yellow-900/20 via-orange-900/20 to-yellow-900/20 overflow-hidden"
          >
            <div className="max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-600 scrollbar-track-yellow-900/20">
              <div className="p-2 space-y-2">
                {joinRequests.map((request, index) => (
                  <motion.div
                    key={request.requestId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <JoinRequestChatMessage
                      request={request}
                      onApprove={onApproveRequest || (() => {})}
                      onReject={onRejectRequest || (() => {})}
                      isProcessing={isProcessingRequest}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages area */}
      <div className="flex-1 min-h-0 relative">
        <div
          ref={messagesContainerRef}
          className="absolute inset-0 overflow-y-auto py-2 px-3 space-y-1 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent"
        >
          {recentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-3 border border-purple-500/30 animate-pulse"
              >
                💬
              </motion.div>
              <h4 className="text-sm font-medium text-gray-300 mb-1">
                Chưa có tin nhắn
              </h4>
              <p className="text-xs text-center opacity-70">
                Bắt đầu trò chuyện ngay!
              </p>
            </div>
          ) : (
            <div className="px-2 space-y-1">
              {messages.length > 30 && (
                <div className="text-center py-2 mb-2">
                  <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full border border-gray-700/30">
                    +{messages.length - 30} tin nhắn cũ
                  </span>
                </div>
              )}
              {recentMessages.map((message) => (
                <MessageBubble
                  key={message.messageId}
                  message={message}
                  isOwn={message.senderId === currentUserId}
                />
              ))}
              <TypingIndicator users={typingUsers} />
              <div ref={messagesEndRef} className="h-2" />
            </div>
          )}
        </div>

        <AnimatePresence>
          <ScrollToBottomButton
            onClick={scrollToBottom}
            show={showScrollButton}
          />
        </AnimatePresence>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 bg-gray-900/60 backdrop-blur-md border-t border-purple-500/20 p-3 rounded-b-2xl flex items-end gap-2 max-h-[180px]">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Tin nhắn với tên ${currentUserName}...`}
          className="flex-1 bg-gray-800/60 text-white placeholder-gray-400 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all min-h-[38px] max-h-[100px]"
        />
        <motion.button
          whileHover={{ scale: inputValue.trim() ? 1.05 : 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center min-w-[38px] ${
            inputValue.trim()
              ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/40"
              : "bg-gray-700/40 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Send size={14} />
        </motion.button>
      </div>

      {/* Scrollbar styles */}
      <style>{`
      .scrollbar-thin::-webkit-scrollbar {
        width: 6px;
      }
      .scrollbar-thin::-webkit-scrollbar-track {
        background: rgba(55, 65, 81, 0.3);
        border-radius: 3px;
      }
      .scrollbar-thin::-webkit-scrollbar-thumb {
        background: #8b5cf6;
        border-radius: 3px;
      }
      .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background: #c084fc;
      }
    `}</style>
    </div>
  );
};

MessageBubble.displayName = "MessageBubble";
export default ChatPanel;

