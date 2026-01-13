import React, { useEffect, useRef } from 'react';

interface CosmicWaveformProps {
    isPlaying: boolean;
    className?: string;
}

export const CosmicWaveform: React.FC<CosmicWaveformProps> = ({ isPlaying, className = '' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!isPlaying || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 200;
        canvas.height = 40;

        const bars = 32;
        const barWidth = canvas.width / bars;
        let animationFrame: number;

        const draw = () => {
            if (!isPlaying) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < bars; i++) {
                const barHeight = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;
                const x = i * barWidth;
                const y = (canvas.height - barHeight) / 2;
                
                // Gradient for each bar
                const gradient = ctx.createLinearGradient(x, 0, x, canvas.height);
                gradient.addColorStop(0, `rgba(168, 85, 247, ${0.6 + Math.random() * 0.4})`);
                gradient.addColorStop(0.5, `rgba(59, 130, 246, ${0.6 + Math.random() * 0.4})`);
                gradient.addColorStop(1, `rgba(236, 72, 153, ${0.4 + Math.random() * 0.3})`);
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
                
                // Glow effect
                ctx.shadowBlur = 8;
                ctx.shadowColor = `rgba(${168 + Math.random() * 50}, 85, 247, 0.8)`;
                ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
                ctx.shadowBlur = 0;
            }
            
            animationFrame = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [isPlaying]);

    if (!isPlaying) return null;

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                imageRendering: 'pixelated',
            }}
        />
    );
};

