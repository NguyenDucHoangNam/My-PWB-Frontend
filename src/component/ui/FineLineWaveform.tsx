import React, { useEffect, useRef } from 'react';

interface FineLineWaveformProps {
    isPlaying: boolean;
    className?: string;
}

export const FineLineWaveform: React.FC<FineLineWaveformProps> = ({ isPlaying, className = '' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size based on container
        const updateSize = () => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width && rect.height) {
                canvas.width = rect.width;
                canvas.height = rect.height;
            } else {
                canvas.width = 200;
                canvas.height = 32;
            }
        };

        updateSize();
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(canvas);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx || !canvas.width || !canvas.height) return;

        const lineCount = 80; // More lines for finer detail
        let animationFrame: number;
        
        // Generate static pattern for non-playing state
        const staticPattern = Array.from({ length: lineCount }, () => Math.random() * 0.3 + 0.1);

        const draw = () => {
            if (!canvas.width || !canvas.height) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const spacing = canvas.width / lineCount;
            
            // Single gradient from violet to transparent
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)'); // Violet
            gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.6)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0)'); // Transparent

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1; // Very thin lines
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            for (let i = 0; i < lineCount; i++) {
                const x = i * spacing + spacing / 2;
                const centerY = canvas.height / 2;
                
                // Generate subtle amplitude variation
                const amplitude = isPlaying 
                    ? (Math.random() * 0.4 + 0.1) * canvas.height * 0.4
                    : staticPattern[i] * canvas.height * 0.3; // Static when not playing
                
                const topY = centerY - amplitude;
                const bottomY = centerY + amplitude;

                // Draw thin vertical line
                ctx.beginPath();
                ctx.moveTo(x, topY);
                ctx.lineTo(x, bottomY);
                ctx.stroke();
            }

            // Fade out at edges using mask
            const fadeGradient = ctx.createLinearGradient(0, 0, canvas.width * 0.1, 0);
            fadeGradient.addColorStop(0, 'rgba(0,0,0,1)');
            fadeGradient.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.globalCompositeOperation = 'destination-in';
            ctx.fillStyle = fadeGradient;
            ctx.fillRect(0, 0, canvas.width * 0.1, canvas.height);
            
            // Right fade
            const fadeGradientRight = ctx.createLinearGradient(canvas.width * 0.9, 0, canvas.width, 0);
            fadeGradientRight.addColorStop(0, 'rgba(0,0,0,0)');
            fadeGradientRight.addColorStop(1, 'rgba(0,0,0,1)');
            ctx.fillStyle = fadeGradientRight;
            ctx.fillRect(canvas.width * 0.9, 0, canvas.width * 0.1, canvas.height);
            
            ctx.globalCompositeOperation = 'source-over';

            if (isPlaying) {
                animationFrame = requestAnimationFrame(draw);
            }
        };

        // Draw initial frame
        draw();

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [isPlaying]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                imageRendering: 'crisp-edges',
            }}
        />
    );
};

