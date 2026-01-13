import axiosCustom from '../config/axiosCustom';

// ==================== Types ====================

export interface UserBasicInfo {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
}

export type CommentStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export interface TrackCommentResponse {
    id: number;
    trackId: number;
    user: UserBasicInfo;
    content: string;
    timestamp: number | null;
    status: CommentStatus;
    parentCommentId: number | null;
    replyCount: number;
    replies: TrackCommentResponse[] | null;
    createdAt: string;
    updatedAt: string;
}

export interface TrackCommentStatisticsResponse {
    trackId: number;
    totalComments: number;
    pendingComments: number;
    inProgressComments: number;
    resolvedComments: number;
}

export interface CreateCommentRequest {
    content: string;
    timestamp?: number | null;
    parentCommentId?: number | null;
}

export interface UpdateCommentRequest {
    content: string;
}

export interface UpdateCommentStatusRequest {
    status: CommentStatus;
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    numberOfElements: number;
}

// ==================== API Service ====================

const commentService = {
    /**
     * 1. Create Comment
     * POST /api/v1/tracks/{trackId}/comments
     */
    createComment: async (
        trackId: number,
        request: CreateCommentRequest
    ): Promise<TrackCommentResponse> => {
        const response = await axiosCustom.post(`/api/v1/tracks/${trackId}/comments`, request);
        return response.data.result;
    },

    /**
     * 2. Get Root Comments (Pagination)
     * GET /api/v1/tracks/{trackId}/comments
     */
    getRootComments: async (
        trackId: number,
        page: number = 0,
        size: number = 20
    ): Promise<PaginatedResponse<TrackCommentResponse>> => {
        const response = await axiosCustom.get(`/api/v1/tracks/${trackId}/comments`, {
            params: { page, size },
        });
        return response.data.result;
    },

    /**
     * 3. Get Comment By ID
     * GET /api/v1/comments/{commentId}
     */
    getCommentById: async (commentId: number): Promise<TrackCommentResponse> => {
        const response = await axiosCustom.get(`/api/v1/comments/${commentId}`);
        return response.data.result;
    },

    /**
     * 4. Get Replies By Comment
     * GET /api/v1/comments/{commentId}/replies
     */
    getRepliesByComment: async (commentId: number): Promise<TrackCommentResponse[]> => {
        const response = await axiosCustom.get(`/api/v1/comments/${commentId}/replies`);
        return response.data.result;
    },

    /**
     * 5. Update Comment
     * PUT /api/v1/comments/{commentId}
     */
    updateComment: async (
        commentId: number,
        request: UpdateCommentRequest
    ): Promise<TrackCommentResponse> => {
        const response = await axiosCustom.put(`/api/v1/comments/${commentId}`, request);
        return response.data.result;
    },

    /**
     * 6. Delete Comment
     * DELETE /api/v1/comments/{commentId}
     */
    deleteComment: async (commentId: number): Promise<void> => {
        await axiosCustom.delete(`/api/v1/comments/${commentId}`);
    },

    /**
     * 7. Update Comment Status
     * PUT /api/v1/comments/{commentId}/status
     */
    updateCommentStatus: async (
        commentId: number,
        request: UpdateCommentStatusRequest
    ): Promise<TrackCommentResponse> => {
        const response = await axiosCustom.put(`/api/v1/comments/${commentId}/status`, request);
        return response.data.result;
    },

    /**
     * 8. Get Comment Statistics
     * GET /api/v1/tracks/{trackId}/comments/statistics
     */
    getCommentStatistics: async (
        trackId: number
    ): Promise<TrackCommentStatisticsResponse> => {
        const response = await axiosCustom.get(`/api/v1/tracks/${trackId}/comments/statistics`);
        return response.data.result;
    },

    /**
     * 9. Get Comments By Timestamp
     * GET /api/v1/tracks/{trackId}/comments/by-timestamp
     */
    getCommentsByTimestamp: async (
        trackId: number,
        timestamp: number
    ): Promise<TrackCommentResponse[]> => {
        const response = await axiosCustom.get(`/api/v1/tracks/${trackId}/comments/by-timestamp`, {
            params: { timestamp },
        });
        return response.data.result;
    },

    // ==================== Client Room Comment APIs ====================

    /**
     * 10. Create Comment in Client Room
     * POST /api/v1/client-deliveries/{deliveryId}/comments
     */
    createClientRoomComment: async (
        deliveryId: number,
        request: CreateCommentRequest
    ): Promise<TrackCommentResponse> => {
        const response = await axiosCustom.post(`/api/v1/client-deliveries/${deliveryId}/comments`, request);
        return response.data.result;
    },

    /**
     * 11. Get Root Comments in Client Room (Pagination)
     * GET /api/v1/client-deliveries/{deliveryId}/comments
     */
    getClientRoomRootComments: async (
        deliveryId: number,
        page: number = 0,
        size: number = 20
    ): Promise<PaginatedResponse<TrackCommentResponse>> => {
        const response = await axiosCustom.get(`/api/v1/client-deliveries/${deliveryId}/comments`, {
            params: { page, size },
        });
        return response.data.result;
    },

    /**
     * 12. Get Replies By Comment in Client Room
     * GET /api/v1/client-deliveries/comments/{commentId}/replies
     */
    getClientRoomRepliesByComment: async (commentId: number): Promise<TrackCommentResponse[]> => {
        const response = await axiosCustom.get(`/api/v1/client-deliveries/comments/${commentId}/replies`);
        return response.data.result;
    },

    /**
     * 13. Get Comments By Timestamp in Client Room
     * GET /api/v1/client-deliveries/{deliveryId}/comments/by-timestamp
     */
    getClientRoomCommentsByTimestamp: async (
        deliveryId: number,
        timestamp: number
    ): Promise<TrackCommentResponse[]> => {
        const response = await axiosCustom.get(`/api/v1/client-deliveries/${deliveryId}/comments/by-timestamp`, {
            params: { timestamp },
        });
        return response.data.result;
    },

    /**
     * 14. Get Comment Statistics in Client Room
     * GET /api/v1/client-deliveries/{deliveryId}/comments/statistics
     */
    getClientRoomCommentStatistics: async (
        deliveryId: number
    ): Promise<TrackCommentStatisticsResponse> => {
        const response = await axiosCustom.get(`/api/v1/client-deliveries/${deliveryId}/comments/statistics`);
        return response.data.result;
    },
};

export default commentService;

