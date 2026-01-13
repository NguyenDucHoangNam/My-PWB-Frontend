import apiInstance from "../config/axiosCustom";
import { ProjectPermissionResponse } from "../types/permission";

interface ApiResponse<T> {
  code: number;
  message?: string;
  result?: T;
}

export interface CreateProjectPayload {
  title: string;
  description: string;
  type: "PERSONAL" | "COLLABORATIVE";
}

export interface ProjectCreationResponse {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  creatorId: number;
}

export interface Project {
  id: number;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "REVISION" | "COMPLETED" | "CANCELLED";
  type: "PERSONAL" | "COLLABORATIVE";
  myRole: "OWNER" | "CLIENT" | "COLLABORATOR" | "OBSERVER";
  creatorName: string;
  createdAt: string;
  clientId?: number; // ID của client (nếu có)
  hasReview?: boolean; // Đã được review chưa
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
}

export interface GetMyProjectsParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  status?: "PENDING" | "IN_PROGRESS" | "REVISION" | "COMPLETED" | "CANCELLED";
}

// Invitation Types
export interface CreateInvitationPayload {
  email: string;
  role: "COLLABORATOR" | "CLIENT" | "OBSERVER";
  anonymous: boolean;
}

export interface Invitation {
  invitationId: number;
  projectId: number;
  projectTitle: string;
  inviterName: string | null;
  invitedEmail: string;
  inviteeEmail?: string;
  invitedRole: "COLLABORATOR" | "CLIENT" | "OBSERVER";
  role?: "COLLABORATOR" | "CLIENT" | "OBSERVER";
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  expiresAt: string;
  createdAt: string;
  invitationLink?: string;
  token?: string;
}

export interface InvitationResponse {
  invitationLink: string;
}

export interface AcceptInvitationPayload {
  token?: string;
  invitationId?: number;
}

// Member Types
export interface ProjectMember {
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: "OWNER" | "CLIENT" | "COLLABORATOR" | "OBSERVER";
  anonymous: boolean;
  anonymousSummaryMessage?: string;
}

export interface MembersResponse {
  members: {
    content: ProjectMember[];
  };
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  anonymousCollaboratorCount: number;
  anonymousSummaryMessage: string;
}
export interface GetMyInvitationsParams {
  page?: number;
  size?: number;
  sort?:
    | "createdAt,desc"
    | "createdAt,asc"
    | "expiresAt,desc"
    | "expiresAt,asc";
}

export interface GetMembersParams {
  page?: number;
  size?: number;
  sort?: string;
}

// Invitation Suggestions Types
export interface InvitationSuggestion {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export interface GetInvitationSuggestionsParams {
  page?: number;
  size?: number;
  sort?: string;
}

// Re-export ProjectPermissionResponse từ types/permission.ts
export type { ProjectPermissionResponse };

class ProjectService {
  private readonly baseUrl = "/api/v1/projects";

  private extractErrorMessage(error: any): string {
    if (error?.response?.status === 401)
      return "Phiên đăng nhập hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại.";
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.message) return error.message;
    return "Có lỗi xảy ra. Vui lòng thử lại.";
  }

  public async createProject(
    projectData: CreateProjectPayload
  ): Promise<ProjectCreationResponse> {
    try {
      const res = await apiInstance.post<ApiResponse<ProjectCreationResponse>>(
        this.baseUrl,
        projectData,
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result)
        return data.result;
      throw new Error(
        data.message || "Invalid response structure from server."
      );
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error creating project:", error);
      throw new Error(message);
    }
  }

  public async checkTitleDuplicate(
    title: string
  ): Promise<{ duplicate: boolean } | null> {
    try {
      const res = await apiInstance.get<ApiResponse<{ duplicate: boolean }>>(
        `${this.baseUrl}/check-duplicate`,
        { params: { title } }
      );
      if (res.data.code === 0 && res.data.result) return res.data.result;
      return null;
    } catch (error) {
      console.warn("checkTitleDuplicate error:", error);
      return null;
    }
  }

