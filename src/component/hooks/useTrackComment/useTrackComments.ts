import { useState, useCallback } from 'react';
import { useCosmicToast } from '../../toast/CosmicToastProvider';
import commentService, {
    type TrackCommentResponse,
    type TrackCommentStatisticsResponse,
} from '../../../services/commentService';

/**
 * Hook để quản lý comments, statistics và replies
 */
export const useTrackComments = (
    trackId: string | undefined,
    isClientRoomMode: boolean,
    deliveryId: string | null
) => {
    const { showToast } = useCosmicToast();
    const [comments, setComments] = useState<TrackCommentResponse[]>([]);
    const [statistics, setStatistics] = useState<TrackCommentStatisticsResponse | null>(null);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentsApiAvailable, setCommentsApiAvailable] = useState(true);
    const [expandedCommentIds, setExpandedCommentIds] = useState<Set<number>>(new Set());

    // Load comments
    const loadComments = useCallback(async () => {
        if (!trackId) return;

        try {
            setLoadingComments(true);
            if (isClientRoomMode && deliveryId) {
                // Client Room mode: use client room comment APIs
                const deliveryIdNum = Number(deliveryId);
                if (isNaN(deliveryIdNum) || deliveryIdNum <= 0) {
                    throw new Error('Invalid delivery ID');
                }
                const response = await commentService.getClientRoomRootComments(deliveryIdNum, 0, 100);
                setComments(response.content);
                setCommentsApiAvailable(true);
            } else {
                // Internal Room mode: use internal room comment APIs
                const trackIdNum = Number(trackId);
                if (isNaN(trackIdNum) || trackIdNum <= 0) {
                    throw new Error('Invalid track ID');
                }
                const response = await commentService.getRootComments(trackIdNum, 0, 100);
                setComments(response.content);
                setCommentsApiAvailable(true);
            }
        } catch (error: any) {
            setComments([]);
            setCommentsApiAvailable(false);
        } finally {
            setLoadingComments(false);
        }
    }, [trackId, isClientRoomMode, deliveryId]);

    // Load statistics
    const loadStatistics = useCallback(async () => {
        if (!trackId) return;

        try {
            if (isClientRoomMode && deliveryId) {
                // Client Room mode: use client room statistics API
                const deliveryIdNum = Number(deliveryId);
                if (isNaN(deliveryIdNum) || deliveryIdNum <= 0) {
                    throw new Error('Invalid delivery ID');
                }
                const stats = await commentService.getClientRoomCommentStatistics(deliveryIdNum);
                setStatistics(stats);
            } else {
                // Internal Room mode: use internal room statistics API
                const trackIdNum = Number(trackId);
                if (isNaN(trackIdNum) || trackIdNum <= 0) {
                    throw new Error('Invalid track ID');
                }
                const stats = await commentService.getCommentStatistics(trackIdNum);
                setStatistics(stats);
            }
        } catch (error: any) {
            setStatistics({
                trackId: Number(trackId),
                totalComments: 0,
                pendingComments: 0,
                inProgressComments: 0,
                resolvedComments: 0,
            });
        }
    }, [trackId, isClientRoomMode, deliveryId]);

    // Load replies for a specific comment (works recursively for nested comments)
    const loadRepliesForComment = useCallback(
        async (commentId: number) => {
            try {
                const replies = isClientRoomMode
                    ? await commentService.getClientRoomRepliesByComment(commentId)
                    : await commentService.getRepliesByComment(commentId);

                // Helper function to recursively update comments
                const updateCommentReplies = (comments: TrackCommentResponse[]): TrackCommentResponse[] => {
                    return comments.map((c) => {
                        if (c.id === commentId) {
                            return {
                                ...c,
                                replies: replies,
                                replyCount: replies.length,
                            };
                        }
                        // Recursively update nested replies
                        if (c.replies && c.replies.length > 0) {
                            return {
                                ...c,
                                replies: updateCommentReplies(c.replies),
                            };
                        }
                        return c;
                    });
                };

                // Update the comments state with the fetched replies
                setComments((prev) => updateCommentReplies(prev));
            } catch (error: any) {
                console.error('Error loading replies:', error);
                showToast({
                    type: 'error',
                    message: 'Không thể tải replies',
                });
            }
        },
        [isClientRoomMode, showToast]
    );

    // Reload replies for all expanded comments after loading root comments
    const reloadExpandedReplies = useCallback(async () => {
        if (expandedCommentIds.size > 0) {
            // Reload replies for all expanded comments in parallel
            await Promise.all(
                Array.from(expandedCommentIds).map((commentId) => loadRepliesForComment(commentId))
            );
        }
    }, [expandedCommentIds, loadRepliesForComment]);

    return {
        comments,
        setComments,
        statistics,
        loadingComments,
        commentsApiAvailable,
        expandedCommentIds,
        setExpandedCommentIds,
        loadComments,
        loadStatistics,
        loadRepliesForComment,
        reloadExpandedReplies,
    };
};

