// ChatPopupDemo.tsx
import { useState } from "react";
import { Minus, X } from "lucide-react";

// Fake MessageInput Component
const MessageInput = ({ onSendMessage }: any) => {
  const [text, setText] = useState("");
  return (
    <div className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nhập tin nhắn..."
        className="flex-1 px-3 py-2 rounded-2xl bg-black/20 text-white outline-none placeholder-white/60"
      />
      <button
        onClick={() => {
          if (text.trim()) {
            onSendMessage({ id: Date.now(), content: text, senderId: "me" });
            setText("");
          }
        }}
        className="px-3 py-2 bg-purple-600/80 rounded-2xl text-white shadow-[0_0_10px_rgba(128,0,255,0.5)]"
      >
        Gửi
      </button>
    </div>
  );
};

const ChatPopupDemo = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  // Fake partner info
  const partnerInfo = {
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/200?img=10",
  };

  const chatPartnerOnline = true;

  // Fake messages
  const [chatMessages, setChatMessages] = useState([
    { id: 1, content: "Xin chào!", senderId: "partner" },
    { id: 2, content: "Chào bạn, hôm nay thế nào?", senderId: "me" },
    { id: 3, content: "Mình ổn, cảm ơn!", senderId: "partner" },
    { id: 4, content: "Bạn có muốn thử demo giao diện chat neon này không?", senderId: "me" },
  ]);

  const chatConversationId = 1;
  const chatError = "";

  const handleSendMessage = (msg: any) => {
    setChatMessages((prev) => [...prev, msg]);
  };

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center p-10">
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] w-[360px] max-w-[92vw]" role="dialog" aria-label="Hộp thoại chat">
          <div className="bg-black/30 dark:bg-dark-surface/40 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(128,0,255,0.5)] border border-purple-500/20 overflow-hidden transition-all transform animate-[chatIn_180ms_ease-out]">
            
            {/* Header */}
            <div className="relative z-20 flex items-center justify-between px-3 py-2 border-b border-purple-500/20 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 backdrop-blur-md rounded-t-2xl select-none">
              <div className="flex items-center gap-2">
                <img
                  src={partnerInfo.avatar}
                  alt={partnerInfo.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-purple-400 shadow-sm"
                />
                <div>
                  <p className="text-sm font-bold text-white leading-4 truncate max-w-[200px] drop-shadow-md">
                    {partnerInfo.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${chatPartnerOnline ? 'bg-emerald-400/90' : 'bg-gray-400/60'} shadow-md`}></span>
                    <span className="text-[11px] text-white/70">{chatPartnerOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setIsMinimized(v => !v); setUnreadCount(0); }}
                  className="relative p-1.5 rounded-lg hover:bg-purple-500/20 text-white/90 transition-colors"
                  aria-label="Thu nhỏ"
                >
                  <Minus size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] leading-4 text-center shadow-md">{unreadCount}</span>
                  )}
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-white/90 transition-colors"
                  aria-label="Đóng"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div className="h-[440px] max-h-[70vh] flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-2">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-3 py-2 rounded-2xl max-w-[70%] 
                        ${msg.senderId === 'me' 
                          ? 'bg-purple-600/80 text-white shadow-[0_0_10px_rgba(128,0,255,0.5)]' 
                          : 'bg-gray-800/50 text-white/90 shadow-[0_0_6px_rgba(0,255,255,0.3)]'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                {chatConversationId && (
                  <div className="flex-shrink-0 border-t border-purple-500/20 bg-black/20 backdrop-blur-sm p-2 rounded-b-2xl">
                    <MessageInput conversationId={chatConversationId} onSendMessage={handleSendMessage} />
                  </div>
                )}
              </div>
            )}

            {chatError && (
              <div className="px-4 py-2 text-sm text-red-400 border-t border-red-500/30 bg-red-500/10 rounded-b-2xl">
                {chatError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPopupDemo;
