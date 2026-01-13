// src/pages/project/live-room/modals/JoinErrorModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface JoinErrorModalProps {
  isOpen: boolean;
  errorMessage: string;
  onRetry: () => void;
  onClose: () => void;
}

const JoinErrorModal: React.FC<JoinErrorModalProps> = ({
  isOpen,
  errorMessage,
  onRetry,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 border border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="inline-block mb-6"
              >
                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </motion.div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-2">
                ❌ Lỗi tham gia phiên
              </h3>

              {/* Error Message */}
              <div className="bg-red-600/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <p className="text-red-300 text-sm leading-relaxed">
                  {errorMessage}
                </p>
              </div>

              {/* Common Reasons */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-6 text-left">
                <p className="text-gray-400 text-xs mb-2 font-semibold">
                  Nguyên nhân có thể:
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Phòng đã đầy</li>
                  <li>• Phiên đã kết thúc</li>
                  <li>• Mất kết nối mạng</li>
                  <li>• Không có quyền truy cập</li>
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onRetry}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Thử lại
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JoinErrorModal;

