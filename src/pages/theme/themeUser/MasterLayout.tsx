import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { ChatDockManager } from "../../../component/chat/ChatDockManager";
import { GlobalChatWidget } from "../../../component/chat/GlobalChatWidget";
import { IncomingMessageHandler } from "../../../component/chat/IncomingMessageHandler";
import { useAuth } from "../../../contexts/AuthContext";
import { NotificationProvider } from "../../../contexts/NotificationContext";
import { LoginPromptModal } from "../../../component/ai/LoginPromptModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { aiContextService } from "../../../services/aiContextService";

const MasterLayout = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check authentication before opening AI chat
  const handleAIToggle = () => {
    if (!aiContextService.isAuthenticated()) {
      setShowLoginModal(true);
    }
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-[rgb(var(--bg))] dark:text-[rgb(var(--text))] transition-colors">
        <header className="sticky top-0 z-50 shadow-md ">
          <Header />
        </header>

        <main className="flex-1 w-full">
          <Outlet />
        </main>
        <Footer />

        {/* Unified Chat Dock System */}
        <ChatDockManager onAIToggle={handleAIToggle}>
          {/* Global Chat Widget integration (hidden UI, logic only) */}
          {isAuthenticated && <GlobalChatWidget />}
        </ChatDockManager>

        {/* Incoming Message Handler - plays sound and opens chat on new messages */}
        {isAuthenticated && <IncomingMessageHandler />}

        {/* Login Prompt Modal for AI */}
        <LoginPromptModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            setShowLoginModal(false);
            navigate('/login', { state: { from: window.location.pathname } });
          }}
        />
      </div>
    </NotificationProvider>
  );
};

export default MasterLayout;
