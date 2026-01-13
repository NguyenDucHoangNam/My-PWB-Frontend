import apiInstance from "../config/axiosCustom";
import type {
  TerminationPreviewResponse,
  TerminationExecuteResponse,
  TerminationDetailResponse,
} from "../types/contract";

// Re-export termination types from types/contract
export type {
  TeamMemberPreview,
  TerminationPreviewResponse,
  TerminationExecuteResponse,
  TeamPaymentDetail,
  TaxRecordDetail,
  TerminationDetailResponse,
} from "../types/contract";

export type ContractStatus = "DRAFT" | "OUT_FOR_SIGNATURE" | "PARTIALLY_SIGNED" | "SIGNED" | "PAID" | "COMPLETED" | "DECLINED" | "VOIDED" | "EXPIRED" | "TERMINATED";

export interface ApiResponse<T> {
  code: number;
  message?: string;
  result?: T;
}

export interface ContractMetadata {
  id: number;
  signnowStatus: ContractStatus | "PENDING" | null;
  documentType: "SIGNED" | "FILLED";
  documentVersion: number;
  documentUrl: string; // presigned URL (inline)
  is_funded?: number | boolean; // snake_case (legacy) - calculated from status: PAID or COMPLETED
  isFunded?: number | boolean; // camelCase (new API format) - calculated from status: PAID or COMPLETED
}

// Helper function to calculate isFunded from contract status
// Check cả PAID, COMPLETED và TERMINATED vì TERMINATED có tất cả quyền như PAID và COMPLETED
export const calculateIsFunded = (status: ContractStatus | "PENDING" | null | undefined): boolean => {
  return status === "PAID" || status === "COMPLETED" || status === "TERMINATED";
};

// Helper function to calculate isPaid from addendum status
// Check cả PAID, COMPLETED và TERMINATED vì TERMINATED có tất cả quyền như PAID và COMPLETED
export const calculateIsPaid = (status: ContractStatus | "PENDING" | null | undefined): boolean => {
  return status === "PAID" || status === "COMPLETED" || status === "TERMINATED";
};

export interface ContractFillBodyBase {
  contractNo?: string;
  signDate: string; // yyyy-MM-dd
  signPlace?: string;
  percent: string; // Bắt buộc

  // Bên A (Producer)
  aName: string;
  aCccd: string;
  aCccdIssueDate: string; // yyyy-MM-dd
  aCccdIssuePlace: string;
  aAddress: string;
  aPhone?: string;

  // Bên B (Client)
  bName: string;
  bCccd: string;
  bCccdIssueDate: string; // yyyy-MM-dd
  bCccdIssuePlace: string;
  bAddress: string;
  bPhone?: string;

  // Hạng mục 1 (Bắt buộc)
  line1Item: string;
  line1Unit: string;
  line1Qty: number;
  line1Price: string;
  line1Amount: string;

  // Hạng mục 2-10 (Tùy chọn)
  line2Item?: string;
  line2Unit?: string;
  line2Qty?: number;
  line2Price?: string;
  line2Amount?: string;

  line3Item?: string;
  line3Unit?: string;
  line3Qty?: number;
  line3Price?: string;
  line3Amount?: string;

  line4Item?: string;
  line4Unit?: string;
  line4Qty?: number;
  line4Price?: string;
  line4Amount?: string;

  line5Item?: string;
  line5Unit?: string;
  line5Qty?: number;
  line5Price?: string;
  line5Amount?: string;

  line6Item?: string;
  line6Unit?: string;
  line6Qty?: number;
  line6Price?: string;
  line6Amount?: string;

  line7Item?: string;
  line7Unit?: string;
  line7Qty?: number;
  line7Price?: string;
  line7Amount?: string;

  line8Item?: string;
  line8Unit?: string;
  line8Qty?: number;
  line8Price?: string;
  line8Amount?: string;

  line9Item?: string;
  line9Unit?: string;
  line9Qty?: number;
  line9Price?: string;
  line9Amount?: string;

  line10Item?: string;
  line10Unit?: string;
  line10Qty?: number;
  line10Price?: string;
  line10Amount?: string;

