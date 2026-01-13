import React from 'react';

interface AudioWaveIconProps {
    isPlaying: boolean;
    className?: string;
}

export const AudioWaveIcon: React.FC<AudioWaveIconProps> = ({ isPlaying, className = '' }) => {
    if (!isPlaying) return null;

    return (
        <div className={`flex items-end gap-0.5 h-4 ${className}`}>
            {[0, 1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="w-0.5 bg-gradient-to-t from-purple-400 to-cyan-400 rounded-full"
                    style={{
                        height: `${20 + i * 15}%`,
                        animation: `wave-bounce ${0.4 + i * 0.1}s ease-in-out infinite`,
                        animationDelay: `${i * 0.05}s`,
                    }}
                />
            ))}
            <style>{`
                @keyframes wave-bounce {
                    0%, 100% { height: 20%; }
                    50% { height: 100%; }
                }
            `}</style>
        </div>
    );
};

