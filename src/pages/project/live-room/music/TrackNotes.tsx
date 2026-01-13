import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    StickyNote,
    Plus,
    ChevronDown,
    ChevronUp,
    Trash2,
    Edit3,
    Check,
    X,
    Loader2,
    Clock,
    Wifi,
    WifiOff
} from 'lucide-react';
import {
    getTrackNotes,
    createTrackNote,
    updateTrackNote,
    deleteTrackNote,
    checkCanNote
} from '../../../../services/sessionApi';
import type { TrackNote, RoomType, NotePermissionResponse } from '../../../../types/session';
import { toast } from 'react-hot-toast';
import websocketService from '../../../../services/websocketService';

interface TrackNotesProps {
    trackId: number | null;
    roomType: RoomType;
    /** Session ID for real-time sync */
    sessionId?: string;
    /** Thời gian hiện tại của audio player (giây) */
    currentTime?: number;
    /** Callback để seek đến thời điểm cụ thể */
    onSeek?: (time: number) => void;
    /** Callback khi notes thay đổi - dùng để hiển thị markers trên waveform */
    onNotesChange?: (notes: TrackNote[]) => void;
}

/**
 * Format seconds to mm:ss
 */
const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const TrackNotes: React.FC<TrackNotesProps> = ({
    trackId,
    roomType,
    sessionId,
    currentTime = 0,
    onSeek,
    onNotesChange
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [notes, setNotes] = useState<TrackNote[]>([]);
    const [loading, setLoading] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [permission, setPermission] = useState<NotePermissionResponse | null>(null);
    const [isWsConnected, setIsWsConnected] = useState(false);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    // Load permission when track changes
    const loadPermission = useCallback(async () => {
        if (!trackId) return;
        try {
            const perm = await checkCanNote(trackId);
            setPermission(perm);
        } catch (error) {
            console.error('Error loading permission:', error);
            setPermission({ canNote: false, isHost: false, isClient: false });
        }
    }, [trackId]);

    useEffect(() => {
        loadPermission();
    }, [loadPermission]);

    // Load notes when track changes or expand
    // Load notes when track changes or expand
    const loadNotes = useCallback(async () => {
        if (!trackId) return;

        setLoading(true);
        try {
            const data = await getTrackNotes(trackId, roomType);
            // Sort by createdAt descending (newest first)
            const sorted = [...data].sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setNotes(sorted);
        } catch (error) {
            console.error('Error loading notes:', error);
        } finally {
            setLoading(false);
        }
    }, [trackId, roomType]);

    // Always load notes when track changes (for waveform markers)
    useEffect(() => {
        if (trackId) {
            loadNotes();
        }
    }, [trackId, loadNotes]);

    // Reset when track changes
    useEffect(() => {
        setNotes([]);
        setNewNote('');
        setEditingId(null);
    }, [trackId]);

    // Notify parent when notes change (for waveform markers)
    useEffect(() => {
        if (onNotesChange) {
            onNotesChange(notes);
        }
    }, [notes, onNotesChange]);

    // Subscribe to WebSocket for real-time updates
    useEffect(() => {
        if (!sessionId) {
            setIsWsConnected(false);
            return;
        }

        console.log('📝 Setting up notes WebSocket subscription for session:', sessionId);

        const unsubscribe = websocketService.subscribeToNotes(sessionId, (event: any) => {
            console.log('📝 Received note event:', event);

            const payload = event.payload || event;
            const action = payload.action || event.eventType?.replace('TRACK_NOTE_', '');
            const noteData = payload.note;
            const noteId = payload.noteId;
            const eventTrackId = payload.trackId;

            // Only process events for current track
            if (trackId && eventTrackId !== trackId) {
                console.log('📝 Ignoring event for different track');
                return;
            }

            switch (action) {
                case 'CREATE':
                    if (noteData) {
                        setNotes(prev => {
                            // Avoid duplicate notes
                            if (prev.some(n => n.id === noteData.id)) {
                                return prev;
                            }
                            return [noteData, ...prev];
                        });
                        console.log('📝 Added new note via WebSocket:', noteData.id);
                    }
                    break;
                case 'UPDATE':
                    if (noteData) {
                        setNotes(prev => prev.map(n => n.id === noteData.id ? noteData : n));
                        console.log('📝 Updated note via WebSocket:', noteData.id);
                    }
                    break;
                case 'DELETE':
                    if (noteId) {
                        setNotes(prev => prev.filter(n => n.id !== noteId));
                        console.log('📝 Deleted note via WebSocket:', noteId);
                    }
                    break;
            }
        });

        setIsWsConnected(true);
        unsubscribeRef.current = unsubscribe;

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
            setIsWsConnected(false);
        };
    }, [sessionId, trackId]);

    const handleAddNote = async () => {
        if (!trackId || !newNote.trim()) return;

        setSubmitting(true);
        try {
            const note = await createTrackNote(trackId, {
                content: newNote.trim(),
                roomType,
                timestamp: currentTime > 0 ? currentTime : undefined,
                sessionId // Include sessionId for WebSocket broadcast
            });
            // Only add if not already added by WebSocket
            setNotes(prev => {
                if (prev.some(n => n.id === note.id)) {
                    return prev;
                }
                return [note, ...prev];
            });
            setNewNote('');
            toast.success(`Đã thêm ghi chú${currentTime > 0 ? ` tại ${formatTime(currentTime)}` : ''}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể thêm ghi chú');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateNote = async (noteId: number) => {
        if (!trackId || !editContent.trim()) return;

        setSubmitting(true);
        try {
            const updated = await updateTrackNote(trackId, noteId, {
                content: editContent.trim(),
                sessionId // Include sessionId for WebSocket broadcast
            });
            setNotes(prev => prev.map(n => n.id === noteId ? updated : n));
            setEditingId(null);
            toast.success('Đã cập nhật ghi chú');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể cập nhật');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        if (!trackId) return;

        try {
            await deleteTrackNote(trackId, noteId, sessionId);
            setNotes(prev => prev.filter(n => n.id !== noteId));
            toast.success('Đã xóa ghi chú');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể xóa');
        }
    };

    const handleTimestampClick = (timestamp: number) => {
        if (onSeek) {
            onSeek(timestamp);
        }
    };

    // Không có trackId hoặc không có quyền xem
    if (!trackId || !permission) return null;

    return (
        <div className="mt-3">
            {/* Toggle Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 bg-black/30 hover:bg-black/40 rounded-lg border border-purple-700/30 transition-all"
            >
                <div className="flex items-center gap-2">
                    <StickyNote size={16} className="text-yellow-400" />
                    <span className="text-sm text-gray-200">
                        Ghi chú ({notes.length})
                    </span>
                    {/* WebSocket status indicator */}
                    {sessionId && (
                        isWsConnected ? (
                            <span title="Real-time connected">
                                <Wifi size={12} className="text-green-400" />
                            </span>
                        ) : (
                            <span title="Real-time disconnected">
                                <WifiOff size={12} className="text-gray-500" />
                            </span>
                        )
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp size={16} className="text-gray-400" />
                ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                )}
            </button>

            {/* Expandable Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-1">
                            {/* Add Note Input - only if canNote */}
                            {permission.canNote && (
                                <>
                                    {currentTime > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-purple-400 px-1">
                                            <Clock size={12} />
                                            <span>Ghi chú tại {formatTime(currentTime)}</span>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                            placeholder={currentTime > 0 ? `Thêm ghi chú tại ${formatTime(currentTime)}...` : "Thêm ghi chú..."}
                                            className="flex-1 px-3 py-2 bg-black/40 border border-purple-700/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                            disabled={submitting}
                                        />
                                        <button
                                            onClick={handleAddNote}
                                            disabled={!newNote.trim() || submitting}
                                            className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
                                        >
                                            {submitting ? (
                                                <Loader2 size={16} className="text-white animate-spin" />
                                            ) : (
                                                <Plus size={16} className="text-white" />
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Loading */}
                            {loading && (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 size={20} className="text-purple-400 animate-spin" />
                                </div>
                            )}

                            {/* Notes List */}
                            {!loading && notes.length === 0 && (
                                <p className="text-center text-gray-500 text-sm py-4">
                                    Chưa có ghi chú nào
                                </p>
                            )}

                            {notes.map((note) => (
                                <motion.div
                                    key={note.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`p-3 rounded-lg border ${roomType === 'INTERNAL'
                                        ? 'bg-yellow-900/20 border-yellow-600/30'
                                        : 'bg-blue-900/20 border-blue-600/30'
                                        }`}
                                >
                                    {editingId === note.id ? (
                                        // Edit Mode
                                        <div className="space-y-2">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full px-2 py-1 bg-black/40 border border-purple-700/30 rounded text-sm text-white resize-none focus:outline-none"
                                                rows={2}
                                                autoFocus
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="p-1 hover:bg-gray-700 rounded"
                                                >
                                                    <X size={14} className="text-gray-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateNote(note.id)}
                                                    disabled={submitting}
                                                    className="p-1 hover:bg-green-700 rounded"
                                                >
                                                    <Check size={14} className="text-green-400" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <>
                                            {/* Timestamp badge - clickable */}
                                            {note.timestamp !== undefined && note.timestamp !== null && (
                                                <button
                                                    onClick={() => handleTimestampClick(note.timestamp!)}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 mb-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-xs text-purple-300 font-mono transition-colors"
                                                    title="Nhấn để nhảy đến thời điểm này"
                                                >
                                                    <Clock size={10} />
                                                    {formatTime(note.timestamp)}
                                                </button>
                                            )}
                                            <p className="text-sm text-gray-200 whitespace-pre-wrap">
                                                {note.content}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-gray-500">
                                                    {note.userName} • {new Date(note.createdAt).toLocaleString('vi-VN')}
                                                </span>
                                                <div className="flex gap-1">
                                                    {/* Host có thể edit/delete tất cả */}
                                                    {permission.isHost && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingId(note.id);
                                                                    setEditContent(note.content);
                                                                }}
                                                                className="p-1 hover:bg-gray-700 rounded opacity-60 hover:opacity-100"
                                                            >
                                                                <Edit3 size={12} className="text-gray-400" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteNote(note.id)}
                                                                className="p-1 hover:bg-red-700 rounded opacity-60 hover:opacity-100"
                                                            >
                                                                <Trash2 size={12} className="text-red-400" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TrackNotes;
