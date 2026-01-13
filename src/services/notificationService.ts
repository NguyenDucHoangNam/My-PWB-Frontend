import { ApiResponse, NotificationPageResponse } from '@/types/notification';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

class NotificationService {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    async getNotifications(page: number = 0, size: number = 20): Promise<NotificationPageResponse> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/v1/notifications?page=${page}&size=${size}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch notifications: ${response.statusText}`);
            }

            const data: ApiResponse<NotificationPageResponse> = await response.json();
            return data.result;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    async getUnreadCount(): Promise<number> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/v1/notifications/unread-count`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch unread count: ${response.statusText}`);
            }

            const data: ApiResponse<number> = await response.json();
            return data.result;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    }

    async markAsRead(notificationId: number): Promise<void> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/v1/notifications/${notificationId}/read`,
                {
                    method: 'PUT',
                    headers: this.getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to mark notification as read: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    async markAllAsRead(): Promise<void> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/v1/notifications/read-all`,
                {
                    method: 'PUT',
                    headers: this.getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to mark all as read: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
            throw error;
        }
    }
}

export const notificationService = new NotificationService();

