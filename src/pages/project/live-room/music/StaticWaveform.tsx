import React, { useEffect, useRef, useMemo } from 'react';

interface StaticWaveformProps {
    progress: number; // 0 to 1
    className?: string;
    barCount?: number;
    color?: string;
    progressColor?: string;
    onSeek?: (percentage: number) => void;
}

const StaticWaveform: React.FC<StaticWaveformProps> = ({
    progress,
    className = "",
    barCount = 100,
    color = "rgba(168, 85, 247, 0.4)", // Purple-400 with opacity
    progressColor = "rgba(216, 70, 239, 1)", // Fushcia-400
    onSeek,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Generate fake waveform data (random but symmetric-ish to look like audio)
    const waveformData = useMemo(() => {
        const data = [];
        for (let i = 0; i < barCount; i++) {
            // Create a pattern that looks somewhat like a song structure (intro, verse, chorus...)
            // Use multiple sine waves + noise to simulate structure
            const normalizedPos = i / barCount;
            const layout =
                Math.sin(normalizedPos * Math.PI) * 0.5 + // Global arc
                Math.sin(normalizedPos * Math.PI * 4) * 0.2 + // Sections
                Math.random() * 0.3; // Noise

            const value = Math.max(0.1, Math.min(1.0, layout));
            data.push(value);
        }
        return data;
    }, [barCount]);

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!onSeek || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));

        onSeek(percentage);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            const { width, height } = canvas;
            ctx.clearRect(0, 0, width, height);

            const barWidth = width / barCount;
            const gap = 1;
            const activeBarWidth = Math.max(1, barWidth - gap);
            const centerY = height / 2;

            waveformData.forEach((value, index) => {
                const x = index * barWidth;
                const barHeight = value * height * 0.8; // Max 80% height

                // Determine color based on progress
                const isPlayed = (index / barCount) <= progress;
                ctx.fillStyle = isPlayed ? progressColor : color;

                // Draw rounded bar (simulated by simple rect for performance)
                // Center vertically like standard waveform
                const y = centerY - barHeight / 2;

                // Draw with rounded corners manually or just rect
                ctx.beginPath();
                ctx.roundRect(x, y, activeBarWidth, barHeight, 2);
                ctx.fill();
            });
        };

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
                draw();
            }
        });

        resizeObserver.observe(canvas);

        // Initial draw
        if (canvas.parentElement) {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
            draw();
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [waveformData, progress, barCount, color, progressColor]);

    return (
        <canvas
            ref={canvasRef}
            className={`w-full h-full cursor-pointer ${className}`}
            onClick={handleClick}
        />
    );
};

export default StaticWaveform;
