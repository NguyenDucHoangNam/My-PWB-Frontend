/**
 * Types cho ProjectWorkspaceDetailPage
 */

import { type LucideIcon } from 'lucide-react';

export type MilestoneStatus = 'Chờ Khách hàng duyệt' | 'Đang Vận Hành' | 'Đang Chờ Lệnh' | 'Nhiệm Vụ Hoàn Thành';

export type MilestoneDetail = {
    id: string;
    title: string;
    status: MilestoneStatus;
    description: string;
    budget: number;
    deadline: string;
};

export type Collaborator = {
    id: string;
    name: string;
    avatar: string;
    role?: 'OWNER' | 'CLIENT' | 'COLLABORATOR' | 'OBSERVER';
    description?: string | null;
    isAnonymous?: boolean;
};

// Component Props Types
export interface StaticInfoPanelProps {
    milestone: MilestoneDetail;
}

export interface TabButtonProps {
    label: string;
    icon: LucideIcon;
    isActive: boolean;
    onClick: () => void;
}

export interface WorkspaceNavigationBoxProps {
    title: string;
    description?: string;
    icon: LucideIcon;
    borderColor: string;
    textColor: string;
    hasPermission: boolean;
    onNavigate: () => void;
    animationType?: 'signal-station' | 'approval-bay';
}

export interface WorkspaceTabProps {
    onNavigateToInternalStudio: () => void;
    onNavigateToClientRoom: () => void;
    canEnterInternalRoom: boolean;
    canEnterCustomerRoom: boolean;
    projectRole?: 'OWNER' | 'CLIENT' | 'COLLABORATOR' | 'OBSERVER';
    contractStatus: string | null;
    allMoneySplitsApproved: boolean;
}

export interface MembersTabProps {
    assigned: Collaborator[];
    projectId: string | number;
    milestoneId: string | number;
    onAssignmentChange: (members: Collaborator[]) => void;
    permission?: import('./permission').ProjectPermissionResponse | null;
}

export interface FinanceTabProps {
    assignedMembers: Collaborator[];
    totalBudget: number;
    projectId: string | number;
    milestoneId: string | number;
    permission?: import('./permission').ProjectPermissionResponse | null;
    onMoneySplitStatusChange?: () => void;
}

