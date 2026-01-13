import React, { useMemo } from 'react';
import { User } from 'lucide-react';
import type { TrackNote } from '../../../../types/session';

interface WaveformMarkersProps {
    notes: TrackNote[];
    duration: number;
    onSeek?: (time: number) => void;
    onNoteClick?: (note: TrackNote) => void;
}

const WaveformMarkers: React.FC<WaveformMarkersProps> = ({
    notes,
    duration,
    onSeek,
    onNoteClick
}) => {
    // Filter notes with timestamp
    const notesWithTimestamp = useMemo(() => {
        return notes.filter(n => n.timestamp !== undefined && n.timestamp !== null && duration > 0);
    }, [notes, duration]);

    if (!notesWithTimestamp.length) return null;

    return (
        <div className="absolute inset-0 z-50 pointer-events-none">
            {notesWithTimestamp.map((note) => {
                const position = ((note.timestamp || 0) / duration) * 100;
                // Ensure position is within 0-100%
                const safePosition = Math.max(0, Math.min(100, position));

                // Calculate staggered height for text bubble to minimize overlap
                // Use index or id to distribute vertically (20% to 70% from top)
                const verticalPos = 20 + ((note.id % 5) * 12);

                return (
                    <div
                        key={note.id}
                        className="absolute top-0 bottom-0 transform -translate-x-1/2 pointer-events-auto cursor-pointer group flex flex-col items-center justify-end pb-2"
                        style={{ left: `${safePosition}%` }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onNoteClick) {
                                onNoteClick(note);
                            } else if (onSeek && note.timestamp !== undefined) {
                                onSeek(note.timestamp);
                            }
                        }}
                        title={`${note.userName}: ${note.content}`}
                    >
                        {/* Full height dotted line */}
                        <div className="absolute top-0 bottom-8 w-px border-l-2 border-dashed border-purple-500/30 group-hover:border-purple-400 group-hover:border-solid transition-all h-full" />

                        {/* Visible Text Bubble on Waveform */}
                        <div
                            className="absolute transform -translate-x-1/2 px-1.5 py-0.5 bg-black/30 backdrop-blur-[2px] rounded border border-purple-500/20 text-[9px] text-white whitespace-nowrap transition-all group-hover:scale-110 group-hover:bg-black/80 group-hover:z-50 hover:!z-50 max-w-[80px] overflow-hidden text-ellipsis flex items-center gap-1 shadow-sm"
                            style={{ top: `${verticalPos}%` }}
                        >
                            <span className="font-bold text-purple-300 opacity-90 truncate max-w-[40px]">{note.userName}:</span>
                            <span className="opacity-80 group-hover:opacity-100 truncate">{note.content}</span>
                        </div>

                        {/* Avatar marker at bottom */}
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-purple-400/70 shadow-[0_0_8px_rgba(168,85,247,0.4)] bg-gray-900 transition-transform group-hover:scale-125 group-hover:z-30 relative z-20 hover:ring-2 hover:ring-purple-300 mb-1">
                            {note.userAvatar ? (
                                <img
                                    src={note.userAvatar}
                                    alt={note.userName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                                    <User size={10} className="text-white" />
                                </div>
                            )}
                        </div>

                        {/* Connecting dot on the bubble line */}
                        <div
                            className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full"
                            style={{ top: `${verticalPos + 2.5}%`, left: '50%', transform: 'translate(-50%, -50%)' }}
                        />

                        {/* Tooltip on hover (Full content) */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden group-hover:block min-w-max max-w-xs px-3 py-2 bg-black/95 rounded-lg text-xs text-white border border-purple-500/30 z-50 shadow-2xl backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-purple-300">{note.userName}</span>
                                <span className="text-gray-400 text-[10px]">{note.timestamp ? new Date(note.timestamp * 1000).toISOString().substr(14, 5) : ''}</span>
                            </div>
                            <p className="text-gray-200 line-clamp-3 max-w-[200px] whitespace-normal">{note.content}</p>
                            {/* Triangle arrow */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/95 border-b border-r border-purple-500/30 transform rotate-45"></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default WaveformMarkers;
