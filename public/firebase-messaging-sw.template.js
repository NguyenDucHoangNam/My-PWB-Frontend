/**
 * Firebase Messaging Service Worker Template
 * This is a TEMPLATE file - DO NOT COMMIT the generated firebase-messaging-sw.js
 * Run: npm run generate-sw (or the build script will do it automatically)
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration - these will be replaced by the build script
const firebaseConfig = {
    apiKey: "__FIREBASE_API_KEY__",
    authDomain: "__FIREBASE_AUTH_DOMAIN__",
    projectId: "__FIREBASE_PROJECT_ID__",
    storageBucket: "__FIREBASE_STORAGE_BUCKET__",
    messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
    appId: "__FIREBASE_APP_ID__",
    measurementId: "__FIREBASE_MEASUREMENT_ID__"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// ==================== CONFIGURATION ====================
// Use larger logo for better visibility (192x192 recommended)
const PWB_LOGO = '/pwb-logo.png';
const PWB_LOGO_LARGE = '/pwb-logo.png'; // For main icon
const PWB_BADGE = '/pwb-logo.png'; // Small badge icon

// Vibration patterns (in milliseconds)
const VIBRATION_PATTERNS = {
    default: [200, 100, 200],
    urgent: [300, 100, 300, 100, 300],
    gentle: [100, 50, 100],
    chat: [150, 75, 150]
};

// Get notification icon based on type
function getNotificationIcon(type, data) {
    switch (type) {
        case 'CHAT_MESSAGE':
            // Use sender's avatar for chat messages if available and valid URL
            const avatar = data?.senderAvatar;
            if (avatar && avatar.length > 0 && avatar.startsWith('http')) {
                console.log('🖼️ [SW] Using sender avatar:', avatar);
                return avatar;
            }
            console.log('🖼️ [SW] No valid avatar, using PWB logo');
            return PWB_LOGO_LARGE;
        default:
            // Use PWB logo for all other notification types
            return PWB_LOGO_LARGE;
    }
}

// ==================== MAIN HANDLER ====================
// Note: We use 'push' event listener instead of messaging.onBackgroundMessage
// because data-only messages (without notification field) are handled by push event

// Firebase onBackgroundMessage - only for messages with notification field
messaging.onBackgroundMessage((payload) => {
    console.log('📬 [SW] onBackgroundMessage received:', payload);
    // This will only fire for messages with notification field
    // Data-only messages are handled by the 'push' event listener below
});

// ==================== HELPER FUNCTIONS ====================

// Get vibration pattern based on notification type
function getVibrationPattern(type) {
    switch (type) {
        case 'CHAT_MESSAGE':
            return VIBRATION_PATTERNS.chat;
        case 'CONTRACT_SIGNED':
        case 'CONTRACT_DECLINED':
        case 'CONTRACT_INVITE':
        case 'PAYMENT_SUCCESS':
        case 'PAYMENT_FAILED':
        case 'PROJECT_INVITATION':
            return VIBRATION_PATTERNS.urgent;
        case 'FOLLOW_NEW':
            return VIBRATION_PATTERNS.gentle;
        default:
            return VIBRATION_PATTERNS.default;
    }
}

// Get notification tag based on type (for grouping)
function getNotificationTag(type, data) {
    switch (type) {
        case 'CHAT_MESSAGE':
            return `chat-${data?.conversationId || 'general'}`;
        case 'CONTRACT_SIGNED':
        case 'CONTRACT_DECLINED':
        case 'CONTRACT_INVITE':
            return `contract-${data?.relatedEntityId || 'general'}`;
        case 'PAYMENT_SUCCESS':
        case 'PAYMENT_FAILED':
            return `payment-${data?.relatedEntityId || 'general'}`;
        case 'PROJECT_UPDATE':
        case 'PROJECT_MILESTONE':
        case 'PROJECT_INVITATION':
            return `project-${data?.relatedEntityId || 'general'}`;
        case 'ORDER_STATUS':
            return `order-${data?.relatedEntityId || 'general'}`;
        default:
            return `notification-${data?.notificationId || Date.now()}`;
    }
}

// Get default action URL based on notification type
function getDefaultActionUrl(type, data) {
    switch (type) {
        case 'CHAT_MESSAGE':
            // Chat is now only available as popup, navigate to homepage
            return '/';
        case 'CONTRACT_SIGNED':
        case 'CONTRACT_DECLINED':
        case 'CONTRACT_INVITE':
            return data?.relatedEntityId ? `/contracts/${data.relatedEntityId}` : '/contracts';
        case 'PAYMENT_SUCCESS':
        case 'PAYMENT_FAILED':
            return '/wallet';
        case 'PROJECT_UPDATE':
        case 'PROJECT_MILESTONE':
        case 'PROJECT_INVITATION':
            return data?.relatedEntityId ? `/projects/${data.relatedEntityId}` : '/projects';
        case 'ORDER_STATUS':
            return data?.relatedEntityId ? `/orders/${data.relatedEntityId}` : '/orders';
        case 'FOLLOW_NEW':
            return data?.relatedEntityId ? `/profile/${data.relatedEntityId}` : '/notifications';
        default:
            return data?.actionUrl || '/notifications';
    }
}

// Check if notification should require user interaction
function shouldRequireInteraction(type) {
    // Important notifications that should stay until user interacts
    const importantTypes = [
        'CONTRACT_SIGNED', 'CONTRACT_DECLINED', 'CONTRACT_INVITE',
        'PAYMENT_SUCCESS', 'PAYMENT_FAILED',
        'PROJECT_MILESTONE', 'PROJECT_INVITATION'
    ];
    return importantTypes.includes(type);
}

// Get notification actions based on type
function getNotificationActions(type) {
    switch (type) {
        case 'CHAT_MESSAGE':
            return [
                { action: 'open', title: 'Mở Chat' },
                { action: 'dismiss', title: 'Bỏ qua' }
            ];
        case 'CONTRACT_INVITE':
            return [
                { action: 'open', title: 'Xem Hợp đồng' },
                { action: 'dismiss', title: 'Để sau' }
            ];
        case 'PROJECT_INVITATION':
            return [
                { action: 'open', title: 'Xem lời mời' },
                { action: 'dismiss', title: 'Để sau' }
            ];
        case 'ORDER_STATUS':
            return [
                { action: 'open', title: 'Xem Đơn hàng' },
                { action: 'dismiss', title: 'Bỏ qua' }
            ];
        default:
            return [
                { action: 'open', title: 'Xem chi tiết' },
                { action: 'dismiss', title: 'Bỏ qua' }
            ];
    }
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ [SW] Notification clicked:', event);

    event.notification.close();

    const action = event.action;
    const notificationData = event.notification.data;

    if (action === 'dismiss') {
        return;
    }

    // Get the URL to open based on notification type and action
    const urlToOpen = notificationData?.actionUrl || notificationData?.clickAction || '/notifications';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there's already an open window
            for (const client of windowClients) {
                if (client.url.includes(self.registration.scope)) {
                    // Focus existing window and navigate
                    client.focus();
                    client.postMessage({
                        type: 'NOTIFICATION_CLICK',
                        notificationType: notificationData?.type,
                        conversationId: notificationData?.conversationId,
                        notificationId: notificationData?.notificationId,
                        relatedEntityType: notificationData?.relatedEntityType,
                        relatedEntityId: notificationData?.relatedEntityId,
                        url: urlToOpen
                    });
                    return;
                }
            }

            // No existing window, open new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Handle push event - This is the main handler for data-only messages
self.addEventListener('push', (event) => {
    console.log('📨 [SW] Push event received:', event);

    if (!event.data) {
        console.log('⚠️ [SW] No data in push event');
        return;
    }

    try {
        const payload = event.data.json();
        console.log('📦 [SW] Push payload:', payload);

        // Extract data - could be in payload.data or directly in payload
        const data = payload.data || payload;

        // Get notification content
        const notificationType = data.type || 'GENERAL';
        const title = data.title || data.senderName || 'Producer Workbench';
        const body = data.body || data.messageContent || 'Bạn có thông báo mới';

        console.log('📝 [SW] Building notification:', { title, body, type: notificationType });

        // Get icon based on notification type (avatar for chat, PWB logo for others)
        const notificationIcon = getNotificationIcon(notificationType, data);

        // Build notification options
        const notificationOptions = {
            body: body,
            icon: notificationIcon,  // Dynamic icon based on type
            badge: PWB_BADGE,
            tag: getNotificationTag(notificationType, data),
            renotify: true,
            data: {
                conversationId: data.conversationId,
                notificationId: data.notificationId,
                type: notificationType,
                relatedEntityType: data.relatedEntityType,
                relatedEntityId: data.relatedEntityId,
                actionUrl: data.actionUrl || getDefaultActionUrl(notificationType, data),
                timestamp: Date.now()
            },
            requireInteraction: shouldRequireInteraction(notificationType),
            silent: false,
            vibrate: getVibrationPattern(notificationType),
            actions: getNotificationActions(notificationType),
            timestamp: Date.now()
        };

        event.waitUntil(
            self.registration.showNotification(title, notificationOptions)
                .then(() => console.log('✅ [SW] Notification shown successfully'))
                .catch(err => console.error('❌ [SW] Failed to show notification:', err))
        );
    } catch (error) {
        console.error('❌ [SW] Error processing push event:', error);
    }
});

console.log('✅ [SW] Firebase Messaging Service Worker loaded');
