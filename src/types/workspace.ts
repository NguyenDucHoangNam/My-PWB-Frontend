import { type PaymentStatus } from '../services/milestoneService';

/**
 * Types cho Workspace Page
 */

export type Project = {
  id: number;
  name: string;
  paymentType: string | null;
  totalAmount: number | null;
  productCount: number | null;
  fpEditAmount: number | null;
  status?: string | null;
};

export type MilestoneStatusVI =
  | "Đang Vận Hành"
  | "Chờ Khách hàng duyệt"
  | "Đang Chờ Lệnh"
  | "Nhiệm Vụ Hoàn Thành";

export type Milestone = {
  id: number;
  title: string;
  description: string;
  status: MilestoneStatusVI;
  budget: number;
  paymentStatus?: PaymentStatus;
  sequence?: number;
  productCount?: number;
  contractProductCount?: number;
  editCount?: number;
  contractFpEditCount?: number;
  contractTotalAmount?: number;
  dueDate?: string;
};

// Component Props Types
export interface StatusTagProps {
  status: MilestoneStatusVI;
}

export interface MilestoneNodeProps {
  milestone: Milestone;
  onNavigate: (id: number) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (milestone: Milestone) => void;
  onDelete?: (milestone: Milestone) => void;
  isDeleting?: boolean;
  canViewFinancialInfo?: boolean;
  contractStatus?: string | null;
  paymentType?: string | null;
  projectId?: number;
}

export interface MilestoneDashboardProps {
  project: Project;
  milestones: Milestone[];
  canCreateMilestone: boolean;
  canEditMilestone: boolean;
  canDeleteMilestone: boolean;
  canViewFinancialInfo: boolean;
  onNavigateToMilestone: (id: number) => void;
  onCreateMilestone: () => void;
  contractStatus?: string | null;
  onNavigateToContract?: () => void;
  onEditMilestone?: (milestone: Milestone) => void;
  onDeleteMilestone?: (milestone: Milestone) => void;
  deletingMilestoneId?: number | null;
  canShowContent: boolean;
  canViewContractOverview: boolean;
  // Values from useWorkspaceCalculations hook
  currencyFormatter: Intl.NumberFormat;
  numberFormatter: Intl.NumberFormat;
  usedAmount: number;
  usedProducts: number;
  usedEdits: number;
  contractAmountLimit: number | null;
  productLimit: number | null;
  editLimit: number | null;
}
