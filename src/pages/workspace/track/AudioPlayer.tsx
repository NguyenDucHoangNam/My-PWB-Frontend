import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import Hls from 'hls.js';

export interface AudioPlayerHandle {
    seek: (time: number) => void;
    play: () => void;
    pause: () => void;
    getAudioElement: () => HTMLAudioElement | null;
}

interface AudioPlayerProps {
    hlsUrl: string | null;
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    currentTime: number;
    duration: number;
    onPlayPause: () => void;
    onMuteToggle: () => void;
    onVolumeChange: (volume: number) => void;
    onTimeUpdate: (time: number, duration: number) => void;
    onEnded: () => void;
    onAudioElementReady?: (audioElement: HTMLAudioElement | null) => void;
}

const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(
    (
        {
            hlsUrl,
            isPlaying,
            isMuted,
            volume,
            currentTime,
            duration,
            onPlayPause,
            onMuteToggle,
            onVolumeChange,
            onTimeUpdate,
            onEnded,
            onAudioElementReady,
        },
        ref
    ) => {
        const audioRef = useRef<HTMLAudioElement>(null);
        const hlsRef = useRef<Hls | null>(null);
        
        // Notify parent when audio element is ready
        useEffect(() => {
            if (audioRef.current && onAudioElementReady) {
                onAudioElementReady(audioRef.current);
            }
            // Also check after a short delay to catch late initialization
            const timeoutId = setTimeout(() => {
                if (audioRef.current && onAudioElementReady) {
                    onAudioElementReady(audioRef.current);
                }
            }, 100);
            return () => clearTimeout(timeoutId);
        }, [onAudioElementReady, hlsUrl]); // Re-run when hlsUrl changes

        // Expose methods via ref
        useImperativeHandle(ref, () => ({
            seek: (time: number) => {
                if (audioRef.current) {
                    audioRef.current.currentTime = time;
                }
            },
            play: () => {
                audioRef.current?.play();
            },
            pause: () => {
                audioRef.current?.pause();
            },
            getAudioElement: () => audioRef.current,
        }));

    // Setup HLS player
    useEffect(() => {
        if (!hlsUrl) return;

        const audio = audioRef.current;
        if (!audio) return;

        if (Hls.isSupported()) {
            const hls = new Hls({
                // Tăng buffer để tránh stalling
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                maxBufferSize: 60 * 1000 * 1000,
                maxBufferHole: 0.5,
                // Enable backoff để retry khi có lỗi
                enableWorker: true,
                lowLatencyMode: false,
            });
            hls.loadSource(hlsUrl);
            hls.attachMedia(audio);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('HLS manifest parsed and ready');
            });

            hls.on(Hls.Events.ERROR, (_event, data) => {
                // Chỉ log fatal errors, bỏ qua non-fatal warnings
                if (data.fatal) {
                    console.error('HLS fatal error:', data);
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('Network error, trying to recover...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('Media error, trying to recover...');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error('Fatal error, cannot recover');
                            hls.destroy();
                            break;
                    }
                }
                // Bỏ qua non-fatal errors (buffer warnings)
            });

            hlsRef.current = hls;

            return () => {
                hls.destroy();
            };
        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            audio.src = hlsUrl;
        }
    }, [hlsUrl]);

    // Sync playing state with audio element
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.error('Playback error:', error);
                });
            }
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    // Sync volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Sync mute
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuted;
        }
    }, [isMuted]);

        const handleTimeUpdate = () => {
            if (audioRef.current) {
                onTimeUpdate(audioRef.current.currentTime, audioRef.current.duration);
            }
        };

        const formatTime = (seconds: number): string => {
            if (!seconds || isNaN(seconds)) return '0:00';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        return (
        <>
            <div className="flex items-center gap-4 bg-black/40 rounded-xl p-4 border border-purple-800/30">
                {/* Play/Pause button */}
                <button
                    onClick={onPlayPause}
                    disabled={!hlsUrl}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                        hlsUrl
                            ? 'bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white cursor-pointer shadow-purple-500/50'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>

                {/* Time display */}
                <div className="flex items-center gap-3 text-sm font-mono">
                    <span className="text-purple-400 font-semibold min-w-[3rem]">
                        {formatTime(currentTime)}
                    </span>
                    <span className="text-gray-600">/</span>
                    <span className="text-gray-400 min-w-[3rem]">{formatTime(duration)}</span>
                </div>

                <div className="flex-1" />

                {/* Volume controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMuteToggle}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => onVolumeChange(Number(e.target.value))}
                        className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        style={{
                            background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${
                                volume * 100
                            }%, rgb(55, 65, 81) ${volume * 100}%, rgb(55, 65, 81) 100%)`,
                        }}
                    />
                </div>
            </div>

            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={onEnded}
                className="hidden"
            />
        </>
    );
}
);

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;

