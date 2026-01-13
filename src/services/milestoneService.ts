import apiInstance from "../config/axiosCustom";
import { ConversationCreationResponse } from "../types/chat";

interface ApiResponse<T> {
  code: number;
  message?: string;
  result?: T;
}

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'EXPIRED'
  | string;

export interface MilestoneResponse {
  id: number;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "PAID";
  paymentStatus?: PaymentStatus;
  sequence: number;
  productCount?: number;
  editCount?: number;
  contractProductCount?: number;
  contractFpEditCount?: number;
  amount?: number;
  contractTotalAmount?: number;
  projectTitle: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestonePayload {
  title: string;
  description?: string;
  amount: string; // Format: "1000000.00"
  dueDate: string; // Format: "yyyy-MM-dd"
  editCount?: number;
  productCount: number;
  createInternalGroupChat?: boolean;
  internalGroupChatName?: string;
  createClientGroupChat?: boolean;
  clientGroupChatName?: string;
}

export interface UpdateMilestonePayload {
  title: string;
  description?: string;
  amount: string; // Format: "1000000.00"
  dueDate: string; // Format: "yyyy-MM-dd"
  editCount?: number;
  productCount: number;
}

export interface CreateMilestoneResponse {
  id: number;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "PAID";
  paymentStatus?: PaymentStatus;
  editCount: number;
  productCount: number;
  sequence: number;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableMemberResponse {
  userId: number;
  userName: string;
  userEmail: string;
  projectRole: "COLLABORATOR" | "OBSERVER";
}

export interface AvailableProjectMemberResponse {
  userId: number;
  userName: string;
  userEmail: string;
  projectRole: string; // COLLABORATOR, OBSERVER, etc.
}

export interface AddMembersRequest {
  members: Array<{
    userId: number;
    description?: string;
    canDownload?: boolean;
  }>;
}

export interface MilestoneDetailResponse {
  id: number;
  contractId?: number;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "PAID";
  paymentStatus?: PaymentStatus;
  editCount: number;
  productCount: number;
  sequence: number;
  createdAt: string;
  updatedAt: string;
  isFunded?: boolean;
  members: Array<{
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    description?: string | null;
    role?: "OWNER" | "CLIENT" | "COLLABORATOR" | "OBSERVER";
    isAnonymous?: boolean;
    canDownload?: boolean;
  }>;
}

// Money Split Interfaces
export interface MoneySplitResponse {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  isCurrentUserRecipient?: boolean | null;
}

export interface CreateMoneySplitRequest {
  userId: number;
  amount: string; // Format: "1000.00"
  note?: string;
}

export interface UpdateMoneySplitRequest {
  amount: string; // Format: "1000.00"
  note?: string;
}

export interface ApproveMoneySplitRequest {
  rejectionReason?: string | null;
}

export interface RejectMoneySplitRequest {
  rejectionReason?: string;
}

// Expense Interfaces
export interface ExpenseResponse {
  id: number;
  name: string;
  description: string | null;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseRequest {
  name: string;
  description?: string;
  amount: string; // Format: "500.00"
}

export interface UpdateExpenseRequest {
  name: string;
  description?: string;
  amount: string; // Format: "500.00"
}

// Money Split Detail Response
export interface MoneySplitDetailResponse {
  moneySplits: MoneySplitResponse[];
  expenses: ExpenseResponse[];
  totalSplitAmount: number;
  totalExpenseAmount: number;
  totalAllocated: number;
  milestoneAmount: number;
  remainingAmount: number;
}

// Permission Types
export interface ProjectPermissionResponse {
  // Role info
  userRole?: 'CUSTOMER' | 'PRODUCER' | 'ADMIN';
  projectRole?: 'OWNER' | 'CLIENT' | 'COLLABORATOR' | 'OBSERVER' | null;
  isProjectOwner?: boolean;
  anonymous?: boolean;
  canEnterCustomerRoom?: boolean;
  canEnterInternalRoom?: boolean;
  
