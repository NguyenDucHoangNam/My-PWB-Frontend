import { useState, useCallback, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import { type TrackDetailResponse } from '../../../services/trackService';
import { useCosmicToast } from '../../toast/CosmicToastProvider';

/**
 * Hook để quản lý audio player
 */
export const useInternalStudioPlayer = () => {
    const { showToast } = useCosmicToast();
    const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(1); // 0-1
    const [playbackSpeed, setPlaybackSpeedState] = useState(1); // 0.5, 1, 1.5, 2
    const [isLooping, setIsLooping] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    // Cleanup HLS on unmount
    useEffect(() => {
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, []);

    const playTrack = useCallback(
        async (track: TrackDetailResponse) => {
            if (track.processingStatus !== 'READY' || !track.hlsPlaybackUrl) {
                showToast({
                    type: 'info',
                    message: 'Track chưa sẵn sàng để phát',
                });
                return;
            }

            // Stop current track if playing
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }

            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }

            // If clicking same track, toggle play/pause
            if (playingTrackId === track.id && isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
                return;
            }

            setPlayingTrackId(track.id);

            // Setup HLS player
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
                hls.loadSource(track.hlsPlaybackUrl);
                hls.attachMedia(audio);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    audio.play();
                    setIsPlaying(true);
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
                                showToast({
                                    type: 'error',
                                    message: 'Không thể phát track',
                                });
                                hls.destroy();
                                break;
                        }
                    }
                    // Bỏ qua non-fatal errors (buffer warnings)
                });

                hlsRef.current = hls;
            } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
                // Safari native HLS support
                audio.src = track.hlsPlaybackUrl;
                audio.play();
                setIsPlaying(true);
            } else {
                showToast({
                    type: 'error',
                    message: 'Trình duyệt không hỗ trợ phát HLS',
                });
            }
        },
        [playingTrackId, isPlaying, showToast]
    );

    const togglePlayPause = useCallback(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const toggleMute = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    const handleTimeUpdate = useCallback(() => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration);
        }
    }, []);

    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Number(e.target.value);
            setCurrentTime(audioRef.current.currentTime);
        }
    }, []);

    const handleEnded = useCallback(() => {
        if (!isLooping) {
            setIsPlaying(false);
        }
    }, [isLooping]);

    // Volume control
    const setVolume = useCallback((newVolume: number) => {
        if (audioRef.current) {
            const clampedVolume = Math.max(0, Math.min(1, newVolume));
            audioRef.current.volume = clampedVolume;
            setVolumeState(clampedVolume);
            // Auto unmute when volume > 0
            if (clampedVolume > 0 && isMuted) {
                audioRef.current.muted = false;
                setIsMuted(false);
            }
        }
    }, [isMuted]);

    // Playback speed control
    const setPlaybackSpeed = useCallback((speed: number) => {
        if (audioRef.current) {
            const validSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
            const clampedSpeed = validSpeeds.includes(speed) ? speed : 1;
            audioRef.current.playbackRate = clampedSpeed;
            setPlaybackSpeedState(clampedSpeed);
        }
    }, []);

    // Toggle loop
    const toggleLoop = useCallback(() => {
        if (audioRef.current) {
            const newLoopState = !isLooping;
            audioRef.current.loop = newLoopState;
            setIsLooping(newLoopState);
        }
    }, [isLooping]);

    // Sync volume and playback speed when audio element changes
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = volume;
            audio.playbackRate = playbackSpeed;
            audio.loop = isLooping;
        }
    }, [volume, playbackSpeed, isLooping]);

    return {
        playingTrackId,
        isPlaying,
        isMuted,
        currentTime,
        duration,
        volume,
        playbackSpeed,
        isLooping,
        audioRef,
        playTrack,
        togglePlayPause,
        toggleMute,
        handleTimeUpdate,
        handleSeek,
        handleEnded,
        setVolume,
        setPlaybackSpeed,
        toggleLoop,
    };
};

