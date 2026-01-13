/**
 * Push Notification Service
 * Handles FCM token registration and push notification management
 */
import { 
    requestNotificationPermission, 
    onForegroundMessage, 
    getBrowserInfo,
    initializeFirebase 
} from '@/config/firebase';
import axiosCustom from '@/config/axiosCustom';
import { MessagePayload } from 'firebase/messaging';

// API endpoints
const FCM_API = '/api/v1/fcm';

// Store unsubscribe function
let unsubscribeForegroundMessage: (() => void) | null = null;

/**
 * Register FCM token with backend
 */
const registerTokenWithBackend = async (token: string): Promise<boolean> => {
    try {
        const browserInfo = getBrowserInfo();
        
        await axiosCustom.post(`${FCM_API}/register`, {
            token,
            deviceType: browserInfo.deviceType,
            browser: browserInfo.browser
        });
        
        console.log('✅ FCM token registered with backend');
        return true;
    } catch (error) {
        console.error('❌ Failed to register FCM token with backend:', error);
        return false;
    }
};

/**
 * Unregister FCM token from backend
 */
const unregisterTokenFromBackend = async (token: string): Promise<boolean> => {
    try {
        await axiosCustom.delete(`${FCM_API}/unregister`, {
            params: { token }
        });
        
        console.log('✅ FCM token unregistered from backend');
        return true;
    } catch (error) {
        console.error('❌ Failed to unregister FCM token:', error);
        return false;
    }
};

/**
 * Initialize push notifications
 * Call this after user logs in
 */
const initializePushNotifications = async (): Promise<string | null> => {
    try {
        // Check if user is logged in
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            console.log('⚠️ User not logged in, skipping push notification setup');
            return null;
        }

        // Initialize Firebase
        initializeFirebase();

        // Request permission and get token
        const fcmToken = await requestNotificationPermission();
        
        if (!fcmToken) {
            console.warn('⚠️ Failed to get FCM token');
            return null;
        }

        // Store token locally
        localStorage.setItem('fcmToken', fcmToken);

        // Register with backend
        await registerTokenWithBackend(fcmToken);

        // Setup foreground message handler
        setupForegroundMessageHandler();

        return fcmToken;
    } catch (error) {
        console.error('❌ Failed to initialize push notifications:', error);
        return null;
    }
};

/**
 * Setup handler for foreground messages
 * These are messages that arrive when the app is in focus
 */
const setupForegroundMessageHandler = () => {
    // Unsubscribe existing handler
    if (unsubscribeForegroundMessage) {
        unsubscribeForegroundMessage();
    }

    unsubscribeForegroundMessage = onForegroundMessage((payload: MessagePayload) => {
        console.log('📬 Foreground notification received:', payload);

        // Note: Chat is now only available as popup, so we don't need to check for /chat page

        // Show notification using browser's Notification API
        if (Notification.permission === 'granted') {
            const title = payload.notification?.title || payload.data?.senderName || 'New Message';
            const body = payload.notification?.body || payload.data?.messageContent || 'You have a new message';
            
            const notification = new Notification(title, {
                body,
                icon: payload.data?.senderAvatar || '/logo192.png',
                badge: '/badge.png',
                tag: payload.data?.conversationId || 'chat-notification',
                requireInteraction: false
            });

            // Handle notification click
            notification.onclick = () => {
                window.focus();
                
                const conversationId = payload.data?.conversationId;
                if (conversationId) {
                    // Dispatch event to open chat window
                    window.dispatchEvent(new CustomEvent('openGlobalChatWithConversation', {
                        detail: { conversationId }
                    }));
                }
                
                notification.close();
            };

            // Auto close after 5 seconds
            setTimeout(() => notification.close(), 5000);
        }
    });
};

/**
 * Cleanup push notifications
 * Call this when user logs out
 */
const cleanupPushNotifications = async (): Promise<void> => {
    try {
        // Unsubscribe from foreground messages
        if (unsubscribeForegroundMessage) {
            unsubscribeForegroundMessage();
            unsubscribeForegroundMessage = null;
        }

        // Unregister token from backend
        const fcmToken = localStorage.getItem('fcmToken');
        if (fcmToken) {
            await unregisterTokenFromBackend(fcmToken);
            localStorage.removeItem('fcmToken');
        }

        console.log('✅ Push notifications cleaned up');
    } catch (error) {
        console.error('❌ Error cleaning up push notifications:', error);
    }
};

/**
 * Check if push notifications are supported
 */
const isPushNotificationSupported = (): boolean => {
    return 'Notification' in window && 
           'serviceWorker' in navigator && 
           'PushManager' in window;
};

/**
 * Get current notification permission status
 */
const getNotificationPermission = (): NotificationPermission => {
    if (!('Notification' in window)) {
        return 'denied';
    }
    return Notification.permission;
};

/**
 * Check if notifications are enabled
 */
const isNotificationEnabled = (): boolean => {
    return getNotificationPermission() === 'granted' && 
           localStorage.getItem('fcmToken') !== null;
};

export const pushNotificationService = {
    initializePushNotifications,
    cleanupPushNotifications,
    isPushNotificationSupported,
    getNotificationPermission,
    isNotificationEnabled,
    registerTokenWithBackend,
    unregisterTokenFromBackend
};
