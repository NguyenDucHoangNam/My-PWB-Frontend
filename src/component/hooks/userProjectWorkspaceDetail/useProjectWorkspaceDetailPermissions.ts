import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { type ProjectPermissionResponse } from '../../../types/permission';

/**
 * Hook để tính toán derived permissions cho project workspace detail
 */
export const useProjectWorkspaceDetailPermissions = (permission: ProjectPermissionResponse | null) => {
    const { userRole } = useAuth();
    const isAdmin = userRole === 'ADMIN';

    const derivedCanEnterInternalRoom = useMemo(() => {
        if (isAdmin) {
            return true;
        }
        return permission?.room?.canEnterInternalRoom ?? (
            permission
                ? permission.role.projectRole === 'OWNER' || permission.role.projectRole === 'COLLABORATOR'
                : true
        );
    }, [isAdmin, permission]);

    const derivedCanEnterCustomerRoom = useMemo(() => {
        if (isAdmin) {
            return true;
        }
        return permission?.room?.canEnterCustomerRoom ?? (
            permission
                ? permission.role.projectRole === 'OWNER' || permission.role.projectRole === 'CLIENT' || permission.role.projectRole === 'OBSERVER'
                : true
        );
    }, [isAdmin, permission]);

    return {
        derivedCanEnterInternalRoom,
        derivedCanEnterCustomerRoom,
    };
};

