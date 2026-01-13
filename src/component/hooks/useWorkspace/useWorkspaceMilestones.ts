import { useState, useEffect } from 'react';
import milestoneService from '../../../services/milestoneService';
import { convertMilestoneFromAPI } from '../../../utils/workspace.helpers';
import { type Milestone } from '../../../types/workspace';

/**
 * Hook để fetch và quản lý milestones
 */
export const useWorkspaceMilestones = (
    projectId: number | null,
    checkingContract: boolean,
    hasContract: boolean
) => {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!projectId) {
            setLoading(false);
            return;
        }

        // Chỉ fetch khi đã kiểm tra xong hợp đồng
        if (checkingContract) {
            return;
        }

        // Nếu không có hợp đồng, không fetch milestones
        if (!hasContract) {
            setLoading(false);
            return;
        }

        const fetchMilestones = async () => {
            try {
                setLoading(true);
                const apiMilestones = await milestoneService.getMilestones(projectId);
                const convertedMilestones = apiMilestones.map(convertMilestoneFromAPI);
                setMilestones(convertedMilestones);
            } catch (err: any) {
                console.error('Error fetching milestones:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMilestones();
    }, [projectId, checkingContract, hasContract]);

    const refreshMilestones = async () => {
        if (!projectId) return;
        try {
            const apiMilestones = await milestoneService.getMilestones(projectId);
            const convertedMilestones = apiMilestones.map(convertMilestoneFromAPI);
            setMilestones(convertedMilestones);
        } catch (err: any) {
            console.error('Error refreshing milestones:', err);
            throw err;
        }
    };

    return {
        milestones,
        loading,
        refreshMilestones,
    };
};

