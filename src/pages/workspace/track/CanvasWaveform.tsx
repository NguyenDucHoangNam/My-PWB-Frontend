import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    memo,
} from 'react';

interface WaveformProps {
    duration: number;
    currentTime: number;
    onSeek: (time: number) => void;
    height?: number;
}

const BAR_COUNT = 400;
const MAX_HEIGHT_RATIO = 0.8;

const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const CanvasWaveform: React.FC<WaveformProps> = ({
    duration,
    currentTime,
    onSeek,
    height = 128,
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const barsRef = useRef<number[]>([]);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverX, setHoverX] = useState<number | null>(null);

    // Generate bars 1 lần
    useEffect(() => {
        if (barsRef.current.length === 0) {
            barsRef.current = Array.from({ length: BAR_COUNT }, () => {
                return Math.random() * 0.8 + 0.2; // 0.2 → 1.0
            });
        }
    }, []);

    // Resize canvas theo container + devicePixelRatio
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = height * dpr;
        };

        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [height]);

    // Hàm vẽ waveform
    const drawWaveform = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !duration) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const h = height;

        // làm việc với toạ độ px bình thường
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, h);

        // === BACKGROUND PANEL (phẳng) ===
        const bgGradient = ctx.createLinearGradient(0, 0, 0, h);
        bgGradient.addColorStop(0, 'rgba(15,23,42,0.96)');
        bgGradient.addColorStop(0.45, 'rgba(15,23,42,0.98)');
        bgGradient.addColorStop(0.55, 'rgba(37,99,235,0.30)');
        bgGradient.addColorStop(1, 'rgba(15,23,42,1)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, h);

        // viền trên để nhìn như mép "tấm kính"
        ctx.fillStyle = 'rgba(248,250,252,0.15)';
        ctx.fillRect(0, h * 0.06, width, 2);

        const centerY = h * 0.48;
        const maxBarHeight = h * MAX_HEIGHT_RATIO * 0.8;
        const barCount = barsRef.current.length;
        const step = width / barCount;
        const barWidth = Math.max(1.5, step * 0.6);
        const progress = Math.max(0, Math.min(1, currentTime / duration));

        // gradient bar chưa nghe
        const baseGradient = ctx.createLinearGradient(0, 0, 0, h);
        baseGradient.addColorStop(0, 'rgba(148,163,184,0.35)');
        baseGradient.addColorStop(1, 'rgba(56,189,248,0.3)');

        // gradient bar đã nghe (màu nóng hơn)
        const playedGradient = ctx.createLinearGradient(0, 0, 0, h);
        playedGradient.addColorStop(0, 'rgba(236,72,153,0.95)');
        playedGradient.addColorStop(1, 'rgba(129,140,248,0.95)');

        // === MAIN BARS ===
        for (let i = 0; i < barCount; i++) {
            const amp = barsRef.current[i];
            const barHeight = amp * maxBarHeight;

            const xCenter = i * step + step / 2;
            const x = xCenter - barWidth / 2;
            const y = centerY - barHeight / 2;

            const played = i / barCount <= progress;
            ctx.fillStyle = played ? playedGradient : baseGradient;

            if (played) {
                ctx.shadowColor = 'rgba(244,114,182,0.85)';
                ctx.shadowBlur = 14;
            } else {
                ctx.shadowColor = 'rgba(15,23,42,0.5)';
                ctx.shadowBlur = 6;
            }

            const r = barWidth / 2;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + barWidth - r, y);
            ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
            ctx.lineTo(x + barWidth, y + barHeight - r);
            ctx.quadraticCurveTo(
                x + barWidth,
                y + barHeight,
                x + barWidth - r,
                y + barHeight
            );
            ctx.lineTo(x + r, y + barHeight);
            ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
        }

        // clear shadow
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        // === REFLECTION (mặt dưới, nhẹ hơn) ===
        const reflectionHeightFactor = 0.35;
        ctx.globalAlpha = 0.3;

        const reflectionGradient = ctx.createLinearGradient(0, centerY, 0, h);
        reflectionGradient.addColorStop(0, 'rgba(56,189,248,0.45)');
        reflectionGradient.addColorStop(1, 'rgba(15,23,42,0)');
        ctx.fillStyle = reflectionGradient;

        ctx.shadowColor = 'rgba(56,189,248,0.75)';
        ctx.shadowBlur = 16;

        for (let i = 0; i < barCount; i++) {
            const amp = barsRef.current[i];
            const barHeight = amp * maxBarHeight * reflectionHeightFactor;

            const xCenter = i * step + step / 2;
            const x = xCenter - barWidth / 2;
            const y = centerY + 5;

            const r = barWidth / 2;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + barWidth - r, y);
            ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
            ctx.lineTo(x + barWidth, y + barHeight - r);
            ctx.quadraticCurveTo(
                x + barWidth,
                y + barHeight,
                x + barWidth - r,
                y + barHeight
            );
            ctx.lineTo(x + r, y + barHeight);
            ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
        }

        // reset
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        // glow ngang ở giữa cho cảm giác dải năng lượng
        const midGlow = ctx.createLinearGradient(0, centerY - 10, 0, centerY + 10);
        midGlow.addColorStop(0, 'rgba(59,130,246,0)');
        midGlow.addColorStop(0.5, 'rgba(96,165,250,0.7)');
        midGlow.addColorStop(1, 'rgba(59,130,246,0)');
        ctx.fillStyle = midGlow;
        ctx.fillRect(0, centerY - 10, width, 20);

        // overlay glow trên cùng cho cảm giác "bề mặt kính"
        const topGlow = ctx.createLinearGradient(0, 0, 0, h);
        topGlow.addColorStop(0, 'rgba(248,250,252,0.10)');
        topGlow.addColorStop(1, 'rgba(248,250,252,0)');
        ctx.fillStyle = topGlow;
        ctx.fillRect(0, 0, width, h);

        // vạch progress siêu sáng
        const progressX = progress * width;
        ctx.save();
        ctx.shadowColor = 'rgba(251,113,133,0.95)';
        ctx.shadowBlur = 22;
        ctx.fillStyle = 'rgba(251,113,133,0.98)';
        ctx.fillRect(progressX - 1, 0, 2, h);
        ctx.restore();
    }, [currentTime, duration, height]);

    // Vẽ lại khi time/duration đổi
    useEffect(() => {
        drawWaveform();
    }, [drawWaveform]);

    // Click để seek
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!duration || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        const clamped = Math.max(0, Math.min(1, ratio));
        onSeek(clamped * duration);
    };

    // Hover time tooltip
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!duration || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        const clamped = Math.max(0, Math.min(1, ratio));
        setHoverTime(clamped * duration);
        setHoverX(e.clientX - rect.left);
    };

    const handleMouseLeave = () => {
        setHoverTime(null);
        setHoverX(null);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full rounded-[30px] overflow-hidden bg-gradient-to-b from-purple-950/70 via-slate-950/90 to-purple-950/70 border border-purple-800/70 shadow-[0_0_40px_rgba(88,28,135,0.7)]"
            style={{ height }}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* lớp glow nền phía sau cho có chiều sâu */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0,rgba(244,114,182,0.25),transparent_55%),radial-gradient(circle_at_80%_100%,rgba(56,189,248,0.22),transparent_55%)] opacity-80" />

            {/* Canvas phẳng */}
            <canvas ref={canvasRef} className="relative w-full h-full block" />

            {/* Tooltip thời gian hover */}
            {hoverTime != null && hoverX != null && (
                <div
                    className="pointer-events-none absolute -top-7 px-2 py-1 rounded-md bg-black/80 text-xs text-purple-100 border border-purple-500/60 shadow-lg"
                    style={{
                        left: hoverX,
                        transform: 'translateX(-50%)',
                    }}
                >
                    {formatTime(hoverTime)}
                </div>
            )}
        </div>
    );
};

export default memo(CanvasWaveform);