  // Phương thức thanh toán
  payOnce?: boolean;      // Thanh toán một lần
  payMilestone?: boolean; // Thanh toán theo cột mốc
  
  // Điều khoản bổ sung
  additionalTerms?: string; // Các điều khoản bổ sung (nếu có)
}

export interface MilestoneItem {
  title: string;
  description?: string;
  amount: string;
  dueDate: string; // yyyy-MM-dd
  editCount: number;
  productCount: number; // số lượng sản phẩm cho cột mốc
}

export interface ContractFillBodyPayOnce extends ContractFillBodyBase {
  fpEditAmount?: number; // Số lần chỉnh sửa (nếu thanh toán một lần)
}

export interface ContractFillBodyMilestones extends ContractFillBodyBase {
  milestones?: MilestoneItem[]; // Danh sách cột mốc (nếu thanh toán theo cột mốc)
}

export interface StartSigningSigner {
  fullName: string;
  email: string;
  roleName?: string;
  roleId?: string;
  order?: number;
}

export interface StartSigningRequest {
  pdfBase64?: string;           // PDF tùy chỉnh (base64)
  signingMode?: "EMAIL" | "EMBEDDED"; // Tùy chọn, mặc định EMAIL phía server
  useFieldInvite?: boolean;     // Tùy chọn, mặc định true phía server
  signers?: StartSigningSigner[]; // Tùy chọn - hệ thống có thể tự động tạo
}

export interface StartSigningResponse {
  inviteId: string;
}

export interface AddendumMilestoneItem {
  milestoneId?: number | null; // Optional - ID milestone (nếu update milestone có sẵn)
  title?: string | null; // Required nếu milestoneId = null
  description?: string | null; // Optional
  numOfMoney?: number | null; // Required nếu milestoneId = null
  numOfEdit?: number | null; // Optional
  numOfRefresh?: number | null; // Optional
}

export interface AddendumFillBody {
  addendumNo: string; // Required - Số phụ lục
  signDate: string; // Required - Ngày ký (yyyy-MM-dd)
  signPlace?: string; // Optional - Nơi ký
  title: string; // Required - Tiêu đề phụ lục
  effectiveDate?: string; // Optional - Ngày hiệu lực (yyyy-MM-dd)
  additional?: string; // Optional - Nội dung bổ sung
  
  // Cho FULL payment type
  numofmoney?: number; // Required nếu không có milestones
  numofedit?: number; // Optional - Số lần chỉnh sửa
  numofrefresh?: number; // Optional - Số lần refresh
  
  // Cho MILESTONE payment type
  milestones?: AddendumMilestoneItem[]; // Required nếu contract là MILESTONE
}

export interface AddendumItem {
  id: number;
  addendumNumber: number;
  version: number;
  title: string;
  effectiveDate: string; // yyyy-MM-dd
  signnowStatus: ContractStatus;
  isPaid: boolean; // calculated from status: PAID or COMPLETED
  documentType: "SIGNED" | "FILLED";
  documentUrl: string;
}

export interface LatestAddendumMetadata {
  id: number;
  addendumNumber: number;
  title: string;
  version: number;
  effectiveDate: string;
  signnowStatus: ContractStatus | "PENDING" | null;
  numOfMoney: number | null;
  numOfEdit: number | null;
  numOfRefresh: number | null;
  pitTax: number | null;
  vatTax: number | null;
  isPaid: boolean; // calculated from status: PAID or COMPLETED
  documentVersion: number;
  documentType: "SIGNED" | "FILLED";
  documentUrl: string;
}

// ============================================================================
// Contract Termination API Types and Methods
// ============================================================================
// 
// Luồng chấm dứt hợp đồng:
// 1. Preview: GET /api/v1/contracts/{contractId}/termination/preview
//    - Hệ thống tự động xác định terminatedBy từ user đăng nhập
//    - CLIENT → ClientTerminationPreviewResponse
//    - OWNER → OwnerTerminationPreviewResponse
//    - Khác → ACCESS_DENIED error
//
// 2. Execute: POST /api/v1/contracts/{contractId}/termination
//    - Body: { "reason": "Lý do (optional)" }
//    - CLIENT chấm dứt: Thanh toán ngay, trả về TerminationResponse
//    - OWNER chấm dứt: Tạo PayOS payment, trả về paymentUrl để thanh toán
//
// 3. Detail: GET /api/v1/contracts/{contractId}/termination
//    - Xem chi tiết chấm dứt hợp đồng đã thực hiện
//
// Error codes:
// - RESOURCE_NOT_FOUND: Hợp đồng không tồn tại
// - ACCESS_DENIED: User không phải Owner/Client
// - CONTRACT_ALREADY_TERMINATED: Hợp đồng đã được chấm dứt
//
// ============================================================================

