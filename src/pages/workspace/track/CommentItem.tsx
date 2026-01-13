import { useState } from 'react';
import { MessageCircle, MoreVertical, Edit2, Trash2, Clock, Send } from 'lucide-react';
import type { TrackCommentResponse, CommentStatus } from '../../../services/commentService';

// Avatar component with fallback
function Avatar({ user }: { user: { avatarUrl: string | null; firstName: string; lastName: string; fullName: string } }) {
    const [imageError, setImageError] = useState(false);
    
    if (user.avatarUrl && !imageError) {
        return (
            <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover border border-purple-500/50 shadow-lg"
                onError={() => setImageError(true)}
            />
        );
    }
    
    return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-xs shadow-lg">
            {user.firstName?.[0] || ''}
            {user.lastName?.[0] || ''}
        </div>
    );
}

interface CommentItemProps {
    comment: TrackCommentResponse;
    isOwner: boolean;
    onReply: (comment: TrackCommentResponse) => void;
    onEdit: (comment: TrackCommentResponse) => void;
    onDelete: (comment: TrackCommentResponse) => void;
    onUpdateStatus: (comment: TrackCommentResponse, status: CommentStatus) => void;
    onTimestampClick: (timestamp: number) => void;
    onLoadReplies?: (commentId: number) => void;
    depth?: number;
    highlighted?: boolean;
    replyingToId?: number | null;
    replyContent?: string;
    onReplyContentChange?: (content: string) => void;
    onSubmitReply?: () => void;
    onCancelReply?: () => void;
    expandedIds: Set<number>;
    onToggleReplies: (commentId: number) => void;
}

