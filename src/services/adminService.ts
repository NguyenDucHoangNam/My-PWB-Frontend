import apiInstance from "@/config/axiosCustom";

export type UserRole = "ADMIN" | "PRODUCER" | "CUSTOMER";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface UserListItemResponse {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  location?: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface GetUsersParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
  keyword?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UserDetailResponse {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  location?: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
}

export const adminUserService = {
  async getUsers(params?: GetUsersParams) {
    const { data } = await apiInstance.get<ApiResponse<PageResponse<UserListItemResponse>>>(
      "/api/v1/admin/users",
      { params }
    );
    return data.result;
  },

   async getUserDetail(userId: number): Promise<UserDetailResponse> {
    const { data } = await apiInstance.get<ApiResponse<UserDetailResponse>>(
      `/api/v1/admin/users/${userId}`
    );
    return data.result;
  },

  async deactivateUser(userId: number): Promise<UserDetailResponse> {
    const { data } = await apiInstance.put<ApiResponse<UserDetailResponse>>(
      `/api/v1/admin/users/${userId}/deactivate`
    );
    return data.result;
  },

  async activateUser(userId: number): Promise<UserDetailResponse> {
    const { data } = await apiInstance.put<ApiResponse<UserDetailResponse>>(
      `/api/v1/admin/users/${userId}/activate`
    );
    return data.result;
  },
};