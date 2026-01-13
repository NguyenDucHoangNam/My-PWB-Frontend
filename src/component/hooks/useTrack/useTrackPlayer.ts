import { useState, useRef } from 'react';
import { type AudioPlayerHandle } from '../../../pages/workspace/track/AudioPlayer';

/**
 * Hook để quản lý player state và controls
 */
export const useTrackPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const audioPlayerRef = useRef<AudioPlayerHandle | null>(null);

    // Player controls
    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleMuteToggle = () => {
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
    };

    const handleTimeUpdate = (time: number, dur: number) => {
        setCurrentTime(time);
        setDuration(dur);
    };

    const handleEnded = () => {
        setIsPlaying(false);
    };

    const handleSeek = (time: number) => {
        audioPlayerRef.current?.seek(time);
        setCurrentTime(time);
    };

    return {
        isPlaying,
        setIsPlaying,
        isMuted,
        currentTime,
        duration,
        volume,
        audioPlayerRef,
        handlePlayPause,
        handleMuteToggle,
        handleVolumeChange,
        handleTimeUpdate,
        handleEnded,
        handleSeek,
    };
};

