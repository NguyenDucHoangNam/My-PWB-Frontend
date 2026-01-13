import { useState, useEffect, useCallback, useMemo } from 'react';
import projectService from '../../../services/projectService';
import clientDeliveryService from '../../../services/clientDeliveryService';
import { useAuth } from '@/contexts/AuthContext';
import { type ProjectPermissionResponse } from '../../../types/permission';

/**
 * Hook để quản lý permission và client delivery info cho Internal Studio Page
 */
export const useInternalStudioPermissions = (
    projectId: string | null,
    milestoneId: string | null
) => {
    const [permission, setPermission] = useState<ProjectPermissionResponse | null>(null);
    const { userRole } = useAuth();
    const isAdmin = userRole === "ADMIN";

    // Client delivery states
    const [productCountRemaining, setProductCountRemaining] = useState<number>(0);
    const [editCountRemaining, setEditCountRemaining] = useState<number>(0);
    const [sentToClientTrackIds, setSentToClientTrackIds] = useState<Set<number>>(new Set());

    // Load permission
    useEffect(() => {
        const loadPermission = async () => {
            if (isAdmin) {
                // Cho phép admin xem phòng nội bộ ở chế độ chỉ xem
                setPermission({
                    role: {
                        userRole: "ADMIN",
                        projectRole: null,
                        anonymous: false,
                    },
                    room: {
                        canEnterCustomerRoom: true,
                        canEnterInternalRoom: true,
                    },
                    project: {
                        canCreateProject: false,
                        canInviteMembers: false,
                        canRemoveMembers: false,
                        canUpdateMemberRole: false,
                        canViewProject: true,
                        canEditProject: false,
                        canDeleteProject: false,
                        canViewMembers: true,
                        canManageInvitations: false,
                        canAcceptInvitation: false,
                        canDeclineInvitation: false,
                        canViewMyInvitations: false,
                    },
                    milestone: {
                        canCreateMilestone: false,
                        canViewMilestones: true,
                        canEditMilestone: false,
                        canDeleteMilestone: false,
                        canAddMembersToMilestone: false,
                        canRemoveMembersFromMilestone: false,
                        canCompleteMilestone: false,
                    },
                    contract: {
                        canCreateContract: false,
                        canViewContract: true,
                        canInviteToSign: false,
                        canDeclineContract: false,
                        canEditContract: false,
                    },
                    payment: {
                        canCreatePayment: false,
                        canViewPayment: true,
                    },
                    moneySplit: {
                        canCreateMoneySplit: false,
                        canUpdateMoneySplit: false,
                        canDeleteMoneySplit: false,
                        canApproveMoneySplit: false,
                        canRejectMoneySplit: false,
                        canViewMoneySplit: true,
                    },
                    expense: {
                        canCreateExpense: false,
                        canUpdateExpense: false,
                        canDeleteExpense: false,
                    },
                    track: {
                        canUploadTrack: false,
                        canViewTrack: true,
                        canUpdateTrack: false,
                        canDeleteTrack: false,
                        canPlayTrack: true,
                        canApproveTrackStatus: false,
                        canDownloadTrack: true,
                    },
                    clientDelivery: {
                        canSendTrackToClient: false,
                        canViewClientTracks: true,
                        canAcceptDelivery: false,
                        canRejectDelivery: false,
                        canRequestEditDelivery: false,
                        canViewProductCountRemaining: true,
                        canCancelDelivery: false,
                        canCreateClientRoomComment: false,
                        canViewClientRoomComments: true,
                        canUpdateClientRoomComment: false,
                        canDeleteClientRoomComment: false,
                        canUpdateClientRoomCommentStatus: false,
                    },
                    addendum: {
                        canCreateAddendum: false,
                        canViewAddendum: true,
                        canInviteToSign: false,
                        canDeclineAddendum: false,
                        canEditAddendum: false,
                        canCreateAddendumPayment: false,
                    },
                    reason: null,
                });
                return;
            }

            if (!projectId) return;
            try {
                const perm = await projectService.getProjectPermissionByProjectId(Number(projectId));
                setPermission(perm);
            } catch (err: any) {
                console.error('Error loading project permission:', err);
            }
        };
        loadPermission();
    }, [isAdmin, projectId]);

    // Load client delivery info
    const loadClientDeliveryInfo = useCallback(async () => {
        if (!milestoneId || !permission?.clientDelivery?.canViewProductCountRemaining) return;

        try {
            // Load quota info using new /quota endpoint
            const quotaRes = await clientDeliveryService.getQuota(Number(milestoneId));
            setProductCountRemaining(quotaRes.productCountRemaining);
            setEditCountRemaining(quotaRes.editCountRemaining);

            // Load sent tracks to show badges
            if (permission?.clientDelivery?.canViewClientTracks) {
                const clientTracks = await clientDeliveryService.getClientTracks(Number(milestoneId));
                const sentIds = new Set(clientTracks.map(item => item.track.id));
                setSentToClientTrackIds(sentIds);
            }
        } catch (error: any) {
            console.error('Error loading client delivery info:', error);
            // Don't show error toast, it's not critical
        }
    }, [milestoneId, permission]);

    // Load client delivery info when permission changes
    useEffect(() => {
        if (permission) {
            loadClientDeliveryInfo();
        }
    }, [permission, loadClientDeliveryInfo]);

    // Computed permission values
    const permissionFlags = useMemo(() => {
        return {
            canApproveTrackStatus: permission?.track?.canApproveTrackStatus ?? false,
            canSendTrackToClient: permission?.clientDelivery?.canSendTrackToClient ?? false,
            canViewProductCountRemaining: permission?.clientDelivery?.canViewProductCountRemaining ?? false,
            canViewClientTracks: permission?.clientDelivery?.canViewClientTracks ?? false,
            canDeleteTrack: permission?.track?.canDeleteTrack ?? false,
            canDownloadTrack: permission?.track?.canDownloadTrack ?? false,
        };
    }, [permission]);

    return {
        permission,
        ...permissionFlags,
        productCountRemaining,
        editCountRemaining,
        sentToClientTrackIds,
        reloadClientDeliveryInfo: loadClientDeliveryInfo,
    };
};

