import apiInstance from "@/config/axiosCustom";

// ----- Generic API Response -----
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// ----- Scope Enum -----
export enum MilestoneBriefScope {
  EXTERNAL = "EXTERNAL",
  INTERNAL = "INTERNAL",
}

// ----- Block Response -----
export interface MilestoneBriefBlockResponse {
  id?: number;
  content: string;
  type: "DESCRIPTION" | "HARMONY" | "IMAGE" | "HUM_MELODY";
  fileKey?: string;
  label?: string;
  position?: number;
}

// ----- Group Response -----
export interface MilestoneBriefGroupResponse {
  id: number;
  title: string;
  position?: number;
  blocks: MilestoneBriefBlockResponse[];
}

// ----- Milestone Brief Response -----
export interface MilestoneBriefDetailResponse {
  milestoneId: number;
  projectId: number;
  scope: MilestoneBriefScope;
  groups: MilestoneBriefGroupResponse[];
}

// ----- Upsert Request -----
export interface MilestoneBriefUpsertRequest {
  scope: MilestoneBriefScope;
  groups: {
    id?: number;
    title: string;
    blocks: {
      id?: number;
      content: string;
      type: "DESCRIPTION" | "HARMONY" | "IMAGE" | "HUM_MELODY";
      label?: string;
      position?: number;
    }[];
  }[];
}

// ----- Service -----
export const descriptionService = {
  // ----- Public -----
  async getMilestoneBrief(projectId: number, milestoneId: number) {
    const response = await apiInstance.get<
      ApiResponse<MilestoneBriefDetailResponse>
    >(`/api/v1/projects/${projectId}/milestones/${milestoneId}/brief`);
    return response.data.result;
  },

  async createBriefGroups(
    projectId: number,
    milestoneId: number,
    payload: MilestoneBriefUpsertRequest
  ) {
    const response = await apiInstance.post<
      ApiResponse<MilestoneBriefGroupResponse[]>
    >(
      `/api/v1/projects/${projectId}/milestones/${milestoneId}/brief/groups`,
      payload
    );
    return response.data.result;
  },

  async deleteBriefGroup(
    projectId: number,
    milestoneId: number,
    groupId: number
  ) {
    const response = await apiInstance.delete<ApiResponse<void>>(
      `/api/v1/projects/${projectId}/milestones/${milestoneId}/brief/groups/${groupId}`
    );
    return response.data;
  },

  //Update theo phòng ngoại bộ
  async upsertMilestoneBrief(
    projectId: number,
    milestoneId: number,
    payload: MilestoneBriefUpsertRequest
  ) {
    const response = await apiInstance.put<
      ApiResponse<MilestoneBriefDetailResponse>
    >(`/api/v1/projects/${projectId}/milestones/${milestoneId}/brief`, payload);

    return response.data.result;
  },

  //Chuyển tiếp vào phòng nội bộ (nguyên bản)
  async forwardExternalGroupToInternal(
    projectId: number,
    milestoneId: number,
    groupId: number
  ) {
    const response = await apiInstance.post<
      ApiResponse<MilestoneBriefGroupResponse>
    >(
      `/api/v1/projects/${projectId}/milestones/${milestoneId}/brief/forward/${groupId}`
    );

    return response.data.result;
  },

  //Chuyển tiếp vào phòng nội bộ với chỉnh sửa
  async forwardExternalGroupToInternalWithEdit(
    projectId: number,
    milestoneId: number,
    groupId: number,
    editedGroup?: {
      title: string;
      position: number;
      blocks: {
        type: "DESCRIPTION" | "HARMONY" | "IMAGE" | "HUM_MELODY";
        label?: string;
        content: string;
        position: number;
      }[];
    }
  ) {
    const response = await apiInstance.post<
      ApiResponse<MilestoneBriefGroupResponse>
    >(
      `/api/v1/projects/${projectId}/milestones/${milestoneId}/brief/forward/${groupId}/edit`,
      editedGroup ? { group: editedGroup } : null
    );

    return response.data.result;
  },
  // ----- Internal -----
  async getInternalMilestoneBrief(projectId: number, milestoneId: number) {
    const response = await apiInstance.get<
      ApiResponse<MilestoneBriefDetailResponse>
    >(`/api/v1/projects/${projectId}/milestones/${milestoneId}/brief/internal`);
    return response.data.result;
  },

  async upsertInternalMilestoneBrief(
    projectId: number,
    milestoneId: number,
    payload: MilestoneBriefUpsertRequest
  ) {
    const response = await apiInstance.put<
      ApiResponse<MilestoneBriefDetailResponse>
    >(
      `/api/v1/projects/${projectId}/milestones/${milestoneId}/brief/internal`,
      payload
    );
    return response.data.result;
  },

  // ----- Upload Brief File -----
  async uploadBriefFile(
    projectId: number,
    milestoneId: number,
    file: File,
    type: string
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await apiInstance.post<ApiResponse<string>>(
      `/api/v1/projects/${projectId}/milestones/${milestoneId}/brief/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.result;
  },
  async deleteInternalBriefGroup(
    projectId: number,
    milestoneId: number,
    groupId: number
  ) {
    const response = await apiInstance.delete<ApiResponse<void>>(
      `/api/v1/projects/${projectId}/milestones/${milestoneId}/brief/internal/groups/${groupId}`
    );
    return response.data.result;
  },

  //Lấy ảnh
  async getBriefFileUrl(
    projectId: number,
    milestoneId: number,
    fileKey: string
  ) {
    const response = await apiInstance.get<ApiResponse<string>>(
      `/api/v1/projects/${projectId}/milestones/${milestoneId}/brief/file`,
      {
        params: { key: fileKey },
      }
    );

    return response.data.result; // => chính là URL
  },
};