  // Project permissions
  canCreateProject?: boolean;
  canInviteMembers?: boolean;
  canViewProject?: boolean;
  canEditProject?: boolean;
  canDeleteProject?: boolean;
  canViewMembers?: boolean;
  canManageInvitations?: boolean;
  canAcceptInvitation?: boolean;
  canDeclineInvitation?: boolean;
  canViewMyInvitations?: boolean;
  
  // Milestone permissions
  canCreateMilestone?: boolean;
  canViewMilestones?: boolean;
  canEditMilestone?: boolean;
  canDeleteMilestone?: boolean;
  canAddMembersToMilestone?: boolean;
  canRemoveMembersFromMilestone?: boolean;
  
  // Contract permissions
  canCreateContract?: boolean;
  canViewContract?: boolean;
  canInviteToSign?: boolean;
  canDeclineContract?: boolean;
  canEditContract?: boolean;
  
  // Payment permissions
  canCreatePayment?: boolean;
  canViewPayment?: boolean;
  
  // MoneySplit permissions
  canCreateMoneySplit?: boolean;
  canUpdateMoneySplit?: boolean;
  canDeleteMoneySplit?: boolean;
  canApproveMoneySplit?: boolean;
  canRejectMoneySplit?: boolean;
  canViewMoneySplit?: boolean;
  
  // Expense permissions
  canCreateExpense?: boolean;
  canUpdateExpense?: boolean;
  canDeleteExpense?: boolean;
  
  reason?: string | null;
}

class MilestoneService {
  private readonly baseUrl = "/api/v1/projects";

  private extractErrorMessage(error: any): string {
    // Handle authentication errors
    if (error?.response?.status === 401) {
      return "Phiên đăng nhập hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại.";
    }

    // Handle access denied (403)
    if (error?.response?.status === 403) {
      // Check for specific error codes
      const errorCode = error?.response?.data?.error;
      if (errorCode === "MONEY_SPLIT_ONLY_MEMBER_CAN_APPROVE") {
        return error?.response?.data?.message || "Chỉ thành viên được phân chia tiền mới có thể chấp nhận/từ chối.";
      }
      if (errorCode === "USER_NOT_IN_PROJECT") {
        return error?.response?.data?.message || "Người dùng không phải là thành viên của dự án này.";
      }
      return error?.response?.data?.message || "Không có quyền truy cập tài nguyên này. Chỉ Owner mới có thể thực hiện hành động này.";
    }

    // Handle specific error messages from backend
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    // Handle error code mapping
    if (error?.response?.data?.error) {
      const errorCode = error.response.data.error;
      const errorMessage = error.response.data.message;

      // Milestone errors
      if (errorCode === "MILESTONE_TITLE_DUPLICATE") {
        return errorMessage || "Tên cột mốc đã tồn tại trong dự án này. Vui lòng chọn tên khác.";
      }
      if (errorCode === "CANNOT_CREATE_MILESTONE_FOR_MILESTONE_PAYMENT_TYPE") {
        return errorMessage || "Hợp đồng có loại thanh toán MILESTONE không được phép tạo cột mốc. Chỉ hợp đồng có loại thanh toán FULL mới được tạo cột mốc.";
      }
      if (errorCode === "CONTRACT_NOT_FOUND") {
        return errorMessage || "Dự án chưa có hợp đồng. Vui lòng tạo hợp đồng trước khi tạo cột mốc.";
      }
      if (errorCode === "MILESTONE_NOT_FOUND") {
        return errorMessage || "Không tìm thấy cột mốc.";
      }
      if (errorCode === "EDIT_COUNT_EXCEEDS_CONTRACT_LIMIT") {
        return errorMessage || "Số lượt chỉnh sửa vượt quá giới hạn hợp đồng.";
      }
      if (errorCode === "PRODUCT_COUNT_EXCEEDS_CONTRACT_LIMIT") {
        return errorMessage || "Số lượng sản phẩm vượt quá giới hạn hợp đồng.";
      }
      if (errorCode === "MILESTONE_AMOUNT_EXCEEDS_CONTRACT_TOTAL") {
        return errorMessage || "Tổng ngân sách cột mốc vượt quá tổng ngân sách hợp đồng.";
      }
      if (errorCode === "MILESTONE_HAS_APPROVED_MONEY_SPLIT") {
        return errorMessage || "Không thể xóa cột mốc do có khoản phân chia tiền đã được duyệt.";
      }

      // Money Split errors
      if (errorCode === "MONEY_SPLIT_NOT_FOUND") {
        return errorMessage || "Không tìm thấy phân chia tiền.";
      }
      if (errorCode === "MONEY_SPLIT_ALREADY_APPROVED") {
        return errorMessage || "Phân chia tiền đã được chấp nhận.";
      }
      if (errorCode === "MONEY_SPLIT_ALREADY_REJECTED") {
        return errorMessage || "Phân chia tiền đã bị từ chối.";
      }
      if (errorCode === "MONEY_SPLIT_TOTAL_EXCEEDS_MILESTONE") {
        return errorMessage || "Tổng số tiền phân chia và chi phí vượt quá số tiền của cột mốc.";
      }
      if (errorCode === "MONEY_SPLIT_CANNOT_UPDATE_APPROVED") {
        return errorMessage || "Không thể chỉnh sửa phân chia tiền đã được chấp nhận.";
      }
      if (errorCode === "MONEY_SPLIT_CANNOT_UPDATE_REJECTED") {
        return errorMessage || "Không thể chỉnh sửa phân chia tiền đã bị từ chối. Vui lòng tạo mới.";
      }
      if (errorCode === "MONEY_SPLIT_ONLY_MEMBER_CAN_APPROVE") {
        return errorMessage || "Chỉ thành viên được phân chia tiền mới có thể chấp nhận/từ chối.";
      }

      // Expense errors
      if (errorCode === "EXPENSE_NOT_FOUND") {
        return errorMessage || "Không tìm thấy chi phí.";
      }

      // General errors
      if (errorCode === "ACCESS_DENIED") {
        return errorMessage || "Không có quyền truy cập tài nguyên này.";
      }
      if (errorCode === "INVALID_PARAMETER_FORMAT") {
        return errorMessage || "Định dạng tham số không hợp lệ.";
      }
      if (errorCode === "USER_NOT_FOUND") {
        return errorMessage || "Không tìm thấy người dùng.";
      }
      if (errorCode === "USER_NOT_IN_PROJECT") {
        return errorMessage || "Người dùng không phải là thành viên của dự án này.";
      }

      // Return backend message if available
      if (errorMessage) {
        return errorMessage;
      }
    }

    // Fallback to error message
    if (error?.message) return error.message;

    return "Có lỗi xảy ra. Vui lòng thử lại.";
  }

