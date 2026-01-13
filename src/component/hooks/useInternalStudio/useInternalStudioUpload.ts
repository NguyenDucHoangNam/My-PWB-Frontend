import { useState, useCallback } from 'react';
import trackService, {
    type CreateTrackRequest,
    type CreateTrackVersionRequest,
    type TrackDetailResponse,
} from '../../../services/trackService';
import { useCosmicToast } from '../../toast/CosmicToastProvider';
import type { UploadProgress } from '../../../types/internalStudio';

const SUPPORTED_FORMATS = [
    { ext: '.wav', mime: 'audio/wav', label: 'WAV (Best Quality)' },
    { ext: '.mp3', mime: 'audio/mpeg', label: 'MP3 (Balanced)' },
    { ext: '.flac', mime: 'audio/flac', label: 'FLAC (Lossless)' },
    { ext: '.m4a', mime: 'audio/mp4', label: 'M4A (Good)' },
    { ext: '.aac', mime: 'audio/aac', label: 'AAC' },
    { ext: '.ogg', mime: 'audio/ogg', label: 'OGG' },
];

/**
 * Hook để quản lý upload track và version
 */
export const useInternalStudioUpload = (
    projectId: string | null,
    milestoneId: string | null,
    onUploadSuccess: (trackId: number) => void
) => {
    const { showToast } = useCosmicToast();

    // Upload form state (track mới)
    const [uploadForm, setUploadForm] = useState({
        name: '',
        description: '',
        voiceTagEnabled: false,
        voiceTagText: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Upload version state
    const [selectedTrackForVersion, setSelectedTrackForVersion] = useState<TrackDetailResponse | null>(null);
    const [versionForm, setVersionForm] = useState({
        description: '',
        voiceTagEnabled: false,
        voiceTagText: '',
    });
    const [versionFile, setVersionFile] = useState<File | null>(null);
    const [versionProgress, setVersionProgress] = useState<UploadProgress | null>(null);
    const [showVersionModal, setShowVersionModal] = useState(false);

    // File validation
    const validateFile = useCallback((file: File): boolean => {
        // Validate file size (max 1GB)
        const maxSize = 1024 * 1024 * 1024; // 1GB
        if (file.size > maxSize) {
            showToast({
                type: 'error',
                message: 'File quá lớn. Kích thước tối đa là 1GB',
            });
            return false;
        }

        // Validate file type
        const isValidType = SUPPORTED_FORMATS.some(
            (format) => file.type === format.mime || file.name.endsWith(format.ext)
        );

        if (!isValidType) {
            showToast({
                type: 'error',
                message: 'Định dạng file không được hỗ trợ',
            });
            return false;
        }

        return true;
    }, [showToast]);

    // Handle file select for new track
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!validateFile(file)) return;

        setSelectedFile(file);

        // Auto-fill form if empty
        if (!uploadForm.name) {
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            setUploadForm((prev) => ({ ...prev, name: nameWithoutExt }));
        }
    }, [uploadForm.name, validateFile]);

    // Handle upload new track
    const handleUpload = useCallback(async () => {
        if (!selectedFile || !projectId || !milestoneId) return;

        if (!uploadForm.name.trim()) {
            showToast({ type: 'error', message: 'Vui lòng nhập tên track' });
            return;
        }

        if (uploadForm.voiceTagEnabled && !uploadForm.voiceTagText.trim()) {
            showToast({ type: 'error', message: 'Vui lòng nhập nội dung voice tag' });
            return;
        }

        try {
            // Phase 1: Create track
            setUploadProgress({
                phase: 'creating',
                progress: 0,
                message: 'Đang tạo track...',
            });

            const createRequest: CreateTrackRequest = {
                name: uploadForm.name.trim(),
                description: uploadForm.description.trim() || undefined,
                contentType: selectedFile.type || 'audio/mpeg',
                fileSize: selectedFile.size,
                voiceTagEnabled: uploadForm.voiceTagEnabled,
                voiceTagText: uploadForm.voiceTagEnabled ? uploadForm.voiceTagText.trim() : undefined,
            };

            const createResponse = await trackService.createTrack(
                Number(projectId),
                Number(milestoneId),
                createRequest
            );

            const { trackId, uploadUrl } = createResponse;

            setUploadProgress({
                trackId,
                phase: 'uploading',
                progress: 0,
                message: 'Đang upload file lên S3...',
            });

            // Phase 2: Upload to S3
            await trackService.uploadToS3(
                uploadUrl,
                selectedFile,
                createRequest.contentType,
                (progress) => {
                    setUploadProgress({
                        trackId,
                        phase: 'uploading',
                        progress,
                        message: `Đang upload... ${Math.round(progress)}%`,
                    });
                }
            );

            // Phase 3: Finalize
            setUploadProgress({
                trackId,
                phase: 'finalizing',
                progress: 100,
                message: 'Đang hoàn tất upload...',
            });

            await trackService.finalizeTrack(trackId);

            // Phase 4: Processing
            setUploadProgress({
                trackId,
                phase: 'processing',
                progress: 100,
                message: 'Đang xử lý audio (TTS, HLS conversion)...',
            });

            // Callback để reload tracks và start polling
            onUploadSuccess(trackId);

            // Reset form and close modal
            setShowUploadModal(false);
            setUploadForm({
                name: '',
                description: '',
                voiceTagEnabled: false,
                voiceTagText: '',
            });
            setSelectedFile(null);
            setUploadProgress(null);

            showToast({
                type: 'success',
                title: '✅ Upload thành công',
                message: 'Track đang được xử lý. Bạn sẽ nhận được thông báo khi hoàn tất.',
            });
        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMessage =
                error.response?.data?.message || error.message || 'Không thể upload track';

            setUploadProgress({
                phase: 'error',
                progress: 0,
                message: errorMessage,
                error: errorMessage,
            });

            showToast({
                type: 'error',
                title: '❌ Upload thất bại',
                message: errorMessage,
            });
        }
    }, [selectedFile, projectId, milestoneId, uploadForm, showToast, onUploadSuccess]);

    // Handle version file select
    const handleVersionFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!validateFile(file)) return;

        setVersionFile(file);
    }, [validateFile]);

    // Handle upload version
    const handleUploadVersion = useCallback(async () => {
        if (!versionFile || !selectedTrackForVersion) return;

        if (versionForm.voiceTagEnabled && !versionForm.voiceTagText.trim()) {
            showToast({ type: 'error', message: 'Vui lòng nhập nội dung voice tag' });
            return;
        }

        try {
            // Phase 1: Create version
            setVersionProgress({
                phase: 'creating',
                progress: 0,
                message: 'Đang tạo version mới...',
            });

            const createRequest: CreateTrackVersionRequest = {
                description: versionForm.description.trim() || undefined,
                contentType: versionFile.type || 'audio/mpeg',
                fileSize: versionFile.size,
                voiceTagEnabled: versionForm.voiceTagEnabled,
                voiceTagText: versionForm.voiceTagEnabled ? versionForm.voiceTagText.trim() : undefined,
            };

            const createResponse = await trackService.createTrackVersion(
                selectedTrackForVersion.id,
                createRequest
            );

            const { trackId, uploadUrl } = createResponse;

            setVersionProgress({
                trackId,
                phase: 'uploading',
                progress: 0,
                message: 'Đang upload file lên S3...',
            });

            // Phase 2: Upload to S3
            await trackService.uploadToS3(
                uploadUrl,
                versionFile,
                createRequest.contentType || 'audio/mpeg',
                (progress) => {
                    setVersionProgress({
                        trackId,
                        phase: 'uploading',
                        progress,
                        message: `Đang upload... ${Math.round(progress)}%`,
                    });
                }
            );

            // Phase 3: Finalize
            setVersionProgress({
                trackId,
                phase: 'finalizing',
                progress: 100,
                message: 'Đang hoàn tất upload...',
            });

            await trackService.finalizeTrack(trackId);

            // Phase 4: Processing
            setVersionProgress({
                trackId,
                phase: 'processing',
                progress: 100,
                message: 'Đang xử lý audio (TTS, HLS conversion)...',
            });

            // Callback để reload tracks và start polling
            onUploadSuccess(trackId);

            // Reset form and close modal
            setShowVersionModal(false);
            setSelectedTrackForVersion(null);
            setVersionForm({
                description: '',
                voiceTagEnabled: false,
                voiceTagText: '',
            });
            setVersionFile(null);
            setVersionProgress(null);

            showToast({
                type: 'success',
                title: '✅ Upload version mới thành công',
                message: 'Version đang được xử lý. Bạn sẽ nhận được thông báo khi hoàn tất.',
            });
        } catch (error: any) {
            console.error('Upload version error:', error);
            const errorMessage =
                error.response?.data?.message || error.message || 'Không thể upload version mới';

            setVersionProgress({
                phase: 'error',
                progress: 0,
                message: errorMessage,
                error: errorMessage,
            });

            showToast({
                type: 'error',
                title: '❌ Upload version thất bại',
                message: errorMessage,
            });
        }
    }, [versionFile, selectedTrackForVersion, versionForm, showToast, onUploadSuccess]);

    // Modal handlers
    const openUploadModal = useCallback(() => {
        setUploadForm({
            name: '',
            description: '',
            voiceTagEnabled: false,
            voiceTagText: '',
        });
        setSelectedFile(null);
        setShowUploadModal(true);
        setUploadProgress(null);
    }, []);

    const closeUploadModal = useCallback(() => {
        if (uploadProgress && uploadProgress.phase !== 'done' && uploadProgress.phase !== 'error') {
            if (!confirm('Upload đang diễn ra. Bạn có chắc muốn hủy?')) {
                return;
            }
        }
        setShowUploadModal(false);
        setUploadProgress(null);
        setSelectedFile(null);
    }, [uploadProgress]);

    const openVersionModal = useCallback((track: TrackDetailResponse) => {
        setSelectedTrackForVersion(track);
        setVersionForm({
            description: '',
            voiceTagEnabled: false,
            voiceTagText: '',
        });
        setVersionFile(null);
        setVersionProgress(null);
        setShowVersionModal(true);
    }, []);

    const closeVersionModal = useCallback(() => {
        if (versionProgress && versionProgress.phase !== 'done' && versionProgress.phase !== 'error') {
            if (!confirm('Upload đang diễn ra. Bạn có chắc muốn hủy?')) {
                return;
            }
        }
        setShowVersionModal(false);
        setSelectedTrackForVersion(null);
        setVersionFile(null);
        setVersionProgress(null);
    }, [versionProgress]);

    return {
        // Upload track state
        uploadForm,
        setUploadForm,
        selectedFile,
        uploadProgress,
        showUploadModal,
        handleFileSelect,
        handleUpload,
        openUploadModal,
        closeUploadModal,
        // Upload version state
        selectedTrackForVersion,
        versionForm,
        setVersionForm,
        versionFile,
        versionProgress,
        showVersionModal,
        handleVersionFileSelect,
        handleUploadVersion,
        openVersionModal,
        closeVersionModal,
    };
};

