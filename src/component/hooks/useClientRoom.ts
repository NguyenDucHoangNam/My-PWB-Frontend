import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCosmicToast } from '../../component/toast/CosmicToastProvider';
import clientDeliveryService, {
    type ClientTrackItem,
    type UpdateDeliveryStatusRequest,
} from '../../services/clientDeliveryService';
import projectService, { type ProjectPermissionResponse } from '../../services/projectService';
import milestoneService from '../../services/milestoneService';
import trackService from '../../services/trackService';
import Hls from 'hls.js';

/**
 * Hook để quản lý toàn bộ logic của ClientRoomPage
 */
export const useClientRoom = (
    milestoneId: string | null,
    projectId: string | null
) => {
    const navigate = useNavigate();
    const { showToast } = useCosmicToast();

    // Data state
    const [clientTracks, setClientTracks] = useState<ClientTrackItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [permission, setPermission] = useState<ProjectPermissionResponse | null>(null);
    const [productCountRemaining, setProductCountRemaining] = useState<number>(0);
    const [editCountRemaining, setEditCountRemaining] = useState<number>(0);
    const [expandedTracks, setExpandedTracks] = useState<Set<number>>(new Set());
    const [milestoneStatus, setMilestoneStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID' | null>(null);

    // Feedback modal state
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedFeedbackItem, setSelectedFeedbackItem] = useState<ClientTrackItem | null>(null);
    const [feedbackType, setFeedbackType] = useState<'REJECTED' | 'REQUEST_EDIT'>('REJECTED');
    const [feedbackReason, setFeedbackReason] = useState('');

    // Download modal state
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [selectedTrackIds, setSelectedTrackIds] = useState<Set<number>>(new Set());
    const [isDownloading, setIsDownloading] = useState(false);

    // Delete confirm state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [trackToDelete, setTrackToDelete] = useState<ClientTrackItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Complete milestone confirm state
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    // Complete project confirm state (hiển thị sau khi hoàn thành cột mốc cuối cùng)
    const [showCompleteProjectConfirm, setShowCompleteProjectConfirm] = useState(false);
    const [isCompletingProject, setIsCompletingProject] = useState(false);

    // Player state
    const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(1); // 0-1
    const [playbackSpeed, setPlaybackSpeedState] = useState(1); // 0.5, 1, 1.5, 2
    const [isLooping, setIsLooping] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    // Load permission
    useEffect(() => {
        const loadPermission = async () => {
            if (!projectId) return;
            try {
                const perm = await projectService.getProjectPermissionByProjectId(Number(projectId));
                setPermission(perm);
            } catch (err: any) {
                console.error('Error loading project permission:', err);
            }
        };
        loadPermission();
    }, [projectId]);

    // Load client tracks
    const loadClientTracks = useCallback(async () => {
        if (!milestoneId) return;

        try {
            setLoading(true);
            const tracks = await clientDeliveryService.getClientTracks(Number(milestoneId));
            setClientTracks(tracks);
        } catch (error: any) {
            console.error('Error loading client tracks:', error);
            showToast({
                type: 'error',
                message: error.response?.data?.message || 'Không thể tải danh sách sản phẩm',
            });
        } finally {
            setLoading(false);
        }
    }, [milestoneId, showToast]);

    // Load quota info (Client/Observer cũng được xem)
    const loadQuotaInfo = useCallback(async () => {
        if (!milestoneId || !permission?.clientDelivery?.canViewProductCountRemaining) return;

        try {
            const quotaRes = await clientDeliveryService.getQuota(Number(milestoneId));
            setProductCountRemaining(quotaRes.productCountRemaining);
            setEditCountRemaining(quotaRes.editCountRemaining);
        } catch (error: any) {
            console.error('Error loading quota info:', error);
            // Don't show error toast, it's not critical
        }
    }, [milestoneId, permission]);

    useEffect(() => {
        loadClientTracks();

        return () => {
            // Cleanup HLS
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [loadClientTracks]);

    // Load quota when permission changes
    useEffect(() => {
        if (permission) {
            loadQuotaInfo();
        }
    }, [permission, loadQuotaInfo]);

    // Load milestone detail to get status
    const loadMilestoneDetail = useCallback(async () => {
        if (!projectId || !milestoneId) return;

        try {
            const detail = await milestoneService.getMilestoneDetail(Number(projectId), Number(milestoneId));
            setMilestoneStatus(detail.status);
        } catch (error: any) {
            console.error('Error loading milestone detail:', error);
            // Don't show error toast, it's not critical
        }
    }, [projectId, milestoneId]);

    useEffect(() => {
        if (projectId && milestoneId) {
            loadMilestoneDetail();
        }
    }, [projectId, milestoneId, loadMilestoneDetail]);

    // Player logic
    const playTrack = useCallback(
        async (item: ClientTrackItem) => {
            const { track } = item;

            if (!track.hlsPlaybackUrl) {
                showToast({
                    type: 'info',
                    message: 'Track chưa sẵn sàng để phát',
                });
                return;
            }

            // Stop current track if playing
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }

            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }

            // If clicking same track, toggle play/pause
            if (playingTrackId === track.id && isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
                return;
            }

            setPlayingTrackId(track.id);

            // Setup HLS player
            const audio = audioRef.current;
            if (!audio) return;

            if (Hls.isSupported()) {
                const hls = new Hls({
                    // Tăng buffer để tránh stalling
                    maxBufferLength: 30,
                    maxMaxBufferLength: 60,
                    maxBufferSize: 60 * 1000 * 1000,
                    maxBufferHole: 0.5,
                    // Enable backoff để retry khi có lỗi
                    enableWorker: true,
                    lowLatencyMode: false,
                });
                hls.loadSource(track.hlsPlaybackUrl);
                hls.attachMedia(audio);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    audio.play();
                    setIsPlaying(true);
                });

                hls.on(Hls.Events.ERROR, (_event, data) => {
                    // Chỉ log fatal errors, bỏ qua non-fatal warnings
                    if (data.fatal) {
                        console.error('HLS fatal error:', data);
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.error('Network error, trying to recover...');
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.error('Media error, trying to recover...');
                                hls.recoverMediaError();
                                break;
                            default:
                                showToast({
                                    type: 'error',
                                    message: 'Không thể phát track',
                                });
                                hls.destroy();
                                break;
                        }
                    }
                    // Bỏ qua non-fatal errors (buffer warnings)
                });

                hlsRef.current = hls;
            } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
                // Safari native HLS support
                audio.src = track.hlsPlaybackUrl;
                audio.play();
                setIsPlaying(true);
            } else {
                showToast({
                    type: 'error',
                    message: 'Trình duyệt không hỗ trợ phát HLS',
                });
            }
        },
        [playingTrackId, isPlaying, showToast]
    );

    const togglePlayPause = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Number(e.target.value);
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleAudioEnded = () => {
        if (!isLooping) {
            setIsPlaying(false);
        }
    };

    // Volume control
    const setVolume = useCallback((newVolume: number) => {
        if (audioRef.current) {
            const clampedVolume = Math.max(0, Math.min(1, newVolume));
            audioRef.current.volume = clampedVolume;
            setVolumeState(clampedVolume);
            // Auto unmute when volume > 0
            if (clampedVolume > 0 && isMuted) {
                audioRef.current.muted = false;
                setIsMuted(false);
            }
        }
    }, [isMuted]);

    // Playback speed control
    const setPlaybackSpeed = useCallback((speed: number) => {
        if (audioRef.current) {
            const validSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
            const clampedSpeed = validSpeeds.includes(speed) ? speed : 1;
            audioRef.current.playbackRate = clampedSpeed;
            setPlaybackSpeedState(clampedSpeed);
        }
    }, []);

    // Toggle loop
    const toggleLoop = useCallback(() => {
        if (audioRef.current) {
            const newLoopState = !isLooping;
            audioRef.current.loop = newLoopState;
            setIsLooping(newLoopState);
        }
    }, [isLooping]);

    // Sync volume and playback speed when audio element changes
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = volume;
            audio.playbackRate = playbackSpeed;
            audio.loop = isLooping;
        }
    }, [volume, playbackSpeed, isLooping]);

    const toggleTrackExpand = (trackId: number) => {
        setExpandedTracks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(trackId)) {
                newSet.delete(trackId);
            } else {
                newSet.add(trackId);
            }
            return newSet;
        });
    };

    // Handler để mở modal feedback
    const handleOpenFeedbackModal = (
        item: ClientTrackItem,
        type: 'REJECTED' | 'REQUEST_EDIT'
    ) => {
        setSelectedFeedbackItem(item);
        setFeedbackType(type);
        setFeedbackReason('');
        setShowFeedbackModal(true);
    };

    // Handler để submit feedback
    const handleSubmitFeedback = async () => {
        if (!selectedFeedbackItem) return;

        // REQUEST_EDIT: reason bắt buộc
        if (feedbackType === 'REQUEST_EDIT' && !feedbackReason.trim()) {
            showToast({
                type: 'error',
                message: 'Vui lòng nêu rõ yêu cầu chỉnh sửa',
            });
            return;
        }

        // REJECTED: reason optional, nhưng validate quota
        // REQUEST_EDIT: validate quota
        if (feedbackType === 'REJECTED' && productCountRemaining <= 0) {
            showToast({
                type: 'error',
                title: '❌ Đã hết lượt',
                message: 'Đã hết lượt yêu cầu làm mới. Vui lòng chấp nhận hoặc yêu cầu chỉnh sửa.',
            });
            return;
        }

        if (feedbackType === 'REQUEST_EDIT' && editCountRemaining <= 0) {
            showToast({
                type: 'error',
                title: '❌ Đã hết lượt',
                message: 'Đã hết lượt chỉnh sửa. Vui lòng chấp nhận hoặc yêu cầu làm mới.',
            });
            return;
        }

        try {
            const request: UpdateDeliveryStatusRequest = {
                status: feedbackType,
                // REQUEST_EDIT: reason bắt buộc
                // REJECTED: reason optional (có thể null hoặc undefined)
                reason: feedbackType === 'REQUEST_EDIT' 
                    ? feedbackReason.trim() 
                    : (feedbackReason.trim() || null),
            };

            await clientDeliveryService.updateDeliveryStatus(
                selectedFeedbackItem.delivery.id,
                request
            );

            showToast({
                type: 'success',
                title: '✅ Đã gửi phản hồi',
                message:
                    feedbackType === 'REJECTED'
                        ? 'Đã từ chối sản phẩm'
                        : 'Đã yêu cầu chỉnh sửa sản phẩm',
            });

            // Reload tracks and quota
            await loadClientTracks();
            await loadQuotaInfo();

            // Close modal
            setShowFeedbackModal(false);
            setSelectedFeedbackItem(null);
            setFeedbackReason('');
        } catch (error: any) {
            console.error('Submit feedback error:', error);
            
            // Xử lý error codes đặc biệt
            const errorCode = error.response?.data?.code;
            let errorMessage = error.response?.data?.message || error.message || 'Không thể gửi phản hồi';
            
            if (errorCode === 8042) {
                errorMessage = 'Vui lòng nêu rõ yêu cầu chỉnh sửa';
            } else if (errorCode === 8043) {
                errorMessage = 'Đã hết lượt chỉnh sửa cho milestone này';
            } else if (errorCode === 8037) {
                errorMessage = 'Đã hết lượt gửi sản phẩm cho milestone này';
            } else if (errorCode === 8041) {
                errorMessage = 'Không thể chuyển đổi trạng thái delivery này';
            }

            showToast({
                type: 'error',
                title: '❌ Gửi thất bại',
                message: errorMessage,
            });
        }
    };

    // Handler để chấp nhận delivery
    const handleAcceptDelivery = async (item: ClientTrackItem) => {
        try {
            // ACCEPTED: reason không bắt buộc, có thể null
            await clientDeliveryService.acceptDelivery(item.delivery.id, null);

            showToast({
                type: 'success',
                title: '✅ Đã chấp nhận',
                message: `Đã chấp nhận sản phẩm "${item.track.name}"`,
            });

            // Reload tracks and quota (quota không đổi vì không trừ)
            await loadClientTracks();
            await loadQuotaInfo();
        } catch (error: any) {
            console.error('Accept delivery error:', error);
            
            // Xử lý error codes
            const errorCode = error.response?.data?.code;
            let errorMessage = error.response?.data?.message || error.message || 'Không thể chấp nhận sản phẩm';
            
            if (errorCode === 8041) {
                errorMessage = 'Không thể chuyển đổi trạng thái delivery này';
            }

            showToast({
                type: 'error',
                title: '❌ Chấp nhận thất bại',
                message: errorMessage,
            });
        }
    };

    // Handler để xem chi tiết track và comment
    const handleViewDetail = (item: ClientTrackItem) => {
        const params = new URLSearchParams({
            trackId: item.track.id.toString(),
            deliveryId: item.delivery.id.toString(),
            ...(milestoneId && { milestoneId }),
            ...(projectId && { projectId }),
        });
        navigate(`/track/${item.track.id}?${params.toString()}`);
    };

    // Handler để mở confirm dialog hoàn thành cột mốc
    const handleOpenCompleteConfirm = () => {
        setShowCompleteConfirm(true);
    };

    // Handler để chấp nhận hoàn thành cột mốc (sau khi confirm)
    const handleConfirmCompleteMilestone = async () => {
        if (!projectId || !milestoneId) {
            showToast({
                type: 'error',
                message: 'Thiếu thông tin dự án hoặc cột mốc',
            });
            return;
        }

        try {
            setIsCompleting(true);
            await milestoneService.completeMilestone(Number(projectId), Number(milestoneId));

            showToast({
                type: 'success',
                title: '✅ Đã chấp nhận hoàn thành',
                message: 'Đã chấp nhận hoàn thành cột mốc. Email thông báo đã được gửi cho chủ dự án.',
            });

            // Reload milestone status
            await loadMilestoneDetail();

            // Đóng modal xác nhận hoàn thành cột mốc
            setShowCompleteConfirm(false);

            // Nếu user là CLIENT, kiểm tra xem đây có phải cột mốc cuối cùng không
            // Nếu tất cả cột mốc đã hoàn thành thì mở modal xác nhận hoàn thành dự án
            if (permission?.role?.projectRole === 'CLIENT') {
                try {
                    const milestones = await milestoneService.getMilestones(Number(projectId));
                    const hasMilestones = milestones.length > 0;
                    const allCompleted = hasMilestones && milestones.every(
                        (ms) => ms.status === 'COMPLETED'
                    );

                    if (allCompleted) {
                        setShowCompleteProjectConfirm(true);
                    }
                } catch (checkError: any) {
                    console.error('Error checking all milestones completed:', checkError);
                    // Không show toast để tránh làm phiền user; đây chỉ là bước phụ.
                }
            }
        } catch (error: any) {
            console.error('Complete milestone error:', error);
            
            // Xử lý error messages
            const errorCode = error.response?.data?.code;
            let errorMessage = error.response?.data?.message || error.message || 'Không thể chấp nhận hoàn thành cột mốc';
            
            if (errorCode === 400) {
                // Có thể là "Cột mốc phải có ít nhất 1 track nhạc" hoặc "Cột mốc đã được hoàn thành"
                errorMessage = error.response?.data?.message || errorMessage;
            } else if (errorCode === 403) {
                errorMessage = 'Chỉ khách hàng mới có quyền chấp nhận hoàn thành cột mốc';
            } else if (errorCode === 404) {
                errorMessage = 'Cột mốc không tồn tại';
            }

            showToast({
                type: 'error',
                title: '❌ Chấp nhận thất bại',
                message: errorMessage,
            });
        } finally {
            setIsCompleting(false);
        }
    };

    // Handler để xác nhận hoàn thành dự án (sau khi đã hoàn thành cột mốc cuối cùng)
    const handleConfirmCompleteProject = async () => {
        if (!projectId) {
            showToast({
                type: 'error',
                message: 'Thiếu thông tin dự án',
            });
            return;
        }

        try {
            setIsCompletingProject(true);
            await projectService.completeProject(Number(projectId));

            showToast({
                type: 'success',
                message: 'Bạn đã xác nhận hoàn thành dự án. Cảm ơn bạn đã đồng hành!',
            });

            setShowCompleteProjectConfirm(false);

            // Reload lại trang để cập nhật trạng thái dự án và cột mốc
            window.location.reload();
        } catch (error: any) {
            console.error('Complete project error:', error);

            const errorMessage =
                error?.message || 'Không thể xác nhận hoàn thành dự án. Vui lòng thử lại.';

            showToast({
                type: 'error',
                message: errorMessage,
            });
        } finally {
            setIsCompletingProject(false);
        }
    };

    // Handler để mở modal download
    const handleOpenDownloadModal = () => {
        // Select all tracks by default
        const allTrackIds = new Set(clientTracks.map(item => item.track.id));
        setSelectedTrackIds(allTrackIds);
        setShowDownloadModal(true);
    };

    // Handler để toggle track selection
    const handleToggleTrackSelection = (trackId: number) => {
        setSelectedTrackIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(trackId)) {
                newSet.delete(trackId);
            } else {
                newSet.add(trackId);
            }
            return newSet;
        });
    };

    // Handler để select all tracks
    const handleSelectAllTracks = () => {
        const allTrackIds = new Set(clientTracks.map(item => item.track.id));
        setSelectedTrackIds(allTrackIds);
    };

    // Handler để deselect all tracks
    const handleDeselectAllTracks = () => {
        setSelectedTrackIds(new Set());
    };

    // Handler để download ZIP
    const handleDownloadZip = async () => {
        if (!projectId || !milestoneId) {
            showToast({
                type: 'error',
                message: 'Thiếu thông tin dự án hoặc cột mốc',
            });
            return;
        }

        if (selectedTrackIds.size === 0) {
            showToast({
                type: 'error',
                message: 'Vui lòng chọn ít nhất một track để tải về',
            });
            return;
        }

        try {
            setIsDownloading(true);
            const trackIdsArray = Array.from(selectedTrackIds);
            const result = await milestoneService.downloadOriginalTracksZip(
                Number(projectId),
                Number(milestoneId),
                trackIdsArray.length > 0 ? trackIdsArray : undefined
            );

            // Download file
            const link = document.createElement('a');
            link.href = result.downloadUrl;
            link.download = result.zipFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Show statistics
            if (result.statistics.failedTracks > 0) {
                showToast({
                    type: 'info',
                    title: '⚠️ Tải về thành công với một số lỗi',
                    message: `Đã tải ${result.statistics.successfulTracks}/${result.statistics.totalTracks} tracks. ${result.statistics.failedTracks} tracks không thể tải.`,
                });
            } else {
                showToast({
                    type: 'success',
                    title: '✅ Tải về thành công',
                    message: `Đã tải ${result.statistics.successfulTracks} tracks thành công.`,
                });
            }

            setShowDownloadModal(false);
            setSelectedTrackIds(new Set());
        } catch (error: any) {
            console.error('Download ZIP error:', error);
            
            const errorCode = error.response?.data?.code;
            let errorMessage = error.response?.data?.message || error.message || 'Không thể tải về file ZIP';
            
            if (errorCode === 400) {
                errorMessage = error.response?.data?.message || errorMessage;
            } else if (errorCode === 403) {
                errorMessage = 'Không có quyền truy cập Client Room';
            } else if (errorCode === 404) {
                errorMessage = 'Cột mốc không tồn tại hoặc không thuộc project';
            }

            showToast({
                type: 'error',
                title: '❌ Tải về thất bại',
                message: errorMessage,
            });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    // Handler để mở confirm dialog xóa track
    const handleDeleteTrack = useCallback((item: ClientTrackItem) => {
        // Kiểm tra điều kiện: Track đã được khách hàng chấp nhận (status = ACCEPTED) → không cho phép xóa
        if (item.delivery.status === 'ACCEPTED') {
            showToast({
                type: 'error',
                title: '❌ Không thể xóa',
                message: 'Không thể xóa track đã được khách hàng chấp nhận. Track này đã được bàn giao cho khách hàng.',
            });
            return;
        }

        setTrackToDelete(item);
        setShowDeleteConfirm(true);
    }, [showToast]);

    // Handler để xác nhận xóa track
    const handleConfirmDeleteTrack = useCallback(async () => {
        if (!trackToDelete) return;

        try {
            setIsDeleting(true);
            await trackService.deleteTrack(trackToDelete.track.id);

            showToast({
                type: 'success',
                title: '✅ Xóa thành công',
                message: `Đã xóa track "${trackToDelete.track.name}"`,
            });

            // Reload tracks
            await loadClientTracks();

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
    }, [trackToDelete, showToast, loadClientTracks]);

    // Chỉ CLIENT mới có thể chấp nhận delivery, không phải OWNER
    const canAcceptDelivery = (permission?.clientDelivery?.canAcceptDelivery ?? false) && 
                               (permission?.role?.projectRole === 'CLIENT');
    const canRejectDelivery = permission?.clientDelivery?.canRejectDelivery ?? false;
    const canRequestEditDelivery = permission?.clientDelivery?.canRequestEditDelivery ?? false;
    const canCompleteMilestone = permission?.milestone?.canCompleteMilestone ?? false;
    const canDeleteTrack = permission?.track?.canDeleteTrack ?? false;

    return {
        // Data
        clientTracks,
        loading,
        permission,
        productCountRemaining,
        editCountRemaining,
        expandedTracks,
        milestoneStatus,
        
        // Feedback modal
        showFeedbackModal,
        selectedFeedbackItem,
        feedbackType,
        feedbackReason,
        setShowFeedbackModal,
        setSelectedFeedbackItem,
        setFeedbackReason,
        
        // Download modal
        showDownloadModal,
        selectedTrackIds,
        isDownloading,
        setShowDownloadModal,
        setSelectedTrackIds,
        
        // Delete confirm
        showDeleteConfirm,
        trackToDelete,
        isDeleting,
        setShowDeleteConfirm,
        setTrackToDelete,
        handleConfirmDeleteTrack,
        
        // Complete milestone confirm
        showCompleteConfirm,
        isCompleting,
        setShowCompleteConfirm,
        handleOpenCompleteConfirm,
        handleConfirmCompleteMilestone,
        
        // Player
        playingTrackId,
        isPlaying,
        isMuted,
        currentTime,
        duration,
        volume,
        playbackSpeed,
        isLooping,
        audioRef,
        
        // Handlers
        handleBack,
        toggleTrackExpand,
        playTrack,
        togglePlayPause,
        toggleMute,
        handleTimeUpdate,
        handleSeek,
        handleAudioEnded,
        setVolume,
        setPlaybackSpeed,
        toggleLoop,
        handleOpenFeedbackModal,
        handleSubmitFeedback,
        handleAcceptDelivery,
        handleViewDetail,
        handleOpenDownloadModal,
        handleToggleTrackSelection,
        handleSelectAllTracks,
        handleDeselectAllTracks,
        handleDownloadZip,
        handleDeleteTrack,

        // Complete project confirm
        showCompleteProjectConfirm,
        isCompletingProject,
        setShowCompleteProjectConfirm,
        handleConfirmCompleteProject,
        
        // Permissions
        canAcceptDelivery,
        canRejectDelivery,
        canRequestEditDelivery,
        canCompleteMilestone,
        canDeleteTrack,
    };
};

