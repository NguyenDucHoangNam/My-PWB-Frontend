import React from "react";
import { X, Sparkles } from "lucide-react";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center"
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative bg-gradient-to-br from-[#3a2d5a] via-[#2d2544] to-[#24202e] rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-purple-400/20"
        >
          {/* Content */}
          <div className="relative z-10 p-8">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Sparkles className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-white mb-4">
              Đăng nhập để dùng AI trợ lý
            </h2>

            {/* Description */}
            <p className="text-center text-gray-300 mb-8 leading-relaxed text-[15px]">
              Bạn cần đăng nhập để trò chuyện với AI và nhận gợi ý phòng trợ phù
              hợp.
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              {/* Login Button - Purple-Pink Gradient */}
              <button
                onClick={onLogin}
                className="w-full py-4 px-6 rounded-xl font-bold text-white text-base
                                         bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 
                                         hover:from-purple-600 hover:via-pink-600 hover:to-purple-700
                                         shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60"
              >
                Đăng nhập
              </button>

              {/* Cancel Button - Outline with Purple */}
              <button
                onClick={onClose}
                className="w-full py-4 px-6 rounded-xl font-semibold text-gray-200
                                         bg-transparent hover:bg-white/5 
                                         border-2 border-purple-400/30 hover:border-purple-400/50"
              >
                Để sau
              </button>
            </div>
          </div>

          {/* Decorative Gradient Orbs */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-500/30 rounded-full blur-3xl" />
        </div>
      </div>
    </>
  );
};
