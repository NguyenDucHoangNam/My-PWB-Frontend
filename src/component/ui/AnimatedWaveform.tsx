import React, { useEffect, useState } from 'react';

interface AnimatedWaveformProps {
    isPlaying?: boolean;
    className?: string;
}

export const AnimatedWaveform: React.FC<AnimatedWaveformProps> = ({ isPlaying = false, className = '' }) => {
    const [bars, setBars] = useState<number[]>([]);

    useEffect(() => {
        // Generate random bar heights for waveform
        const generateBars = () => {
            const barCount = 40;
            const newBars = Array.from({ length: barCount }, () => Math.random() * 0.4 + 0.1);
            setBars(newBars);
        };

        generateBars();
        const interval = setInterval(generateBars, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`absolute inset-0 flex items-center justify-center gap-0.5 overflow-hidden pointer-events-none ${className}`}>
            {bars.map((height, index) => {
                const baseHeight = height * 100;
                return (
                    <div
                        key={index}
                        className="w-0.5 bg-gradient-to-t from-purple-500/20 via-blue-500/20 to-transparent rounded-full"
                        style={{
                            height: `${baseHeight}%`,
                            animation: isPlaying
                                ? `waveform-pulse ${0.5 + Math.random() * 0.5}s ease-in-out infinite`
                                : `waveform-slow ${1 + Math.random() * 1}s ease-in-out infinite`,
                            animationDelay: `${index * 0.05}s`,
                            '--bar-height': `${baseHeight}%`,
                        } as React.CSSProperties & { '--bar-height': string }}
                    />
                );
            })}
            <style>{`
                @keyframes waveform-pulse {
                    0%, 100% { opacity: 0.3; transform: scaleY(1); }
                    50% { opacity: 0.6; transform: scaleY(1.2); }
                }
                @keyframes waveform-slow {
                    0%, 100% { opacity: 0.1; transform: scaleY(1); }
                    50% { opacity: 0.2; transform: scaleY(1.1); }
                }
            `}</style>
        </div>
    );
};

