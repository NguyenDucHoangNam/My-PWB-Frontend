import apiInstance from "../config/axiosCustom";
import { TrackDetailResponse } from "./trackService";

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

/**
 * Delivery Response từ API
 * 
 * Lưu ý: Interface này được dùng cho nhiều API:
 * - GET /api/v1/milestones/{milestoneId}/client-tracks: chỉ có id, trackId, status, sentBy, sentByName, sentAt, note
 * - POST /api/v1/tracks/{trackId}/send-to-client: có thể có thêm trackName, milestoneId, productCountRemaining
 * - PUT /api/v1/client-deliveries/{deliveryId}/status: có thể có thêm trackName, milestoneId, productCountRemaining
 */
export interface ClientDeliveryResponse {
  id: number;
  trackId: number;
  trackName?: string; // Có trong send-to-client và update-status response, không có trong client-tracks
  milestoneId?: number; // Có trong send-to-client và update-status response, không có trong client-tracks
  sentBy: number;
  sentByName: string;
  status: "DELIVERED" | "REJECTED" | "REQUEST_EDIT" | "ACCEPTED";
  sentAt: string;
  note?: string; // Ghi chú từ Producer khi gửi (status=DELIVERED) hoặc lý do từ Client (status=REJECTED/REQUEST_EDIT/ACCEPTED)
  productCountRemaining?: number; // Có trong send-to-client và update-status response, không có trong client-tracks
}

/**
 * Request để gửi track cho client
 */
export interface SendTrackToClientRequest {
  note?: string;
}

/**
 * Request để cập nhật trạng thái delivery
 */
export interface UpdateDeliveryStatusRequest {
  status: "REJECTED" | "REQUEST_EDIT" | "ACCEPTED";
  reason?: string | null;
}

/**
 * Response khi lấy danh sách tracks trong Client Room
 */
export interface ClientTrackItem {
  track: TrackDetailResponse;
  delivery: ClientDeliveryResponse;
  sentAt: string;
}

/**
 * Response thông tin quota milestone
 */
export interface ProductCountRemainingResponse {
  productCountRemaining: number;
  editCountRemaining: number;
}

const clientDeliveryService = {
  /**
   * Gửi track cho Client (Owner only)
   * POST /api/v1/tracks/{trackId}/send-to-client
   */
  async sendTrackToClient(
    trackId: number,
    request: SendTrackToClientRequest
  ): Promise<ClientDeliveryResponse> {
    const response = await apiInstance.post<ApiResponse<ClientDeliveryResponse>>(
      `/api/v1/tracks/${trackId}/send-to-client`,
      request
    );
    return response.data.result;
  },

  /**
   * Lấy danh sách tracks trong Client Room
   * GET /api/v1/milestones/{milestoneId}/client-tracks
   */
  async getClientTracks(milestoneId: number): Promise<ClientTrackItem[]> {
    const response = await apiInstance.get<ApiResponse<ClientTrackItem[]>>(
      `/api/v1/milestones/${milestoneId}/client-tracks`
    );
    return response.data.result;
  },

  /**
   * Cập nhật trạng thái delivery (Client phản hồi)
   * PUT /api/v1/client-deliveries/{deliveryId}/status
   */
  async updateDeliveryStatus(
    deliveryId: number,
    request: UpdateDeliveryStatusRequest
  ): Promise<ClientDeliveryResponse> {
    const response = await apiInstance.put<ApiResponse<ClientDeliveryResponse>>(
      `/api/v1/client-deliveries/${deliveryId}/status`,
      request
    );
    return response.data.result;
  },

  /**
   * Chấp nhận delivery (Client chấp nhận sản phẩm)
   * PUT /api/v1/client-deliveries/{deliveryId}/status
   * reason không bắt buộc, có thể null
   */
  async acceptDelivery(deliveryId: number, reason?: string | null): Promise<ClientDeliveryResponse> {
    return this.updateDeliveryStatus(deliveryId, {
      status: "ACCEPTED",
      reason: reason || null,
    });
  },

  /**
   * Lấy thông tin quota (số lượt gửi còn lại)
   * GET /api/v1/milestones/{milestoneId}/quota
   * 
   * Permission: Owner, Admin, Client, Observer (nếu funded)
   */
  async getQuota(
    milestoneId: number
  ): Promise<ProductCountRemainingResponse> {
    const response = await apiInstance.get<ApiResponse<ProductCountRemainingResponse>>(
      `/api/v1/milestones/${milestoneId}/quota`
    );
    return response.data.result;
  },

  /**
   * Hủy delivery (Owner only)
   * DELETE /api/v1/client-deliveries/{deliveryId}
   */
  async cancelDelivery(deliveryId: number): Promise<void> {
    await apiInstance.delete<ApiResponse<void>>(
      `/api/v1/client-deliveries/${deliveryId}`
    );
  },

  /**
   * Lấy track detail trong Client Room
   * GET /api/v1/client-deliveries/{deliveryId}/track-detail
   */
  async getTrackDetail(deliveryId: number): Promise<ClientTrackResponse> {
    const response = await apiInstance.get<ApiResponse<ClientTrackResponse>>(
      `/api/v1/client-deliveries/${deliveryId}/track-detail`
    );
    return response.data.result;
  },
};

/**
 * Response khi lấy track detail trong Client Room
 */
export interface ClientTrackResponse {
  track: TrackDetailResponse;
  delivery: ClientDeliveryResponse;
  sentAt: string;
}

export default clientDeliveryService;

