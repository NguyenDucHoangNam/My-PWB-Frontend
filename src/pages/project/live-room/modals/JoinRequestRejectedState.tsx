// src/pages/project/live-room/modals/JoinRequestRejectedState.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, Clock } from 'lucide-react';

interface JoinRequestRejectedStateProps {
  reason?: string;
  onStay: () => void;
  onLeave: () => void;
}

const JoinRequestRejectedState: React.FC<JoinRequestRejectedStateProps> = ({
  reason = 'Yêu cầu của bạn đã bị từ chối',
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
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full p-8"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white text-center mb-3">
          Yêu cầu bị từ chối
        </h3>

        {/* Reason */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-300 text-center text-sm leading-relaxed">
            {reason}
          </p>
        </div>

        {/* Message */}
        <p className="text-gray-400 text-center mb-6 text-sm">
          Chủ phòng đã từ chối yêu cầu tham gia của bạn.
          <br />
          Bạn có muốn tiếp tục đợi hay rời khỏi phòng?
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onStay}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Clock size={18} />
            Ở lại và đợi
          </button>

          <button
            onClick={onLeave}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Rời phòng
          </button>
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-500 text-center mt-4">
          💡 Bạn có thể tiếp tục đợi hoặc quay lại danh sách phiên
        </p>
      </motion.div>
    </motion.div>
  );
};

export default JoinRequestRejectedState;

