import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface CenterCircleVisualizerProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    isPlaying: boolean;
    playingTrack: { track: { id: number; name: string } } | null;
}

export const CenterCircleVisualizer: React.FC<CenterCircleVisualizerProps> = ({
    audioRef,
    isPlaying,
    playingTrack,
}) => {
    const [bars, setBars] = useState<number[]>([]);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [starOpacity, setStarOpacity] = useState<number[]>([]);

    const BAR_COUNT = 120;
    const STAR_COUNT = 30;

    // Initialize stars opacity
    useEffect(() => {
        const initialStars = Array.from({ length: STAR_COUNT }, () => Math.random());
        setStarOpacity(initialStars);
    }, []);

    // Initialize Web Audio API
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Only create if not already created
        if (audioContextRef.current) return;

        // Create AudioContext
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.3; // Giảm để phản ứng nhanh hơn với bass/beat

        // Create source from audio element
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;

        // Initialize bars array
        setBars(new Array(BAR_COUNT).fill(0.1));

        // Cleanup function
        return () => {
            if (sourceRef.current) {
                sourceRef.current.disconnect();
            }
            if (analyserRef.current) {
                analyserRef.current.disconnect();
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [audioRef]);

    // Update bars data and visibility
    useEffect(() => {
        if (!isPlaying || !playingTrack || !analyserRef.current) {
            // Fade out when not playing
            setBars(new Array(BAR_COUNT).fill(0.1));
            // Delay hiding to allow fade-out animation
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 300);
            return () => clearTimeout(timer);
        }

        // Fade in when playing
        setIsVisible(true);

        // Resume audio context if suspended
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        // Animate planet rotation
        let rotationFrameId: number;
        const rotatePlanet = () => {
            setRotation(prev => (prev + 0.2) % 360);
            rotationFrameId = requestAnimationFrame(rotatePlanet);
        };
        rotationFrameId = requestAnimationFrame(rotatePlanet);

        // Animate stars twinkling
        const twinkleStars = setInterval(() => {
            setStarOpacity(prev => 
                prev.map(opacity => {
                    const change = (Math.random() - 0.5) * 0.1;
                    return Math.max(0.3, Math.min(1, opacity + change));
                })
            );
        }, 200);

        const updateBars = () => {
            if (!analyserRef.current) return;

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserRef.current.getByteFrequencyData(dataArray);

            // Downsample to BAR_COUNT bars với boost cho bass frequencies
            const step = Math.floor(dataArray.length / BAR_COUNT);
            const newBars: number[] = [];

            for (let i = 0; i < BAR_COUNT; i++) {
                let sum = 0;
                for (let j = 0; j < step; j++) {
                    const idx = i * step + j;
                    if (idx < dataArray.length) {
                        // Boost bass frequencies (lower indices) để tạo cảm giác "bùng" mạnh hơn
                        const bassBoost = idx < dataArray.length * 0.2 ? 1.8 : 1.0;
                        sum += (dataArray[idx] || 0) * bassBoost;
                    }
                }
                const avg = sum / step;
                // Tăng multiplier từ 2 lên 4 để bars nhảy mạnh hơn
                const normalized = Math.max(0.1, Math.min(1, (avg / 255) * 4));
                newBars.push(normalized);
            }

            setBars(newBars);
            animationFrameRef.current = requestAnimationFrame(updateBars);
        };

        animationFrameRef.current = requestAnimationFrame(updateBars);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            clearInterval(twinkleStars);
            cancelAnimationFrame(rotationFrameId);
        };
    }, [isPlaying, playingTrack]);

    // Don't render if no track
    if (!playingTrack) return null;

    return (
        <div 
            className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none"
            style={{
                opacity: isVisible ? 0.3 : 0, // Giảm opacity xuống 0.3 để làm mờ
                transition: 'opacity 0.3s ease-in-out',
            }}
        >
            <div
                className="
                    relative
                    flex items-center justify-center
                    rounded-full
                    w-[280px] h-[280px]
                    transform
                    perspective-[1000px]
                    transition-opacity duration-300
                "
                style={{
                    transform: `perspective(1000px) rotateX(15deg) rotateY(${rotation}deg)`,
                }}
            >
                {/* Vòng ngoài - vành đai hành tinh (outer ring) */}
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.5)]" />
                
                {/* Halo phát sáng vũ trụ - gradient cyan/blue */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-900/60 via-blue-800/40 to-cyan-900/50 blur-3xl" />
                <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-cyan-500/25 via-blue-400/20 to-cyan-500/20 blur-2xl" />

                {/* Hành tinh ở tâm - với texture và gradient cyan/blue */}
                <div 
                    className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-600 via-blue-600 to-cyan-700 shadow-inner"
                    style={{
                        background: `
                            radial-gradient(circle at 30% 30%, rgba(6,182,212,0.9) 0%, transparent 50%),
                            radial-gradient(circle at 70% 70%, rgba(59,130,246,0.7) 0%, transparent 50%),
                            linear-gradient(135deg, rgb(6,182,212) 0%, rgb(59,130,246) 50%, rgb(14,165,233) 100%)
                        `,
                        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5), 0 0 40px rgba(6,182,212,0.5)',
                    }}
                >
                    {/* Texture hành tinh - các vùng sáng/tối */}
                    <div className="absolute inset-0 rounded-full opacity-30" style={{
                        background: `
                            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 30%),
                            radial-gradient(circle at 80% 60%, rgba(0,0,0,0.3) 0%, transparent 40%)
                        `,
                    }} />
                </div>

                {/* Tên bài + icon ở tâm */}
                <div className="relative z-20 flex flex-col items-center text-center px-4">
                    <div className="relative">
                        <Sparkles className="text-cyan-300 mb-1 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" size={24} />
                        <div className="absolute inset-0 animate-pulse">
                            <Sparkles className="text-blue-400 opacity-50" size={24} />
                        </div>
                    </div>
                    <div className="text-xs text-cyan-200 font-semibold truncate max-w-[180px] drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]">
                        {playingTrack.track.name}
                    </div>
                </div>

                {/* Các hạt sao nhấp nháy xung quanh */}
                {Array.from({ length: STAR_COUNT }).map((_, index) => {
                    const starAngle = (index / STAR_COUNT) * 360;
                    const starRadius = 140 + Math.random() * 20;
                    const starRadians = (starAngle * Math.PI) / 180;
                    const starX = Math.sin(starRadians) * starRadius;
                    const starY = -Math.cos(starRadians) * starRadius;
                    const opacity = starOpacity[index] || 0.5;
                    
                    return (
                        <div
                            key={`star-${index}`}
                            className="absolute rounded-full bg-cyan-300"
                            style={{
                                width: 2 + Math.random() * 2,
                                height: 2 + Math.random() * 2,
                                left: `calc(50% + ${starX}px)`,
                                top: `calc(50% + ${starY}px)`,
                                transform: 'translate(-50%, -50%)',
                                opacity: opacity * 0.8,
                                boxShadow: `0 0 ${4 + Math.random() * 4}px rgba(6,182,212,0.8)`,
                                transition: 'opacity 0.2s ease-in-out',
                            }}
                        />
                    );
                })}

                {/* Vành đai hành tinh / Sóng năng lượng vũ trụ - đầy đủ 360° */}
                {bars.map((value, index) => {
                    const angle = (index / bars.length) * 360; // độ - đầy đủ 360°
                    const baseRadius = 130; // px - khoảng cách từ tâm đến điểm bắt đầu của bar
                    // Chiều dài bar - nhảy mạnh hơn với bass
                    const barLength = 25 + value * 95; // chiều dài thanh (từ 25px đến 120px)
                    // Tính toán vị trí để bar quay quanh tâm và mở rộng ra ngoài
                    const radians = (angle * Math.PI) / 180;
                    const x = Math.sin(radians) * baseRadius;
                    const y = -Math.cos(radians) * baseRadius;
                    
                    // Màu sắc theo vị trí - tạo gradient cyan/blue
                    const colorIndex = index / bars.length;
                    let gradientColors = '';
                    if (colorIndex < 0.33) {
                        // Cyan → Blue
                        gradientColors = 'from-cyan-500 via-blue-500 to-blue-400';
                    } else if (colorIndex < 0.66) {
                        // Blue → Cyan (accent)
                        gradientColors = 'from-blue-500 via-cyan-400 to-cyan-400';
                    } else {
                        // Cyan → Blue (hoàn thành vòng tròn)
                        gradientColors = 'from-cyan-400 via-blue-500 to-blue-600';
                    }
                    
                    return (
                        <div
                            key={index}
                            className={`absolute rounded-full
                                       bg-gradient-to-t ${gradientColors}
                                       transition-[height,opacity,transform] duration-75`}
                            style={{
                                width: 3 + value * 2, // Độ rộng thay đổi theo amplitude
                                height: barLength,
                                left: `calc(50% + ${x}px)`,
                                top: `calc(50% + ${y}px)`,
                                transform: `
                                    translate(-50%, -100%)
                                    rotate(${angle}deg)
                                    scaleY(${0.8 + value * 0.7})
                                `,
                                opacity: 0.7 + value * 0.3,
                                transformOrigin: 'center bottom',
                                boxShadow: `0 0 ${8 + value * 12}px rgba(6,182,212,${0.5 + value * 0.3})`,
                                filter: `blur(${value * 0.5}px)`,
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

