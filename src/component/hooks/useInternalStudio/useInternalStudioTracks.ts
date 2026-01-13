import { useState, useEffect, useCallback, useRef } from 'react';
import trackService, { type TrackDetailResponse } from '../../../services/trackService';
import { useCosmicToast } from '../../toast/CosmicToastProvider';

const POLL_INTERVAL = 5000; // 5 seconds
const MAX_POLL_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Hook để quản lý tracks: load, polling, update
 */
export const useInternalStudioTracks = (milestoneId: string | null) => {
    const { showToast } = useCosmicToast();
    const [tracks, setTracks] = useState<TrackDetailResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const pollTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

    // Polling logic
    const startPolling = useCallback(
        (trackId: number) => {
            const startTime = Date.now();

            const poll = async () => {
                try {
                    const track = await trackService.getTrackDetails(trackId);

                    // Update track in list
                    setTracks((prev) =>
                        prev.map((t) => (t.id === trackId ? track : t))
                    );

                    if (track.processingStatus === 'READY' || track.processingStatus === 'FAILED') {
                        // Stop polling
                        const timeout = pollTimeoutsRef.current.get(trackId);
                        if (timeout) {
                            clearTimeout(timeout);
                            pollTimeoutsRef.current.delete(trackId);
                        }

                        if (track.processingStatus === 'READY') {
                            showToast({
                                type: 'success',
                                title: '✅ Xử lý hoàn tất',
                                message: `Track "${track.name}" đã sẵn sàng để phát`,
                            });
                        } else {
                            showToast({
                                type: 'error',
                                title: '❌ Xử lý thất bại',
                                message: track.errorMessage || 'Không thể xử lý track',
                            });
                        }
                    } else if (Date.now() - startTime > MAX_POLL_DURATION) {
                        // Timeout
                        const timeout = pollTimeoutsRef.current.get(trackId);
                        if (timeout) {
                            clearTimeout(timeout);
                            pollTimeoutsRef.current.delete(trackId);
                        }

                        showToast({
                            type: 'info',
                            title: '⏱️ Xử lý quá lâu',
                            message: 'Track đang được xử lý lâu hơn dự kiến. Vui lòng kiểm tra lại sau.',
                        });
                    } else {
                        // Continue polling
                        const timeout = setTimeout(poll, POLL_INTERVAL);
                        pollTimeoutsRef.current.set(trackId, timeout);
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                }
            };

            poll();
        },
        [showToast]
    );

    // Load tracks
    const loadTracks = useCallback(async () => {
        if (!milestoneId) return;

        try {
            setLoading(true);
            const tracksList = await trackService.getTracksList(Number(milestoneId));
            setTracks(tracksList);

            // Start polling for tracks that are processing
            tracksList.forEach((track) => {
                if (track.processingStatus === 'PROCESSING') {
                    startPolling(track.id);
                }
            });
        } catch (error: any) {
            console.error('Error loading tracks:', error);
            showToast({
                type: 'error',
                message: error.response?.data?.message || 'Không thể tải danh sách tracks',
            });
        } finally {
            setLoading(false);
        }
    }, [milestoneId, showToast, startPolling]);

    useEffect(() => {
        loadTracks();

        return () => {
            // Cleanup all polling timeouts
            pollTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
            pollTimeoutsRef.current.clear();
        };
    }, [loadTracks]);

    // Update track in list
    const updateTrack = useCallback((track: TrackDetailResponse) => {
        setTracks((prev) => prev.map((t) => (t.id === track.id ? track : t)));
    }, []);

    return {
        tracks,
        loading,
        loadTracks,
        startPolling,
        updateTrack,
    };
};

