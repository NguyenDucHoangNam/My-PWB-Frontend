import { useState, useEffect, useCallback } from 'react';
import milestoneService from '../../../services/milestoneService';
import { type MilestoneDetail, type Collaborator, type MilestoneStatus } from '../../../types/projectWorkspaceDetail';
import { emptyMilestoneDetail } from '../../../utils/projectWorkspaceDetail.helpers';
import { generateAvatarUrl } from '../../../utils/projectWorkspaceDetail.helpers';

export const useProjectWorkspaceDetail = (
    projectId: number | undefined,
    milestoneId: number | undefined,
    hasValidIds: boolean
) => {
    const [detail, setDetail] = useState<MilestoneDetail>(emptyMilestoneDetail);
    const [assignedMembers, setAssignedMembers] = useState<Collaborator[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [hasContract, setHasContract] = useState<boolean>(true);
    const [allMoneySplitsApproved, setAllMoneySplitsApproved] = useState<boolean>(false);

    // Hàm để refresh lại trạng thái money split approval
    const refreshMoneySplitStatus = useCallback(async () => {
        if (!projectId || !milestoneId) return;
        try {
            const moneySplitData = await milestoneService.getMoneySplitDetail(projectId, milestoneId);
            const moneySplits = moneySplitData.moneySplits || [];
            const allApproved = moneySplits.length > 0 && moneySplits.every(split => split.status === 'APPROVED');
            setAllMoneySplitsApproved(allApproved);
            console.log('✅ Refreshed money split status:', { allApproved, moneySplitsCount: moneySplits.length });
        } catch (err) {
            console.error('Error refreshing money split status:', err);
            setAllMoneySplitsApproved(false);
        }
    }, [projectId, milestoneId]);

    useEffect(() => {
        const load = async () => {
            if (!hasValidIds || !projectId || !milestoneId) {
                setError('Thiếu projectId hoặc milestoneId.');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const result = await milestoneService.getMilestoneDetail(projectId, milestoneId);
                
                const contractId = result.contractId;
                if (!contractId) {
                    setHasContract(false);
                    setLoading(false);
                    return;
                }
                
                const statusMap: Record<string, MilestoneStatus> = {
                    PENDING: 'Đang Chờ Lệnh',
                    IN_PROGRESS: 'Đang Vận Hành',
                    COMPLETED: 'Nhiệm Vụ Hoàn Thành',
                    PAID: 'Chờ Khách hàng duyệt',
                };
                setDetail({
                    id: String(result.id),
                    title: result.title || '',
                    status: statusMap[result.status] || 'Đang Chờ Lệnh',
                    description: result.description || '',
                    budget: typeof result.amount === 'number' ? result.amount : 0,
                    deadline: result.dueDate ? new Date(result.dueDate).toISOString() : new Date().toISOString(),
                });

                // --- ĐOẠN LOGIC QUAN TRỌNG ĐÃ SỬA ---
                setAssignedMembers(Array.isArray(result.members) ? result.members.map(m => {
                    const displayName = m.userName || m.userEmail || 'Thành viên';
                    const memberAny = m as any;

                    // LOG DỮ LIỆU RA ĐỂ KIỂM TRA (Mở F12 Console xem nếu vẫn lỗi)
                    console.log('🔍 CHECK MEMBER DATA:', m);

                    const avatarUrl = 
                        // 1. Kiểm tra lớp ngoài cùng
                        memberAny.avatarUrl || 
                        memberAny.userAvatarUrl || 
                        memberAny.avatar || 
                        memberAny.imageUrl ||
                        
                        // 2. Kiểm tra lớp lồng nhau (QUAN TRỌNG)
                        memberAny.user?.avatarUrl || 
                        memberAny.user?.avatar || 
                        memberAny.user?.profileImageUrl ||
                        memberAny.account?.avatarUrl ||
                        memberAny.account?.avatar;

                    return {
                        id: String(m.userId ?? m.id),
                        name: displayName,
                        avatar: avatarUrl || generateAvatarUrl(displayName, 40),
                        role: m.role,
                        description: m.description,
                        isAnonymous: m.isAnonymous || false,
                    };
                }) : []);
                // -------------------------------------

                try {
                    const moneySplitData = await milestoneService.getMoneySplitDetail(projectId, milestoneId);
                    const moneySplits = moneySplitData.moneySplits || [];
                    const allApproved = moneySplits.length > 0 && moneySplits.every(split => split.status === 'APPROVED');
                    setAllMoneySplitsApproved(allApproved);
                } catch (err) {
                    console.error('Error checking money splits:', err);
                    setAllMoneySplitsApproved(false);
                }
            } catch (err: any) {
                const errorCode = err?.response?.data?.error;
                if (errorCode === 'CONTRACT_NOT_FOUND' || err?.message?.includes('hợp đồng')) {
                    setHasContract(false);
                    setError(null);
                } else {
                    setError(err.message || 'Không thể tải chi tiết cột mốc.');
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [hasValidIds, milestoneId, projectId]);

    return {
        detail,
        assignedMembers,
        setAssignedMembers,
        loading,
        error,
        hasContract,
        allMoneySplitsApproved,
        refreshMoneySplitStatus,
    };
};