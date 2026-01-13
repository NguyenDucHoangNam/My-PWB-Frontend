import React, { useEffect, useRef } from 'react';
import { X, CheckCheck, ExternalLink, Calendar, FileText, Users, DollarSign, Briefcase, Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationResponse, NotificationType } from '@/types/notification';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../chat/LoadingSpinner';

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case NotificationType.PROJECT_INVITATION:
        case NotificationType.MILESTONE_INVITATION:
            return <Users size={16} className="text-blue-500" />;
        case NotificationType.MONEY_SPLIT_REQUEST:
            return <DollarSign size={16} className="text-green-500" />;
        case NotificationType.CONTRACT_SIGNING:
            return <Briefcase size={16} className="text-purple-500" />;
        default:
            return <FileText size={16} className="text-gray-500" />;
    }
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Vừa xong';
    if (diffInMins < 60) return `${diffInMins} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
};

const getGroupLabel = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    
    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return 'Tuần này';
    if (diffInDays < 30) return 'Tháng này';
    return 'Cũ hơn';
};

export const NotificationPanel: React.FC = () => {
    const {
        notifications,
        unreadCount,
        isLoading,
        isPanelOpen,
        setIsPanelOpen,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        hasMore,
        currentPage
    } = useNotifications();

    const navigate = useNavigate();
    const panelRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showAll, setShowAll] = React.useState<boolean>(false);

    // Get limited notifications (first 4) or all notifications
    const displayNotifications = React.useMemo(() => {
        if (showAll) {
            return notifications;
        }
        return notifications.slice(0, 4);
    }, [notifications, showAll]);

    // Group limited notifications by date
    const groupedDisplayNotifications = React.useMemo(() => {
        const groups: Record<string, NotificationResponse[]> = {};
        displayNotifications.forEach(notification => {
            const label = getGroupLabel(notification.createdAt);
            if (!groups[label]) {
                groups[label] = [];
            }
            groups[label].push(notification);
        });
        return groups;
    }, [displayNotifications]);

    // Handle notification click
    const handleNotificationClick = async (notification: NotificationResponse) => {
        // Mark as read if unread
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }

        // Navigate to actionUrl if available
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
            setIsPanelOpen(false);
        }
    };

    // Load more notifications on scroll
    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (!scrollElement || !isPanelOpen) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollElement;
            if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isLoading) {
                fetchNotifications(currentPage + 1, true);
            }
        };

        scrollElement.addEventListener('scroll', handleScroll);
        return () => scrollElement.removeEventListener('scroll', handleScroll);
    }, [isPanelOpen, hasMore, isLoading, currentPage, fetchNotifications]);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsPanelOpen(false);
            }
        };

        if (isPanelOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPanelOpen, setIsPanelOpen]);

    // Reset showAll when panel closes
    useEffect(() => {
        if (!isPanelOpen) {
            setShowAll(false);
        }
    }, [isPanelOpen]);

    if (!isPanelOpen) return null;

    return (
        <>
            {/* Custom Scrollbar Styles */}
            <style>{`
                .notification-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .notification-scrollbar::-webkit-scrollbar-track {
                    background: rgba(243, 244, 246, 0.5);
                    border-radius: 10px;
                    margin: 4px 0;
                }
                .dark .notification-scrollbar::-webkit-scrollbar-track {
                    background: rgba(17, 18, 23, 0.5);
                }
                .notification-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #c4b5fd 0%, #a78bfa 100%);
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: padding-box;
                }
                .notification-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #a78bfa 0%, #9333ea 100%);
                    background-clip: padding-box;
                }
                .dark .notification-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%);
                    background-clip: padding-box;
                }
                .dark .notification-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #6d28d9 0%, #5b21b6 100%);
                    background-clip: padding-box;
                }
                .notification-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #c4b5fd rgba(243, 244, 246, 0.5);
                }
                .dark .notification-scrollbar {
                    scrollbar-color: #7c3aed rgba(17, 18, 23, 0.5);
                }
            `}</style>
            
            {/* Overlay */}
            <div className="fixed inset-0 z-[9998]" onClick={() => setIsPanelOpen(false)} />
            
            {/* Panel */}
            <div
                ref={panelRef}
                className="fixed top-16 right-4 w-[400px] max-w-[90vw] z-[9999] bg-white dark:bg-dark-surface rounded-lg shadow-2xl border border-gray-200 dark:border-border-color flex flex-col max-h-[600px]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-border-color">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary">
                            Thông báo
                        </h2>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg/60 text-gray-600 dark:text-text-secondary transition-colors"
                                title="Đánh dấu tất cả đã đọc"
                            >
                                <CheckCheck size={18} />
                            </button>
                        )}
                        <button
                            onClick={() => setIsPanelOpen(false)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg/60 text-gray-600 dark:text-text-secondary transition-colors"
                            aria-label="Đóng"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto notification-scrollbar"
                >
                    {isLoading && notifications.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner size="md" color="purple" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-text-secondary">
                            <Bell size={48} className="mb-4 opacity-50" />
                            <p className="text-sm">Chưa có thông báo nào</p>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-gray-200 dark:divide-border-color">
                                {Object.entries(groupedDisplayNotifications).map(([groupLabel, groupNotifications]) => (
                                    <div key={groupLabel}>
                                        <div className="px-4 py-2 bg-gray-50 dark:bg-dark-bg/50">
                                            <span className="text-xs font-semibold text-gray-600 dark:text-text-secondary">
                                                {groupLabel}
                                            </span>
                                        </div>
                                        {groupNotifications.map((notification) => (
                                            <button
                                                key={notification.id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors ${
                                                    !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-500/10' : ''
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                            <h3 className={`text-sm font-semibold ${
                                                                !notification.isRead 
                                                                    ? 'text-gray-900 dark:text-text-primary' 
                                                                    : 'text-gray-700 dark:text-text-secondary'
                                                            }`}>
                                                                {notification.title}
                                                            </h3>
                                                            {!notification.isRead && (
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-text-secondary mb-2 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-gray-500 dark:text-text-secondary flex items-center gap-1">
                                                                <Calendar size={12} />
                                                                {formatDate(notification.createdAt)}
                                                            </span>
                                                            {notification.actionUrl && (
                                                                <ExternalLink size={12} className="text-gray-400" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Show more button */}
                            {!showAll && notifications.length > 4 && (
                                <div className="p-4 border-t border-gray-200 dark:border-border-color">
                                    <button
                                        onClick={() => setShowAll(true)}
                                        className="w-full py-2 px-4 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-lg transition-colors"
                                    >
                                        Xem tiếp ({notifications.length - 4} thông báo còn lại)
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                    
                    {/* Loading more indicator */}
                    {isLoading && notifications.length > 0 && (
                        <div className="flex items-center justify-center py-4">
                            <LoadingSpinner size="sm" color="purple" />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

