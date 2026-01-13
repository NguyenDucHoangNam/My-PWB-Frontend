import apiInstance from "../config/axiosCustom";

export interface UserProfileResponse {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  dateOfBirth: string | null; // ISO date string from backend
  avatarUrl: string | null;
  location: string | null;
  role: string;
  cccdNumber: string | null;
  cccdIssueDate: string | null;
  cccdIssuePlace: string | null;
  isVerified: boolean | null;
}

export interface UpdatePersonalProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // Format: "yyyy-MM-dd"
  avatarUrl?: string;
  location?: string;
}

export interface SaveCccdInfoRequest {
  cccdNumber?: string;
  cccdFullName?: string;
  cccdBirthDay?: string;
  cccdGender?: string;
  cccdOriginLocation?: string;
  cccdRecentLocation?: string;
  cccdIssueDate?: string;
  cccdIssuePlace?: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

class UserService {
  /**
   * Lấy thông tin profile cá nhân của user hiện tại
   */
  async getPersonalProfile(): Promise<UserProfileResponse> {
    try {
      const response = await apiInstance.get<ApiResponse<UserProfileResponse>>(
        "/api/v1/users/profile"
      );

      if (response.data.code === 200 && response.data.result) {
        return response.data.result;
      }

      throw new Error(response.data.message || "Không thể lấy thông tin profile");
    } catch (error: any) {
      console.error("Get personal profile API error:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error(error.message || "Có lỗi xảy ra khi lấy thông tin profile");
    }
  }

  /**
   * Cập nhật thông tin profile cá nhân
   */
  async updatePersonalProfile(
    request: UpdatePersonalProfileRequest,
    avatar?: File
  ): Promise<UserProfileResponse> {
    try {
      const formData = new FormData();

      // Add avatar file if provided
      if (avatar) {
        formData.append("avatar", avatar);
      }

      // Add JSON data
      formData.append(
        "data",
        new Blob([JSON.stringify(request)], { type: "application/json" })
      );

      const response = await apiInstance.put<ApiResponse<UserProfileResponse>>(
        "/api/v1/users/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.code === 200 && response.data.result) {
        return response.data.result;
      }

      throw new Error(response.data.message || "Không thể cập nhật profile");
    } catch (error: any) {
      console.error("Update personal profile API error:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error(error.message || "Có lỗi xảy ra khi cập nhật profile");
    }
  }

  async saveCccdInfo(request: SaveCccdInfoRequest): Promise<void> {
    try {
      const response = await apiInstance.post<ApiResponse<null>>(
        "/api/v1/users/save-cccd-info",
        request
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.message || "Không thể lưu thông tin CCCD");
      }
    } catch (error: any) {
      console.error("Save CCCD info API error:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error(error.message || "Có lỗi xảy ra khi lưu thông tin CCCD");
    }
  }
}

export const userService = new UserService();
export default userService;

