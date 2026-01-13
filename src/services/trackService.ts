import apiInstance from "../config/axiosCustom";

export interface CreateTrackRequest {
  name: string;
  description?: string;
  contentType: string;
  fileSize: number;
  voiceTagEnabled: boolean;
  voiceTagText?: string;
}

export interface CreateTrackResponse {
  trackId: number;
  uploadUrl: string;
  s3Key: string;
  expiresIn: number;
}

export interface CreateTrackVersionRequest {
  description?: string;
  voiceTagEnabled: boolean;
  voiceTagText?: string;
  contentType?: string;
  fileSize?: number;
}

export interface CreateTrackVersionResponse {
  trackId: number;
  uploadUrl: string;
  s3Key: string;
  expiresIn: number;
}

export interface UpdateTrackStatusRequest {
  status: 'INTERNAL_DRAFT' | 'INTERNAL_APPROVED' | 'INTERNAL_REJECTED';
  reason?: string;
}

export interface TrackDetailResponse {
  id: number;
  name: string;
  description?: string;
  version: string;
  rootTrackId: number | null; // ID của track version đầu tiên (để group)
  parentTrackId: number | null; // ID của track cha trực tiếp (để build tree)
  milestoneId: number;
  userId: number;
  userName: string;
  userAvatarUrl?: string | null; // Avatar URL của người tải track lên
  voiceTagEnabled: boolean;
  voiceTagText?: string;
  status: 'INTERNAL_DRAFT' | 'INTERNAL_APPROVED' | 'INTERNAL_REJECTED';
  reason?: string | null; // Lý do từ chối (từ API)
  rejectionReason?: string | null; // Alias cho reason để backward compatibility
  processingStatus: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
  errorMessage?: string | null;
  contentType: string;
  fileSize: number;
  duration?: number | null;
  hlsPlaybackUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
  expiresIn: string;
}

export interface TrackDownloadPermissionUser {
  userId: number;
  userName: string;
  userEmail: string;
  userAvatarUrl?: string | null;
  grantedByUserId: number;
  grantedByUserName: string;
  grantedAt: string;
}

export interface TrackDownloadPermissionResponse {
  users: TrackDownloadPermissionUser[];
}

const trackService = {
  /**
   * Tạo track mới và nhận upload URL
   */
  async createTrack(
    projectId: number,
    milestoneId: number,
    request: CreateTrackRequest
  ): Promise<CreateTrackResponse> {
    const response = await apiInstance.post<ApiResponse<CreateTrackResponse>>(
      `/api/v1/projects/${projectId}/milestones/${milestoneId}/tracks`,
      request
    );
    return response.data.result;
  },

  /**
   * Upload file trực tiếp lên S3
   */
  async uploadToS3(
    uploadUrl: string,
    file: File,
    contentType: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', contentType);
      xhr.send(file);
    });
  },

  /**
   * Finalize upload và trigger processing
   */
  async finalizeTrack(trackId: number): Promise<void> {
    await apiInstance.post<ApiResponse<void>>(
      `/api/v1/tracks/${trackId}/finalize`
    );
  },

  /**
   * Lấy chi tiết track
   */
  async getTrackDetails(trackId: number): Promise<TrackDetailResponse> {
    const response = await apiInstance.get<ApiResponse<TrackDetailResponse>>(
      `/api/v1/tracks/${trackId}`
    );
    return response.data.result;
  },

  /**
   * Lấy danh sách tracks trong milestone
   */
  async getTracksList(milestoneId: number): Promise<TrackDetailResponse[]> {
    const response = await apiInstance.get<ApiResponse<TrackDetailResponse[]>>(
      `/api/v1/milestones/${milestoneId}/tracks`
    );
    return response.data.result;
  },

  /**
   * Lấy playback URL
   */
  async getPlaybackUrl(trackId: number): Promise<string> {
    const response = await apiInstance.get<ApiResponse<string>>(
      `/api/v1/tracks/${trackId}/playback-url`
    );
    return response.data.result;
  },

  /**
   * Tạo version mới của track hiện có
   */
  async createTrackVersion(
    trackId: number,
    request: CreateTrackVersionRequest
  ): Promise<CreateTrackVersionResponse> {
    const response = await apiInstance.post<ApiResponse<CreateTrackVersionResponse>>(
      `/api/v1/tracks/${trackId}/versions`,
      request
    );
    return response.data.result;
  },

  /**
   * Cập nhật trạng thái track (chỉ OWNER)
   */
  async updateTrackStatus(
    trackId: number,
    request: UpdateTrackStatusRequest
  ): Promise<TrackDetailResponse> {
    const response = await apiInstance.put<ApiResponse<TrackDetailResponse>>(
      `/api/v1/tracks/${trackId}/status`,
      request
    );
    return response.data.result;
  },

  /**
   * Xóa track
   * DELETE /api/v1/milestones/tracks/{trackId}
   */
  async deleteTrack(trackId: number): Promise<void> {
    await apiInstance.delete<ApiResponse<void>>(`/api/v1/milestones/tracks/${trackId}`);
  },

  /**
   * Lấy download URL cho track (presigned URL từ S3)
   * GET /api/v1/tracks/{trackId}/download-url
   */
  async getDownloadUrl(trackId: number): Promise<DownloadUrlResponse> {
    const response = await apiInstance.get<ApiResponse<DownloadUrlResponse>>(
      `/api/v1/tracks/${trackId}/download-url`
    );
    return response.data.result;
  },

  /**
   * Lấy danh sách users có quyền download track
   * GET /api/v1/tracks/{trackId}/download-permissions
   */
  async getTrackDownloadPermissions(
    trackId: number
  ): Promise<TrackDownloadPermissionResponse> {
    const response = await apiInstance.get<ApiResponse<TrackDownloadPermissionResponse>>(
      `/api/v1/tracks/${trackId}/download-permissions`
    );
    return response.data.result;
  },

  /**
   * Thay thế toàn bộ danh sách quyền download cho track
   * PUT /api/v1/tracks/{trackId}/download-permissions
   */
  async updateTrackDownloadPermissions(
    trackId: number,
    userIds: number[]
  ): Promise<void> {
    await apiInstance.put<ApiResponse<void>>(
      `/api/v1/tracks/${trackId}/download-permissions`,
      { userIds }
    );
  },

  /**
   * Thêm quyền download cho track (không thay thế danh sách hiện có)
   * POST /api/v1/tracks/{trackId}/download-permissions
   */
  async grantTrackDownloadPermissions(
    trackId: number,
    userIds: number[]
  ): Promise<void> {
    await apiInstance.post<ApiResponse<void>>(
      `/api/v1/tracks/${trackId}/download-permissions`,
      { userIds }
    );
  },

  /**
   * Hủy quyền download cho user cụ thể
   * DELETE /api/v1/tracks/{trackId}/download-permissions/{userId}
   */
  async revokeTrackDownloadPermission(
    trackId: number,
    userId: number
  ): Promise<void> {
    await apiInstance.delete<ApiResponse<void>>(
      `/api/v1/tracks/${trackId}/download-permissions/${userId}`
    );
  },
};

export default trackService;