  // ========== Permission API ==========
  /**
   * Lấy quyền của user trong một project cụ thể
   * GET /api/v1/projects/{projectId}/permissions
   */
  public async getProjectPermission(
    projectId: number | string
  ): Promise<ProjectPermissionResponse> {
    try {
      const res = await apiInstance.get<ApiResponse<any>>(
        `${this.baseUrl}/${projectId}/permissions`
      );
      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        const raw = data.result as {
          role?: { 
            userRole?: string; 
            projectRole?: string;
            anonymous?: boolean;
          };
          room?: {
            canEnterCustomerRoom?: boolean;
            canEnterInternalRoom?: boolean;
          };
          project?: Record<string, boolean>;
          milestone?: Record<string, boolean>;
          contract?: Record<string, boolean>;
          payment?: Record<string, boolean>;
          moneySplit?: Record<string, boolean>;
          expense?: Record<string, boolean>;
          reason?: string | null;
        };

        // Map nested structure to the flattened ProjectPermissionResponse
        const mapped: ProjectPermissionResponse = {
          // Role info
          userRole: (raw.role?.userRole as any) || undefined,
          projectRole: (raw.role?.projectRole as any) || null,
          isProjectOwner: raw.role?.projectRole === "OWNER",
          anonymous: raw.role?.anonymous || false,
          canEnterCustomerRoom: Boolean(raw.room?.canEnterCustomerRoom),
          canEnterInternalRoom: Boolean(raw.room?.canEnterInternalRoom),

          // Project-level capabilities
          canCreateProject: Boolean(raw.project?.canCreateProject),
          canInviteMembers: Boolean(raw.project?.canInviteMembers),
          canViewProject: Boolean(raw.project?.canViewProject),
          canEditProject: Boolean(raw.project?.canEditProject),
          canDeleteProject: Boolean(raw.project?.canDeleteProject),
          canViewMembers: Boolean(raw.project?.canViewMembers),
          canManageInvitations: Boolean(raw.project?.canManageInvitations),
          canAcceptInvitation: Boolean(raw.project?.canAcceptInvitation),
          canDeclineInvitation: Boolean(raw.project?.canDeclineInvitation),
          canViewMyInvitations: Boolean(raw.project?.canViewMyInvitations),

          // Milestone-level capabilities
          canCreateMilestone: Boolean(raw.milestone?.canCreateMilestone),
          canViewMilestones: Boolean(raw.milestone?.canViewMilestones),
          canEditMilestone: Boolean(raw.milestone?.canEditMilestone),
          canDeleteMilestone: Boolean(raw.milestone?.canDeleteMilestone),
          canAddMembersToMilestone: Boolean(raw.milestone?.canAddMembersToMilestone),
          canRemoveMembersFromMilestone: Boolean(raw.milestone?.canRemoveMembersFromMilestone),

          // Contract-level capabilities
          canCreateContract: Boolean(raw.contract?.canCreateContract),
          canViewContract: Boolean(raw.contract?.canViewContract),
          canInviteToSign: Boolean(raw.contract?.canInviteToSign),
          canDeclineContract: Boolean(raw.contract?.canDeclineContract),
          canEditContract: Boolean(raw.contract?.canEditContract),

          // Payment-level capabilities
          canCreatePayment: Boolean(raw.payment?.canCreatePayment),
          canViewPayment: Boolean(raw.payment?.canViewPayment),

          // MoneySplit-level capabilities
          canCreateMoneySplit: Boolean(raw.moneySplit?.canCreateMoneySplit),
          canUpdateMoneySplit: Boolean(raw.moneySplit?.canUpdateMoneySplit),
          canDeleteMoneySplit: Boolean(raw.moneySplit?.canDeleteMoneySplit),
          canApproveMoneySplit: Boolean(raw.moneySplit?.canApproveMoneySplit),
          canRejectMoneySplit: Boolean(raw.moneySplit?.canRejectMoneySplit),
          canViewMoneySplit: Boolean(raw.moneySplit?.canViewMoneySplit),

          // Expense-level capabilities
          canCreateExpense: Boolean(raw.expense?.canCreateExpense),
          canUpdateExpense: Boolean(raw.expense?.canUpdateExpense),
          canDeleteExpense: Boolean(raw.expense?.canDeleteExpense),

          // Keep reason for debugging/UI
          reason: raw.reason ?? null,
        };

        return mapped;
      }
      throw new Error(data.message || "Không thể kiểm tra quyền trong dự án này.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  /**
   * Lấy danh sách tất cả cột mốc của một dự án
   * GET /api/v1/projects/{projectId}/milestones
   */
  public async getMilestones(projectId: number): Promise<MilestoneResponse[]> {
    try {
      const res = await apiInstance.get<ApiResponse<MilestoneResponse[]>>(
        `${this.baseUrl}/${projectId}/milestones`
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể tải danh sách cột mốc.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error fetching milestones:", error);
      throw new Error(message);
    }
  }

  /**
   * Tạo cột mốc mới cho dự án
   * POST /api/v1/projects/{projectId}/milestones
   */
  public async createMilestone(
    projectId: number,
    payload: CreateMilestonePayload
  ): Promise<CreateMilestoneResponse> {
    try {
      const res = await apiInstance.post<ApiResponse<CreateMilestoneResponse>>(
        `${this.baseUrl}/${projectId}/milestones`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;
      if ((data.code === 201 || data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể tạo cột mốc.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error creating milestone:", error);
      throw new Error(message);
    }
  }

  /**
   * Cập nhật cột mốc
   * PUT /api/v1/projects/{projectId}/milestones/{milestoneId}
   */
  public async updateMilestone(
    projectId: number | string,
    milestoneId: number | string,
    payload: UpdateMilestonePayload
  ): Promise<MilestoneResponse> {
    try {
      const res = await apiInstance.put<ApiResponse<MilestoneResponse>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể cập nhật cột mốc.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error updating milestone:", error);
      throw new Error(message);
    }
  }

  /**
   * Xóa cột mốc
   * DELETE /api/v1/projects/{projectId}/milestones/{milestoneId}
   */
  public async deleteMilestone(
    projectId: number | string,
    milestoneId: number | string
  ): Promise<void> {
    try {
      const res = await apiInstance.delete<ApiResponse<void>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}`
      );

      const data = res.data;
      if (data.code === 200 || data.code === 0) {
        return;
      }
      throw new Error(data.message || "Không thể xóa cột mốc.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error deleting milestone:", error);
      throw new Error(message);
    }
  }

  /**
   * Khách hàng chấp nhận hoàn thành cột mốc
   * POST /api/v1/projects/{projectId}/milestones/{milestoneId}/complete
   */
  public async completeMilestone(
    projectId: number | string,
    milestoneId: number | string
  ): Promise<MilestoneResponse> {
    try {
      const res = await apiInstance.post<ApiResponse<MilestoneResponse>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/complete`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể chấp nhận hoàn thành cột mốc.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error completing milestone:", error);
      throw new Error(message);
    }
  }

  /**
   * Tải về ZIP các track bản gốc
   * POST /api/v1/projects/{projectId}/milestones/{milestoneId}/download-original-tracks-zip
   */
  public async downloadOriginalTracksZip(
    projectId: number | string,
    milestoneId: number | string,
    trackIds?: number[]
  ): Promise<{
    downloadUrl: string;
    zipFileName: string;
    expiresAt: string;
    statistics: {
      totalTracks: number;
      successfulTracks: number;
      failedTracks: number;
      failedTrackIds: number[];
    };
  }> {
    try {
      const res = await apiInstance.post<
        ApiResponse<{
          downloadUrl: string;
          zipFileName: string;
          expiresAt: string;
          statistics: {
            totalTracks: number;
            successfulTracks: number;
            failedTracks: number;
            failedTrackIds: number[];
          };
        }>
      >(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/download-original-tracks-zip`,
        trackIds && trackIds.length > 0 ? { trackIds } : {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể tạo file ZIP các track bản gốc.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error downloading original tracks zip:", error);
      throw new Error(message);
    }
  }

  /**
   * Lấy chi tiết một cột mốc của dự án
   * GET /api/v1/projects/{projectId}/milestones/{milestoneId}
   */
  public async getMilestoneDetail(
    projectId: number | string,
    milestoneId: number | string
  ): Promise<MilestoneDetailResponse> {
    try {
      const res = await apiInstance.get<
        ApiResponse<
          MilestoneDetailResponse
        >
      >(`${this.baseUrl}/${projectId}/milestones/${milestoneId}`);

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể tải chi tiết cột mốc.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error fetching milestone detail:", error);
      throw new Error(message);
    }
  }

  /**
   * Lấy danh sách thành viên có thể thêm vào cột mốc
   * GET /api/v1/projects/{projectId}/milestones/{milestoneId}/available-members
   */
  public async getAvailableMembers(
    projectId: number | string,
    milestoneId: number | string
  ): Promise<AvailableMemberResponse[]> {
    try {
      const res = await apiInstance.get<ApiResponse<AvailableMemberResponse[]>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/available-members`
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể tải danh sách thành viên có thể thêm.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error fetching available members:", error);
      throw new Error(message);
    }
  }

  /**
   * Thêm thành viên vào cột mốc
   * POST /api/v1/projects/{projectId}/milestones/{milestoneId}/members
   */
  public async addMembersToMilestone(
    projectId: number | string,
    milestoneId: number | string,
    payload: AddMembersRequest
  ): Promise<MilestoneDetailResponse> {
    try {
      const res = await apiInstance.post<ApiResponse<MilestoneDetailResponse>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/members`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể thêm thành viên vào cột mốc.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error adding members to milestone:", error);
      throw new Error(message);
    }
  }

  /**
   * Xóa thành viên khỏi cột mốc
   * DELETE /api/v1/projects/{projectId}/milestones/{milestoneId}/members/{memberId}
   */
  public async removeMemberFromMilestone(
    projectId: number | string,
    milestoneId: number | string,
    memberId: number | string
  ): Promise<MilestoneDetailResponse> {
    try {
      const res = await apiInstance.delete<ApiResponse<MilestoneDetailResponse>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/members/${memberId}`
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể xóa thành viên khỏi cột mốc.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error removing member from milestone:", error);
      throw new Error(message);
    }
  }

  // ========== Money Split APIs ==========

  /**
   * Lấy chi tiết phân chia tiền
   * GET /api/v1/projects/{projectId}/milestones/{milestoneId}/money-splits
   */
  public async getMoneySplitDetail(
    projectId: number | string,
    milestoneId: number | string
  ): Promise<MoneySplitDetailResponse> {
    try {
      const res = await apiInstance.get<ApiResponse<MoneySplitDetailResponse>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/money-splits`
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể tải chi tiết phân chia tiền.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error fetching money split detail:", error);
      throw new Error(message);
    }
  }

  /**
   * Tạo phân chia tiền
   * POST /api/v1/projects/{projectId}/milestones/{milestoneId}/money-splits
   */
  public async createMoneySplit(
    projectId: number | string,
    milestoneId: number | string,
    payload: CreateMoneySplitRequest
  ): Promise<MoneySplitResponse> {
    try {
      const res = await apiInstance.post<ApiResponse<MoneySplitResponse>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/money-splits`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;
      if ((data.code === 201 || data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể tạo phân chia tiền.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error creating money split:", error);
      throw new Error(message);
    }
  }

  /**
   * Cập nhật phân chia tiền
   * PUT /api/v1/projects/{projectId}/milestones/{milestoneId}/money-splits/{moneySplitId}
   */
  public async updateMoneySplit(
    projectId: number | string,
    milestoneId: number | string,
    moneySplitId: number | string,
    payload: UpdateMoneySplitRequest
  ): Promise<MoneySplitResponse> {
    try {
      const res = await apiInstance.put<ApiResponse<MoneySplitResponse>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/money-splits/${moneySplitId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể cập nhật phân chia tiền.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error updating money split:", error);
      throw new Error(message);
    }
  }

  /**
   * Xóa phân chia tiền
   * DELETE /api/v1/projects/{projectId}/milestones/{milestoneId}/money-splits/{moneySplitId}
   */
  public async deleteMoneySplit(
    projectId: number | string,
    milestoneId: number | string,
    moneySplitId: number | string
  ): Promise<void> {
    try {
      const res = await apiInstance.delete<ApiResponse<void>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/money-splits/${moneySplitId}`
      );

      const data = res.data;
      if (data.code === 200 || data.code === 0) {
        return;
      }
      throw new Error(data.message || "Không thể xóa phân chia tiền.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error deleting money split:", error);
      throw new Error(message);
    }
  }

  /**
   * Phê duyệt phân chia tiền
   * POST /api/v1/projects/{projectId}/milestones/{milestoneId}/money-splits/{moneySplitId}/approve
   */
  public async approveMoneySplit(
    projectId: number | string,
    milestoneId: number | string,
    moneySplitId: number | string,
    payload?: ApproveMoneySplitRequest
  ): Promise<MoneySplitResponse> {
    try {
      const res = await apiInstance.post<ApiResponse<MoneySplitResponse>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/money-splits/${moneySplitId}/approve`,
        payload || {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể phê duyệt phân chia tiền.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error approving money split:", error);
      throw new Error(message);
    }
  }

  /**
   * Từ chối phân chia tiền
   * POST /api/v1/projects/{projectId}/milestones/{milestoneId}/money-splits/{moneySplitId}/reject
   */
  public async rejectMoneySplit(
    projectId: number | string,
    milestoneId: number | string,
    moneySplitId: number | string,
    payload: RejectMoneySplitRequest
  ): Promise<MoneySplitResponse> {
    try {
      const res = await apiInstance.post<ApiResponse<MoneySplitResponse>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/money-splits/${moneySplitId}/reject`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể từ chối phân chia tiền.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error rejecting money split:", error);
      throw new Error(message);
    }
  }

  // ========== Expense APIs ==========

  /**
   * Tạo chi phí
   * POST /api/v1/projects/{projectId}/milestones/{milestoneId}/expenses
   */
  public async createExpense(
    projectId: number | string,
    milestoneId: number | string,
    payload: CreateExpenseRequest
  ): Promise<ExpenseResponse> {
    try {
      const res = await apiInstance.post<ApiResponse<ExpenseResponse>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/expenses`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;
      if ((data.code === 201 || data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể tạo chi phí.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error creating expense:", error);
      throw new Error(message);
    }
  }

  /**
   * Cập nhật chi phí
   * PUT /api/v1/projects/{projectId}/milestones/{milestoneId}/expenses/{expenseId}
   */
  public async updateExpense(
    projectId: number | string,
    milestoneId: number | string,
    expenseId: number | string,
    payload: UpdateExpenseRequest
  ): Promise<ExpenseResponse> {
    try {
      const res = await apiInstance.put<ApiResponse<ExpenseResponse>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/expenses/${expenseId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể cập nhật chi phí.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error updating expense:", error);
      throw new Error(message);
    }
  }

  /**
   * Xóa chi phí
   * DELETE /api/v1/projects/{projectId}/milestones/{milestoneId}/expenses/{expenseId}
   */
  public async deleteExpense(
    projectId: number | string,
    milestoneId: number | string,
    expenseId: number | string
  ): Promise<void> {
    try {
      const res = await apiInstance.delete<ApiResponse<void>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/expenses/${expenseId}`
      );

      const data = res.data;
      if (data.code === 200 || data.code === 0) {
        return;
      }
      throw new Error(data.message || "Không thể xóa chi phí.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error deleting expense:", error);
      throw new Error(message);
    }
  }

  // ========== Group Chat APIs ==========

  /**
   * Tạo group chat cho milestone
   * POST /api/v1/projects/{projectId}/milestones/{milestoneId}/group-chat
   */
  public async createGroupChatForMilestone(
    projectId: number | string,
    milestoneId: number | string,
    request: { participantIds: number[]; conversationName: string },
    avatar?: File
  ): Promise<any> {
    try {
      const formData = new FormData();

      // Add avatar if provided
      if (avatar) {
        formData.append("avatar", avatar);
      }

      // Add request data as JSON blob
      formData.append(
        "data",
        new Blob([JSON.stringify(request)], { type: "application/json" })
      );

      const res = await apiInstance.post<ApiResponse<any>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/group-chat`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = res.data;
      if ((data.code === 201 || data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể tạo group chat cho cột mốc.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error creating group chat for milestone:", error);
      throw new Error(message);
    }
  }

  /**
   * Lấy danh sách group chat cho milestone
   * GET /api/v1/projects/{projectId}/milestones/{milestoneId}/group-chats
   */
  public async getGroupChatsForMilestone(
    projectId: number | string,
    milestoneId: number | string,
    type?: "INTERNAL" | "CLIENT"
  ): Promise<ConversationCreationResponse[]> {
    try {
      const params: any = {};
      if (type) {
        params.type = type;
      }

      const res = await apiInstance.get<ApiResponse<ConversationCreationResponse[]>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/group-chats`,
        { params }
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể lấy danh sách group chat cho cột mốc.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error fetching group chats for milestone:", error);
      throw new Error(message);
    }
  }

  /**
   * Tìm kiếm thành viên dự án cho milestone chat
   * GET /api/v1/projects/{projectId}/milestones/{milestoneId}/search-users?keyword={keyword}
   */
  public async searchUsersForMilestoneChat(
    projectId: number | string,
    milestoneId: number | string,
    keyword?: string
  ): Promise<AvailableProjectMemberResponse[]> {
    try {
      const params: any = {};
      if (keyword) {
        params.keyword = keyword;
      }

      const res = await apiInstance.get<ApiResponse<AvailableProjectMemberResponse[]>>(
        `${this.baseUrl}/${projectId}/milestones/${milestoneId}/search-users`,
        { params }
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể tìm kiếm thành viên.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error searching users for milestone chat:", error);
      throw new Error(message);
    }
  }
}

const milestoneService = new MilestoneService();
export default milestoneService;

