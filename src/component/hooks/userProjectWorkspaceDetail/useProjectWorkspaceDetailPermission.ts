import { useState, useEffect, useCallback } from 'react';
import projectService from '../../../services/projectService';
import { type ProjectPermissionResponse } from '../../../types/permission';

/**
 * Hook để fetch permission cho project workspace detail
 */
export const useProjectWorkspaceDetailPermission = (projectId: number | undefined) => {
    const [permission, setPermission] = useState<ProjectPermissionResponse | null>(null);

    const loadPermission = useCallback(async () => {
        if (!projectId) {
            return;
        }
        try {
            const perm = await projectService.getProjectPermissionByProjectId(projectId);
            setPermission(perm);
        } catch (err: any) {
            console.error('Error loading project permission:', err);
        }
    }, [projectId]);

    useEffect(() => {
        loadPermission();
    }, [loadPermission]);

    return { permission, refreshPermission: loadPermission };
};

