import apiInstance from "../config/axiosCustom";

export interface ClassifyResult {
    type: number;
    name: string;
}

export interface CardLivenessResult {
    liveness: string;
    liveness_msg: string;
    face_swapping: boolean;
    fake_liveness: boolean;
}

export interface FaceLivenessResult {
    liveness: string;
    liveness_msg: string;
    is_eye_open: string;
}

export interface CompareFaceResult {
    result: string;
    msg: string;
}

export interface CccdInfoResponse {
    // Thông tin OCR từ CCCD (OcrIdObject)
    // Note: API response uses camelCase, not snake_case
    id: string;
    name: string;
    cardType: string;
    birthDay: string;
    gender: string;
    originLocation: string;
    recentLocation: string;
    expireWarning?: string | null;
    issuePlace: string;
    issueDate: string;
    backExpireWarning?: string | null;

    // Kết quả Classify (ClassifyObject)
    classify: ClassifyResult | null;

    // Kết quả Card Liveness (CardLivenessObject)
    cardLiveness: CardLivenessResult | null;

    // Kết quả Face Liveness (FaceLivenessObject)
    faceLiveness: FaceLivenessResult | null;

    // Kết quả Compare Face (CompareFaceObject)
    compareFace: CompareFaceResult | null;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    result: T | null;
}

class EkycService {
    // Lấy token eKYC từ backend
    async getToken(): Promise<string> {
        try {
            const response = await apiInstance.get<ApiResponse<string>>(
                "/api/v1/ekyc/get-token"
            );

            if (response.data.code === 200 && response.data.result) {
                return response.data.result;
            }

            throw new Error(response.data.message || "Không thể lấy token eKYC");
        } catch (error: any) {
            console.error("Lỗi khi lấy token eKYC:", error);
            throw new Error(error.response?.data?.message || error.message || "Lỗi khi lấy token eKYC");
        }
    }
    async verifyCccd(
        frontImage: File,
        backImage: File,
        faceImage?: File
    ): Promise<ApiResponse<CccdInfoResponse>> {
        const formData = new FormData();
        formData.append("front", frontImage);
        formData.append("back", backImage);

        // Face image is optional
        if (faceImage) {
            formData.append("face", faceImage);
        }

        try {
            const response = await apiInstance.post<ApiResponse<CccdInfoResponse>>(
                "/api/v1/ekyc/verify-cccd",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            // Handle different error types
            if (error.response) {
                // Server responded with error status
                const errorData = error.response.data;
                if (errorData?.message) {
                    throw new Error(errorData.message);
                }
                throw new Error(error.response.statusText || "Xác thực CCCD thất bại");
            } else if (error.request) {
                // Request was made but no response received
                throw new Error("Không thể kết nối đến server. Vui lòng thử lại sau.");
            } else {
                // Something else happened
                throw new Error(error.message || "Có lỗi xảy ra khi xác thực CCCD");
            }
        }
    }
}

export const ekycService = new EkycService();
export default ekycService;