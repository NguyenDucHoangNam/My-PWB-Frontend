import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Sparkles, Music, Gauge, RotateCcw, ChevronDown, ChevronUp, Satellite } from 'lucide-react';
import type { TrackDetailResponse } from '../../../services/trackService';
import { formatDuration } from '../../../utils/internalStudio.helpers';

interface MiniPlayerProps {
    playingTrack: TrackDetailResponse | null;
    isPlaying: boolean;
    isMuted: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    playbackSpeed: number;
    isLooping: boolean;
    onTogglePlayPause: () => void;
    onToggleMute: () => void;
    onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onVolumeChange: (volume: number) => void;
    onPlaybackSpeedChange: (speed: number) => void;
    onToggleLoop: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
    playingTrack,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    volume,
    playbackSpeed,
    isLooping,
    onTogglePlayPause,
    onToggleMute: _onToggleMute,
    onSeek,
    onVolumeChange,
    onPlaybackSpeedChange,
    onToggleLoop,
}) => {
    const [showExpanded, setShowExpanded] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const volumeButtonRef = useRef<HTMLButtonElement>(null);
    const speedButtonRef = useRef<HTMLButtonElement>(null);
    const speedMenuRef = useRef<HTMLDivElement>(null);

    const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (volumeButtonRef.current && !volumeButtonRef.current.contains(event.target as Node)) {
                setShowVolumeSlider(false);
            }
            if (speedButtonRef.current && !speedButtonRef.current.contains(event.target as Node) &&
                speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
                setShowSpeedMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!playingTrack) return null;

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(e.target.value);
        onVolumeChange(newVolume);
    };

    // const _handleVolumeButtonClick = () => {
    //     if (isMuted || volume === 0) {
    //         onToggleMute();
    //         onVolumeChange(0.5);
    //     } else {
    //         setShowVolumeSlider(!showVolumeSlider);
    //     }
    // };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999]">
            {/* Main Player Bar */}
            <div className="bg-gradient-to-t from-black/95 via-black/90 to-black/85 backdrop-blur-2xl border-t border-purple-800/50 shadow-2xl shadow-purple-900/30">
                <div className="w-full px-4 py-3">
                    <div className="flex items-center gap-4">
                        {/* Volume Control - Bên trái nhất */}
                        <div className="relative flex-shrink-0">
                            {showVolumeSlider && (
                                <div className="absolute bottom-full mb-2 left-0 bg-black/90 backdrop-blur-xl border border-purple-800/50 rounded-lg p-3 shadow-xl">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-24 h-1.5 bg-gray-700/50 rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${
                                                (isMuted ? 0 : volume) * 100
                                            }%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`,
                                        }}
                                    />
                                    <div className="text-xs text-center text-gray-400 mt-1">
                                        {Math.round((isMuted ? 0 : volume) * 100)}%
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Track Info */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 animate-pulse" />
                                <Music size={22} className="text-white relative z-10 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-white font-bold text-sm truncate max-w-[200px] drop-shadow-[0_0_4px_rgba(168,85,247,0.5)]">
                                    {playingTrack.name}
                                </h4>
                                <p className="text-gray-400 text-xs">
                                    {formatDuration(currentTime)} / {formatDuration(duration)}
                                </p>
                            </div>
                        </div>

                        {/* Main Controls - Bên phải */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Play/Pause */}
                            <button
                                onClick={onTogglePlayPause}
                                className="w-12 h-12 mx-3 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 flex items-center justify-center text-white transition-all shadow-lg shadow-purple-500/40 hover:scale-110 active:scale-95"
                            >
                                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                            </button>

                            {/* Playback Speed */}
                            <div className="relative">
                                <button
                                    ref={speedButtonRef}
                                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all ${
                                        playbackSpeed !== 1
                                            ? 'bg-purple-600/60 hover:bg-purple-500/60 text-purple-200'
                                            : 'bg-gray-800/60 hover:bg-gray-700/60'
                                    }`}
                                    title={`Tốc độ: ${playbackSpeed}x`}
                                >
                                    <Gauge size={18} />
                                </button>
                                {showSpeedMenu && (
                                    <div
                                        ref={speedMenuRef}
                                        className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-xl border border-purple-800/50 rounded-lg p-2 shadow-xl min-w-[120px]"
                                    >
                                        {playbackSpeeds.map((speed) => (
                                            <button
                                                key={speed}
                                                onClick={() => {
                                                    onPlaybackSpeedChange(speed);
                                                    setShowSpeedMenu(false);
                                                }}
                                                className={`w-full px-4 py-2 text-sm rounded-md transition-all text-left ${
                                                    playbackSpeed === speed
                                                        ? 'bg-purple-600/60 text-purple-200 font-semibold'
                                                        : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                                                }`}
                                            >
                                                {speed}x {speed === 1 && '(Bình thường)'}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Loop */}
                            <button
                                onClick={onToggleLoop}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                    isLooping
                                        ? 'bg-purple-600/60 hover:bg-purple-500/60 text-purple-200'
                                        : 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white'
                                }`}
                                title={isLooping ? 'Tắt lặp lại' : 'Bật lặp lại'}
                            >
                                <RotateCcw size={18} className={isLooping ? 'animate-spin-slow' : ''} />
                            </button>

                            {/* Expand/Collapse */}
                            <button
                                onClick={() => setShowExpanded(!showExpanded)}
                                className="w-10 h-10 rounded-full bg-gray-800/60 hover:bg-gray-700/60 flex items-center justify-center text-gray-300 hover:text-white transition-all"
                            >
                                {showExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                            </button>
                        </div>

                         {/* Progress Bar - Giữa */}
                         <div className="flex-1 min-w-0 mx-4">
                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={onSeek}
                                className="w-full h-1.5 bg-gray-700/50 rounded-full appearance-none cursor-pointer hover:h-2 transition-all"
                                style={{
                                    background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${
                                        duration ? (currentTime / duration) * 100 : 0
                                    }%, #374151 ${duration ? (currentTime / duration) * 100 : 0}%, #374151 100%)`,
                                }}
                            />
                        </div>

                    </div>
                </div>
            </div>

            {/* Expanded Controls Panel */}
            {showExpanded && (
                <div className="bg-black/80 backdrop-blur-xl border-t border-purple-800/30">
                    <div className="w-full px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Volume Control Expanded */}
                            <div className="flex items-center gap-3">
                                {isMuted || volume === 0 ? (
                                    <Satellite size={18} className="text-gray-400 flex-shrink-0" />
                                ) : (
                                    <Sparkles size={18} className="text-purple-300 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-full h-2 bg-gray-700/50 rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${
                                                (isMuted ? 0 : volume) * 100
                                            }%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`,
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-gray-400 w-10 text-right">
                                    {Math.round((isMuted ? 0 : volume) * 100)}%
                                </span>
                            </div>

                            {/* Playback Speed Expanded */}
                            <div className="flex items-center gap-3">
                                <Gauge size={18} className="text-gray-400 flex-shrink-0" />
                                <div className="flex-1 flex gap-1">
                                    {playbackSpeeds.map((speed) => (
                                        <button
                                            key={speed}
                                            onClick={() => onPlaybackSpeedChange(speed)}
                                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                                playbackSpeed === speed
                                                    ? 'bg-purple-600 text-purple-200 shadow-lg shadow-purple-500/30'
                                                    : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60 hover:text-gray-300'
                                            }`}
                                        >
                                            {speed}x
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Track Info Expanded */}
                            <div className="flex items-center gap-3 text-sm">
                                <div className="text-gray-400">Tốc độ hiện tại:</div>
                                <div className="text-purple-300 font-semibold">{playbackSpeed}x</div>
                                {isLooping && (
                                    <>
                                        <div className="text-gray-400">•</div>
                                        <div className="text-pink-300 font-semibold flex items-center gap-1">
                                            <RotateCcw size={14} />
                                            Lặp lại
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

