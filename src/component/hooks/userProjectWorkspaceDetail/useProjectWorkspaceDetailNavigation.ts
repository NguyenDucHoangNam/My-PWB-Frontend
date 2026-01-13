import { useNavigate } from 'react-router-dom';
import { ROUTER } from '../../../routes/router';
import { type MilestoneDetail } from '../../../types/projectWorkspaceDetail';

/**
 * Hook để xử lý navigation trong project workspace detail
 */
export const useProjectWorkspaceDetailNavigation = (
    sanitizedProjectId: string | undefined,
    sanitizedMilestoneId: string | undefined,
    detail: MilestoneDetail
) => {
    const navigate = useNavigate();

    const handleBackToOverview = () => {
        navigate('/workspace');
    };

    const handleNavigateToInternalStudio = () => {
        navigate(`${ROUTER.USER.INTERNAL_STUDIO}?projectId=${sanitizedProjectId}&milestoneId=${sanitizedMilestoneId || detail.id}`);
    };

    const handleNavigateToClientRoom = () => {
        navigate(`${ROUTER.USER.CLIENT_ROOM}?projectId=${sanitizedProjectId}&milestoneId=${sanitizedMilestoneId || detail.id}`);
    };

    const handleNavigateToCreateContract = () => {
        navigate(`${ROUTER.USER.CONTRACTSPACE}?id=${sanitizedProjectId}`);
    };

    return {
        handleBackToOverview,
        handleNavigateToInternalStudio,
        handleNavigateToClientRoom,
        handleNavigateToCreateContract,
    };
};

