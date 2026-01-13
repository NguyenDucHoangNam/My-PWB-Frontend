import { useState } from 'react';
import { type PopupPosition } from '../../../types/track';

/**
 * Hook để quản lý comment popup state
 */
export const useTrackCommentPopup = () => {
    const [showCommentPopup, setShowCommentPopup] = useState(false);
    const [popupTimestamp, setPopupTimestamp] = useState<number>(0);
    const [popupPosition, setPopupPosition] = useState<PopupPosition | undefined>();
    const [highlightedCommentId, setHighlightedCommentId] = useState<number | null>(null);

    const handleCreateCommentAtTime = (timestamp: number, position?: PopupPosition) => {
        setPopupTimestamp(timestamp);
        setPopupPosition(position);
        setShowCommentPopup(true);
    };

    const handleCommentClick = (comment: { id: number; timestamp: number | null }, onSeek: (time: number) => void) => {
        if (comment.timestamp !== null) {
            onSeek(comment.timestamp);
        }
        setHighlightedCommentId(comment.id);
        setTimeout(() => setHighlightedCommentId(null), 3000);
    };

    const closePopup = () => {
        setShowCommentPopup(false);
        setPopupTimestamp(0);
        setPopupPosition(undefined);
    };

    return {
        showCommentPopup,
        popupTimestamp,
        popupPosition,
        highlightedCommentId,
        handleCreateCommentAtTime,
        handleCommentClick,
        closePopup,
    };
};

