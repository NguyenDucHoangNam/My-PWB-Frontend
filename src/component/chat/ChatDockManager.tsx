import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatWindow } from "./ChatWindow";
import { ChatPopup } from "./ChatPopup";
import { AIAssistantWindow } from "./AIAssistantWindow";
import { ChatWindowData } from "@/types/chatDock";
import { useAIChatLogic } from "@/hooks/useAIChatLogic";
import Autronas from "@/assets/image/astronaut.png";

interface ChatDockManagerProps {
  onAIToggle?: () => void;
  children?: React.ReactNode;
}

export const ChatDockManager: React.FC<ChatDockManagerProps> = ({
  onAIToggle,
  children,
}) => {
  const [activeWindows, setActiveWindows] = useState<ChatWindowData[]>([]);
  const [maxWindows, setMaxWindows] = useState(2);
  const [unreadMessages, setUnreadMessages] = useState<Map<string, number>>(
    new Map()
  );

  const aiChat = useAIChatLogic();
  const [showGreeting, setShowGreeting] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const calculateMaxWindows = () => {
      const width = window.innerWidth;
      if (width < 768) return 0;
      if (width < 1440) return 1;
      if (width < 1920) return 2;
      return 3;
    };

    const handleResize = () => {
      setMaxWindows(calculateMaxWindows());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openWindow = useCallback(
    (windowData: Omit<ChatWindowData, "isMinimized" | "unreadCount">) => {
      setActiveWindows((prev) => {
        const existing = prev.find((w) => w.id === windowData.id);
        if (existing) {
          return prev.map((w) =>
            w.id === windowData.id ? { ...w, isMinimized: false } : w
          );
        }

        if (prev.filter((w) => !w.isMinimized).length >= maxWindows) {
          const newPrev = [...prev];
          const oldestOpenIndex = newPrev.findIndex((w) => !w.isMinimized);
          if (oldestOpenIndex !== -1) {
            newPrev[oldestOpenIndex].isMinimized = true;
          }
          return [
            ...newPrev,
            { ...windowData, isMinimized: false, unreadCount: 0 },
          ];
        }

        return [...prev, { ...windowData, isMinimized: false, unreadCount: 0 }];
      });
    },
    [maxWindows]
  );

  const closeWindow = useCallback((id: string) => {
    setActiveWindows((prev) => {
      const windowToClose = prev.find((w) => w.id === id);

      // If closing a user chat window, notify GlobalChatWidget to clear state
      if (windowToClose && windowToClose.role === "user") {
        window.dispatchEvent(
          new CustomEvent("closeUserChatWindow", {
            detail: { conversationId: id },
          })
        );
      }

      return prev.filter((w) => w.id !== id);
    });
  }, []);

  const toggleMinimize = useCallback((id: string) => {
    setActiveWindows((prev) => {
      const window = prev.find((w) => w.id === id);
      const newIsMinimized = window ? !window.isMinimized : false;

      // Dispatch event for IncomingMessageHandler to track state
      globalThis.window.dispatchEvent(
        new CustomEvent("chatWindowStateChange", {
          detail: { conversationId: id, isMinimized: newIsMinimized },
        })
      );

      // Clear unread when un-minimizing
      if (!newIsMinimized) {
        setUnreadMessages((prevUnread) => {
          const newMap = new Map(prevUnread);
          newMap.delete(id);
          return newMap;
        });
      }

      return prev.map((w) =>
        w.id === id
          ? {
              ...w,
              isMinimized: newIsMinimized,
              unreadCount: newIsMinimized ? w.unreadCount : 0,
            }
          : w
      );
    });
  }, []);

  const handleSendMessage = useCallback(
    (windowId: string, text: string, attachments?: any[]) => {
      const window = activeWindows.find((w) => w.id === windowId);

      if (window?.role === "ai") {
        aiChat.sendMessage(text);
      } else if (window?.role === "user") {
        // Emit event for GlobalChatWidget to handle (with attachments)
        globalThis.window.dispatchEvent(
          new CustomEvent("sendUserChatMessage", {
            detail: { conversationId: windowId, text, attachments },
          })
        );
      }
    },
    [activeWindows, aiChat]
  );

  useEffect(() => {
    const aiWindow = activeWindows.find((w) => w.id === "ai-cosmic");
    if (aiWindow) {
      setActiveWindows((prev) =>
        prev.map((w) =>
          w.id === "ai-cosmic"
            ? { ...w, messages: aiChat.messages, isTyping: aiChat.isTyping }
            : w
        )
      );
    }
  }, [aiChat.messages, aiChat.isTyping]);

  const toggleAIWindow = useCallback(() => {
    const AI_BOT_ID = "ai-cosmic";
    const existing = activeWindows.find((w) => w.id === AI_BOT_ID);

    if (existing) {
      toggleMinimize(AI_BOT_ID);
    } else {
      openWindow({
        id: AI_BOT_ID,
        name: "Cosmic Assistant",
        role: "ai",
        status: "online",
        messages: aiChat.messages,
        isTyping: aiChat.isTyping,
      });
    }
    onAIToggle?.();
  }, [
    activeWindows,
    toggleMinimize,
    openWindow,
    aiChat.messages,
    aiChat.isTyping,
    onAIToggle,
  ]);

  useEffect(() => {
    const handleOpenChat = (event: CustomEvent) => {
      const { windowData } = event.detail;
      openWindow(windowData);
    };

    window.addEventListener("chatDockOpen" as any, handleOpenChat);
    return () =>
      window.removeEventListener("chatDockOpen" as any, handleOpenChat);
  }, [openWindow]);

  // Listen for user chat window requests from GlobalChatWidget
  useEffect(() => {
    const handleOpenUserChat = (event: CustomEvent) => {
      const {
        conversationId,
        conversationName,
        conversationAvatar,
        chatMessages,
      } = event.detail;

      // Clear unread count when opening this conversation
      setUnreadMessages((prev) => {
        const newMap = new Map(prev);
        newMap.delete(conversationId);
        return newMap;
      });

      openWindow({
        id: conversationId,
        name: conversationName,
        role: "user",
        avatar: conversationAvatar,
        status: "offline",
        messages: [],
        chatMessages: chatMessages || [], // Use loaded messages from GlobalChatWidget
        isTyping: false,
      });
    };

    window.addEventListener("openUserChatWindow" as any, handleOpenUserChat);
    return () =>
      window.removeEventListener(
        "openUserChatWindow" as any,
        handleOpenUserChat
      );
  }, [openWindow]);

  // Listen for incoming user chat messages from GlobalChatWidget
  useEffect(() => {
    const handleUserChatMessage = (event: CustomEvent) => {
      const { conversationId, chatMessages } = event.detail;

      if (chatMessages && Array.isArray(chatMessages)) {
        setActiveWindows((prev) =>
          prev.map((w) =>
            w.id === conversationId && w.role === "user"
              ? { ...w, chatMessages }
              : w
          )
        );
      }
    };

    window.addEventListener("userChatMessage" as any, handleUserChatMessage);
    return () =>
      window.removeEventListener(
        "userChatMessage" as any,
        handleUserChatMessage
      );
  }, []);

  // Listen for online status updates from GlobalChatWidget
  useEffect(() => {
    const handleStatusUpdate = (event: CustomEvent) => {
      const { conversationId, isOnline } = event.detail;
      if (!conversationId) {
        return;
      }
      setActiveWindows((prev) =>
        prev.map((w) =>
          w.id === conversationId && w.role === "user"
            ? { ...w, status: isOnline ? "online" : "offline" }
            : w
        )
      );
    };

    window.addEventListener("userChatStatusUpdate" as any, handleStatusUpdate);
    return () =>
      window.removeEventListener(
        "userChatStatusUpdate" as any,
        handleStatusUpdate
      );
  }, []);

  // Listen for incoming message sync from IncomingMessageHandler
  // This handles messages for any open window (not just GlobalChatWidget's current conversation)
  useEffect(() => {
    const handleSyncIncomingMessage = (event: CustomEvent) => {
      const { conversationId, message } = event.detail;
      if (conversationId && message) {
        setActiveWindows((prev) =>
          prev.map((w) => {
            if (w.id === conversationId && w.role === "user") {
              const existingMessages = w.chatMessages || [];
              // Check if message already exists (by id or tempId)
              const messageExists = existingMessages.some(
                (m) =>
                  (message.id && m.id === message.id) ||
                  (message.tempId && m.tempId === message.tempId)
              );
              if (messageExists) {
                // Update existing message
                return {
                  ...w,
                  chatMessages: existingMessages.map((m) =>
                    (message.id && m.id === message.id) ||
                    (message.tempId && m.tempId === message.tempId)
                      ? { ...m, ...message }
                      : m
                  ),
                };
              }
              // Add new message
              return {
                ...w,
                chatMessages: [...existingMessages, message],
              };
            }
            return w;
          })
        );
      }
    };

    window.addEventListener(
      "syncIncomingMessage" as any,
      handleSyncIncomingMessage
    );
    return () =>
      window.removeEventListener(
        "syncIncomingMessage" as any,
        handleSyncIncomingMessage
      );
  }, []);

  // Listen for increment unread on minimized window
  useEffect(() => {
    const handleIncrementUnread = (event: CustomEvent) => {
      const { conversationId } = event.detail;
      if (conversationId) {
        setActiveWindows((prev) =>
          prev.map((w) =>
            w.id === conversationId && w.role === "user" && w.isMinimized
              ? { ...w, unreadCount: (w.unreadCount || 0) + 1 }
              : w
          )
        );
      }
    };

    window.addEventListener(
      "incrementWindowUnread" as any,
      handleIncrementUnread
    );
    return () =>
      window.removeEventListener(
        "incrementWindowUnread" as any,
        handleIncrementUnread
      );
  }, []);

  const isAIWindowOpen = activeWindows.find(
    (w) => w.role === "ai" && !w.isMinimized
  );

  // Calculate total unread count
  const totalUnreadCount = Array.from(unreadMessages.values()).reduce(
    (sum, count) => sum + count,
    0
  );

  // Listen for new unread messages
  useEffect(() => {
    const handleNewUnreadMessage = (event: CustomEvent) => {
      const { conversationId } = event.detail;
      if (conversationId) {
        setUnreadMessages((prev) => {
          const newMap = new Map(prev);
          newMap.set(conversationId, (newMap.get(conversationId) || 0) + 1);
          return newMap;
        });
      }
    };

    window.addEventListener("newUnreadMessage" as any, handleNewUnreadMessage);
    return () =>
      window.removeEventListener(
        "newUnreadMessage" as any,
        handleNewUnreadMessage
      );
  }, []);

  // Broadcast unread count changes for Header to listen
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("unreadCountChanged", {
        detail: { totalUnreadCount },
      })
    );
  }, [totalUnreadCount]);

  // Auto-hide greeting message after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {children}

      {/* Chat windows container */}
      <div className="fixed bottom-0 right-6 flex items-end gap-3 z-50 pointer-events-none">
        <div className="flex items-end gap-3 flex-row-reverse pointer-events-auto">
          {/* AI Button */}
          <motion.div
            className="relative"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <AnimatePresence>
              {(showGreeting || isHovering) && !isAIWindowOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute bottom-full mb-2 pointer-events-none z-50"
                  style={{ transform: "translateX(-80px)" }}
                >
                  <div className="absolute right-[-50px] bottom-0 max-w-[280px] px-4 py-2.5 rounded-2xl rounded-bl-none bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 text-white shadow-[0_4px_20px_rgba(219,39,119,0.4),0_0_30px_rgba(147,51,234,0.3)] border border-pink-300/30 backdrop-blur-md">
                    <p className="text-sm font-medium leading-relaxed whitespace-nowrap drop-shadow-sm">
                      Bạn có muốn tôi giúp đỡ không?
                    </p>
                    {/* Chat bubble tail - hướng xuống phải về phía astronaut */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-gradient-to-r from-pink-600 to-purple-600 transform rotate-45 translate-x-[-8px] translate-y-[8px] border-l border-b border-pink-300/30 shadow-[0_2px_8px_rgba(219,39,119,0.3)]"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={toggleAIWindow}
              className={`transition-all duration-300 hover:scale-110 z-50 relative ${
                isAIWindowOpen
                  ? "translate-y-2 opacity-0 pointer-events-none"
                  : ""
              }`}
            >
              <img
                src={Autronas}
                alt="Cosmic Assistant"
                className="w-28 h-auto drop-shadow-[0_0_30px_rgba(192,38,211,0.5)]"
              />
            </button>
          </motion.div>

          {activeWindows.map((window) => (
            <div key={window.id}>
              {window.role === "user" ? (
                <ChatPopup
                  conversationId={window.id}
                  conversationName={window.name}
                  conversationAvatar={window.avatar || null}
                  conversationType={
                    (window as any).conversationType || "PRIVATE"
                  }
                  messages={(window as any).chatMessages || []}
                  loading={(window as any).loading || false}
                  loadingMore={(window as any).loadingMore || false}
                  pagination={
                    (window as any).pagination || {
                      currentPage: 1,
                      totalPages: 1,
                      hasMore: false,
                    }
                  }
                  connectionStatus={
                    (window as any).connectionStatus || {
                      isConnected: true,
                      reconnectAttempts: 0,
                    }
                  }
                  isOnline={window.status === "online"}
                  isMinimized={window.isMinimized}
                  unreadCount={window.unreadCount || 0}
                  onClose={() => closeWindow(window.id)}
                  onMinimize={() => toggleMinimize(window.id)}
                  onSendMessage={(text, attachments) =>
                    handleSendMessage(window.id, text, attachments)
                  }
                  onLoadMore={(page) => {
                    // Emit event to GlobalChatWidget
                    globalThis.window.dispatchEvent(
                      new CustomEvent("loadMoreUserMessages", {
                        detail: { conversationId: window.id, page },
                      })
                    );
                  }}
                />
              ) : window.role === "ai" ? (
                <AIAssistantWindow
                  conversationId={window.id}
                  messages={window.messages}
                  isTyping={window.isTyping ?? false}
                  isMinimized={window.isMinimized ?? false}
                  unreadCount={window.unreadCount ?? 0}
                  onClose={() => closeWindow(window.id)}
                  onMinimize={() => toggleMinimize(window.id)}
                  onSendMessage={(text) => handleSendMessage(window.id, text)}
                />
              ) : (
                <ChatWindow
                  windowData={window}
                  onClose={closeWindow}
                  onMinimize={toggleMinimize}
                  onSendMessage={handleSendMessage}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #13141c;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #333;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                @keyframes slide-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.2s ease-out forwards;
                }
            `}</style>
    </>
  );
};

export const openChatWindow = (
  windowData: Omit<ChatWindowData, "isMinimized" | "unreadCount">
) => {
  window.dispatchEvent(
    new CustomEvent("chatDockOpen", { detail: { windowData } })
  );
};
