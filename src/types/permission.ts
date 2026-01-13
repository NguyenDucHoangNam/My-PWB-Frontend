/**
 * Permission Types - Nguồn sự thật duy nhất về quyền trong FE
 * Cấu trúc này giữ nguyên format từ API /api/v1/projects/{id}/permissions
 */

// Role Types
export type UserRole = "CUSTOMER" | "PRODUCER" | "ADMIN";
export type ProjectRole = "OWNER" | "CLIENT" | "COLLABORATOR" | "OBSERVER" | null;

export interface RoleInfo {
  userRole: UserRole;
  projectRole: ProjectRole;
  anonymous: boolean;
}

// Permission Group Types
export interface ProjectPermissions {
  canCreateProject: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canUpdateMemberRole: boolean;
  canViewProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canViewMembers: boolean;
  canManageInvitations: boolean;
  canAcceptInvitation: boolean;
  canDeclineInvitation: boolean;
  canViewMyInvitations: boolean;
}

export interface RoomPermissions {
  canEnterCustomerRoom: boolean;
  canEnterInternalRoom: boolean;
}

export interface MilestonePermissions {
  canCreateMilestone: boolean;
  canViewMilestones: boolean;
  canEditMilestone: boolean;
  canDeleteMilestone: boolean;
  canAddMembersToMilestone: boolean;
  canRemoveMembersFromMilestone: boolean;
  canCompleteMilestone: boolean;
}

export interface ContractPermissions {
  canCreateContract: boolean;
  canViewContract: boolean;
  canInviteToSign: boolean;
  canDeclineContract: boolean;
  canEditContract: boolean;
}

export interface PaymentPermissions {
  canCreatePayment: boolean;
  canViewPayment: boolean;
}

export interface MoneySplitPermissions {
  canCreateMoneySplit: boolean;
  canUpdateMoneySplit: boolean;
  canDeleteMoneySplit: boolean;
  canApproveMoneySplit: boolean;
  canRejectMoneySplit: boolean;
  canViewMoneySplit: boolean;
}

export interface ExpensePermissions {
  canCreateExpense: boolean;
  canUpdateExpense: boolean;
  canDeleteExpense: boolean;
}

export interface TrackPermissions {
  canUploadTrack: boolean;
  canViewTrack: boolean;
  canUpdateTrack: boolean;
  canDeleteTrack: boolean;
  canPlayTrack: boolean;
  canApproveTrackStatus: boolean;
  canDownloadTrack: boolean;
}

export interface ClientDeliveryPermissions {
  canSendTrackToClient: boolean;
  canViewClientTracks: boolean;
  canAcceptDelivery: boolean;
  canRejectDelivery: boolean;
  canRequestEditDelivery: boolean;
  canViewProductCountRemaining: boolean;
  canCancelDelivery: boolean;
  canCreateClientRoomComment: boolean;
  canViewClientRoomComments: boolean;
  canUpdateClientRoomComment: boolean;
  canDeleteClientRoomComment: boolean;
  canUpdateClientRoomCommentStatus: boolean;
}

export interface AddendumPermissions {
  canCreateAddendum: boolean;
  canViewAddendum: boolean;
  canInviteToSign: boolean;
  canDeclineAddendum: boolean;
  canEditAddendum: boolean;
  canCreateAddendumPayment: boolean;
}

// Main Permission Response Interface
export interface ProjectPermissionResponse {
  role: RoleInfo;
  project: ProjectPermissions;
  room: RoomPermissions;
  milestone: MilestonePermissions;
  contract: ContractPermissions;
  payment: PaymentPermissions;
  moneySplit: MoneySplitPermissions;
  expense: ExpensePermissions;
  track: TrackPermissions;
  clientDelivery: ClientDeliveryPermissions;
  addendum: AddendumPermissions;
  reason: string | null;
}

// Utility Types for easier access
export type PermissionGroup = keyof Omit<ProjectPermissionResponse, "role" | "reason">;

/**
 * Extract a specific permission group from ProjectPermissionResponse
 */
export type ExtractPermissionGroup<T extends PermissionGroup> = ProjectPermissionResponse[T];

/**
 * Check if user has a specific role
 * @example
 * const isOwner = (permissions: ProjectPermissionResponse | null) => 
 *   permissions?.role.projectRole === "OWNER";
 */
export type HasRoleCheck = (permissions: ProjectPermissionResponse | null) => boolean;