  public async getMyProjects(
    params: GetMyProjectsParams = {}
  ): Promise<Page<Project>> {
    try {
      const res = await apiInstance.get<ApiResponse<Page<Project>>>(
        "/api/v1/my-projects",
        {
          params: {
            page: params.page ?? 0,
            size: params.size ?? 20,
            sort: params.sort ?? "updatedAt,desc",
            search: params.search || undefined,
            status: params.status || undefined,
          },
        }
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        const rawResult: any = data.result;

        // BE hiện tại trả về dạng { content: [...], page: { size, number, totalElements, totalPages } }
        // FE lại mong đợi kiểu Page<Project> phẳng: { content, size, number, totalElements, totalPages, first, last }
        // Đoạn dưới map từ cấu trúc BE sang cấu trúc FE, đồng thời vẫn hỗ trợ kiểu phẳng nếu BE đổi sau này.
        if (
          rawResult &&
          Array.isArray(rawResult.content) &&
          rawResult.page &&
          typeof rawResult.page === "object"
        ) {
          const pageMeta = rawResult.page;
          const size = pageMeta.size ?? 0;
          const number = pageMeta.number ?? 0;
          const totalElements = pageMeta.totalElements ?? 0;
          const totalPages = pageMeta.totalPages ?? 0;

          const mapped: Page<Project> = {
            content: rawResult.content,
            size,
            number,
            totalElements,
            totalPages,
            first: number === 0,
            last: totalPages > 0 ? number >= totalPages - 1 : true,
          };

          return mapped;
        }

        // Fallback: nếu BE đã trả đúng kiểu Page<Project> phẳng thì dùng luôn
        return rawResult as Page<Project>;
      }
      throw new Error(data.message || "Không thể tải danh sách dự án.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error fetching my projects:", error);
      throw new Error(message);
    }
  }

