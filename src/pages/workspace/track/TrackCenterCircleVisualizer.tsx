import { memo, useEffect, useRef, useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import type { TrackDetailResponse } from '../../../services/trackService';

interface TrackCenterCircleVisualizerProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    isPlaying: boolean;
    playingTrack: TrackDetailResponse | null;
    audioElementVersion: number;
}

interface StarData {
    x: number;
    y: number;
    size: number;
    radius: number;
    angle: number;
    delay: number;
}

export const TrackCenterCircleVisualizer = memo(function TrackCenterCircleVisualizer({
    audioRef,
    isPlaying,
    playingTrack,
    audioElementVersion,
}: TrackCenterCircleVisualizerProps) {
    const animationFrameRef = useRef<number | undefined>(undefined);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const barsRef = useRef<(HTMLDivElement | null)[]>([]);
    const lastUpdateTimeRef = useRef<number>(0);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const bufferLengthRef = useRef<number>(0);
    
    // Constants - must be declared before useMemo
    const BAR_COUNT = 120;
    const STAR_COUNT = 30;
    const TARGET_FPS = 30; // Throttle to 30fps
    const FRAME_INTERVAL = 1000 / TARGET_FPS; // ~33ms
    
    // Pre-compute bar angles (static, calculated once)
    const barAngles = useMemo(() => {
        return Array.from({ length: BAR_COUNT }, (_, i) => (i / BAR_COUNT) * 360);
    }, []);

    // Pre-generate star positions and properties once
    const stars = useMemo<StarData[]>(() => {
        return Array.from({ length: STAR_COUNT }, (_, index) => {
            const angle = (index / STAR_COUNT) * 360;
            const radius = 140 + Math.random() * 20;
            const radians = (angle * Math.PI) / 180;
            return {
                x: Math.sin(radians) * radius,
                y: -Math.cos(radians) * radius,
                size: 2 + Math.random() * 2,
                radius: radius,
                angle: angle,
                delay: Math.random() * 2, // For CSS animation delay
            };
        });
    }, []); // Only generate once

    // Cleanup function for AudioContext - must be declared before useEffect
    const cleanupAudioContext = () => {
        if (sourceRef.current) {
            try {
                sourceRef.current.disconnect();
            } catch (e) {
                // Ignore disconnect errors
            }
            sourceRef.current = null;
        }
        if (analyserRef.current) {
            try {
                analyserRef.current.disconnect();
            } catch (e) {
                // Ignore disconnect errors
            }
            analyserRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
        }
    };

    // Setup Web Audio API when audio element version changes
    useEffect(() => {
        // Mỗi lần audioElementVersion thay đổi: cleanup trước
        cleanupAudioContext();

        const audio = audioRef.current;
        if (!audio) return;

        // Create AudioContext
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.3;

        // Create source from audio element
        try {
            const source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            sourceRef.current = source;
        } catch (error) {
            console.error('Error creating media element source:', error);
            cleanupAudioContext();
        }
    }, [audioElementVersion]); // Không cần audioRef trong deps

    // Update bars animation and visibility
    useEffect(() => {
        if (!isPlaying || !playingTrack || !analyserRef.current) {
            // Fade out when not playing - update DOM directly
            barsRef.current.forEach((bar) => {
                if (bar) {
                    bar.style.height = '10px';
                    bar.style.opacity = '0.1';
                }
            });
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
            audioContextRef.current.resume().catch(() => {});
        }

        // Update bars with FPS throttling
        const updateBars = (time: number) => {
            if (!analyserRef.current) return;

            // Throttle to target FPS
            if (time - lastUpdateTimeRef.current < FRAME_INTERVAL) {
                animationFrameRef.current = requestAnimationFrame(updateBars);
                return;
            }
            lastUpdateTimeRef.current = time;

            const bufferLength = analyserRef.current.frequencyBinCount;
            
            // Reuse Uint8Array if possible (only recreate if buffer length changed)
            if (!dataArrayRef.current || bufferLengthRef.current !== bufferLength) {
                dataArrayRef.current = new Uint8Array(bufferLength);
                bufferLengthRef.current = bufferLength;
            }

            const dataArray = dataArrayRef.current;
            if (!dataArray) {
                animationFrameRef.current = requestAnimationFrame(updateBars);
                return;
            }

            // Bây giờ TS biết chắc dataArray là Uint8Array
            // Type assertion needed due to TypeScript strict typing with ArrayBufferLike
            analyserRef.current.getByteFrequencyData(dataArray as Uint8Array<ArrayBuffer>);

            // Downsample to BAR_COUNT bars với boost cho bass frequencies
            const step = Math.floor(dataArray.length / BAR_COUNT);

            for (let i = 0; i < BAR_COUNT; i++) {
                let sum = 0;
                for (let j = 0; j < step; j++) {
                    const idx = i * step + j;
                    if (idx < dataArray.length) {
                        // Boost bass frequencies (lower indices)
                        const bassBoost = idx < dataArray.length * 0.2 ? 1.8 : 1.0;
                        sum += (dataArray[idx] || 0) * bassBoost;
                    }
                }
                const avg = sum / step;
                const normalized = Math.max(0.1, Math.min(1, (avg / 255) * 4));

                // Update DOM directly - no React re-render
                // Chỉ update những thuộc tính thay đổi theo nhạc, không set lại left/top
                const bar = barsRef.current[i];
                if (bar) {
                    const barLength = 25 + normalized * 95;
                    const angle = barAngles[i]; // Pre-computed angle

                    bar.style.height = `${barLength}px`;
                    bar.style.width = `${3 + normalized * 2}px`;
                    bar.style.opacity = `${0.7 + normalized * 0.3}`;
                    bar.style.transform = `
                        translate(-50%, -100%)
                        rotate(${angle}deg)
                        scaleY(${0.8 + normalized * 0.7})
                    `;
                    bar.style.filter = `blur(${normalized * 0.5}px)`;
                    bar.style.boxShadow = `0 0 ${8 + normalized * 12}px rgba(168,85,247,${0.5 + normalized * 0.3})`;
                }
            }

            animationFrameRef.current = requestAnimationFrame(updateBars);
        };

        animationFrameRef.current = requestAnimationFrame(updateBars);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = undefined;
            }
        };
    }, [isPlaying, playingTrack]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupAudioContext();
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Don't render if no track
    if (!playingTrack) return null;

    // Calculate gradient colors for bars (static, calculated once)
    const getBarGradientClass = (index: number) => {
        const colorIndex = index / BAR_COUNT;
        if (colorIndex < 0.33) {
            return 'from-purple-500 via-pink-500 to-pink-400';
        } else if (colorIndex < 0.66) {
            return 'from-pink-500 via-purple-400 to-cyan-400';
        } else {
            return 'from-cyan-400 via-purple-500 to-purple-600';
        }
    };

    return (
        <>
            {/* CSS for planet rotation animation */}
            <style>{`
                @keyframes spin-planet {
                    from { transform: perspective(1000px) rotateX(15deg) rotateY(0deg); }
                    to { transform: perspective(1000px) rotateX(15deg) rotateY(360deg); }
                }
                .planet-rotate {
                    animation: spin-planet 40s linear infinite;
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }
                .star-twinkle {
                    animation: twinkle 2s ease-in-out infinite;
                }
            `}</style>
            <div 
                ref={containerRef}
                className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none"
                style={{
                    opacity: isVisible ? 0.3 : 0,
                    transition: 'opacity 0.3s ease-in-out',
                }}
            >
                <div
                    className="
                        relative
                        flex items-center justify-center
                        rounded-full
                        w-[280px] h-[280px]
                        planet-rotate
                    "
                >
                    {/* Vòng ngoài - vành đai hành tinh (outer ring) */}
                    <div className="absolute inset-0 rounded-full border-2 border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.5)]" />
                    
                    {/* Halo phát sáng vũ trụ - gradient purple/pink */}
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-900/60 via-pink-800/40 to-indigo-900/50 blur-3xl" />
                    <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-purple-500/25 via-pink-400/20 to-purple-500/20 blur-2xl" />

                    {/* Hành tinh ở tâm - với texture và gradient purple/pink */}
                    <div 
                        className="absolute inset-8 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-700 shadow-inner"
                        style={{
                            background: `
                                radial-gradient(circle at 30% 30%, rgba(168,85,247,0.9) 0%, transparent 50%),
                                radial-gradient(circle at 70% 70%, rgba(236,72,153,0.7) 0%, transparent 50%),
                                linear-gradient(135deg, rgb(168,85,247) 0%, rgb(236,72,153) 50%, rgb(99,102,241) 100%)
                            `,
                            boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5), 0 0 40px rgba(168,85,247,0.5)',
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
                            <Sparkles className="text-purple-300 mb-1 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" size={24} />
                            <div className="absolute inset-0 animate-pulse">
                                <Sparkles className="text-pink-400 opacity-50" size={24} />
                            </div>
                        </div>
                        <div className="text-xs text-purple-200 font-semibold truncate max-w-[180px] drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]">
                            {playingTrack.name}
                        </div>
                    </div>

                    {/* Các hạt sao nhấp nháy xung quanh - pre-generated positions */}
                    {stars.map((star, index) => (
                        <div
                            key={`star-${index}`}
                            className="absolute rounded-full bg-purple-300 star-twinkle"
                            style={{
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                left: `calc(50% + ${star.x}px)`,
                                top: `calc(50% + ${star.y}px)`,
                                transform: 'translate(-50%, -50%)',
                                opacity: 0.8,
                                boxShadow: `0 0 ${4 + star.size}px rgba(168,85,247,0.8)`,
                                animationDelay: `${star.delay}s`,
                            }}
                        />
                    ))}

                    {/* Vành đai hành tinh / Sóng năng lượng vũ trụ - đầy đủ 360° */}
                    {/* Render bars once, update via DOM refs */}
                    {Array.from({ length: BAR_COUNT }).map((_, index) => {
                        const angle = (index / BAR_COUNT) * 360;
                        const baseRadius = 130;
                        const radians = (angle * Math.PI) / 180;
                        const x = Math.sin(radians) * baseRadius;
                        const y = -Math.cos(radians) * baseRadius;
                        
                        return (
                            <div
                                key={index}
                                ref={(el) => {
                                    barsRef.current[index] = el;
                                }}
                                className={`absolute rounded-full
                                           bg-gradient-to-t ${getBarGradientClass(index)}
                                           transition-none`}
                                style={{
                                    width: '3px',
                                    height: '10px',
                                    left: `calc(50% + ${x}px)`,
                                    top: `calc(50% + ${y}px)`,
                                    transform: `
                                        translate(-50%, -100%)
                                        rotate(${angle}deg)
                                        scaleY(0.8)
                                    `,
                                    opacity: 0.1,
                                    transformOrigin: 'center bottom',
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </>
    );
});
