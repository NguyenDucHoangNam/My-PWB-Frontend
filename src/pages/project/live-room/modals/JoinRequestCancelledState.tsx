// src/pages/project/live-room/modals/JoinRequestCancelledState.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, Info } from 'lucide-react';

interface JoinRequestCancelledStateProps {
  onStay: () => void; // Changed from onRetry
  onLeave: () => void;
}

const JoinRequestCancelledState: React.FC<JoinRequestCancelledStateProps> = ({
  onStay,
  onLeave
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl max-w-md w-full p-8"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center">
            <Info className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white text-center mb-3">
          Đã hủy yêu cầu
        </h3>

        {/* Message */}
        <p className="text-gray-400 text-center mb-6 leading-relaxed">
          Bạn đã hủy yêu cầu tham gia phiên live.
          <br />
          Bạn có muốn tiếp tục đợi hay rời khỏi phòng?
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onStay}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Clock size={18} />
            Ở lại và đợi
          </button>

          <button
            onClick={onLeave}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Rời phòng
          </button>
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-500 text-center mt-4">
          💡 Bạn có thể đợi ở đây hoặc quay lại danh sách phiên
        </p>
      </motion.div>
    </motion.div>
  );
};

export default JoinRequestCancelledState;

