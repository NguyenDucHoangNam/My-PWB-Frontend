import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
    getTrackNotes,
    createTrackNote,
    updateTrackNote,
    deleteTrackNote,
    checkCanNote
} from '../../services/sessionApi';
import websocketService from '../../services/websocketService';
import type { TrackNote, RoomType, NotePermissionResponse } from '../../types/session';

interface UseTrackNotesProps {
    trackId: number | null;
    roomType: RoomType;
    sessionId?: string;
}

export const useTrackNotes = ({ trackId, roomType, sessionId }: UseTrackNotesProps) => {
    const [notes, setNotes] = useState<TrackNote[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [permission, setPermission] = useState<NotePermissionResponse | null>(null);
    const [isWsConnected, setIsWsConnected] = useState(false);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    // Load permission when track changes
    useEffect(() => {
        const loadPermission = async () => {
            if (!trackId) return;
            try {
                const perm = await checkCanNote(trackId);
                setPermission(perm);
            } catch (error) {
                console.error('Error loading permission:', error);
                setPermission({ canNote: false, isHost: false, isClient: false });
            }
        };
        loadPermission();
    }, [trackId]);

    // Load notes
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

    // Initial load
    useEffect(() => {
        if (trackId) {
            loadNotes();
        } else {
            setNotes([]);
        }
    }, [trackId, loadNotes]);

    // WebSocket subscription
    useEffect(() => {
        if (!sessionId || !trackId) {
            setIsWsConnected(false);
            return;
        }

        console.log('📝 Setting up notes WebSocket subscription for session:', sessionId);

        const unsubscribe = websocketService.subscribeToNotes(sessionId, (event: any) => {
            const payload = event.payload || event;
            const action = payload.action || event.eventType?.replace('TRACK_NOTE_', '');
            const noteData = payload.note;
            const noteId = payload.noteId;
            const eventTrackId = payload.trackId;

            // Only process events for current track
            if (eventTrackId && eventTrackId !== trackId) {
                return;
            }

            switch (action) {
                case 'CREATE':
                    if (noteData) {
                        setNotes(prev => {
                            if (prev.some(n => n.id === noteData.id)) return prev;
                            return [noteData, ...prev];
                        });
                    }
                    break;
                case 'UPDATE':
                    if (noteData) {
                        setNotes(prev => prev.map(n => n.id === noteData.id ? noteData : n));
                    }
                    break;
                case 'DELETE':
                    if (noteId) {
                        setNotes(prev => prev.filter(n => n.id !== noteId));
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

    // Actions
    const addNote = async (content: string, currentTime: number = 0) => {
        if (!trackId || !content.trim()) return;

        setSubmitting(true);
        try {
            const note = await createTrackNote(trackId, {
                content: content.trim(),
                roomType,
                timestamp: currentTime > 0 ? currentTime : undefined,
                sessionId
            });
            setNotes(prev => {
                if (prev.some(n => n.id === note.id)) return prev;
                return [note, ...prev];
            });
            toast.success('Đã thêm ghi chú');
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể thêm ghi chú');
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const updateNote = async (noteId: number, content: string) => {
        if (!trackId || !content.trim()) return;

        setSubmitting(true);
        try {
            const updated = await updateTrackNote(trackId, noteId, {
                content: content.trim(),
                sessionId
            });
            setNotes(prev => prev.map(n => n.id === noteId ? updated : n));
            toast.success('Đã cập nhật ghi chú');
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể cập nhật');
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const deleteNote = async (noteId: number) => {
        if (!trackId) return;

        try {
            await deleteTrackNote(trackId, noteId, sessionId);
            setNotes(prev => prev.filter(n => n.id !== noteId));
            toast.success('Đã xóa ghi chú');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể xóa');
        }
    };

    return {
        notes,
        loading,
        submitting,
        permission,
        isWsConnected,
        addNote,
        updateNote,
        deleteNote
    };
};
