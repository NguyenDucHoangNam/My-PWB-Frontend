import apiInstance from "@/config/axiosCustom";

// --- Authentication Check ---

/**
 * Authentication error thrown when user is not logged in
 */
export class AuthenticationRequiredError extends Error {
    constructor(message: string = "Bạn cần đăng nhập để sử dụng tính năng này") {
        super(message);
        this.name = "AuthenticationRequiredError";
    }
}

/**
 * Check if user is authenticated by looking for access token
 */
const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('accessToken');
    return !!token && token.trim().length > 0;
};

/**
 * Ensure user is authenticated before proceeding
 * @throws {AuthenticationRequiredError} if user is not logged in
 */
const requireAuth = (): void => {
    if (!isAuthenticated()) {
        throw new AuthenticationRequiredError();
    }
};

// --- Request Interfaces ---

export interface AiGuidanceRequest {
    query: string;
    currentPage?: string;
    userAction?: string;
    // userRole auto-filled by backend from JWT
    maxGuides?: number;
    includeRelatedGuides?: boolean;
    // ❌ NO conversationHistory - Backend manages via Redis!
    // ❌ NO sessionId - Backend auto-generates from JWT!
}

// History
export interface ConversationHistoryResponse {
    sessionId: string;
    messages: HistoryMessage[];
    totalMessages: number;
}

export interface HistoryMessage {
    role: 'user' | 'assistant';
    content: string;
}

// --- Response Interfaces ---

export interface GuideStep {
    stepOrder: number;
    title: string;
    description: string;
    screenshotUrl: string | null;
}

export interface RelevantGuide {
    id: number;
    title: string;
    shortDescription: string;
    coverImageUrl: string;
    category: string;
    difficulty: string;
    steps: GuideStep[];
}

export interface AiGuidanceResponse {
    answer: string; // Markdown formatted with embedded images
    intent: "how-to" | "troubleshoot" | "find-feature" | "best-practice";
    confidence: number;
    relevantGuides: RelevantGuide[] | null;
    suggestedActions: string[] | null;
    relatedTopics: string[] | null;
    processingTimeMs: number;
    model: string;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

// --- Service ---

export const aiContextService = {
    /**
     * Check if user is authenticated
     */
    isAuthenticated,

    /**
     * Get AI guidance based on user query and context
     * POST /api/ai/context/guidance
     * 
     * ⚠️ REQUIRES AUTHENTICATION
     * 
     * Backend auto-manages:
     * - sessionId (generated from JWT)
     * - conversation memory (stored in Redis)
     * 
     * @throws {AuthenticationRequiredError} if user is not logged in
     */
    getGuidance: async (request: AiGuidanceRequest): Promise<ApiResponse<AiGuidanceResponse>> => {
        // ✅ Check authentication before making request
        requireAuth();

        const response = await apiInstance.post<ApiResponse<AiGuidanceResponse>>(
            "/api/ai/context/guidance",
            request,
            { timeout: 60000 } // 60 seconds for AI responses
        );
        return response.data;
    },

    /**
     * Get conversation history from Redis
     * GET /api/ai/context/history
     * 
     * ⚠️ REQUIRES AUTHENTICATION
     * 
     * @throws {AuthenticationRequiredError} if user is not logged in
     */
    getHistory: async (): Promise<ApiResponse<ConversationHistoryResponse>> => {
        // ✅ Check authentication before making request
        requireAuth();

        const response = await apiInstance.get<ApiResponse<ConversationHistoryResponse>>(
            "/api/ai/context/history"
        );
        return response.data;
    },

    /**
     * Get quick contextual help (lightweight, no conversation)
     * GET /api/ai/context/quick-help?query=...
     * 
     * ℹ️ This endpoint does NOT require authentication (for guest users)
     */
    getQuickHelp: async (query: string): Promise<ApiResponse<AiGuidanceResponse>> => {
        const response = await apiInstance.get<ApiResponse<AiGuidanceResponse>>(
            "/api/ai/context/quick-help",
            { params: { query } }
        );
        return response.data;
    },
};
