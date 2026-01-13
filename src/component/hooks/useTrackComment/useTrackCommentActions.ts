import { useCallback } from 'react';
import { useCosmicToast } from '../../toast/CosmicToastProvider';
import commentService, {
    type TrackCommentResponse,
    type CommentStatus,
    type CreateCommentRequest,
} from '../../../services/commentService';
import { type AudioPlayerHandle } from '../../../pages/workspace/track/AudioPlayer';

/**
 * Hook để quản lý comment actions (create, edit, delete, update status, reply)
 */
export const useTrackCommentActions = (
    trackId: string | undefined,
    isClientRoomMode: boolean,
    deliveryId: string | null,
    loadComments: () => Promise<void>,
    loadStatistics: () => Promise<void>,
    loadRepliesForComment: (commentId: number) => Promise<void>,
    reloadExpandedReplies: () => Promise<void>,
    isPlaying: boolean,
    currentTime: number,
    audioPlayerRef: React.RefObject<AudioPlayerHandle | null>,
    setIsPlaying: (playing: boolean) => void
) => {
    const { showToast } = useCosmicToast();

    const handleCommentSubmit = useCallback(
        async (content: string, popupTimestamp: number) => {
            if (!content.trim()) return;

            // Save audio state before operations to preserve playback
            const wasPlaying = isPlaying;
            const savedTime = currentTime;

            try {
                const request: CreateCommentRequest = {
                    content: content.trim(),
                    timestamp: popupTimestamp,
                    parentCommentId: null,
                };

                if (isClientRoomMode && deliveryId) {
                    // Client Room mode: use client room comment API
                    await commentService.createClientRoomComment(Number(deliveryId), request);
                } else if (trackId) {
                    // Internal Room mode: use internal room comment API
                    await commentService.createComment(Number(trackId), request);
                } else {
                    throw new Error('Missing trackId or deliveryId');
                }

                showToast({
                    type: 'success',
                    message: 'Đã tạo comment thành công',
                });

                // Reload comments and statistics, preserving expanded threads
                await loadStatistics();
                await loadComments();
                await reloadExpandedReplies();

                // Restore audio playback state if it was playing
                // This ensures music continues without interruption
                if (wasPlaying && audioPlayerRef.current) {
                    // Small delay to ensure state updates are complete
                    setTimeout(() => {
                        if (audioPlayerRef.current) {
                            // Only seek if there's significant drift (>0.5 seconds)
                            if (Math.abs(currentTime - savedTime) > 0.5) {
                                audioPlayerRef.current.seek(savedTime);
                            }
                            // Resume playback if it got paused
                            if (!isPlaying) {
                                audioPlayerRef.current.play();
                                setIsPlaying(true);
                            }
                        }
                    }, 50);
                }
            } catch (error: any) {
                console.error('Error creating comment:', error);
                showToast({
                    type: 'error',
                    message: error.response?.data?.message || 'Không thể tạo comment',
                });
            }
        },
        [
            isClientRoomMode,
            deliveryId,
            trackId,
            loadComments,
            loadStatistics,
            reloadExpandedReplies,
            isPlaying,
            currentTime,
            audioPlayerRef,
            setIsPlaying,
            showToast,
        ]
    );

    const handleReply = useCallback(
        async (comment: TrackCommentResponse, content: string) => {
            try {
                const request: CreateCommentRequest = {
                    content: content.trim(),
                    timestamp: null,
                    parentCommentId: comment.id,
                };

                if (isClientRoomMode && deliveryId) {
                    // Client Room mode: use client room comment API
                    await commentService.createClientRoomComment(Number(deliveryId), request);
                } else if (trackId) {
                    // Internal Room mode: use internal room comment API
                    await commentService.createComment(Number(trackId), request);
                } else {
                    throw new Error('Missing trackId or deliveryId');
                }

                showToast({
                    type: 'success',
                    message: 'Đã reply thành công',
                });

                // DON'T reload all comments - this resets the tree and loses loaded replies
                // Instead, just reload the specific parent's replies and update statistics
                await loadStatistics();
                await loadRepliesForComment(comment.id);
            } catch (error: any) {
                console.error('Error creating reply:', error);
                showToast({
                    type: 'error',
                    message: error.response?.data?.message || 'Không thể reply',
                });
            }
        },
        [isClientRoomMode, deliveryId, trackId, loadStatistics, loadRepliesForComment, showToast]
    );

    const handleEdit = useCallback(
        async (comment: TrackCommentResponse, content: string) => {
            try {
                await commentService.updateComment(comment.id, {
                    content: content.trim(),
                });

                showToast({
                    type: 'success',
                    message: 'Đã cập nhật comment',
                });

                loadComments();
            } catch (error: any) {
                console.error('Error updating comment:', error);
                showToast({
                    type: 'error',
                    message: error.response?.data?.message || 'Không thể cập nhật comment',
                });
            }
        },
        [loadComments, showToast]
    );

    const handleDelete = useCallback(
        async (comment: TrackCommentResponse) => {
            if (!confirm('Bạn có chắc muốn xóa comment này?')) return;

            try {
                await commentService.deleteComment(comment.id);

                showToast({
                    type: 'success',
                    message: 'Đã xóa comment',
                });

                loadComments();
                loadStatistics();
            } catch (error: any) {
                console.error('Error deleting comment:', error);
                showToast({
                    type: 'error',
                    message: error.response?.data?.message || 'Không thể xóa comment',
                });
            }
        },
        [loadComments, loadStatistics, showToast]
    );

    const handleUpdateStatus = useCallback(
        async (comment: TrackCommentResponse, newStatus: CommentStatus) => {
            try {
                await commentService.updateCommentStatus(comment.id, { status: newStatus });

                showToast({
                    type: 'success',
                    message: 'Đã cập nhật trạng thái',
                });

                loadComments();
                loadStatistics();
            } catch (error: any) {
                console.error('Error updating status:', error);
                showToast({
                    type: 'error',
                    message: error.response?.data?.message || 'Không thể cập nhật trạng thái',
                });
            }
        },
        [loadComments, loadStatistics, showToast]
    );

    return {
        handleCommentSubmit,
        handleReply,
        handleEdit,
        handleDelete,
        handleUpdateStatus,
    };
};

