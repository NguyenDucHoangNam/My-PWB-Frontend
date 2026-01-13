import { useRef, useState, useMemo } from 'react';

interface WaveformProps {
    duration: number;
    currentTime: number;
    onSeek: (time: number) => void;
    height?: number;
}

export default function Waveform({
    duration,
    currentTime,
    onSeek,
    height = 128,
}: WaveformProps) {
    const waveformRef = useRef<HTMLDivElement>(null);
    const [hoveredTime, setHoveredTime] = useState<number | null>(null);
    const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

    // Generate waveform bars ONCE
    const bars = useMemo(() => 
        Array.from({ length: 500 }).map(() => Math.random() * 0.8 + 0.2),
        [] 
    );

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!waveformRef.current || duration <= 0) return;
        const rect = waveformRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        onSeek(percentage * duration);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!waveformRef.current || duration <= 0) return;
        const rect = waveformRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        setHoveredTime(percentage * duration);
        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
        setHoveredTime(null);
        setMousePosition(null);
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Hàm render các thanh bar với hiệu ứng 3D như trong hình
    const renderBars = (isActiveLayer: boolean) => (
        <div className="absolute inset-0 flex items-center gap-[1px] px-2" style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
            {bars.map((barHeight, i) => {
                // Tính toán style 3D với độ sâu rõ ràng hơn
                const depth = barHeight * 0.8; // Tăng độ sâu để bars nổi bật hơn
                const shadowIntensity = barHeight * 0.7;
                const glowIntensity = barHeight * 0.6;

                return (
                    <div
                        key={i}
                        className="flex-1 h-full flex flex-col justify-center items-center"
                        style={{ minWidth: '4px', maxWidth: '5px' }} // Bars dày hơn như trong hình
                    >
                        <div
                            className={`w-full rounded-lg transition-all duration-200 relative ${
                                isActiveLayer
                                    ? 'bg-gradient-to-t from-purple-900 via-purple-700 via-purple-500 via-purple-300 to-purple-100'
                                    : 'bg-gradient-to-t from-gray-700 via-gray-600 via-gray-500 to-gray-400'
                            }`}
                            style={{
                                height: `${barHeight * 100}%`,
                                minHeight: '30%',
                                maxHeight: '100%',
                                transform: `translateZ(${depth}px)`,
                                transformStyle: 'preserve-3d',
                                // Multi-layer shadows để tạo depth rõ ràng như trong hình
                                boxShadow: isActiveLayer
                                    ? `0 ${shadowIntensity * 3}px ${shadowIntensity * 6}px rgba(168, 85, 247, ${shadowIntensity * 0.5}),
                                       0 ${shadowIntensity * 1.5}px ${shadowIntensity * 3}px rgba(168, 85, 247, ${shadowIntensity * 0.4}),
                                       0 0 ${shadowIntensity * 15}px rgba(192, 132, 252, ${glowIntensity * 0.3}),
                                       inset 0 2px 3px rgba(255, 255, 255, 0.4),
                                       inset 0 -2px 3px rgba(0, 0, 0, 0.3),
                                       inset -1px 0 2px rgba(255, 255, 255, 0.2),
                                       inset 1px 0 2px rgba(0, 0, 0, 0.25)`
                                    : `0 ${shadowIntensity * 2}px ${shadowIntensity * 4}px rgba(0, 0, 0, ${shadowIntensity * 0.4}),
                                       0 ${shadowIntensity * 1}px ${shadowIntensity * 2}px rgba(0, 0, 0, ${shadowIntensity * 0.3}),
                                       inset 0 1px 2px rgba(255, 255, 255, 0.15),
                                       inset 0 -1px 2px rgba(0, 0, 0, 0.25),
                                       inset -1px 0 1px rgba(255, 255, 255, 0.1),
                                       inset 1px 0 1px rgba(0, 0, 0, 0.2)`,
                                border: isActiveLayer
                                    ? '1px solid rgba(192, 132, 252, 0.5)'
                                    : '1px solid rgba(107, 114, 128, 0.4)',
                                borderTopColor: isActiveLayer ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.15)',
                                borderBottomColor: isActiveLayer ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.3)',
                            }}
                        >
                            {/* Top highlight rõ ràng như trong hình - tạo glow effect cho active bars */}
                            {isActiveLayer ? (
                                <>
                                    <div className="absolute top-0 left-0 right-0 h-[40%] rounded-t-lg bg-gradient-to-b from-white/70 via-white/30 to-transparent pointer-events-none" />
                                    <div className="absolute top-0 left-0 right-0 h-[25%] rounded-t-lg bg-gradient-to-b from-purple-200/90 via-purple-300/50 to-transparent pointer-events-none" />
                                </>
                            ) : (
                                <div className="absolute top-0 left-0 right-0 h-[30%] rounded-t-lg bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                            )}
                            
                            {/* Side lighting để tăng cường hiệu ứng 3D */}
                            <div 
                                className="absolute top-0 bottom-0 left-0 w-[25%] rounded-l-lg pointer-events-none"
                                style={{
                                    background: isActiveLayer 
                                        ? 'linear-gradient(to right, rgba(255, 255, 255, 0.3), transparent)'
                                        : 'linear-gradient(to right, rgba(255, 255, 255, 0.12), transparent)'
                                }}
                            />
                            
                            {/* Bottom shadow gradient */}
                            <div 
                                className="absolute bottom-0 left-0 right-0 h-[20%] rounded-b-lg pointer-events-none"
                                style={{
                                    background: isActiveLayer
                                        ? 'linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent)'
                                        : 'linear-gradient(to top, rgba(0, 0, 0, 0.35), transparent)'
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <>
            <div
                ref={waveformRef}
                className="relative w-full cursor-pointer group rounded-lg overflow-hidden bg-gray-900"
                style={{ height: `${height}px` }}
                onClick={handleClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Layer 0: Background base */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950 z-0" />

                {duration > 0 ? (
                    <>
                        {/* Layer 1: INACTIVE BARS (Màu xám - Nằm dưới cùng) */}
                        <div className="absolute inset-0 z-10 opacity-70">
                            {renderBars(false)}
                        </div>

                        {/* Layer 2: ACTIVE BARS (Màu tím - Nằm đè lên trên) */}
                        {/* Dùng clip-path để cắt chính xác tại vị trí progress */}
                        <div 
                            className="absolute inset-0 z-20"
                            style={{ 
                                clipPath: `inset(0 ${100 - progress}% 0 0)`,
                                transition: 'clip-path 0.1s linear' // Giúp chuyển động mượt hơn
                            }}
                        >
                            {renderBars(true)}
                        </div>
                    </>
                ) : (
                     <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm z-10">
                        Loading waveform...
                    </div>
                )}

                {/* Layer 4: Playhead Line (z-30) với glow effect như trong hình */}
                {duration > 0 && (
                    <>
                        {/* Glow effect phía sau playhead */}
                        <div
                            className="absolute top-0 bottom-0 w-[3px] pointer-events-none z-[29]"
                            style={{ 
                                left: `calc(${progress}% - 0.5px)`,
                                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
                                filter: 'blur(1.5px)'
                            }}
                        />
                        {/* Main playhead line */}
                        <div
                            className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] pointer-events-none z-30"
                            style={{ left: `${progress}%` }}
                        >
                            {/* Top indicator với glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.9)]" />
                        </div>
                    </>
                )}

                {/* Hover indicator */}
                {hoveredTime !== null && duration > 0 && (
                    <div
                        className="absolute top-0 bottom-0 w-[1px] bg-orange-400/50 pointer-events-none z-25"
                        style={{ left: `${((hoveredTime / duration) * 100)}%` }}
                    />
                )}
            </div>

            {/* Tooltip */}
            {hoveredTime !== null && mousePosition && (
                <div
                    className="fixed z-50 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white shadow-lg pointer-events-none"
                    style={{
                        left: mousePosition.x,
                        top: mousePosition.y - 30,
                        transform: 'translateX(-50%)',
                    }}
                >
                    {formatTime(hoveredTime)}
                </div>
            )}
        </>
    );
}