import { useMemo } from 'react';
import { type ProjectPermissionResponse } from '../../types/permission';

/**
 * Custom hook để extract và sử dụng permission flags dễ dàng
 * Giúp code gọn gàng và dễ maintain hơn
 */
export const usePermissions = (permissions: ProjectPermissionResponse | null) => {
    return useMemo(() => {
        if (!permissions) {
            return {
                // Role info
                userRole: null,
                projectRole: null,
                anonymous: false,
                
                // Project permissions
                project: {
                    canCreateProject: false,
                    canInviteMembers: false,
                    canRemoveMembers: false,
                    canUpdateMemberRole: false,
                    canViewProject: false,
                    canEditProject: false,
                    canDeleteProject: false,
                    canViewMembers: false,
                    canManageInvitations: false,
                    canAcceptInvitation: false,
                    canDeclineInvitation: false,
                    canViewMyInvitations: false,
                },
                
                // Room permissions
                room: {
                    canEnterCustomerRoom: false,
                    canEnterInternalRoom: false,
                },
                
                // Milestone permissions
                milestone: {
                    canCreateMilestone: false,
                    canViewMilestones: false,
                    canEditMilestone: false,
                    canDeleteMilestone: false,
                    canAddMembersToMilestone: false,
                    canRemoveMembersFromMilestone: false,
                    canCompleteMilestone: false,
                },
                
                // Contract permissions
                contract: {
                    canCreateContract: false,
                    canViewContract: false,
                    canInviteToSign: false,
                    canDeclineContract: false,
                    canEditContract: false,
                },
                
                // Payment permissions
                payment: {
                    canCreatePayment: false,
                    canViewPayment: false,
                },
                
                // Money split permissions
                moneySplit: {
                    canCreateMoneySplit: false,
                    canUpdateMoneySplit: false,
                    canDeleteMoneySplit: false,
                    canApproveMoneySplit: false,
                    canRejectMoneySplit: false,
                    canViewMoneySplit: false,
                },
                
                // Expense permissions
                expense: {
                    canCreateExpense: false,
                    canUpdateExpense: false,
                    canDeleteExpense: false,
                },
                
                // Track permissions
                track: {
                    canUploadTrack: false,
                    canViewTrack: false,
                    canUpdateTrack: false,
                    canDeleteTrack: false,
                    canPlayTrack: false,
                    canApproveTrackStatus: false,
                },
                
                // Client delivery permissions
                clientDelivery: {
                    canSendTrackToClient: false,
                    canViewClientTracks: false,
                    canAcceptDelivery: false,
                    canRejectDelivery: false,
                    canRequestEditDelivery: false,
                    canViewProductCountRemaining: false,
                    canCancelDelivery: false,
                    canCreateClientRoomComment: false,
                    canViewClientRoomComments: false,
                    canUpdateClientRoomComment: false,
                    canDeleteClientRoomComment: false,
                    canUpdateClientRoomCommentStatus: false,
                },
                
                // Addendum permissions
                addendum: {
                    canCreateAddendum: false,
                    canViewAddendum: false,
                    canInviteToSign: false,
                    canDeclineAddendum: false,
                    canEditAddendum: false,
                    canCreateAddendumPayment: false,
                },
            };
        }

        return {
            // Role info
            userRole: permissions.role.userRole,
            projectRole: permissions.role.projectRole,
            anonymous: permissions.role.anonymous,
            
            // Project permissions
            project: permissions.project,
            
            // Room permissions
            room: permissions.room,
            
            // Milestone permissions
            milestone: permissions.milestone,
            
            // Contract permissions
            contract: permissions.contract,
            
            // Payment permissions
            payment: permissions.payment,
            
            // Money split permissions
            moneySplit: permissions.moneySplit,
            
            // Expense permissions
            expense: permissions.expense,
            
            // Track permissions
            track: permissions.track,
            
            // Client delivery permissions
            clientDelivery: permissions.clientDelivery,
            
            // Addendum permissions
            addendum: permissions.addendum,
        };
    }, [permissions]);
};

