// src/pages/project/live-room/chat/JoinRequestChatMessage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, User, Mail, Shield } from 'lucide-react';
import type { JoinRequestNotification } from '../../../../types/session';

interface JoinRequestChatMessageProps {
  request: JoinRequestNotification;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
  isProcessing?: boolean;
}

const JoinRequestChatMessage: React.FC<JoinRequestChatMessageProps> = ({
  request,
  onApprove,
  onReject,
  isProcessing = false
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(request.secondsRemaining);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (isExpired) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(request.expiresAt).getTime();
      const remaining = Math.floor((expires - now) / 1000);

      if (remaining <= 0) {
        setSecondsRemaining(0);
        setIsExpired(true);
        clearInterval(interval);
      } else {
        setSecondsRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [request.expiresAt, isExpired]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'COLLABORATOR': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'CLIENT': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER': return '👑';
      case 'COLLABORATOR': return '🤝';
      case 'CLIENT': return '💼';
      default: return '👤';
    }
  };

  const handleApprove = () => {
    if (!isProcessing && !isExpired) {
      onApprove(request.requestId);
    }
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!isProcessing && !isExpired) {
      const reason = rejectReason.trim() || 'Không có lý do cụ thể';
      onReject(request.requestId, reason);
      setShowRejectModal(false);
      setRejectReason('');
    }
  };

  const handleCancelReject = () => {
    setShowRejectModal(false);
    setRejectReason('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-3 my-2"
    >
      {/* Main card */}
      <div className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border-2 border-purple-500/40 rounded-xl p-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-purple-600/30 rounded-full flex items-center justify-center">
            <span className="text-lg">🙋</span>
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-sm">Yêu cầu tham gia</h4>
            <p className="text-purple-300 text-xs">
              {new Date(request.requestedAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Countdown badge */}
          {!isExpired ? (
            <div className={`px-2 py-1 rounded-full text-xs font-bold ${secondsRemaining < 60 ? 'bg-red-500/20 text-red-300 animate-pulse' : 'bg-purple-500/20 text-purple-300'
              }`}>
              <Clock size={12} className="inline mr-1" />
              {formatTime(secondsRemaining)}
            </div>
          ) : (
            <div className="px-2 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400">
              Đã hết hạn
            </div>
          )}
        </div>

        {/* User info */}
        <div className="space-y-2 mb-4">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3">
            {request.userAvatarUrl ? (
              <img
                src={request.userAvatarUrl}
                alt={request.userName}
                className="w-12 h-12 rounded-full border-2 border-purple-500/50"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold border-2 border-purple-500/50">
                {request.userName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <User size={14} className="text-purple-400" />
                <span className="text-white font-semibold text-sm">{request.userName}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Mail size={12} className="text-gray-400" />
                <span className="text-gray-400 text-xs">{request.userEmail}</span>
              </div>
            </div>
          </div>

          {/* Role badge */}
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-purple-400" />
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleColor(request.projectRole)}`}>
              {getRoleIcon(request.projectRole)} {request.projectRole}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        {!isExpired && (
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <Check size={16} />
              Chấp nhận
            </button>
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1 bg-red-600/80 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <X size={16} />
              Từ chối
            </button>
          </div>
        )}

        {isExpired && (
          <div className="text-center py-2 text-gray-400 text-sm">
            Yêu cầu đã hết hạn
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={(e) => e.target === e.currentTarget && handleCancelReject()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 border border-red-500/30 rounded-xl p-6 max-w-md w-full shadow-2xl"
          >
            <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <X className="text-red-400" size={20} />
              Từ chối yêu cầu?
            </h4>

            <p className="text-gray-300 text-sm mb-4">
              Từ chối yêu cầu tham gia của <span className="text-purple-400 font-semibold">{request.userName}</span>
            </p>

            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                Lý do (tùy chọn):
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Phòng đang full, không phù hợp..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelReject}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Xác nhận từ chối
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default JoinRequestChatMessage;

