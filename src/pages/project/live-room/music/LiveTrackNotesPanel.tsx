import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    StickyNote,
    Plus,
    Trash2,
    Edit3,
    Loader2,
    Clock,
    Wifi,
    WifiOff
} from 'lucide-react';
import type { TrackNote, RoomType, NotePermissionResponse } from '../../../../types/session';

interface LiveTrackNotesPanelProps {
    trackId: number | null;
    roomType: RoomType;
    sessionId?: string;
    currentTime?: number;
    notes: TrackNote[];
    permission: NotePermissionResponse | null;
    loading: boolean;
    submitting: boolean;
    isWsConnected: boolean;
    onSeek?: (time: number) => void;
    onAddNote: (content: string, time: number) => Promise<boolean | void>;
    onUpdateNote: (noteId: number, content: string) => Promise<boolean | void>;
    onDeleteNote: (noteId: number) => Promise<void>;
    onClose?: () => void; // Optional back button
}

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const LiveTrackNotesPanel: React.FC<LiveTrackNotesPanelProps> = ({
    trackId,
    roomType,
    sessionId,
    currentTime = 0,
    notes,
    permission,
    loading,
    submitting,
    isWsConnected,
    onSeek,
    onAddNote,
    onUpdateNote,
    onDeleteNote,
    onClose
}) => {
    const [newNote, setNewNote] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        const success = await onAddNote(newNote, currentTime);
        if (success) {
            setNewNote('');
        }
    };

    const handleUpdateNote = async (noteId: number) => {
        if (!editContent.trim()) return;
        const success = await onUpdateNote(noteId, editContent);
        if (success) {
            setEditingId(null);
        }
    };

    const handleTimestampClick = (timestamp: number) => {
        if (onSeek) {
            onSeek(timestamp);
        }
    };

    // Không có trackId hoặc không có quyền xem
    if (!trackId || !permission) return (
        <div className="h-full flex items-center justify-center text-gray-500">
            Chọn bài hát để xem ghi chú
        </div>
    );

    return (
        <div className="absolute inset-0 flex flex-col bg-gray-900/50 z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/20 bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <StickyNote size={18} className="text-yellow-400" />
                    <span className="text-white font-medium">
                        Ghi chú ({notes.length})
                    </span>
                    {sessionId && (
                        isWsConnected ? (
                            <span title="Real-time connected">
                                <Wifi size={14} className="text-green-400" />
                            </span>
                        ) : (
                            <span title="Real-time disconnected">
                                <WifiOff size={14} className="text-gray-500" />
                            </span>
                        )
                    )}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-800/50 hover:bg-gray-700 rounded-lg text-xs text-gray-300 hover:text-white transition-all border border-transparent hover:border-gray-600"
                        title="Quay lại chat"
                    >
                        Quay lại
                    </button>
                )}
            </div>

            {/* Note Input */}
            {permission.canNote && (
                <div className="p-4 bg-gray-900/40 border-b border-purple-500/10">
                    {currentTime > 0 && (
                        <div className="flex items-center gap-1 text-xs text-purple-400 px-1 mb-2">
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
                            placeholder={currentTime > 0 ? `Ghi chú tại ${formatTime(currentTime)}...` : "Thêm ghi chú..."}
                            className="flex-1 px-3 py-2 bg-black/40 border border-purple-700/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                            disabled={submitting}
                        />
                        <button
                            onClick={handleAddNote}
                            disabled={!newNote.trim() || submitting}
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
                        >
                            {submitting ? (
                                <Loader2 size={16} className="text-white animate-spin" />
                            ) : (
                                <Plus size={16} className="text-white" />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3 custom-scrollbar">
                {loading && (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 size={24} className="text-purple-400 animate-spin" />
                    </div>
                )}

                {!loading && notes.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
                        <StickyNote size={32} className="opacity-20 mb-2" />
                        <p>Chưa có ghi chú nào</p>
                    </div>
                )}

                <AnimatePresence mode='popLayout'>
                    {notes.map((note) => (
                        <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                            className={`p-3 rounded-xl border ${roomType === 'INTERNAL'
                                ? 'bg-yellow-900/10 border-yellow-600/20 hover:border-yellow-600/40'
                                : 'bg-blue-900/10 border-blue-600/20 hover:border-blue-600/40'
                                } transition-colors group relative`}
                        >
                            {editingId === note.id ? (
                                // Edit Mode
                                <div className="space-y-2">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full px-3 py-2 bg-black/40 border border-purple-700/30 rounded-lg text-sm text-white resize-none focus:outline-none"
                                        rows={3}
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={() => handleUpdateNote(note.id)}
                                            disabled={submitting}
                                            className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-xs text-white"
                                        >
                                            Lưu
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <>
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            {/* Avatar if available, otherwise name initials or icon */}
                                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                                {note.userName?.substring(0, 1) || '?'}
                                            </div>
                                            <span className="text-xs font-bold text-gray-300">
                                                {note.userName}
                                            </span>
                                            <span className="text-[10px] text-gray-500">
                                                {new Date(note.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        {permission.isHost && (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(note.id);
                                                        setEditContent(note.content);
                                                    }}
                                                    className="p-1 hover:bg-gray-700/80 rounded"
                                                    title="Sửa"
                                                >
                                                    <Edit3 size={12} className="text-gray-400 hover:text-white" />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteNote(note.id)}
                                                    className="p-1 hover:bg-red-900/50 rounded"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={12} className="text-red-400 hover:text-red-300" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Timestamp badge - clickable */}
                                    {note.timestamp !== undefined && note.timestamp !== null && (
                                        <button
                                            onClick={() => handleTimestampClick(note.timestamp!)}
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 mb-1 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 rounded text-[10px] text-purple-300 font-mono transition-colors"
                                            title="Nhấn để nhảy đến thời điểm này"
                                        >
                                            <Clock size={10} />
                                            {formatTime(note.timestamp)}
                                        </button>
                                    )}

                                    <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                                        {note.content}
                                    </p>
                                </>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LiveTrackNotesPanel;
