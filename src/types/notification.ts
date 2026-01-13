export enum NotificationType {
    SYSTEM = "SYSTEM",
    PROJECT_INVITATION = "PROJECT_INVITATION",
    MILESTONE_INVITATION = "MILESTONE_INVITATION",
    MONEY_SPLIT_REQUEST = "MONEY_SPLIT_REQUEST",
    CONTRACT_SIGNING = "CONTRACT_SIGNING"
}

export enum RelatedEntityType {
    PROJECT = "PROJECT",
    MILESTONE = "MILESTONE",
    MONEY_SPLIT = "MONEY_SPLIT",
    CONTRACT = "CONTRACT",
    INVITATION = "INVITATION"
}

export interface NotificationResponse {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    relatedEntityType: RelatedEntityType | null;
    relatedEntityId: number | null;
    actionUrl: string | null;
    createdAt: string; // ISO date string
}

export interface SystemNotification {
    type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
    title: string;
    message: string;
    requiresAction: boolean;
    actionUrl: string | null;
    data: {
        notificationId: number;
        type: string; // NotificationType enum value
        relatedEntityType: string; // RelatedEntityType enum value or ""
        relatedEntityId: number; // or 0 if null
    };
}

export interface NotificationPageResponse {
    content: NotificationResponse[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

