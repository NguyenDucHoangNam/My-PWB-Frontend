// src/pages/project/live-room/modals/JoinRequestWaitingModal.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Clock, AlertCircle, ArrowLeft } from 'lucide-react';

interface JoinRequestWaitingModalProps {
  isOpen: boolean;
  ownerName: string;
  ownerAvatarUrl?: string;
  expiresAt?: string;
  onLeave: () => void; // Changed from onCancel
}

const JoinRequestWaitingModal: React.FC<JoinRequestWaitingModalProps> = ({
  isOpen,
  ownerName,
  ownerAvatarUrl,
  expiresAt,
  onLeave
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300); // 5 minutes

  // ✅ Countdown timer - fallback to 5 minutes if expiresAt not provided
  useEffect(() => {
    if (!isOpen) return;

    let interval: NodeJS.Timeout;

    if (expiresAt) {
      // ✅ Use expiresAt from backend
      interval = setInterval(() => {
        const now = new Date().getTime();
        const expires = new Date(expiresAt).getTime();
        const remaining = Math.floor((expires - now) / 1000);
        
        if (remaining <= 0) {
          setSecondsRemaining(0);
          clearInterval(interval);
        } else {
          setSecondsRemaining(remaining);
        }
      }, 1000);
    } else {
      // ✅ Fallback: countdown from 5 minutes locally
      let remaining = 300; // 5 minutes
      setSecondsRemaining(remaining);
      
      interval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          setSecondsRemaining(0);
          clearInterval(interval);
        } else {
          setSecondsRemaining(remaining);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isOpen, expiresAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
          >
            {/* Content */}
            <div className="text-center">
              {/* Icon */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-6"
              >
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-purple-400" />
                </div>
              </motion.div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-2">
                ⏳ Chờ phê duyệt...
              </h3>

              {/* Owner Avatar */}
              <div className="flex justify-center mb-4">
                {ownerAvatarUrl ? (
                  <img
                    src={ownerAvatarUrl}
                    alt={ownerName}
                    className="w-20 h-20 rounded-full border-4 border-purple-500/50 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-purple-500/50 shadow-lg">
                    {ownerName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Message */}
              <p className="text-gray-300 mb-6 leading-relaxed">
                Chờ <span className="text-purple-400 font-semibold">{ownerName}</span> phê duyệt
                <br />
                yêu cầu tham gia của bạn
              </p>

              {/* Countdown */}
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-purple-300 mb-2">
                  <Clock size={16} />
                  <span className="text-sm font-medium">Thời gian còn lại</span>
                </div>
                <div className="text-4xl font-bold text-white font-mono">
                  {formatTime(secondsRemaining)}
                </div>
                {secondsRemaining < 60 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-1 text-yellow-400 text-xs mt-2"
                  >
                    <AlertCircle size={12} />
                    <span>Sắp hết hạn!</span>
                  </motion.div>
                )}
              </div>

              {/* Spinner animation */}
              <div className="flex justify-center gap-2 mb-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                  />
                ))}
              </div>

              {/* Leave button */}
              <button
                onClick={onLeave}
                className="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Rời phòng
              </button>
              
              <p className="text-xs text-gray-500 mt-4">
                💡 Bạn có thể đợi ở đây hoặc rời phòng và quay lại sau
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JoinRequestWaitingModal;

