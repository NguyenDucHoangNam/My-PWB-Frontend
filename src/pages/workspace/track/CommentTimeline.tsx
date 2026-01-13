import { useState, useRef } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import CommentDot from './CommentDot';
import type { TrackCommentResponse } from '../../../services/commentService';

// Helper function to format time
const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

interface CommentTimelineProps {
    comments: TrackCommentResponse[];
    duration: number;
    onCommentClick: (comment: TrackCommentResponse) => void;
    onCreateCommentAtTime: (timestamp: number) => void;
}

export default function CommentTimeline({
    comments,
    duration,
    onCommentClick,
    onCreateCommentAtTime,
}: CommentTimelineProps) {
    const [hoveredTimestamp, setHoveredTimestamp] = useState<number | null>(null);
    const [mouseX, setMouseX] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Group comments by timestamp
    const commentsByTimestamp = new Map<number, TrackCommentResponse[]>();
    comments.forEach((comment) => {
        if (comment.timestamp !== null) {
            const existing = commentsByTimestamp.get(comment.timestamp) || [];
            existing.push(comment);
            commentsByTimestamp.set(comment.timestamp, existing);
        }
    });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (duration <= 0) return; // Don't calculate if duration is invalid
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const timestamp = Math.floor(percentage * duration);
        setHoveredTimestamp(timestamp);
        setMouseX(x);
    };

    const handleMouseLeave = () => {
        setHoveredTimestamp(null);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Prevent event from bubbling to other components (like Waveform)
        e.stopPropagation();
        e.preventDefault();
        
        if (hoveredTimestamp !== null && duration > 0) {
            onCreateCommentAtTime(hoveredTimestamp);
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative h-16 w-full bg-gradient-to-b from-gray-900/80 to-gray-950/50 border-t-2 border-purple-800/30 hover:border-purple-700/50 transition-colors cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {/* Empty state hint */}
            {commentsByTimestamp.size === 0 && hoveredTimestamp === null && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm pointer-events-none">
                    <div className="flex items-center gap-2">
                        <MessageSquarePlus size={16} />
                        <span>Di chuột vào bất kỳ đâu và nhấp để thêm bình luận tại thời điểm đó</span>
                    </div>
                </div>
            )}

            {/* Comment dots */}
            {Array.from(commentsByTimestamp.entries()).map(([timestamp, comments]) => (
                <CommentDot
                    key={timestamp}
                    comments={comments}
                    timestamp={timestamp}
                    duration={duration}
                    onClick={() => onCommentClick(comments[0])}
                />
            ))}

            {/* Vertical line indicator - short line only */}
            {hoveredTimestamp !== null && (() => {
                // Determine if time should be on left or right based on position
                const containerWidth = containerRef.current?.offsetWidth || 0;
                const showTimeOnRight = mouseX < containerWidth / 2;
                const timeOffset = 12; // Distance from the vertical line
                
                return (
                    <>
                        {/* Time display at top - positioned to left or right of the line */}
                        <div
                            className="absolute top-1 pointer-events-none z-20"
                            style={{ 
                                left: showTimeOnRight 
                                    ? `${mouseX + timeOffset}px` 
                                    : 'auto',
                                right: showTimeOnRight 
                                    ? 'auto' 
                                    : `${containerWidth - mouseX + timeOffset}px`,
                            }}
                        >
                            <div className="px-2 py-1 rounded bg-black/80 text-xs text-purple-300 font-mono border border-purple-500/50 shadow-lg whitespace-nowrap">
                                {formatTime(hoveredTimestamp)}
                            </div>
                        </div>
                        {/* Longer vertical line indicator */}
                        <div
                            className="absolute top-0 bottom-6 w-0.5 pointer-events-none z-10"
                            style={{
                                left: `${mouseX}px`,
                                transform: 'translateX(-50%)',
                                background: 'rgba(251, 113, 133, 0.8)',
                                boxShadow: '0 0 8px rgba(251, 113, 133, 0.6)',
                            }}
                        />
                        {/* Hover indicator for creating new comment */}
                        <div
                            className="absolute bottom-2 transform -translate-x-1/2 pointer-events-none z-20"
                            style={{ left: `${mouseX}px` }}
                        >
                            <div className="flex flex-col items-center animate-bounce-subtle">
                                <MessageSquarePlus
                                    size={20}
                                    className="text-orange-400 opacity-70 drop-shadow-lg"
                                />
                                <div className="text-[10px] text-orange-400 mt-1 bg-gray-900/90 px-1 rounded">
                                    Nhấp để bình luận
                                </div>
                            </div>
                        </div>
                    </>
                );
            })()}

            <style>
                {`
                    @keyframes bounce-subtle {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-4px); }
                    }
                    .animate-bounce-subtle {
                        animation: bounce-subtle 2s ease-in-out infinite;
                    }
                `}
            </style>
        </div>
    );
}

