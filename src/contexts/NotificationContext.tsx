import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { NotificationResponse, SystemNotification, NotificationType, RelatedEntityType } from '@/types/notification';
import { notificationService } from '@/services/notificationService';
import { webSocketService } from '@/libs/websocket';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface NotificationContextType {
    notifications: NotificationResponse[];
    unreadCount: number;
    isLoading: boolean;
    isPanelOpen: boolean;
    setIsPanelOpen: (open: boolean) => void;
    fetchNotifications: (page?: number, append?: boolean) => Promise<void>;
    markAsRead: (notificationId: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshUnreadCount: () => Promise<void>;
    hasMore: boolean;
    currentPage: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const notificationUnsubscribeRef = useRef<(() => void) | null>(null);
    const notificationsRef = useRef<NotificationResponse[]>([]);

    // Fetch notifications
    const fetchNotifications = useCallback(async (page: number = 0, append: boolean = false) => {
        try {
            setIsLoading(true);
            const response = await notificationService.getNotifications(page, 20);

            setNotifications(prev => {
                let updated: NotificationResponse[];
                if (append) {
                    // Combine with existing, avoiding duplicates
                    const existingIds = new Set(prev.map(n => n.id));
                    const newNotifications = response.content.filter(n => !existingIds.has(n.id));
                    updated = [...prev, ...newNotifications];
                } else {
                    updated = response.content;
                }
                notificationsRef.current = updated;
                return updated;
            });

            setHasMore(response.page < response.totalPages);
            setCurrentPage(response.page);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Không thể tải thông báo');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch unread count
    const refreshUnreadCount = useCallback(async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, []);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId: number) => {
        try {
            await notificationService.markAsRead(notificationId);

            // Update local state
            setNotifications(prev => {
                const updated = prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
                notificationsRef.current = updated;
                return updated;
            });

            // Decrement unread count if it was unread
            setUnreadCount(prev => {
                const notification = notifications.find(n => n.id === notificationId);
                return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Không thể đánh dấu thông báo đã đọc');
        }
    }, [notifications]);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();

            // Update local state
            setNotifications(prev => {
                const updated = prev.map(n => ({ ...n, isRead: true }));
                notificationsRef.current = updated;
                return updated;
            });
            setUnreadCount(0);

            toast.success('Đã đánh dấu tất cả thông báo đã đọc');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Không thể đánh dấu tất cả thông báo đã đọc');
        }
    }, []);

    // Handle real-time notification from WebSocket
    const handleRealtimeNotification = useCallback((notification: SystemNotification) => {
        console.log('🔔 Received real-time notification:', notification);

        // Convert SystemNotification to NotificationResponse format
        const notificationResponse: NotificationResponse = {
            id: notification.data.notificationId,
            type: notification.data.type as NotificationType,
            title: notification.title,
            message: notification.message,
            isRead: false,
            relatedEntityType: notification.data.relatedEntityType
                ? (notification.data.relatedEntityType as RelatedEntityType)
                : null,
            relatedEntityId: notification.data.relatedEntityId || null,
            actionUrl: notification.actionUrl,
            createdAt: new Date().toISOString()
        };

        // Check if notification already exists before adding
        const isNewNotification = !notificationsRef.current.some(n => n.id === notificationResponse.id);
        console.log('🔔 Is new notification:', isNewNotification);

        // Add to notifications list (prepend)
        setNotifications(prev => {
            // Check if notification already exists
            if (prev.some(n => n.id === notificationResponse.id)) {
                console.log('🔔 Notification already exists, skipping');
                return prev;
            }
            const updated = [notificationResponse, ...prev];
            notificationsRef.current = updated;
            console.log('🔔 Added notification to list, new count:', updated.length);
            return updated;
        });

        // Immediately increment unread count for new notification (optimistic update)
        if (isNewNotification) {
            setUnreadCount(prev => {
                const newCount = prev + 1;
                console.log('🔔 Updated unread count:', prev, '->', newCount);
                return newCount;
            });
        }

        // Refresh unread count from server to ensure accuracy (async, non-blocking)
        refreshUnreadCount().then(count => {
            console.log('🔔 Server unread count:', count);
        }).catch(error => {
            console.error('Error refreshing unread count after real-time notification:', error);
        });

        // Show toast notification
        const toastType = notification.type.toLowerCase() as 'success' | 'error' | 'info';
        if (toastType === 'info') {
            toast(notification.message, {
                duration: 5000,
                icon: '🔔',
            });
        } else {
            toast[toastType](notification.message, {
                duration: 5000,
                icon: '🔔',
            });
        }

        // Play sound (optional)
        // const audio = new Audio('/notification-sound.mp3');
        // audio.play().catch(() => {});
    }, [refreshUnreadCount]);

    // Initialize: fetch unread count and first page only when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            refreshUnreadCount();
            fetchNotifications(0, false);
        } else {
            // Clear notifications when user logs out
            setNotifications([]);
            notificationsRef.current = [];
            setUnreadCount(0);
        }
    }, [isAuthenticated, refreshUnreadCount, fetchNotifications]);

    // Subscribe to WebSocket notifications only when authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            // Unsubscribe if user is not authenticated
            if (notificationUnsubscribeRef.current) {
                notificationUnsubscribeRef.current();
                notificationUnsubscribeRef.current = null;
            }
            return;
        }

        // Ensure WebSocket is connected
        if (!webSocketService.isConnected()) {
            console.log('🔔 WebSocket not connected, connecting...');
            // Connect WebSocket if not connected (using dummy handlers for chat)
            webSocketService.connect(
                () => { }, // dummy chat message handler
                () => { }, // dummy status change handler
            ).then(() => {
                console.log('🔔 WebSocket connected, subscribing to notifications...');
                // Subscribe to notifications after connection
                notificationUnsubscribeRef.current = webSocketService.subscribeToNotifications(handleRealtimeNotification);
                console.log('🔔 Subscribed to notifications');
            }).catch(error => {
                console.error('Failed to connect WebSocket for notifications:', error);
            });
        } else {
            console.log('🔔 WebSocket already connected, subscribing to notifications...');
            // Already connected, subscribe immediately
            notificationUnsubscribeRef.current = webSocketService.subscribeToNotifications(handleRealtimeNotification);
            console.log('🔔 Subscribed to notifications');
        }

        return () => {
            if (notificationUnsubscribeRef.current) {
                notificationUnsubscribeRef.current();
                notificationUnsubscribeRef.current = null;
            }
        };
    }, [isAuthenticated, handleRealtimeNotification]);

    // Refresh notifications and unread count when panel opens (only if authenticated)
    useEffect(() => {
        if (isPanelOpen && isAuthenticated) {
            // Fetch fresh notifications from server to ensure we have the latest
            fetchNotifications(0, false);
            // Also refresh unread count to sync with server
            refreshUnreadCount();
        }
    }, [isPanelOpen, isAuthenticated, fetchNotifications, refreshUnreadCount]);

    // Periodic refresh of unread count as fallback (every 10 seconds)
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            refreshUnreadCount().catch(error => {
                console.error('Error in periodic unread count refresh:', error);
            });
        }, 10000); // Refresh every 10 seconds

        return () => clearInterval(interval);
    }, [isAuthenticated, refreshUnreadCount]);

    // Listen for custom events that indicate operations completed (e.g., project created)
    useEffect(() => {
        if (!isAuthenticated) return;

        const handleOperationSuccess = () => {
            console.log('🔔 Operation success event detected, refreshing unread count...');
            // Delay slightly to allow server to process notification
            setTimeout(() => {
                refreshUnreadCount().catch(error => {
                    console.error('Error refreshing unread count after operation:', error);
                });
            }, 1000); // Wait 1 second for server to process
        };

        // Listen for custom events
        window.addEventListener('operation-success', handleOperationSuccess);
        window.addEventListener('project-created', handleOperationSuccess);
        window.addEventListener('notification-update', handleOperationSuccess);

        return () => {
            window.removeEventListener('operation-success', handleOperationSuccess);
            window.removeEventListener('project-created', handleOperationSuccess);
            window.removeEventListener('notification-update', handleOperationSuccess);
        };
    }, [isAuthenticated, refreshUnreadCount]);

    // Refresh unread count when page becomes visible (user switches back to tab)
    useEffect(() => {
        if (!isAuthenticated) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('🔔 Page became visible, refreshing unread count...');
                refreshUnreadCount().catch(error => {
                    console.error('Error refreshing unread count on visibility change:', error);
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isAuthenticated, refreshUnreadCount]);

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        isLoading,
        isPanelOpen,
        setIsPanelOpen,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        refreshUnreadCount,
        hasMore,
        currentPage
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

