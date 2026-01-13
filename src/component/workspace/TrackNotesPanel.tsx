import React, { useState, useEffect, useCallback } from 'react';
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
    Clock
} from 'lucide-react';
import {
    getTrackNotes,
    createTrackNote,
    updateTrackNote,
    deleteTrackNote,
    checkCanNote
} from '../../services/sessionApi';
import type { TrackNote, RoomType, NotePermissionResponse } from '../../types/session';
import { toast } from 'react-hot-toast';

interface TrackNotesPanelProps {
    trackId: number;
    roomType: RoomType;
    className?: string;
    defaultExpanded?: boolean;
    /** Thời gian hiện tại của audio player (giây) */
    currentTime?: number;
    /** Callback để seek đến thời điểm cụ thể */
    onSeek?: (time: number) => void;
}

/**
 * Format seconds to mm:ss
 */
const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Shared TrackNotes panel for workspace pages (InternalStudio, ClientRoom)
 */
const TrackNotesPanel: React.FC<TrackNotesPanelProps> = ({
    trackId,
    roomType,
    className = '',
    defaultExpanded = false,
    currentTime = 0,
    onSeek
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [notes, setNotes] = useState<TrackNote[]>([]);
    const [loading, setLoading] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [permission, setPermission] = useState<NotePermissionResponse | null>(null);

    // Load permission
    const loadPermission = useCallback(async () => {
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

    // Load notes
    const loadNotes = useCallback(async () => {
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

    useEffect(() => {
        if (isExpanded) {
            loadNotes();
        }
    }, [isExpanded, loadNotes]);

    // Reset when track changes
    useEffect(() => {
        setNotes([]);
        setNewNote('');
        setEditingId(null);
        if (isExpanded) {
            loadNotes();
        }
    }, [trackId]);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        setSubmitting(true);
        try {
            const note = await createTrackNote(trackId, {
                content: newNote.trim(),
                roomType,
                timestamp: currentTime > 0 ? currentTime : undefined
            });
            // Prepend new note (newest first)
            setNotes(prev => [note, ...prev]);
            setNewNote('');
            toast.success(`Đã thêm ghi chú${currentTime > 0 ? ` tại ${formatTime(currentTime)}` : ''}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể thêm ghi chú');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateNote = async (noteId: number) => {
        if (!editContent.trim()) return;

        setSubmitting(true);
        try {
            const updated = await updateTrackNote(trackId, noteId, {
                content: editContent.trim()
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
        try {
            await deleteTrackNote(trackId, noteId);
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

    // Không hiển thị nếu chưa load permission
    if (!permission) return null;

    const borderColor = roomType === 'INTERNAL'
        ? 'border-yellow-600/40'
        : 'border-blue-600/40';

    const bgColor = roomType === 'INTERNAL'
        ? 'bg-yellow-900/20'
        : 'bg-blue-900/20';

    return (
        <div className={`mt-3 ${className}`}>
            {/* Toggle Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center justify-between px-3 py-2 ${bgColor} hover:bg-opacity-50 rounded-lg border ${borderColor} transition-all`}
            >
                <div className="flex items-center gap-2">
                    <StickyNote size={14} className={roomType === 'INTERNAL' ? 'text-yellow-400' : 'text-blue-400'} />
                    <span className="text-xs text-gray-300 font-medium">
                        Ghi chú {notes.length > 0 && `(${notes.length})`}
                    </span>
                </div>
                {isExpanded ? (
                    <ChevronUp size={14} className="text-gray-400" />
                ) : (
                    <ChevronDown size={14} className="text-gray-400" />
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
                        <div className={`mt-2 p-3 rounded-lg border ${borderColor} ${bgColor} space-y-2`}>
                            {/* Add Note Input - only if canNote */}
                            {permission.canNote && (
                                <div className="space-y-1">
                                    {currentTime > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-purple-400">
                                            <Clock size={10} />
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
                                            className="flex-1 px-3 py-1.5 bg-black/40 border border-gray-600/50 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                            disabled={submitting}
                                        />
                                        <button
                                            onClick={handleAddNote}
                                            disabled={!newNote.trim() || submitting}
                                            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
                                        >
                                            {submitting ? (
                                                <Loader2 size={14} className="text-white animate-spin" />
                                            ) : (
                                                <Plus size={14} className="text-white" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Loading */}
                            {loading && (
                                <div className="flex items-center justify-center py-3">
                                    <Loader2 size={18} className="text-purple-400 animate-spin" />
                                </div>
                            )}

                            {/* Notes List */}
                            {!loading && notes.length === 0 && (
                                <p className="text-center text-gray-500 text-xs py-3">
                                    Chưa có ghi chú
                                </p>
                            )}

                            <div className="max-h-40 overflow-y-auto space-y-2">
                                {notes.map((note) => (
                                    <motion.div
                                        key={note.id}
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="p-2 rounded-md bg-black/30 border border-gray-700/50"
                                    >
                                        {editingId === note.id ? (
                                            // Edit Mode
                                            <div className="space-y-2">
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className="w-full px-2 py-1 bg-black/50 border border-gray-600 rounded text-xs text-white resize-none focus:outline-none"
                                                    rows={2}
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="p-1 hover:bg-gray-700 rounded"
                                                    >
                                                        <X size={12} className="text-gray-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateNote(note.id)}
                                                        disabled={submitting}
                                                        className="p-1 hover:bg-green-700 rounded"
                                                    >
                                                        <Check size={12} className="text-green-400" />
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
                                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 mb-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-[10px] text-purple-300 font-mono transition-colors"
                                                        title="Nhấn để nhảy đến thời điểm này"
                                                    >
                                                        <Clock size={9} />
                                                        {formatTime(note.timestamp)}
                                                    </button>
                                                )}
                                                <p className="text-xs text-gray-200 whitespace-pre-wrap mb-1">
                                                    {note.content}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-gray-500">
                                                        {note.userName} • {new Date(note.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        {/* Host có thể edit/delete */}
                                                        {permission.isHost && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingId(note.id);
                                                                        setEditContent(note.content);
                                                                    }}
                                                                    className="p-0.5 hover:bg-gray-700 rounded opacity-60 hover:opacity-100"
                                                                >
                                                                    <Edit3 size={10} className="text-gray-400" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteNote(note.id)}
                                                                    className="p-0.5 hover:bg-red-700 rounded opacity-60 hover:opacity-100"
                                                                >
                                                                    <Trash2 size={10} className="text-red-400" />
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TrackNotesPanel;