  /**
   * Lấy thông tin chi tiết của một project
   */
  public async getProjectDetails(projectId: number): Promise<any> {
    try {
      const res = await apiInstance.get<ApiResponse<any>>(
        `${this.baseUrl}/${projectId}`
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể tải thông tin dự án.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error fetching project details:", error);
      throw new Error(message);
    }
  }

  /**
   * Lấy quyền của user trong một project cụ thể
   * GET /api/v1/projects/{projectId}/permissions
   *
   * Trả về đúng cấu trúc lồng nhau như BE gửi - không flatten
   */
  public async getProjectPermissionByProjectId(
    projectId: number | string
  ): Promise<ProjectPermissionResponse> {
    try {
      const res = await apiInstance.get<ApiResponse<ProjectPermissionResponse>>(
        `${this.baseUrl}/${projectId}/permissions`
      );
      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        // Trả về đúng như BE gửi, không map/flatten
        return data.result;
      }
      throw new Error(
        data.message || "Không thể kiểm tra quyền trong dự án này."
      );
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // ============ INVITATION APIs (Owner) ============

  /**
   * Mời thành viên vào dự án (Owner)
   */
  public async createInvitation(
    projectId: number,
    payload: CreateInvitationPayload
  ): Promise<InvitationResponse> {
    try {
      const res = await apiInstance.post<ApiResponse<InvitationResponse>>(
        `${this.baseUrl}/${projectId}/invitations`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể gửi lời mời.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error creating invitation:", error);
      throw new Error(message);
    }
  }

  /**
   * Danh sách lời mời đang chờ (Owner)
   */
  public async getPendingInvitations(projectId: number): Promise<Invitation[]> {
    try {
      const res = await apiInstance.get<ApiResponse<Invitation[]>>(
        `${this.baseUrl}/${projectId}/invitations`
      );

      const data = res.data;
      console.log("Invitations API response:", data);

      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }

      if (Array.isArray(data)) {
        return data;
      }

      if (data.code === 200 || data.code === 0) {
        return [];
      }

      throw new Error(data.message || "Không thể tải danh sách lời mời.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error fetching pending invitations:", error);
      throw new Error(message);
    }
  }

  /**
   * Hủy lời mời (Owner)
   */
  public async cancelInvitation(
    projectId: number,
    invitationId: number
  ): Promise<void> {
    try {
      const res = await apiInstance.delete<ApiResponse<void>>(
        `${this.baseUrl}/${projectId}/invitations/${invitationId}`
      );

      const data = res.data;
      if (data.code !== 200 && data.code !== 0) {
        throw new Error(data.message || "Không thể hủy lời mời.");
      }
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error canceling invitation:", error);
      throw new Error(message);
    }
  }

  // ============ INVITATION APIs (Invitee) ============

  /**
   * Xem lời mời của tôi (Invitee)
   */
  public async getMyInvitations(): Promise<Invitation[]> {
    try {
      const res = await apiInstance.get<ApiResponse<Invitation[]>>(
        "/api/v1/my-invitations"
      );

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(
        data.message || "Không thể tải danh sách lời mời của bạn."
      );
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error fetching my invitations:", error);
      throw new Error(message);
    }
  }

  /**
   * Get my invitations with pagination/sort
   * Endpoint: GET /api/v1/my-invitations?page=&size=&sort=
   */
  public async getMyInvitationsPage(
    params: GetMyInvitationsParams = {}
  ): Promise<Page<Invitation>> {
    try {
      const res = await apiInstance.get<ApiResponse<Page<Invitation>>>(
        "/api/v1/my-invitations",
        {
          params: {
            page: params.page ?? 0,
            size: params.size ?? 10,
            sort: params.sort || "createdAt,desc",
          },
        }
      );
      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể tải danh sách lời mời.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error getMyInvitationsPage:", error);
      throw new Error(message);
    }
  }

  /**
   * Chấp nhận lời mời (Invitee)
   */
  public async acceptInvitation(
    payload: AcceptInvitationPayload
  ): Promise<void> {
    try {
      const res = await apiInstance.post<ApiResponse<void>>(
        "/api/v1/my-invitations/accept",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;
      if (data.code !== 200 && data.code !== 0) {
        throw new Error(data.message || "Không thể chấp nhận lời mời.");
      }
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error accepting invitation:", error);
      throw new Error(message);
    }
  }

  /**
   * Chấp nhận lời mời bằng invitationId (Alternative method)
   */
  public async acceptInvitationById(invitationId: number): Promise<void> {
    try {
      const res = await apiInstance.post<ApiResponse<void>>(
        `/api/v1/my-invitations/${invitationId}/accept`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;
      if (data.code !== 200 && data.code !== 0) {
        throw new Error(data.message || "Không thể chấp nhận lời mời.");
      }
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error accepting invitation by ID:", error);
      throw new Error(message);
    }
  }

  /**
   * Từ chối lời mời (Invitee)
   */
  public async declineInvitation(invitationId: number): Promise<void> {
    try {
      const res = await apiInstance.post<ApiResponse<void>>(
        `/api/v1/my-invitations/${invitationId}/decline`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;
      if (data.code !== 200 && data.code !== 0) {
        throw new Error(data.message || "Không thể từ chối lời mời.");
      }
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error declining invitation:", error);
      throw new Error(message);
    }
  }

  // ============ MEMBERS APIs ============

  /**
   * Xem danh sách thành viên dự án (có phân trang + ẩn danh theo vai trò)
   */
  public async getProjectMembers(
    projectId: number,
    params: GetMembersParams = {}
  ): Promise<MembersResponse> {
    try {
      const res = await apiInstance.get<ApiResponse<MembersResponse>>(
        `${this.baseUrl}/${projectId}/members`,
        {
          params: {
            page: params.page ?? 0,
            size: params.size ?? 10,
            sort: params.sort || undefined,
          },
        }
      );

      const data = res.data;
      console.log("Members API response:", data);

      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }

      throw new Error(data.message || "Không thể tải danh sách thành viên.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error fetching project members:", error);
      throw new Error(message);
    }
  }

  /**
   * Xóa thành viên khỏi dự án
   * DELETE /api/v1/projects/{projectId}/members/{userId}
   */
  public async removeProjectMember(
    projectId: number | string,
    userId: number | string
  ): Promise<void> {
    try {
      const res = await apiInstance.delete<ApiResponse<void>>(
        `${this.baseUrl}/${projectId}/members/${userId}`
      );

      const data = res.data;
      if (data.code === 200 || data.code === 0) {
        return;
      }

      throw new Error(data.message || "Không thể xóa thành viên khỏi dự án.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error removing project member:", error);
      throw new Error(message);
    }
  }

  /**
   * Lấy danh sách gợi ý người dùng để mời vào project
   * GET /api/v1/projects/{projectId}/invitations/suggestions
   */
  public async getInvitationSuggestions(
    projectId: number,
    params: GetInvitationSuggestionsParams = {}
  ): Promise<Page<InvitationSuggestion>> {
    try {
      const res = await apiInstance.get<
        ApiResponse<Page<InvitationSuggestion>>
      >(`${this.baseUrl}/${projectId}/invitations/suggestions`, {
        params: {
          page: params.page ?? 0,
          size: params.size ?? 20,
          sort: params.sort || undefined,
        },
      });

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể tải danh sách gợi ý.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error fetching invitation suggestions:", error);
      throw new Error(message);
    }
  }

  // ============ EXPENSE CHART APIs ============

  /**
   * Lấy thống kê chi phí dự án
   * GET /api/v1/projects/{projectId}/expense-chart
   */
  public async getProjectExpenseChart(
    projectId: number
  ): Promise<ProjectExpenseChartResponse> {
    try {
      const res = await apiInstance.get<
        ApiResponse<ProjectExpenseChartResponse>
      >(`${this.baseUrl}/${projectId}/expense-chart`);

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(data.message || "Không thể tải thống kê chi phí dự án.");
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error fetching project expense chart:", error);
      const newError = new Error(message);
      // Preserve status code for 404 detection
      if (error?.response?.status) {
        (newError as any).status = error.response.status;
        (newError as any).originalError = error;
      }
      throw newError;
    }
  }

  /**
   * Lấy chi tiết chi phí dịch vụ theo milestone
   * GET /api/v1/projects/{projectId}/expense-details
   */
  public async getProjectExpenseDetails(
    projectId: number
  ): Promise<ProjectExpenseDetailResponse[]> {
    try {
      const res = await apiInstance.get<
        ApiResponse<ProjectExpenseDetailResponse[]>
      >(`${this.baseUrl}/${projectId}/expense-details`);

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(
        data.message || "Không thể tải chi tiết chi phí dịch vụ."
      );
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error fetching project expense details:", error);
      throw new Error(message);
    }
  }

  /**
   * Lấy chi tiết chia tiền cho thành viên theo milestone
   * GET /api/v1/projects/{projectId}/money-split-details
   */
  public async getProjectMoneySplitDetails(
    projectId: number
  ): Promise<ProjectMoneySplitDetailResponse[]> {
    try {
      const res = await apiInstance.get<
        ApiResponse<ProjectMoneySplitDetailResponse[]>
      >(`${this.baseUrl}/${projectId}/money-split-details`);

      const data = res.data;
      if ((data.code === 200 || data.code === 0) && data.result) {
        return data.result;
      }
      throw new Error(
        data.message || "Không thể tải chi tiết chia tiền cho thành viên."
      );
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error fetching project money split details:", error);
      throw new Error(message);
    }
  }

  /**
   * Xác nhận hoàn thành dự án (chỉ client trong dự án mới được phép)
   * POST /api/v1/projects/{projectId}/complete
   */
  public async completeProject(projectId: number): Promise<void> {
    try {
      const res = await apiInstance.post<ApiResponse<unknown>>(
        `${this.baseUrl}/${projectId}/complete`
      );

      const data = res.data;
      if (data.code === 200 || data.code === 0) {
        return;
      }

      throw new Error(
        data.message || "Không thể xác nhận hoàn thành dự án. Vui lòng thử lại."
      );
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error("Error completing project:", error);
      throw new Error(message);
    }
  }
}

// Expense Chart Types
export interface ProjectExpenseChartResponse {
  totalExpenseAmount: number | string;
  totalMoneySplitAmount: number | string;
  remainingAmount: number | string;
  remainingAfterTax: number | string;
  totalTax: number | string;
  contractTotalAmount: number | string;
  percentages: {
    expense?: number | string;
    moneySplit?: number | string;
    tax?: number | string;
    remaining?: number | string;
  };
}

// Expense Detail Types
export interface MilestoneExpenseResponse {
  id: number;
  name: string;
  description?: string;
  amount: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectExpenseDetailResponse {
  milestoneId: number;
  milestoneTitle: string;
  milestoneSequence: number;
  milestoneTotalAmount: number | string;
  totalExpenseAmount: number | string;
  expenses: MilestoneExpenseResponse[];
}

// Money Split Detail Types
export interface MilestoneMoneySplitResponse {
  id: number;
  userId?: number;
  userName?: string;
  userEmail?: string;
  amount: number | string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  isCurrentUserRecipient?: boolean;
}

export interface ProjectMoneySplitDetailResponse {
  milestoneId: number;
  milestoneTitle: string;
  milestoneSequence: number;
  milestoneTotalAmount: number | string;
  totalMoneySplitAmount: number | string;
  moneySplits: MilestoneMoneySplitResponse[];
}

const projectService = new ProjectService();
export default projectService;