// Contract Termination Types are now exported from ../types/contract.ts


class ContractService {
  private extractErrorMessage(error: unknown): string {
    // Type guard for error with response structure
    const errorWithResponse = error as {
      response?: {
        data?: {
          code?: number | string;
          error?: string;
          message?: string;
        };
        status?: number;
      };
      message?: string;
      code?: string;
    };

    // Kiểm tra error code từ server response (theo format backend trả về)
    const errorCode = errorWithResponse?.response?.data?.code || errorWithResponse?.response?.data?.error;
    const errorMessage = errorWithResponse?.response?.data?.message;
    const status = errorWithResponse?.response?.status;

    // Xử lý các error code cụ thể theo specification
    // Check for 4001 error code (custom Not Found code)
    if (errorCode === 4001 || errorCode === "4001" || errorCode === "RESOURCE_NOT_FOUND" || status === 404) {
      return errorMessage || "Không tìm thấy hợp đồng. Vui lòng kiểm tra lại ID hợp đồng.";
    }
    
    if (errorCode === "ACCESS_DENIED" || status === 403) {
      return errorMessage || "Bạn không có quyền thực hiện thao tác này. Chỉ Owner hoặc Client mới có thể chấm dứt hợp đồng.";
    }
    
    if (errorCode === "CONTRACT_ALREADY_TERMINATED") {
      return errorMessage || "Hợp đồng đã được chấm dứt trước đó.";
    }
    
    if (status === 401) {
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    }
    
    if (status && status >= 500) {
      return "Lỗi máy chủ. Vui lòng thử lại sau.";
    }
    
    // Kiểm tra message từ server response
    if (errorMessage) {
      return errorMessage;
    }
    
    // Kiểm tra message từ error object
    if (errorWithResponse?.message) {
      return errorWithResponse.message;
    }
    
    // Kiểm tra network error
    if (errorWithResponse?.code === "ECONNABORTED" || errorWithResponse?.message?.includes("timeout")) {
      return "Kết nối quá thời gian. Vui lòng kiểm tra kết nối mạng và thử lại.";
    }
    if (errorWithResponse?.code === "ERR_NETWORK" || errorWithResponse?.message?.includes("Network Error")) {
      return "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.";
    }
    
    return "Có lỗi xảy ra. Vui lòng thử lại.";
  }

