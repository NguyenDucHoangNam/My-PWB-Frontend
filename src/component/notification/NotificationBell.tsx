import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

export const NotificationBell: React.FC = () => {
    const { unreadCount, setIsPanelOpen, isPanelOpen } = useNotifications();

    return (
        <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="relative p-2 rounded-full hover:scale-110 hover:shadow-[0_0_15px_rgba(255,0,128,0.6)] transition-transform duration-300"
            aria-label="Notifications"
            title="Thông báo"
        >
            <Bell className="w-5 h-5 text-gray-300" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center font-semibold flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </button>
    );
};

