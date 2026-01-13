import { useState, useEffect } from 'react';
import projectService from '../../../services/projectService';
import { type Project } from '../../../types/workspace';
import { type ProjectPermissionResponse } from '../../../types/permission';

/**
 * Hook để fetch thông tin project và permissions
 */
export const useWorkspaceProject = (
    projectId: number | null,
    checkingContract: boolean,
    hasContract: boolean
) => {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [projectRole, setProjectRole] = useState<'OWNER' | 'CLIENT' | 'COLLABORATOR' | 'OBSERVER' | null>(null);
    const [permissions, setPermissions] = useState<ProjectPermissionResponse | null>(null);

    useEffect(() => {
        if (!projectId) {
            setError('Project ID không hợp lệ. Vui lòng kiểm tra lại URL.');
            setLoading(false);
            return;
        }

        // Chỉ fetch khi đã kiểm tra xong hợp đồng
        if (checkingContract) {
            return;
        }

        // Nếu không có hợp đồng, không fetch project
        if (!hasContract) {
            setLoading(false);
            setError('Dự án chưa có hợp đồng. Vui lòng tạo hợp đồng trước.');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch project details
                const projectDetails = await projectService.getProjectDetails(projectId);
                const rawTotalAmount = projectDetails.totalAmount;
                const parsedTotalAmount =
                    rawTotalAmount === null || rawTotalAmount === undefined
                        ? null
                        : Number(rawTotalAmount);
                const normalizedTotalAmount =
                    typeof parsedTotalAmount === 'number' && Number.isFinite(parsedTotalAmount)
                        ? parsedTotalAmount
                        : null;

                const rawProductCount = projectDetails.productCount;
                const parsedProductCount =
                    rawProductCount === null || rawProductCount === undefined
                        ? null
                        : Number(rawProductCount);
                const normalizedProductCount =
                    typeof parsedProductCount === 'number' && Number.isFinite(parsedProductCount)
                        ? parsedProductCount
                        : null;

                const rawFpEditAmount = projectDetails.fpEditAmount;
                const parsedFpEditAmount =
                    rawFpEditAmount === null || rawFpEditAmount === undefined
                        ? null
                        : Number(rawFpEditAmount);
                const normalizedFpEditAmount =
                    typeof parsedFpEditAmount === 'number' && Number.isFinite(parsedFpEditAmount)
                        ? parsedFpEditAmount
                        : null;

                setProject({
                    id: projectDetails.id,
                    name: projectDetails.title || projectDetails.name || 'Dự án',
                    paymentType: projectDetails.paymentType ?? null,
                    totalAmount: normalizedTotalAmount,
                    productCount: normalizedProductCount,
                    fpEditAmount: normalizedFpEditAmount,
                    status: projectDetails.status ?? null,
                });

                // Lưu projectId để trang chi tiết có thể truy xuất nếu không có query param
                try { 
                    sessionStorage.setItem('currentProjectId', String(projectId)); 
                } catch { }

                // Check if current user is project owner via permissions API
                try {
                    const permissionsData = await projectService.getProjectPermissionByProjectId(projectId);
                    const ownerFlag = Boolean(permissionsData.role.projectRole === 'OWNER');
                    setIsOwner(ownerFlag);
                    setProjectRole(permissionsData.role.projectRole);
                    setPermissions(permissionsData);
                } catch (permErr) {
                    // If permission check fails, default to not owner
                    setIsOwner(false);
                    setProjectRole(null);
                    setPermissions(null);
                }
            } catch (err: any) {
                console.error('Error fetching project:', err);
                const errorCode = err?.response?.data?.error;
                const statusCode = err?.response?.status;

                // Kiểm tra nếu error là CONTRACT_NOT_FOUND
                if (errorCode === 'CONTRACT_NOT_FOUND' || statusCode === 404) {
                    setError('Dự án chưa có hợp đồng. Vui lòng tạo hợp đồng trước.');
                } else {
                    setError(err.message || 'Không thể tải dữ liệu. Vui lòng thử lại.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId, checkingContract, hasContract]);

    return {
        project,
        loading,
        error,
        isOwner,
        projectRole,
        permissions,
    };
};

