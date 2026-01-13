import { useState } from 'react';
import type { TrackCommentResponse } from '../../../services/commentService';

// Avatar component with fallback for CommentDot
function CommentDotAvatar({ user }: { user: { avatarUrl: string | null; firstName: string; lastName: string; fullName: string } }) {
    const [imageError, setImageError] = useState(false);
    
    if (user.avatarUrl && !imageError) {
        return (
            <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-8 h-8 rounded-full border-2 border-gray-900 object-cover shadow-lg transition-transform group-hover:scale-110"
                onError={() => setImageError(true)}
            />
        );
    }
    
    return (
        <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform group-hover:scale-110">
            {user.firstName?.[0] || ''}
            {user.lastName?.[0] || ''}
        </div>
    );
}

interface CommentDotProps {
    comments: TrackCommentResponse[];
    timestamp: number;
    duration: number;
    onClick: () => void;
}

export default function CommentDot({ comments, timestamp, duration, onClick }: CommentDotProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    
    // Don't render if duration is invalid (avoid division by zero)
    if (duration <= 0) {
        return null;
    }
    
    const position = (timestamp / duration) * 100;

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Stack multiple avatars if there are multiple comments
    const displayComments = comments.slice(0, 3); // Show max 3 avatars

    return (
        <div
            className="absolute bottom-0 transform -translate-x-1/2 z-20"
            style={{ left: `${position}%` }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            {/* Avatar stack */}
            <div className="relative flex items-center justify-center cursor-pointer group">
                {displayComments.map((comment, index) => (
                    <div
                        key={comment.id}
                        className="relative"
                        style={{
                            marginLeft: index > 0 ? '-8px' : '0',
                            zIndex: displayComments.length - index,
                        }}
                        title={comment.user.fullName}
                    >
                        <CommentDotAvatar user={comment.user} />
                    </div>
                ))}
                {comments.length > 3 && (
                    <div
                        className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-700 flex items-center justify-center text-white text-xs font-bold shadow-lg"
                        style={{ marginLeft: '-8px', zIndex: 0 }}
                    >
                        +{comments.length - 3}
                    </div>
                )}
            </div>

            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 border border-orange-500/50 rounded-lg shadow-xl z-50">
                    <div className="text-orange-400 font-mono text-xs mb-2">
                        @ {formatTime(timestamp)}
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {comments.slice(0, 3).map((comment) => (
                            <div key={comment.id} className="text-xs">
                                <div className="font-semibold text-white">
                                    {comment.user.fullName}
                                </div>
                                <div className="text-gray-400 line-clamp-2">{comment.content}</div>
                            </div>
                        ))}
                        {comments.length > 3 && (
                            <div className="text-xs text-gray-500 italic">
                                +{comments.length - 3} bình luận khác...
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 border-r border-b border-orange-500/50" />
                </div>
            )}
        </div>
    );
}

