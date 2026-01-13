import apiInstance from "../config/axiosCustom";
import { ApiResponse, ConversationCreationResponse, ChatMessage, ParticipantInfoDetailResponse, PageResponse, ConversationType } from "@/types/chat";
import { FileMetaDataResponse, UploadProgress } from "@/types/file";
import { AxiosProgressEvent } from "axios";

export class ApiService {
    static async getConversations(): Promise<ConversationCreationResponse[]> {
        try {
            const response = await apiInstance.get<ApiResponse<ConversationCreationResponse[]>>(
                "/conversations"
            );
            return response.data.result || [];
        } catch (error) {
            throw error;
        }
    }



    static async getMessages(conversationId: string, page: number = 1, size: number = 15): Promise<PageResponse<ChatMessage>> {
        try {
            const response = await apiInstance.get<ApiResponse<PageResponse<ChatMessage>>>(
                `/chat/${conversationId}?page=${page}&size=${size}`
            );

            const pageData = response.data.result;

            if (!pageData) {
                return {
                    page: 1,
                    size: size,
                    totalPages: 0,
                    totalElements: 0,
                    content: [],
                    last: false
                };
            }

            return pageData;
        } catch (error) {
            throw error;
        }
    }

    static async searchUsers(username: string): Promise<ParticipantInfoDetailResponse[]> {
        try {
            const response = await apiInstance.get<ApiResponse<ParticipantInfoDetailResponse[]>>(
                `api/v1/users?username=${encodeURIComponent(username)}`
            );
            return response.data.result || [];
        } catch (error) {
            throw error;
        }
    }

    static async createConversation(
        participantIds: string[],
        conversationType: ConversationType = ConversationType.PRIVATE,
        conversationName?: string,
        conversationAvatar?: string
    ): Promise<ConversationCreationResponse> {
        try {
            const response = await apiInstance.post<ApiResponse<ConversationCreationResponse>>(
                "/conversations",
                {
                    participantIds,
                    conversationType,
                    conversationName,
                    conversationAvatar
                }
            );
            return response.data.result;
        } catch (error) {
            throw error;
        }
    }

    static async deleteConversation(conversationId: string): Promise<void> {
        try {
            await apiInstance.delete<ApiResponse<void>>(
                `/conversations/${conversationId}`
            );
        } catch (error) {
            throw error;
        }
    }

    static async addMembersToGroup(
        conversationId: string,
        memberIds: number[]
    ): Promise<ConversationCreationResponse> {
        try {
            const response = await apiInstance.post<ApiResponse<ConversationCreationResponse>>(
                `/conversations/${conversationId}/members`,
                {
                    memberIds
                }
            );
            return response.data.result;
        } catch (error) {
            throw error;
        }
    }

    // static async updateFcmToken(fcmToken: string): Promise<void> {
    //     try {
    //         await apiInstance.post("/users/register-fcm-token", { fcmToken });
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    static async markAsRead(conversationId: string, messageId: string): Promise<void> {
        try {
            await apiInstance.post(
                `/chat/${conversationId}/read/${messageId}`,
                {}
            );
        } catch (error) {
            console.error('❌ Failed to mark as read via HTTP:', error);
            throw error;
        }
    }

    static async getOnlineStatus(conversationId: string): Promise<Record<string, boolean>> {
        try {
            const response = await apiInstance.get<ApiResponse<Record<string, boolean>>>(
                `/chat/${conversationId}/online-status`
            );
            return response.data.result || {};
        } catch (error) {
            throw error;
        }
    }

