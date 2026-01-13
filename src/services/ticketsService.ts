import apiInstance from "@/config/axiosCustom";

// Request/Response types
export interface TicketRequest {
  title: string;
  content: string;
  attachmentUrls?: string[];
  projectId: number;
}

export interface TicketResponse {
  id: number;
  title: string;
  status: TicketStatus;
  createdBy: string;
  projectName: string;
  projectId?: number;
  createdAt: string;
  description: string;
  attachmentUrls: string[];
}

export interface TicketReplyRequest {
  content: string;
  attachmentUrls?: string[];
}

export interface TicketReplyResponse {
  id: number;
  ticketId: number;
  content: string;
  senderName: string;
  senderRole: string;
  createdAt: string;
  attachmentUrls: string[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export enum TicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
}

// -----------------------------
// POST APIs
// -----------------------------

// Tạo ticket mới
// src/services/ticketsService.ts

export const TicketPostService = {
  createTicket: async (data: TicketRequest, files?: File[]) => {
    const formData = new FormData();

    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    if (files?.length) {
      files.forEach((f) => formData.append("files", f));
    }

    const res = await apiInstance.post("/api/tickets", formData, {
      headers: {
        "Content-Type": undefined, // để trình duyệt tự set multipart/form-data + boundary
        Accept: "application/json",
      },
    });

    return res.data;
  },
  getMyTickets: async (page = 0, size = 10) => {
    const res = await apiInstance.get("/api/tickets", {
      params: {
        page,
        size,
        sort: "createdAt,DESC",
      },
    });

    return res.data; // Page<TicketResponse>
  },
  getAllTickets: async (page = 0, size = 10) => {
    const res = await apiInstance.get<{ content: TicketResponse[]; page: any }>(
      "/api/tickets/admin",
      {
        params: { page, size, sort: "createdAt,DESC" },
      }
    );
    return res.data; // trực tiếp { content, page }
  },
  getTicketDetail: async (ticketId: number) => {
    const res = await apiInstance.get<TicketResponse>(
      `/api/tickets/${ticketId}`
    );
    return res.data;
  },
  createReply: async (
    ticketId: number,
    data: TicketReplyRequest,
    files?: File[]
  ): Promise<TicketReplyResponse> => {
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    if (files?.length) {
      files.forEach((f) => formData.append("files", f));
    }

    const res = await apiInstance.post<TicketReplyResponse>(
      `/api/tickets/${ticketId}/replies`,
      formData,
      {
        headers: {
          "Content-Type": undefined,
          Accept: "application/json",
        },
      }
    );

    return res.data;
  },

  updateTicketStatus: async (
    ticketId: number,
    status: TicketStatus
  ): Promise<TicketResponse> => {
    const res = await apiInstance.put<TicketResponse>(
      `/api/tickets/${ticketId}/status`,
      null, // không có body
      {
        params: { status }, // truyền status qua query param
      }
    );

    return res.data;
  },
  getTicketReplies: async (
    ticketId: number
  ): Promise<TicketReplyResponse[]> => {
    const res = await apiInstance.get<TicketReplyResponse[]>(
      `/api/tickets/${ticketId}/replies`
    );
    return res.data;
  },
};