export default function CommentItem({
    comment,
    isOwner,
    onReply,
    onEdit,
    onDelete,
    onUpdateStatus,
    onTimestampClick,
    onLoadReplies,
    depth = 0,
    highlighted = false,
    replyingToId = null,
    replyContent = '',
    onReplyContentChange,
    onSubmitReply,
    onCancelReply,
    expandedIds,
    onToggleReplies,
}: CommentItemProps) {
    const [showMenu, setShowMenu] = useState(false);
    const maxDepth = 5; // Maximum nesting depth for visual indentation
    
    // Check if this comment is being replied to
    const isReplying = replyingToId === comment.id;
    
    // Dùng expandedIds thay vì state nội bộ
    const showReplies = expandedIds.has(comment.id);

    const handleToggleReplies = () => {
        // Nếu chưa mở và chưa load replies thì load
        if (!showReplies && comment.replyCount > 0 && (!comment.replies || comment.replies.length === 0)) {
            onLoadReplies?.(comment.id);
        }
        onToggleReplies(comment.id);
    };

    const handleReplyClick = () => {
        // Auto-expand replies khi click Reply
        if (!showReplies && comment.replyCount > 0) {
            if (!comment.replies || comment.replies.length === 0) {
                onLoadReplies?.(comment.id);
            }
            onToggleReplies(comment.id);
        }
        onReply(comment);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusBadge = (status: CommentStatus) => {
        switch (status) {
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/50">
                        <Clock size={9} />
                        Đang chờ
                    </span>
                );
            case 'IN_PROGRESS':
                return (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/50">
                        <Clock size={9} />
                        Đang xử lý
                    </span>
                );
            case 'RESOLVED':
                return (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/50">
                        <Clock size={9} />
                        Đã giải quyết
                    </span>
                );
        }
    };

    // Calculate indentation - max out at maxDepth
    const indentLevel = Math.min(depth, maxDepth);
    const borderLeftClass = indentLevel > 0 ? 'border-l-2 border-purple-500/30 pl-4' : '';

    return (
        <>
            <div
                className={`bg-gray-900/50 rounded-lg p-3 border transition-all ${
                    highlighted
                        ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20'
                        : 'border-gray-700'
                } ${borderLeftClass}`}
            >
                {/* Comment header */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {/* Avatar */}
                        <Avatar user={comment.user} />

                        <div>
                            <div className="font-medium text-sm text-white">{comment.user.fullName}</div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                {/* Timestamp badge */}
                                {comment.timestamp !== null && (
                                    <button
                                        onClick={() => onTimestampClick(comment.timestamp!)}
                                        className="text-orange-400 font-mono hover:text-orange-300 hover:underline transition-colors"
                                    >
                                        @ {formatTime(comment.timestamp)}
                                    </button>
                                )}
                                <span>•</span>
                                <span>
                                    {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Status badge */}
                        {getStatusBadge(comment.status)}

                        {/* Status dropdown (for owner) */}
                        {isOwner && (
                            <select
                                value={comment.status}
                                onChange={(e) =>
                                    onUpdateStatus(comment, e.target.value as CommentStatus)
                                }
                                className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 text-white text-xs rounded transition-colors hover:bg-gray-700 focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="PENDING">Đang chờ</option>
                                <option value="IN_PROGRESS">Đang xử lý</option>
                                <option value="RESOLVED">Đã giải quyết</option>
                            </select>
                        )}

                        {/* Actions menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-0.5 hover:bg-gray-700 rounded transition-colors"
                            >
                                <MoreVertical size={14} className="text-gray-400" />
                            </button>
                            {showMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowMenu(false)}
                                    />
                                    <div className="absolute right-0 top-6 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 min-w-[100px] overflow-hidden">
                                        <button
                                            onClick={() => {
                                                onEdit(comment);
                                                setShowMenu(false);
                                            }}
                                            className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-700 flex items-center gap-1.5 text-white transition-colors"
                                        >
                                            <Edit2 size={12} />
                                            Chỉnh sửa
                                        </button>
                                        <button
                                            onClick={() => {
                                                onDelete(comment);
                                                setShowMenu(false);
                                            }}
                                            className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-700 flex items-center gap-1.5 text-red-400 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                            Xóa
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Comment content */}
                <p className="text-gray-300 mb-2 text-sm whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                </p>

                {/* Reply button and toggle replies */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReplyClick}
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                    >
                        <MessageCircle size={12} />
                        Trả lời
                    </button>

                    {comment.replyCount > 0 && (
                        <button
                            onClick={handleToggleReplies}
                            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                        >
                            {showReplies ? '▼' : '▶'} {comment.replyCount} phản hồi
                        </button>
                    )}
                </div>
            </div>

            {/* Reply Form - shown when this comment is being replied to */}
            {isReplying && onReplyContentChange && onSubmitReply && onCancelReply && (
                <div className="mt-3 ml-10 bg-gray-900/50 rounded-lg p-3 border border-purple-500/30">
                    <div className="flex items-start gap-1.5 mb-2">
                        <MessageCircle size={14} className="text-purple-400 mt-0.5" />
                        <span className="text-xs text-gray-400">
                            Đang trả lời <span className="text-purple-300">{comment.user.fullName}</span>
                        </span>
                    </div>
                    <textarea
                        value={replyContent}
                        onChange={(e) => onReplyContentChange(e.target.value)}
                        placeholder="Viết phản hồi của bạn..."
                        rows={2}
                        className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2 resize-none"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={onSubmitReply}
                            disabled={!replyContent.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={14} />
                            Trả lời
                        </button>
                        <button
                            onClick={onCancelReply}
                            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-xs transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            {/* Nested replies */}
            {showReplies && comment.replies && comment.replies.length > 0 && (
                <div className="ml-5 mt-2 space-y-2">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            isOwner={isOwner}
                            onReply={onReply}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onUpdateStatus={onUpdateStatus}
                            onTimestampClick={onTimestampClick}
                            onLoadReplies={onLoadReplies}
                            depth={depth + 1}
                            highlighted={highlighted}
                            replyingToId={replyingToId}
                            replyContent={replyContent}
                            onReplyContentChange={onReplyContentChange}
                            onSubmitReply={onSubmitReply}
                            onCancelReply={onCancelReply}
                            expandedIds={expandedIds}
                            onToggleReplies={onToggleReplies}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

