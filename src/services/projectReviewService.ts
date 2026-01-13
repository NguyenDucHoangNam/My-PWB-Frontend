import axios from "../config/axiosCustom";

export interface ProjectReviewRequest {
  rating: number;
  comment?: string;
  allowPublicPortfolio?: boolean;
}

export interface ProjectReviewResponse {
  id: number;
  projectId: number;
  projectTitle: string;
  producerName: string;
  rating: number;
  comment: string;
  allowPublicPortfolio: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

const projectReviewService = {
  /**
   * Tạo đánh giá cho một dự án đã hoàn thành
   * @param projectId ID của dự án
   * @param request Thông tin đánh giá
   */
  async createReview(
    projectId: number,
    request: ProjectReviewRequest
  ): Promise<ProjectReviewResponse> {
    const response = await axios.post<ApiResponse<ProjectReviewResponse>>(
      `/api/v1/projects/${projectId}/reviews`,
      request
    );
    return response.data.result;
  },

  /**
   * Lấy đánh giá của một dự án
   * @param projectId ID của dự án
   */
  async getProjectReview(projectId: number): Promise<ProjectReviewResponse> {
    const response = await axios.get<ApiResponse<ProjectReviewResponse>>(
      `/api/v1/projects/${projectId}/reviews`
    );
    return response.data.result;
  },

  /**
   * Cập nhật đánh giá của dự án
   * @param projectId ID của dự án
   * @param request Thông tin cập nhật
   */
  async updateReview(
    projectId: number,
    request: ProjectReviewRequest
  ): Promise<ProjectReviewResponse> {
    const response = await axios.put<ApiResponse<ProjectReviewResponse>>(
      `/api/v1/projects/${projectId}/reviews`,
      request
    );
    return response.data.result;
  },

  /**
   * Xóa đánh giá của dự án
   * @param projectId ID của dự án
   */
  async deleteReview(projectId: number): Promise<void> {
    await axios.delete(`/api/v1/projects/${projectId}/reviews`);
  },

  /**
   * Lấy portfolio công khai của producer
   * @param producerId ID của producer
   */
  async getProducerPortfolio(
    producerId: number
  ): Promise<ProjectReviewResponse[]> {
    const response = await axios.get<ApiResponse<ProjectReviewResponse[]>>(
      `/api/v1/producers/${producerId}/portfolio`
    );
    return response.data.result;
  },
};

export default projectReviewService;

