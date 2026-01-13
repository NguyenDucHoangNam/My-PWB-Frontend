import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ExplanationRequest,
  ExplanationResponse,
  ApiResponse,
  AiExplanationError,
} from '../types/aiExplanation';
import { AI_EXPLANATION_CONFIG } from '../config/aiExplanationConfig';

// ========================================
// Create Axios Instance (No Auth Token)
// ========================================
const aiApiInstance: AxiosInstance = axios.create({
  baseURL: AI_EXPLANATION_CONFIG.api.baseUrl,
  timeout: AI_EXPLANATION_CONFIG.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================================
// API Methods
// ========================================

class AiExplanationService {
  /**
   * Get explanation for highlighted text
   */
  async getExplanation(
    request: ExplanationRequest
  ): Promise<ExplanationResponse> {
    try {
      const { data } = await aiApiInstance.post<ApiResponse<ExplanationResponse>>(
        AI_EXPLANATION_CONFIG.api.endpoints.explain,
        {
          highlightedText: request.highlightedText.trim(),
          contextText: request.contextText?.trim() || '',
          maxRelatedTerms: request.maxRelatedTerms || 3,
          language: request.language || 'vi',
        }
      );

      // Backend returns ApiResponse<T> format
      if (data.code === 200 && data.result) {
        return data.result;
      }

      throw new Error(data.message || 'Unknown error');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { data } = await aiApiInstance.get<ApiResponse<string>>(
        AI_EXPLANATION_CONFIG.api.endpoints.health
      );
      return data.code === 200;
    } catch {
      return false;
    }
  }

  /**
   * Error handler
   */
  private handleError(error: unknown): AiExplanationError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse<any>>;

      // Rate limit (429)
      if (axiosError.response?.status === 429) {
        return {
          code: 429,
          message: 'Bạn đã hết lượt sử dụng miễn phí. Vui lòng thử lại sau 1 phút.',
          type: 'RATE_LIMIT',
        };
      }

      // Service unavailable (503)
      if (axiosError.response?.status === 503) {
        return {
          code: 503,
          message: 'AI đang bận. Vui lòng thử lại sau!',
          type: 'SERVICE_UNAVAILABLE',
        };
      }

      // Backend error response
      if (axiosError.response?.data?.message) {
        return {
          code: axiosError.response.data.code || 500,
          message: axiosError.response.data.message,
          type: 'UNKNOWN',
        };
      }

      // Network error
      if (axiosError.code === 'ECONNABORTED' || !axiosError.response) {
        return {
          code: 0,
          message: 'Không có kết nối internet. Kiểm tra lại nhé!',
          type: 'NETWORK_ERROR',
        };
      }
    }

    // Unknown error
    return {
      code: 500,
      message: 'Có lỗi xảy ra. Vui lòng thử lại!',
      type: 'UNKNOWN',
    };
  }
}

export const aiExplanationService = new AiExplanationService();
