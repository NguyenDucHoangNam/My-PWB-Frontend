import apiInstance from "../config/axiosCustom";

interface ApiResponse<T> {
    code: number;
    message?: string;
    result?: T;
}

// Portfolio Section Types
export enum PortfolioSectionType {
    BIO = "BIO",
    EXPERIENCE = "EXPERIENCE",
    AWARD = "AWARD",
    EDUCATION = "EDUCATION",
    CUSTOM = "CUSTOM",
    SKILLS = "SKILLS",
    SERVICE = "SERVICE",
    TOOLS = "TOOLS",
}

export interface PortfolioSectionRequest {
    title: string;
    content: string;
    displayOrder: number;
    sectionType: PortfolioSectionType;
}

export interface PortfolioSectionResponse {
    id: number;
    title: string;
    content: string;
    displayOrder?: number;
    sectionType?: PortfolioSectionType;
    order?: number; // Keep for backward compatibility
}

// Personal Project Types
export interface PersonalProjectRequest {
    title: string;
    description: string;
    audioDemoUrl?: string;
    coverImageUrl?: string;
    releaseYear?: number;
}

export interface PersonalProjectResponse {
    id: number;
    title: string;
    description: string;
    audioDemoUrl?: string;
    coverImageUrl?: string;
    releaseYear?: number;
}

// Social Link Types
export interface SocialLinkRequest {
    platform: string;
    url: string;
}

export interface SocialLinkResponse {
    id: number;
    platform: string;
    url: string;
}

// Portfolio Request Types
export interface PortfolioRequest {
    customUrlSlug?: string;
    headline?: string;
    latitude?: number;
    longitude?: number;
    genreIds?: number[];
    tags?: string[];
    sections?: PortfolioSectionRequest[];
    personalProjects?: PersonalProjectRequest[];
    socialLinks?: SocialLinkRequest[];
}

// Portfolio Update Request Types
export interface PortfolioSectionUpdateRequest {
    id?: number;
    title: string;
    content: string;
    displayOrder: number;
    sectionType: PortfolioSectionType;
}

export interface PersonalProjectUpdateRequest {
    id?: number;
    title: string;
    description: string;
    releaseYear: number;
    // Note: audioDemoUrl and coverImageUrl are NOT sent in update request
    // They are uploaded separately via projectAudioDemos and projectCoverImages
}

export interface SocialLinkUpdateRequest {
    id?: number;
    platform: string;
    url: string;
}

export interface PortfolioUpdateRequest {
    id: number;
    customUrlSlug?: string;
    headline?: string;
    latitude?: number;
    longitude?: number;
    genreIds?: number[];
    tags?: string[];
    sections?: PortfolioSectionUpdateRequest[];
    personalProjects?: PersonalProjectUpdateRequest[];
    socialLinks?: SocialLinkUpdateRequest[];
}

// Portfolio Response Types
export interface PortfolioResponse {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    customUrlSlug: string;
    headline: string;
    coverImageUrl: string | null;
    isPublic: boolean;
    latitude: number | null;
    longitude: number | null;
    genres: string[];
    tags: string[];
    sections: PortfolioSectionResponse[];
    personalProjects: PersonalProjectResponse[];
    socialLinks: SocialLinkResponse[];
    role?: string;
}

class PortfolioService {
    private extractErrorMessage(error: any): string {
        if (error?.response?.status === 401)
            return "Phiên đăng nhập hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại.";
        if (error?.response?.data?.message) return error.response.data.message;
        if (error?.message) return error.message;
        return "Có lỗi xảy ra. Vui lòng thử lại.";
    }

    public async getPersonalPortfolio(): Promise<PortfolioResponse> {
        try {
            const res = await apiInstance.get<ApiResponse<PortfolioResponse>>(
                "/api/v1/portfolios/personal"
            );

            const data = res.data;
            if ((data.code === 200 || data.code === 0) && data.result) {
                return data.result;
            }
            throw new Error(data.message || "Invalid response structure from server.");
        } catch (error: any) {
            // Check if error is PORTFOLIO_NOT_FOUND
            const errorMessage = this.extractErrorMessage(error);
            const errorCode = error?.response?.data?.code;

            // Check for PORTFOLIO_NOT_FOUND error
            if (
                error?.response?.status === 404 ||
                errorCode === "PORTFOLIO_NOT_FOUND" ||
                errorMessage?.toUpperCase().includes("PORTFOLIO_NOT_FOUND") ||
                errorMessage?.toUpperCase().includes("PORTFOLIO") && errorMessage?.toUpperCase().includes("NOT FOUND")
            ) {
                const portfolioNotFoundError = new Error("PORTFOLIO_NOT_FOUND");
                (portfolioNotFoundError as any).code = "PORTFOLIO_NOT_FOUND";
                (portfolioNotFoundError as any).status = 404;
                throw portfolioNotFoundError;
            }

            throw new Error(errorMessage);
        }
    }

