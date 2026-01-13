import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import trackService, {
    type TrackDetailResponse,
    type UpdateTrackStatusRequest,
} from '../../../services/trackService';
import clientDeliveryService, { type SendTrackToClientRequest } from '../../../services/clientDeliveryService';
import { useCosmicToast } from '../../toast/CosmicToastProvider';

/**
 * Hook để quản lý các actions trên track: status change, send to client, reject
 */
export const useInternalStudioTrackActions = (
    milestoneId: string | null,
    projectId: string | null,
    onTrackUpdate: (track: TrackDetailResponse) => void,
    onReloadClientDeliveryInfo: () => Promise<void>,
    onTrackDelete: (trackId: number) => void
) => {
    const navigate = useNavigate();
    const { showToast } = useCosmicToast();

    // Reject modal state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingTrack, setRejectingTrack] = useState<TrackDetailResponse | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // View reject reason modal state
    const [showViewRejectReasonModal, setShowViewRejectReasonModal] = useState(false);
    const [viewingRejectTrack, setViewingRejectTrack] = useState<TrackDetailResponse | null>(null);

    // Send to client modal state
    const [showSendToClientModal, setShowSendToClientModal] = useState(false);
    const [selectedTrackForSending, setSelectedTrackForSending] = useState<TrackDetailResponse | null>(null);
    const [sendNote, setSendNote] = useState('');

    // Delete confirm state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [trackToDelete, setTrackToDelete] = useState<TrackDetailResponse | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Helper function để update status
    const updateTrackStatus = useCallback(
        async (
            track: TrackDetailResponse,
            status: 'INTERNAL_DRAFT' | 'INTERNAL_APPROVED' | 'INTERNAL_REJECTED',
            reason?: string
        ) => {
            try {
                const request: UpdateTrackStatusRequest = {
                    status: status as UpdateTrackStatusRequest['status'],
                    reason: reason?.trim() || undefined,
                };

                const updatedTrack = await trackService.updateTrackStatus(track.id, request);
                onTrackUpdate(updatedTrack);

                const statusMessages = {
                    'INTERNAL_APPROVED': {
                        title: '✅ Phê duyệt thành công',
                        message: `Track "${track.name}" đã được phê duyệt`,
                    },
                    'INTERNAL_REJECTED': {
                        title: '✅ Từ chối thành công',
                        message: `Track "${track.name}" đã bị từ chối`,
                    },
                    'INTERNAL_DRAFT': {
                        title: '✅ Cập nhật thành công',
                        message: `Track "${track.name}" đã được chuyển về bản nháp`,
                    },
                };

                showToast({
                    type: 'success',
                    title: statusMessages[status].title,
                    message: statusMessages[status].message,
                });
            } catch (error: any) {
                console.error('Update track status error:', error);
                const errorMessage =
                    error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái track';

                showToast({
                    type: 'error',
                    title: '❌ Cập nhật thất bại',
                    message: errorMessage,
                });
            }
        },
        [onTrackUpdate, showToast]
    );

    // Handler để thay đổi status track
    const handleStatusChange = useCallback(
        (track: TrackDetailResponse, newStatus: 'INTERNAL_DRAFT' | 'INTERNAL_APPROVED' | 'INTERNAL_REJECTED') => {
            // Nếu chọn REJECTED, mở modal để nhập reason
            if (newStatus === 'INTERNAL_REJECTED') {
                setRejectingTrack(track);
                setRejectReason('');
                setShowRejectModal(true);
            } else {
                // APPROVED hoặc DRAFT: gọi API trực tiếp
                updateTrackStatus(track, newStatus);
            }
        },
        [updateTrackStatus]
    );

    // Handler để reject track (từ modal)
    const handleRejectTrack = useCallback(async () => {
        if (!rejectingTrack) return;

        await updateTrackStatus(rejectingTrack, 'INTERNAL_REJECTED', rejectReason);

        // Close modal
        setShowRejectModal(false);
        setRejectingTrack(null);
        setRejectReason('');
    }, [rejectingTrack, rejectReason, updateTrackStatus]);

    // Handler để xem lý do từ chối
    const handleViewRejectReason = useCallback((track: TrackDetailResponse) => {
        setViewingRejectTrack(track);
        setShowViewRejectReasonModal(true);
    }, []);

    // Handler để xem chi tiết track và comment
    const handleViewDetail = useCallback(
        (track: TrackDetailResponse) => {
            const params = new URLSearchParams({
                trackId: track.id.toString(),
                ...(milestoneId && { milestoneId }),
                ...(projectId && { projectId }),
            });
            navigate(`/track/${track.id}?${params.toString()}`);
        },
        [navigate, milestoneId, projectId]
    );

    // Handler để mở modal gửi cho client
    const handleOpenSendToClientModal = useCallback((track: TrackDetailResponse) => {
        setSelectedTrackForSending(track);
        setSendNote('');
        setShowSendToClientModal(true);
    }, []);

    // Handler để gửi track cho client
    const handleSendToClient = useCallback(async () => {
        if (!selectedTrackForSending) return;

        try {
            const request: SendTrackToClientRequest = {
                note: sendNote.trim() || undefined,
            };

            await clientDeliveryService.sendTrackToClient(selectedTrackForSending.id, request);

            showToast({
                type: 'success',
                title: '✅ Đã gửi cho Client',
                message: `Track "${selectedTrackForSending.name}" đã được gửi thành công`,
            });

            // Reload client delivery info
            await onReloadClientDeliveryInfo();

            // Close modal
            setShowSendToClientModal(false);
            setSelectedTrackForSending(null);
            setSendNote('');
        } catch (error: any) {
            console.error('Send to client error:', error);
            const errorMessage =
                error.response?.data?.message || error.message || 'Không thể gửi track cho Client';

            showToast({
                type: 'error',
                title: '❌ Gửi thất bại',
                message: errorMessage,
            });
        }
    }, [selectedTrackForSending, sendNote, showToast, onReloadClientDeliveryInfo]);

    // Handler để mở confirm dialog xóa track
    const handleDeleteTrack = useCallback((track: TrackDetailResponse) => {
        setTrackToDelete(track);
        setShowDeleteConfirm(true);
    }, []);

    // Handler để xác nhận xóa track
    const handleConfirmDeleteTrack = useCallback(async () => {
        if (!trackToDelete) return;

        try {
            setIsDeleting(true);
            await trackService.deleteTrack(trackToDelete.id);

            showToast({
                type: 'success',
                title: '✅ Xóa thành công',
                message: `Đã xóa track "${trackToDelete.name}"`,
            });

            // Remove track from list
            onTrackDelete(trackToDelete.id);

            // Close confirm
            setShowDeleteConfirm(false);
            setTrackToDelete(null);
        } catch (error: any) {
            console.error('Delete track error:', error);
            
            const errorCode = error.response?.data?.code;
            let errorMessage = error.response?.data?.message || error.message || 'Không thể xóa track';
            
            if (errorCode === 400) {
                errorMessage = error.response?.data?.message || 'Không thể xóa track đã được khách hàng chấp nhận';
            } else if (errorCode === 403) {
                errorMessage = 'Chỉ chủ dự án hoặc người tải track lên mới có thể xóa track';
            } else if (errorCode === 404) {
                errorMessage = 'Track không tồn tại';
            }

            showToast({
                type: 'error',
                title: '❌ Xóa thất bại',
                message: errorMessage,
            });
        } finally {
            setIsDeleting(false);
        }
    }, [trackToDelete, showToast, onTrackDelete]);

    // Handler để download track
    const handleDownloadTrack = useCallback(async (track: TrackDetailResponse) => {
        try {
            // Lấy download URL từ API
            const { downloadUrl } = await trackService.getDownloadUrl(track.id);

            // Xác định extension từ contentType
            const getFileExtension = (contentType: string): string => {
                const mimeToExt: Record<string, string> = {
                    'audio/mpeg': 'mp3',
                    'audio/mp3': 'mp3',
                    'audio/wav': 'wav',
                    'audio/wave': 'wav',
                    'audio/x-wav': 'wav',
                    'audio/flac': 'flac',
                    'audio/aac': 'aac',
                    'audio/ogg': 'ogg',
                    'audio/m4a': 'm4a',
                    'audio/x-m4a': 'm4a',
                };
                
                const normalizedType = contentType.toLowerCase().split(';')[0].trim();
                return mimeToExt[normalizedType] || normalizedType.split('/')[1] || 'mp3';
            };

            const extension = getFileExtension(track.contentType);
            const fileName = track.name.includes('.') ? track.name : `${track.name}.${extension}`;

            // Tạo link tạm để download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            link.target = '_blank'; // Mở trong tab mới nếu cần
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast({
                type: 'success',
                title: '✅ Đang tải xuống',
                message: `Đang tải track "${track.name}"`,
            });
        } catch (error: any) {
            console.error('Download track error:', error);
            
            const errorCode = error.response?.data?.code;
            const statusCode = error.response?.status;
            let errorMessage = error.response?.data?.message || error.message || 'Không thể tải xuống track';
            
            if (errorCode === 403 || statusCode === 403) {
                errorMessage = 'Bạn không có quyền tải xuống track này. Vui lòng liên hệ chủ dự án để được cấp quyền.';
            } else if (errorCode === 404 || statusCode === 404) {
                errorMessage = 'Track không tồn tại';
            }

            showToast({
                type: 'error',
                title: '❌ Tải xuống thất bại',
                message: errorMessage,
            });
        }
    }, [showToast]);

    return {
        // Status change
        handleStatusChange,
        // Reject modal
        showRejectModal,
        rejectingTrack,
        rejectReason,
        setRejectReason,
        handleRejectTrack,
        closeRejectModal: () => {
            setShowRejectModal(false);
            setRejectingTrack(null);
            setRejectReason('');
        },
        // View reject reason modal
        showViewRejectReasonModal,
        viewingRejectTrack,
        handleViewRejectReason,
        closeViewRejectReasonModal: () => {
            setShowViewRejectReasonModal(false);
            setViewingRejectTrack(null);
        },
        // Send to client modal
        showSendToClientModal,
        selectedTrackForSending,
        sendNote,
        setSendNote,
        handleOpenSendToClientModal,
        handleSendToClient,
        closeSendToClientModal: () => {
            setShowSendToClientModal(false);
            setSelectedTrackForSending(null);
            setSendNote('');
        },
        // View detail
        handleViewDetail,
        // Delete track
        handleDeleteTrack,
        // Delete confirm
        showDeleteConfirm,
        trackToDelete,
        isDeleting,
        setShowDeleteConfirm,
        setTrackToDelete,
        handleConfirmDeleteTrack,
        // Download track
        handleDownloadTrack,
    };
};