  // 1) Fill contract (generate FILLED PDF and upload to S3)
  async fillContract(
    projectId: number | string,
    body: ContractFillBodyPayOnce | ContractFillBodyMilestones
  ): Promise<Blob> {
    try {
      console.log("Sending contract data:", JSON.stringify(body, null, 2));
      
      const res = await apiInstance.post(`/api/v1/contracts/pdf/${projectId}/fill`, body, {
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/pdf, application/octet-stream, */*"
        },
        responseType: "blob",
        timeout: 30000, // 30 seconds timeout
      });
      
      console.log("Response headers:", res.headers);
      console.log("Response status:", res.status);
      
      return res.data as Blob;
    } catch (error: unknown) {
      const errorWithResponse = error as { response?: { data?: unknown; status?: number; headers?: unknown } };
      console.error("Contract fill error:", error);
      console.error("Error response:", errorWithResponse?.response?.data);
      console.error("Error status:", errorWithResponse?.response?.status);
      console.error("Error headers:", errorWithResponse?.response?.headers);
      
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 2) Get metadata for project contract
  async getContractMetadata(projectId: number | string): Promise<ContractMetadata | null> {
    try {
      const res = await apiInstance.get<ApiResponse<ContractMetadata>>(`/api/v1/projects/${projectId}/contract`);
      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) return data.result;
      return null;
    } catch (error: unknown) {
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 3) Preview/View URLs
  async getFilledViewUrl(contractId: number | string): Promise<string> {
    try {
      const res = await apiInstance.get<ApiResponse<string>>(`/api/v1/contracts/${contractId}/filled/view-url`);
      if ((res.data.code === 200 || res.data.code === 0) && res.data.result) return res.data.result as unknown as string;
      throw new Error(res.data.message || "Không thể lấy URL xem trước.");
    } catch (error: unknown) {
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  async getFilledFile(contractId: number | string): Promise<void> {
    try {
      await apiInstance.get(`/api/v1/contracts/${contractId}/filled/file`, {
        maxRedirects: 0,
      });
    } catch (error: unknown) {
      const errorWithResponse = error as { response?: { status?: number; headers?: { location?: string } } };
      if (errorWithResponse?.response?.status === 302 && errorWithResponse.response.headers?.location) {
        window.open(errorWithResponse.response.headers.location, "_blank");
        return;
      }
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  async getSignedFile(contractId: number | string): Promise<void> {
    try {
      await apiInstance.get(`/api/v1/contracts/${contractId}/signed/file`, {
        maxRedirects: 0,
      });
    } catch (error: unknown) {
      const errorWithResponse = error as { response?: { status?: number; headers?: { location?: string } } };
      if (errorWithResponse?.response?.status === 302 && errorWithResponse.response.headers?.location) {
        window.open(errorWithResponse.response.headers.location, "_blank");
        return;
      }
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 4) Invite signers
  async sendInvites(contractId: number | string, payload: StartSigningRequest = {}): Promise<StartSigningResponse> {
    try {
      const res = await apiInstance.post<ApiResponse<StartSigningResponse>>(
        `/api/v1/contracts/${contractId}/invites`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) return data.result;
      throw new Error(data.message || "Không thể gửi lời mời ký.");
    } catch (error: unknown) {
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 5) Finalize signed version (download from SignNow to S3)
  async finalizeSigned(contractId: number | string, withHistory = false): Promise<{ storageUrl: string; version: number; size: number; }> {
    try {
      const res = await apiInstance.post<ApiResponse<{ storageUrl: string; version: number; size: number }>>(
        `/api/v1/contracts/${contractId}/signed`,
        null,
        { params: { withHistory } }
      );
      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) return data.result;
      throw new Error(data.message || "Không thể hoàn tất ký.");
    } catch (error: unknown) {
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 6) Decline contract
  async decline(contractId: number | string, reason: string): Promise<string> {
    try {
      const res = await apiInstance.post(`/api/v1/contracts/${contractId}/decline`, reason, {
        headers: { "Content-Type": "text/plain" },
      });
      return (res.data?.result as string) || "DECLINED";
    } catch (error: unknown) {
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 7) Get decline reason
  async getDeclineReason(contractId: number | string): Promise<string> {
    try {
      const res = await apiInstance.get<ApiResponse<string>>(`/api/v1/contracts/${contractId}/decline-reason`);
      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) return data.result;
      throw new Error(data.message || "Không thể lấy lý do từ chối.");
    } catch (error: unknown) {
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 8) Get all addendums for a contract
  async getAllAddendums(contractId: number | string): Promise<AddendumItem[]> {
    try {
      const res = await apiInstance.get<ApiResponse<AddendumItem[]>>(`/api/v1/contracts/${contractId}/addendum/all`);
      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) return data.result;
      throw new Error(data.message || "Không thể lấy danh sách phụ lục.");
    } catch (error: unknown) {
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 9) Fill addendum (generate FILLED PDF and upload to S3)
  async fillAddendum(
    contractId: number | string,
    body: AddendumFillBody
  ): Promise<Blob> {
    try {
      console.log("Sending addendum data:", JSON.stringify(body, null, 2));
      
      const res = await apiInstance.post(`/api/v1/contracts/${contractId}/addendum/pdf/fill`, body, {
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/pdf, application/octet-stream, */*"
        },
        responseType: "blob",
        timeout: 30000, // 30 seconds timeout
      });
      
      console.log("Response headers:", res.headers);
      console.log("Response status:", res.status);
      
      return res.data as Blob;
    } catch (error: unknown) {
      const errorWithResponse = error as { response?: { data?: unknown; status?: number; headers?: unknown } };
      console.error("Addendum fill error:", error);
      console.error("Error response:", errorWithResponse?.response?.data);
      console.error("Error status:", errorWithResponse?.response?.status);
      console.error("Error headers:", errorWithResponse?.response?.headers);
      
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 10) Get latest addendum metadata for a contract
  async getLatestAddendum(contractId: number | string): Promise<LatestAddendumMetadata | null> {
    try {
      const res = await apiInstance.get<ApiResponse<(LatestAddendumMetadata & { exists: boolean })>>(
        `/api/v1/contracts/${contractId}/addendum`
      );
      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        if (data.result.exists === false) {
          return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { exists, ...meta } = data.result;
        return meta;
      }
      return null;
    } catch (error: unknown) {
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 11) Open latest FILLED addendum file in a new tab (via 302 redirect)
  async openLatestAddendumFilledFile(contractId: number | string): Promise<void> {
    try {
      await apiInstance.get(`/api/v1/contracts/${contractId}/addendum/file`, {
        maxRedirects: 0,
      });
    } catch (error: unknown) {
      const errorWithResponse = error as { response?: { status?: number; headers?: { location?: string } } };
      if (errorWithResponse?.response?.status === 302 && errorWithResponse.response.headers?.location) {
        window.open(errorWithResponse.response.headers.location, "_blank");
        return;
      }
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 14) Invite signing for latest addendum of a contract
  async sendAddendumInvites(
    contractId: number | string,
    payload: StartSigningRequest = {}
  ): Promise<StartSigningResponse> {
    try {
      const res = await apiInstance.post<ApiResponse<StartSigningResponse>>(
        `/api/v1/contracts/${contractId}/addendum/invites`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) return data.result;
      throw new Error(data.message || "Không thể gửi lời mời ký phụ lục.");
    } catch (error: unknown) {
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 12) Open latest SIGNED addendum file in a new tab (via 302 redirect)
  async openLatestAddendumSignedFile(contractId: number | string): Promise<void> {
    try {
      await apiInstance.get(`/api/v1/contracts/${contractId}/addendum/signed/file`, {
        maxRedirects: 0,
      });
    } catch (error: unknown) {
      const errorWithResponse = error as { response?: { status?: number; headers?: { location?: string } } };
      if (errorWithResponse?.response?.status === 302 && errorWithResponse.response.headers?.location) {
        window.open(errorWithResponse.response.headers.location, "_blank");
        return;
      }
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 13) Get decline reason for latest addendum of a contract
  async getLatestAddendumDeclineReason(contractId: number | string): Promise<string> {
    try {
      const res = await apiInstance.get<ApiResponse<string>>(
        `/api/v1/contracts/${contractId}/addendum/decline-reason`
      );
      const data = res.data;
      if ((data.code === 200 || data.code === 0) && typeof data.result === "string") {
        return data.result;
      }
      throw new Error(data.message || "Không thể lấy lý do từ chối phụ lục.");
    } catch (error: unknown) {
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 15) Decline latest addendum of a contract
  async declineAddendum(contractId: number | string, reason: string): Promise<string> {
    try {
      const res = await apiInstance.post(`/api/v1/contracts/${contractId}/addendum/decline`, reason, {
        headers: { "Content-Type": "text/plain" },
      });
      return (res.data?.result as string) || "DECLINED";
    } catch (error: unknown) {
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }


  // 16) Get Party B verified info
  async getPartyBVerifiedInfo(): Promise<{
    bName: string;
    bCccd: string;
    bCccdIssueDate: string; // yyyy-MM-dd
    bCccdIssuePlace: string;
    bAddress: string;
    bPhone: string;
    isVerified: boolean;
  }> {
    try {
      const res = await apiInstance.get<ApiResponse<{
        bName: string;
        bCccd: string;
        bCccdIssueDate: string;
        bCccdIssuePlace: string;
        bAddress: string;
        bPhone: string;
        isVerified: boolean;
      }>>(`/api/v1/contracts/party-b/verified-info`);
      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể lấy thông tin từ xác thực.");
    } catch (error: unknown) {
      // Preserve error code for handling
      const errorWithResponse = error as { response?: { data?: { code?: number | string; message?: string }; status?: number } };
      if (errorWithResponse?.response?.data?.code) {
        const err = new Error(errorWithResponse.response.data.message || "Có lỗi xảy ra.");
        (err as { code?: number | string; status?: number }).code = errorWithResponse.response.data.code;
        (err as { code?: number | string; status?: number }).status = errorWithResponse.response.status;
        throw err;
      }
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 17) Preview Termination
  // Endpoint: GET /api/v1/contracts/{contractId}/termination/preview
  // Hệ thống tự động xác định terminatedBy từ user đăng nhập:
  // - Nếu user là Owner → trả về OwnerTerminationPreviewResponse
  // - Nếu user là Client → trả về ClientTerminationPreviewResponse
  // - Nếu không phải Owner/Client → trả về lỗi ACCESS_DENIED
  async previewTermination(
    contractId: number | string
  ): Promise<TerminationPreviewResponse> {
    try {
      const res = await apiInstance.get<unknown>(
        `/api/v1/contracts/${contractId}/termination/preview`
      );
      const data = res.data;
      
      // Kiểm tra xem response có được wrap trong ApiResponse format không
      // Nếu có code và result, đó là ApiResponse format
      if (data && typeof data === 'object' && 'code' in data && 'result' in data) {
        const apiResponse = data as ApiResponse<TerminationPreviewResponse>;
        if ((apiResponse.code === 200 || apiResponse.code === 0) && apiResponse.result) {
          return apiResponse.result;
        }
        throw new Error(apiResponse.message || "Không thể xem trước chấm dứt hợp đồng.");
      }
      
      // Nếu response trả về trực tiếp TerminationPreviewResponse (có totalAmount)
      // Đây là trường hợp API trả về trực tiếp data không wrap
      // Có thể là Owner response (có totalTeamCompensation, teamMembers) hoặc Client response (có compensationAmount)
      if (data && typeof data === 'object' && 'totalAmount' in data && ('totalTeamCompensation' in data || 'compensationAmount' in data || 'clientWillReceive' in data)) {
        return data as TerminationPreviewResponse;
      }
      
      // Nếu không match cả 2 format trên
      const apiResponse = data as ApiResponse<TerminationPreviewResponse>;
      throw new Error((apiResponse && typeof apiResponse === 'object' && 'message' in apiResponse ? apiResponse.message : undefined) || "Không thể xem trước chấm dứt hợp đồng.");
    } catch (error: unknown) {
      // Nếu error đã có response từ server (HTTP error)
      const errorWithResponse = error as { response?: unknown; message?: string };
      if (errorWithResponse?.response) {
        const message = this.extractErrorMessage(error);
        throw new Error(message);
      }
      
      // Nếu error là từ logic check (không phải HTTP error)
      // Giữ nguyên error message đã được throw ở trên
      if (errorWithResponse?.message) {
        throw error;
      }
      
      // Fallback
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 18) Execute Termination
  // Request body: { "reason": "Lý do chấm dứt (optional)", "returnUrl": "...", "cancelUrl": "..." }
  async executeTermination(
    contractId: number | string, 
    reason?: string,
    returnUrl?: string,
    cancelUrl?: string
  ): Promise<TerminationExecuteResponse> {
    try {
      const requestBody: { reason?: string; returnUrl?: string; cancelUrl?: string } = {};
      if (reason && reason.trim()) {
        requestBody.reason = reason.trim();
      }
      if (returnUrl) {
        requestBody.returnUrl = returnUrl;
      }
      if (cancelUrl) {
        requestBody.cancelUrl = cancelUrl;
      }
      
      const res = await apiInstance.post<ApiResponse<TerminationExecuteResponse> | TerminationExecuteResponse>(
        `/api/v1/contracts/${contractId}/termination`,
        requestBody,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = res.data;
      
      // Normalize response: unwrap ApiResponse nếu có
      let normalizedData: TerminationExecuteResponse;
      if (data && typeof data === 'object' && 'code' in data && 'result' in data) {
        // ApiResponse format: { code, result, message }
        const apiResponse = data as ApiResponse<TerminationExecuteResponse>;
        if ((apiResponse.code === 200 || apiResponse.code === 0) && apiResponse.result) {
          normalizedData = apiResponse.result;
        } else {
          // Kiểm tra xem có result với paymentUrl không (trường hợp cần thanh toán)
          if (apiResponse.result && apiResponse.result.paymentUrl) {
            return apiResponse.result;
          }
          throw new Error(apiResponse.message || "Không thể thực hiện chấm dứt hợp đồng.");
        }
      } else if (data && typeof data === 'object' && 'contractId' in data) {
        // Plain JSON format: trả về trực tiếp TerminationExecuteResponse
        normalizedData = data as TerminationExecuteResponse;
      } else {
        throw new Error("Không thể thực hiện chấm dứt hợp đồng.");
      }
      
      // Kiểm tra nếu có paymentUrl thì return luôn (không cần check terminationId)
      if (normalizedData.paymentUrl) {
        return normalizedData;
      }
      
      // Success case: có terminationId và newStatus === "TERMINATED"
      if (normalizedData.terminationId && normalizedData.newStatus === "TERMINATED") {
        return normalizedData;
      }
      
      // Other cases
      return normalizedData;
    } catch (error: unknown) {
      // Kiểm tra xem error response có chứa paymentUrl không (cả wrapped và unwrapped)
      const errorWithResponse = error as { 
        response?: { 
          data?: ApiResponse<TerminationExecuteResponse> | TerminationExecuteResponse | {
            result?: TerminationExecuteResponse;
            paymentUrl?: string;
            paymentOrderCode?: string;
          };
          status?: number;
        };
        message?: string;
      };
      
      const errorData = errorWithResponse?.response?.data;
      
      if (errorData && typeof errorData === 'object') {
        // Case 1: ApiResponse format với result có paymentUrl
        if ('result' in errorData && errorData.result && typeof errorData.result === 'object') {
          const result = errorData.result as TerminationExecuteResponse;
          if (result.paymentUrl) {
            return result;
          }
        }
        
        // Case 2: Plain JSON format có paymentUrl trực tiếp
        if ('paymentUrl' in errorData && errorData.paymentUrl) {
          return errorData as TerminationExecuteResponse;
        }
      }
      
      // Không có paymentUrl → đây là lỗi thật sự
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // 19) Get Termination Detail
  // Xem chi tiết chấm dứt hợp đồng
  async getTerminationDetail(contractId: number | string): Promise<TerminationDetailResponse> {
    try {
      const res = await apiInstance.get<ApiResponse<TerminationDetailResponse> | TerminationDetailResponse>(
        `/api/v1/contracts/${contractId}/termination`
      );
      const data = res.data;
      
      // Check if response is wrapped in ApiResponse format
      if (data && typeof data === 'object' && 'code' in data && 'result' in data) {
        const apiResponse = data as ApiResponse<TerminationDetailResponse>;
        if ((apiResponse.code === 200 || apiResponse.code === 0) && apiResponse.result) {
          return apiResponse.result;
        }
        throw new Error(apiResponse.message || "Không thể lấy chi tiết chấm dứt hợp đồng.");
      }
      
      // Check if response is direct TerminationDetailResponse (has terminationId)
      if (data && typeof data === 'object' && 'terminationId' in data) {
        return data as TerminationDetailResponse;
      }
      
      // If neither format matches, throw error
      throw new Error("Không thể lấy chi tiết chấm dứt hợp đồng.");
    } catch (error: unknown) {
      const message = this.extractErrorMessage(error);
      const errorWithResponse = error as { response?: { data?: { code?: number | string; error?: string }; status?: number } };
      const errorCode = errorWithResponse?.response?.data?.code || errorWithResponse?.response?.data?.error;
      const err = new Error(message);
      // Preserve error code for checking 4001 (Not Found)
      (err as { errorCode?: number | string; status?: number }).errorCode = errorCode;
      (err as { errorCode?: number | string; status?: number }).status = errorWithResponse?.response?.status;
      throw err;
    }
  }
}

const contractService = new ContractService();
export default contractService;