    public async getPortfolioById(id: number): Promise<PortfolioResponse> {
        try {
            const res = await apiInstance.get<ApiResponse<PortfolioResponse>>(
                `/api/v1/portfolios/${id}`
            );

            const data = res.data;
            if ((data.code === 200 || data.code === 0) && data.result) {
                return data.result;
            }
            throw new Error(data.message || "Invalid response structure from server.");
        } catch (error: any) {
            const errorMessage = this.extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }

    public async getPortfolioByUserId(userId: number): Promise<PortfolioResponse> {
        try {
            const res = await apiInstance.get<ApiResponse<PortfolioResponse>>(
                `/api/v1/portfolios/user/${userId}`
            );

            const data = res.data;
            if ((data.code === 200 || data.code === 0) && data.result) {
                return data.result;
            }
            throw new Error(data.message || "Invalid response structure from server.");
        } catch (error: any) {
            const errorMessage = this.extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }

    public async getPortfolioBySlug(slug: string): Promise<PortfolioResponse> {
        try {
            const res = await apiInstance.get<ApiResponse<PortfolioResponse>>(
                `/api/v1/portfolios/slug/${slug}`
            );

            const data = res.data;
            if ((data.code === 200 || data.code === 0) && data.result) {
                return data.result;
            }
            throw new Error(data.message || "Invalid response structure from server.");
        } catch (error: any) {
            const errorMessage = this.extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }

    public async createPortfolio(
        portfolioData: PortfolioRequest,
        coverImage?: File
    ): Promise<PortfolioResponse> {
        try {
            const formData = new FormData();

            // Add cover image if provided
            if (coverImage) {
                formData.append("coverImage", coverImage);
            }

            formData.append(
                "data",
                new Blob([JSON.stringify(portfolioData)], { type: "application/json" })
            );

            const res = await apiInstance.post<ApiResponse<PortfolioResponse>>(
                "/api/v1/portfolios",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const data = res.data;
            if ((data.code === 201 || data.code === 200) && data.result) {
                return data.result;
            }
            throw new Error(data.message || "Invalid response structure from server.");
        } catch (error: unknown) {
            const message = this.extractErrorMessage(error);
            throw new Error(message);
        }
    }

    public async updatePortfolio(
        portfolioData: PortfolioUpdateRequest,
        coverImage?: File,
        projectAudioDemos?: Map<string, File>,
        projectCoverImages?: Map<string, File>
    ): Promise<PortfolioResponse> {
        try {
            const formData = new FormData();

            // Add cover image if provided
            if (coverImage) {
                formData.append("coverImage", coverImage);
            }

            // Add project audio demos (Map with index as key)
            if (projectAudioDemos && projectAudioDemos.size > 0) {
                projectAudioDemos.forEach((file, index) => {
                    formData.append(`projectAudioDemos[${index}]`, file);
                });
            }

            // Add project cover images (Map with index as key)
            if (projectCoverImages && projectCoverImages.size > 0) {
                projectCoverImages.forEach((file, index) => {
                    formData.append(`projectCoverImages[${index}]`, file);
                });
            }

            // Prepare portfolio data - remove audioDemoUrl and coverImageUrl from personalProjects
            const cleanPortfolioData: PortfolioUpdateRequest = {
                ...portfolioData,
                personalProjects: portfolioData.personalProjects?.map((project) => ({
                    id: project.id,
                    title: project.title,
                    description: project.description,
                    releaseYear: project.releaseYear,
                    // Explicitly exclude audioDemoUrl and coverImageUrl
                })),
            };

            formData.append(
                "data",
                new Blob([JSON.stringify(cleanPortfolioData)], { type: "application/json" })
            );

            const res = await apiInstance.put<ApiResponse<PortfolioResponse>>(
                "/api/v1/portfolios/personal",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const data = res.data;
            if ((data.code === 200 || data.code === 0) && data.result) {
                return data.result;
            }
            throw new Error(data.message || "Invalid response structure from server.");
        } catch (error: any) {
            const message = this.extractErrorMessage(error);

            // Check for FILE_TOO_LARGE error (code 8000)
            if (error?.response?.data?.code === 8000 || error?.response?.data?.code === "FILE_TOO_LARGE") {
                throw new Error("File quá lớn. Audio demo tối đa 20MB.");
            }

            throw new Error(message);
        }
    }
}

export const portfolioService = new PortfolioService();

