import React from 'react';

interface MiniEqualizerProps {
    isPlaying: boolean;
    className?: string;
}

export const MiniEqualizer: React.FC<MiniEqualizerProps> = ({ isPlaying, className = '' }) => {
    if (!isPlaying) return null;

    return (
        <div className={`flex items-end gap-0.5 h-3 ${className}`}>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="w-0.5 bg-white/40 rounded-full"
                    style={{
                        height: `${30 + i * 20}%`,
                        animation: `equalizer-bar ${0.6 + i * 0.1}s ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`,
                    }}
                />
            ))}
            <style>{`
                @keyframes equalizer-bar {
                    0%, 100% { height: 30%; }
                    50% { height: 80%; }
                }
            `}</style>
        </div>
    );
};