    static async uploadFilesSync(
        files: File[],
        onProgress?: (progressEvent: AxiosProgressEvent) => void
    ): Promise<FileMetaDataResponse[]> {
        const formData = new FormData();

        files.forEach((file) => {
            formData.append('files', file);
        });

        try {
            const response = await apiInstance.post<ApiResponse<FileMetaDataResponse[]>>(
                '/files/upload-media-sync',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: onProgress
                }
            );

            return response.data.result || [];
        } catch (error) {
            throw error;
        }
    }

    static async uploadFilesSyncWithProgress(
        files: File[],
        onProgress?: (progress: UploadProgress[]) => void
    ): Promise<FileMetaDataResponse[]> {
        try {
            const result = await this.uploadFilesSync(files, (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );

                    // Create progress for all files (simplified for sync upload)
                    const progressArray: UploadProgress[] = files.map((file, index) => ({
                        fileId: `${file.name}-${index}`,
                        progress: progress,
                        status: progress === 100 ? 'completed' : 'uploading'
                    }));

                    onProgress(progressArray);
                }
            });

            return result;
        } catch (error) {
            console.error('File upload error:', error);
            throw new Error('Upload failed');
        }
    }

    static async uploadFilesAsync(
        conversationId: string,
        files: File[],
        onProgress?: (progressEvent: AxiosProgressEvent) => void
    ): Promise<FileMetaDataResponse[]> {
        const formData = new FormData();

        files.forEach((file) => {
            formData.append('files', file);
        });

        try {
            const response = await apiInstance.post<ApiResponse<FileMetaDataResponse[]>>(
                `api/v1/files/upload/chat-message-files?conversationId=${conversationId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: onProgress
                }
            );

            return response.data.result || [];
        } catch (error) {
            console.error('Error uploading files async:', error);
            throw error;
        }
    }

    static async uploadFilesAsyncWithProgress(
        conversationId: string,
        files: File[],
        onProgress?: (progress: UploadProgress[]) => void
    ): Promise<FileMetaDataResponse[]> {
        try {
            const result = await this.uploadFilesAsync(conversationId, files, (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );

                    const progressArray: UploadProgress[] = files.map((file, index) => ({
                        fileId: `${file.name}-${index}`,
                        progress: progress,
                        status: progress === 100 ? 'completed' : 'uploading'
                    }));

                    onProgress(progressArray);
                }
            });

            return result;
        } catch (error) {
            console.error('File upload error:', error);

            // Preserve original error message
            if (error instanceof Error) {
                throw error;
            }

            // For axios errors, extract meaningful message
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as any;
                const message = axiosError.response?.data?.message ||
                    axiosError.response?.data?.error ||
                    axiosError.message ||
                    'Upload failed';
                throw new Error(message);
            }

            throw new Error('Upload failed');
        }
    }

    static validateFile(file: File): { isValid: boolean; error?: string } {
        const maxSize = 100 * 1024 * 1024; // 100MB

        if (file.size > maxSize) {
            return {
                isValid: false,
                error: `File "${file.name}" exceeds the 100MB size limit (${this.formatFileSize(file.size)}). Please choose a smaller file.`
            };
        }

        const allowedTypes = [
            // Images
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
            // Videos
            'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv',
            // Audio
            'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/m4a', 'audio/wma',
            // Documents
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/rtf', 'application/vnd.oasis.opendocument.text',
            // Spreadsheets
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.oasis.opendocument.spreadsheet',
            // Presentations
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.oasis.opendocument.presentation',
            // Archives
            'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip',
            // Text
            'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript', 'text/xml', 'application/json', 'text/markdown'
        ];

        if (!allowedTypes.includes(file.type)) {
            const error = `🚫 File "${file.name}" format is not supported. Please choose a different file type.`;
            return {
                isValid: false,
                error
            };
        }

        return { isValid: true };
    }

    static validateFiles(files: File[]): { isValid: boolean; errors: string[] } {
        const maxFiles = 10;
        const errors: string[] = [];

        if (files.length > maxFiles) {
            errors.push(`📂 Maximum ${maxFiles} files allowed per message. Please select fewer files.`);
        }

        files.forEach((file, index) => {
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                errors.push(validation.error || `❌ File ${index + 1} (${file.name}): Invalid file`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static createImagePreview(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                reject(new Error('File is not an image'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target?.result as string);
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        });
    }

}
