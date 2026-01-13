import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Loader, AlertCircle, Filter } from 'lucide-react';
import CommentItem from './CommentItem';
import type {
    TrackCommentResponse,
    CommentStatus,
    TrackCommentStatisticsResponse,
} from '../../../services/commentService';

interface CommentsPanelProps {
    comments: TrackCommentResponse[];
    statistics: TrackCommentStatisticsResponse | null;
    loading: boolean;
    isOwner: boolean;
    highlightedCommentId: number | null;
    onReply: (comment: TrackCommentResponse, content: string) => void;
    onEdit: (comment: TrackCommentResponse, content: string) => void;
    onDelete: (comment: TrackCommentResponse) => void;
    onUpdateStatus: (comment: TrackCommentResponse, status: CommentStatus) => void;
    onTimestampClick: (timestamp: number) => void;
    onLoadReplies: (commentId: number) => void;
    apiAvailable: boolean;
    expandedCommentIds: Set<number>;
    onExpandedIdsChange: (ids: Set<number>) => void;
}

type FilterStatus = 'ALL' | CommentStatus;

export default function CommentsPanel({
    comments,
    statistics,
    loading,
    isOwner,
    highlightedCommentId,
    onReply,
    onEdit,
    onDelete,
    onUpdateStatus,
    onTimestampClick,
    onLoadReplies,
    apiAvailable,
    expandedCommentIds,
    onExpandedIdsChange,
}: CommentsPanelProps) {
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
    const [replyingTo, setReplyingTo] = useState<TrackCommentResponse | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [editingComment, setEditingComment] = useState<TrackCommentResponse | null>(null);
    const [editContent, setEditContent] = useState('');

    const commentRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    // Scroll to highlighted comment
    useEffect(() => {
        if (highlightedCommentId !== null) {
            const element = commentRefs.current.get(highlightedCommentId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [highlightedCommentId]);


    // Toggle expand/collapse replies
    const toggleReplies = (id: number) => {
        const next = new Set(expandedCommentIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        onExpandedIdsChange(next);
    };

    const handleReplyClick = (comment: TrackCommentResponse) => {
        // Auto-expand replies khi click Reply
        if (comment.replyCount > 0 && !expandedCommentIds.has(comment.id)) {
            // Load replies nếu chưa load
            if (!comment.replies || comment.replies.length === 0) {
                onLoadReplies(comment.id);
            }
            toggleReplies(comment.id);
        }
        setReplyingTo(comment);
        setReplyContent('');
    };

    const handleSubmitReply = () => {
        if (replyingTo && replyContent.trim()) {
            onReply(replyingTo, replyContent.trim());
            setReplyingTo(null);
            setReplyContent('');
        }
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
        setReplyContent('');
    };

    const handleEdit = () => {
        if (editingComment && editContent.trim()) {
            onEdit(editingComment, editContent.trim());
            setEditingComment(null);
            setEditContent('');
        }
    };

    const filteredComments = comments.filter((comment) => {
        if (filterStatus === 'ALL') return true;
        return comment.status === filterStatus;
    });


    return (
        <div className="bg-black/30 backdrop-blur-md border border-purple-800/50 rounded-xl shadow-lg p-4">
            {/* Header */}
            <h2 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                <MessageCircle size={18} />
                Bình luận
            </h2>

            {/* Filter */}
            <div className="flex items-center gap-2 mb-4">
                <Filter size={14} className="text-gray-400" />
                <button
                    onClick={() => setFilterStatus('ALL')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                        filterStatus === 'ALL'
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                    Tất cả ({statistics?.totalComments || 0})
                </button>
                <button
                    onClick={() => setFilterStatus('PENDING')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                        filterStatus === 'PENDING'
                            ? 'bg-yellow-600 text-white shadow-lg'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                    Đang chờ ({statistics?.pendingComments || 0})
                </button>
                <button
                    onClick={() => setFilterStatus('IN_PROGRESS')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                        filterStatus === 'IN_PROGRESS'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                    Đang xử lý ({statistics?.inProgressComments || 0})
                </button>
                <button
                    onClick={() => setFilterStatus('RESOLVED')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                        filterStatus === 'RESOLVED'
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                    Đã giải quyết ({statistics?.resolvedComments || 0})
                </button>
            </div>

            {/* Comments list */}
            {loading ? (
                <div className="text-center py-8">
                    <Loader size={24} className="animate-spin mx-auto text-purple-400" />
                </div>
            ) : !apiAvailable ? (
                <div className="text-center py-8">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 max-w-md mx-auto">
                        <AlertCircle size={32} className="mx-auto mb-3 text-yellow-400" />
                        <h3 className="text-base font-semibold text-yellow-300 mb-2">
                            Comment System đang được phát triển
                        </h3>
                        <p className="text-gray-400 text-xs">
                            Tính năng comment hiện đang được backend team phát triển. Vui lòng quay
                            lại sau.
                        </p>
                    </div>
                </div>
            ) : filteredComments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <MessageCircle size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Chưa có comment nào. Hãy là người đầu tiên comment!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredComments.map((comment) => (
                        <div
                            key={comment.id}
                            ref={(el) => {
                                if (el) commentRefs.current.set(comment.id, el);
                            }}
                        >
                            {editingComment?.id === comment.id ? (
                                /* Edit mode */
                                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        rows={3}
                                        className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleEdit}
                                            disabled={!editContent.trim()}
                                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Lưu
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingComment(null);
                                                setEditContent('');
                                            }}
                                            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-xs transition-colors"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Display mode */
                                <CommentItem
                                    comment={comment}
                                    isOwner={isOwner}
                                    onReply={handleReplyClick}
                                    onEdit={(c) => {
                                        setEditingComment(c);
                                        setEditContent(c.content);
                                    }}
                                    onDelete={onDelete}
                                    onUpdateStatus={onUpdateStatus}
                                    onTimestampClick={onTimestampClick}
                                    onLoadReplies={onLoadReplies}
                                    highlighted={highlightedCommentId === comment.id}
                                    replyingToId={replyingTo?.id || null}
                                    replyContent={replyContent}
                                    onReplyContentChange={setReplyContent}
                                    onSubmitReply={handleSubmitReply}
                                    onCancelReply={handleCancelReply}
                                    expandedIds={expandedCommentIds}
                                    onToggleReplies={toggleReplies}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

