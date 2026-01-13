/**
 * Firebase Configuration for Push Notifications
 */
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from 'firebase/messaging';

// Firebase configuration from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyA-5K5r6ekcXTVpemykfWEkqIvdh3eMl_M",
    authDomain: "producerworkbench-noti.firebaseapp.com",
    projectId: "producerworkbench-noti",
    storageBucket: "producerworkbench-noti.firebasestorage.app",
    messagingSenderId: "582889711290",
    appId: "1:582889711290:web:4805c88d333027a877c483",
    measurementId: "G-KTPJ4EJBJB"
};

// VAPID Key for Web Push
const VAPID_KEY = "BMvxS55pA2oOwuDjpSevVbIX6fxiJyQyYnqYsblw9NngegfnEfm8it6At_Mwwz1w1RIIExfWPhBP3UtDv2QWpL4";

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

/**
 * Initialize Firebase App
 */
export const initializeFirebase = (): FirebaseApp => {
    if (!app) {
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized');
    }
    return app;
};

/**
 * Get Firebase Messaging instance
 */
export const getFirebaseMessaging = (): Messaging | null => {
    if (!messaging) {
        try {
            const firebaseApp = initializeFirebase();
            messaging = getMessaging(firebaseApp);
        } catch (error) {
            console.error('❌ Failed to initialize Firebase Messaging:', error);
            return null;
        }
    }
    return messaging;
};

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
    try {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.warn('⚠️ This browser does not support notifications');
            return null;
        }

        // Check if service workers are supported
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ Service workers are not supported');
            return null;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        
        if (permission !== 'granted') {
            console.warn('⚠️ Notification permission denied');
            return null;
        }

        console.log('✅ Notification permission granted');

        // Register service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('✅ Service Worker registered:', registration);

        // Get messaging instance
        const messagingInstance = getFirebaseMessaging();
        if (!messagingInstance) {
            console.error('❌ Failed to get Firebase Messaging instance');
            return null;
        }

        // Get FCM token
        const token = await getToken(messagingInstance, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration
        });

        if (token) {
            console.log('✅ FCM Token obtained:', token.substring(0, 20) + '...');
            return token;
        } else {
            console.warn('⚠️ No FCM token available');
            return null;
        }
    } catch (error) {
        console.error('❌ Error getting FCM token:', error);
        return null;
    }
};

/**
 * Listen for foreground messages
 * These are messages that arrive when the app is in focus
 */
export const onForegroundMessage = (callback: (payload: MessagePayload) => void): (() => void) => {
    const messagingInstance = getFirebaseMessaging();
    if (!messagingInstance) {
        console.warn('⚠️ Firebase Messaging not initialized');
        return () => {};
    }

    return onMessage(messagingInstance, (payload: MessagePayload) => {
        console.log('📬 Foreground message received:', payload);
        callback(payload);
    });
};

/**
 * Get browser info for token registration
 */
export const getBrowserInfo = (): { deviceType: string; browser: string } => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    let browser = 'unknown';
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
        browser = 'chrome';
    } else if (userAgent.includes('firefox')) {
        browser = 'firefox';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
        browser = 'safari';
    } else if (userAgent.includes('edg')) {
        browser = 'edge';
    } else if (userAgent.includes('opera') || userAgent.includes('opr')) {
        browser = 'opera';
    }

    return {
        deviceType: 'web',
        browser
    };
};

export { VAPID_KEY, firebaseConfig };
