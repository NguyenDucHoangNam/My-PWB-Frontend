import { useState, useEffect } from 'react';
import { useCosmicToast } from '../../toast/CosmicToastProvider';
import trackService, { type TrackDetailResponse } from '../../../services/trackService';
import clientDeliveryService from '../../../services/clientDeliveryService';
import projectService, { type ProjectPermissionResponse } from '../../../services/projectService';

/**
 * Hook để quản lý track detail và permission
 */
export const useTrackDetail = (
    trackId: string | undefined,
    isClientRoomMode: boolean,
    deliveryId: string | null,
    projectId: string | null
) => {
    const { showToast } = useCosmicToast();
    const [track, setTrack] = useState<TrackDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [permission, setPermission] = useState<ProjectPermissionResponse | null>(null);

    // Load track details và permission song song
    useEffect(() => {
        const loadData = async () => {
            if (!trackId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            
            try {
                // Tạo array promises để chạy song song
                const promises: Promise<any>[] = [];

                // Load track
                if (isClientRoomMode && deliveryId) {
                    promises.push(
                        clientDeliveryService.getTrackDetail(Number(deliveryId))
                            .then(data => setTrack(data.track))
                            .catch(err => {
                                throw err; // Re-throw để catch ở ngoài xử lý
                            })
                    );
                } else {
                    promises.push(
                        trackService.getTrackDetails(Number(trackId))
                            .then(data => setTrack(data))
                            .catch(err => {
                                throw err;
                            })
                    );
                }

                // Load permission nếu có projectId (không block nếu lỗi)
                if (projectId) {
                    promises.push(
                        projectService.getProjectPermissionByProjectId(Number(projectId))
                            .then(perm => setPermission(perm))
                            .catch(err => {
                                // Permission lỗi không block việc load track
                                console.error('Error loading project permission:', err);
                            })
                    );
                }

                // Chờ tất cả promises hoàn thành (track phải thành công, permission có thể fail)
                await Promise.all(promises);
            } catch (error: any) {
                console.error('Error loading track:', error);
                showToast({
                    type: 'error',
                    message: error.response?.data?.message || 'Không thể tải thông tin track',
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [trackId, isClientRoomMode, deliveryId, projectId, showToast]);

    return {
        track,
        loading,
        permission,
    };
};

