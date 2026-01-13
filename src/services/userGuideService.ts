import apiInstance from "@/config/axiosCustom";

export enum GuideCategory {
  GETTING_STARTED = "GETTING_STARTED",
  ACCOUNT_SETTINGS = "ACCOUNT_SETTINGS", // ⚠️ Was ACCOUNT_MANAGEMENT - FIXED!
  PROJECT_MANAGEMENT = "PROJECT_MANAGEMENT",
  AUDIO_PRODUCTION = "AUDIO_PRODUCTION", // ⚠️ NEW - for music production
  TRACK_MANAGEMENT = "TRACK_MANAGEMENT", // ⚠️ NEW
  COLLABORATION = "COLLABORATION", // ⚠️ NEW
  PAYMENT_BILLING = "PAYMENT_BILLING", // ⚠️ Was CONTRACTS_PAYMENTS - FIXED!
  TROUBLESHOOTING = "TROUBLESHOOTING",
}

export enum GuideDifficulty {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export interface GuideStep {
  stepOrder: number;
  title: string;
  description: string;
  imageUrl?: string;
  screenLocation?: string;
  uiElement?: string;
  expectedResult?: string;
  tips?: string;
  commonMistakes?: string;
}

export interface UserGuideIndexRequest {
  title: string;
  shortDescription?: string;
  category: GuideCategory;
  difficulty: GuideDifficulty;
  contentText: string;
  prerequisites?: string[];
  tags?: string[];
  keywords?: string[];
  searchableQueries?: string[]; // ⭐ NEW: Common user questions for better search
  steps: GuideStep[];
  author?: string;
  version?: string;
}

export interface UserGuideResponse {
  id: string;
  title: string;
  shortDescription?: string;
  category: GuideCategory;
  difficulty: GuideDifficulty;
  contentText: string;
  prerequisites: string[];
  tags: string[];
  keywords: string[];
  searchableQueries: string[]; // ⭐ NEW
  relatedGuideIds: string[];
  coverImageUrl?: string;
  viewCount: number;
  helpfulCount: number;
  author: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  steps: GuideStepResponse[];
  isActive: boolean;
}

// Helper interface for steps in response (might differ slightly from request)
export interface GuideStepResponse extends GuideStep {
  id: string;
  screenshotUrl?: string;
  videoUrl?: string;
}

export interface IndexingResultResponse {
  guideId: string;
  vectorId: string;
  status: string;
  message: string;
}

export interface UserGuideSummaryResponse {
  id: string;
  title: string;
  shortDescription: string;
  category: GuideCategory;
  difficulty: GuideDifficulty;
  coverImageUrl?: string;
  viewCount: number;
  helpfulCount: number;
  totalSteps: number;
  author: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface UserGuideFilter {
  category?: GuideCategory;
  difficulty?: GuideDifficulty;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export const userGuideService = {
  indexGuide: async (
    request: UserGuideIndexRequest,
    coverImage?: File,
    stepImages?: (File | null)[]
  ) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.warn("UserGuideService: No access token found in localStorage. API call may fail.");
    }

    const formData = new FormData();
    formData.append("request", JSON.stringify(request));

    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    if (stepImages && stepImages.length > 0) {
      stepImages.forEach((image) => {
        if (image) {
          formData.append("stepImages", image);
        } else {
          const emptyFile = new File([""], "empty.png", { type: "application/octet-stream" });
          formData.append("stepImages", emptyFile);
        }
      });
    }

    return await apiInstance.post<IndexingResultResponse>(
      "/api/user-guides/index",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  searchGuides: async (query: string) => {
    return await apiInstance.post("/api/user-guides/search", { query });
  },

  getAllGuides: async (filter?: UserGuideFilter) => {
    const params = new URLSearchParams();
    if (filter?.category) params.append("category", filter.category);
    if (filter?.difficulty) params.append("difficulty", filter.difficulty);
    if (filter?.isActive !== undefined) params.append("isActive", String(filter.isActive));

    return await apiInstance.get<ApiResponse<UserGuideSummaryResponse[]>>(`/api/user-guides?${params.toString()}`);
  },

  getGuideById: async (id: string) => {
    return await apiInstance.get<ApiResponse<UserGuideResponse>>(`/api/user-guides/${id}`);
  },

  updateGuide: async (
    id: string,
    request: UserGuideIndexRequest,
    coverImage?: File,
    stepImages?: (File | null)[]
  ) => {
    const formData = new FormData();

    // ✅ Gửi JSON như text field, KHÔNG phải file
    // Cách 1: Append trực tiếp string (recommended cho @RequestParam)
    formData.append("request", JSON.stringify(request));

    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    if (stepImages && stepImages.length > 0) {
      stepImages.forEach((image) => {
        if (image) {
          formData.append("stepImages", image);
        } else {
          const emptyFile = new File([""], "empty.png", { type: "application/octet-stream" });
          formData.append("stepImages", emptyFile);
        }
      });
    }

    return await apiInstance.put<UserGuideResponse>(
      `/api/user-guides/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  deleteGuide: async (id: string) => {
    return await apiInstance.delete<void>(`/api/user-guides/index/${id}`);
  }
};
