import apiInstance from "../config/axiosCustom";

interface ApiResponse<T> {
    code: number;
    message?: string;
    result?: T;
}

export interface FollowResponse {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    avatarUrl: string | null;
    location: string | null;
}

export interface FollowListResponse {
    page: {
        content: FollowResponse[];
        totalElements: number;
        totalPages: number;
        size: number;
        number: number;
    };
    totalFollowers: number;
    totalFollowing: number;
}

class FollowService {
    private extractErrorMessage(error: any): string {
        if (error?.response?.status === 401)
            return "Phiên đăng nhập hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại.";
        if (error?.response?.data?.message) return error.response.data.message;
        if (error?.message) return error.message;
        return "Có lỗi xảy ra. Vui lòng thử lại.";
    }

    /**
     * Follow a user
     * @param targetId - User ID to follow
     */
    public async follow(targetId: number): Promise<void> {
        try {
            const res = await apiInstance.post<ApiResponse<void>>(
                `/api/v1/users/${targetId}/follow`,
                {}
            );

            const data = res.data;
            if (data.code === 200 || data.code === 0) {
                return;
            }
            throw new Error(data.message || "Invalid response structure from server.");
        } catch (error: any) {
            const errorMessage = this.extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Unfollow a user
     * @param targetId - User ID to unfollow
     */
    public async unfollow(targetId: number): Promise<void> {
        try {
            const res = await apiInstance.delete<ApiResponse<void>>(
                `/api/v1/users/${targetId}/follow`
            );

            const data = res.data;
            if (data.code === 200 || data.code === 0) {
                return;
            }
            throw new Error(data.message || "Invalid response structure from server.");
        } catch (error: any) {
            const errorMessage = this.extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Check if current user is following a target user
     * @param targetId - User ID to check
     * @returns true if following, false otherwise
     */
    public async isFollowing(targetId: number): Promise<boolean> {
        try {
            const res = await apiInstance.get<ApiResponse<{ following: boolean }>>(
                `/api/v1/users/${targetId}/follow/status`
            );

            const data = res.data;
            if ((data.code === 200 || data.code === 0) && data.result) {
                return data.result.following;
            }
            throw new Error(data.message || "Invalid response structure from server.");
        } catch (error: any) {
            const errorMessage = this.extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Get followers of a user
     * @param userId - User ID
     * @param page - Page number (0-indexed)
     * @param size - Page size
     * @returns Follow list response with pagination
     */
    public async getFollowers(
        userId: number,
        page: number = 0,
        size: number = 20
    ): Promise<FollowListResponse> {
        try {
            const res = await apiInstance.get<ApiResponse<FollowListResponse>>(
                `/api/v1/users/${userId}/followers`,
                {
                    params: { page, size },
                }
            );

            const data = res.data;
            if ((data.code === 200 || data.code === 0) && data.result) {
                return data.result;
            }
            throw new Error(data.message || "Invalid response structure from server.");
        } catch (error: any) {
            const errorMessage = this.extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Get following list of a user
     * @param userId - User ID
     * @param page - Page number (0-indexed)
     * @param size - Page size
     * @returns Follow list response with pagination
     */
    public async getFollowing(
        userId: number,
        page: number = 0,
        size: number = 20
    ): Promise<FollowListResponse> {
        try {
            const res = await apiInstance.get<ApiResponse<FollowListResponse>>(
                `/api/v1/users/${userId}/following`,
                {
                    params: { page, size },
                }
            );

            const data = res.data;
            if ((data.code === 200 || data.code === 0) && data.result) {
                return data.result;
            }
            throw new Error(data.message || "Invalid response structure from server.");
        } catch (error: any) {
            const errorMessage = this.extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }
}

export const followService = new FollowService();

