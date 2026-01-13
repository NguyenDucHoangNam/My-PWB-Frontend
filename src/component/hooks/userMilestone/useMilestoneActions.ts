import { useState } from 'react';
import milestoneService from '../../../services/milestoneService';
import { type Milestone } from '../../../types/workspace';
import { useCosmicToast } from '../../toast/CosmicToastProvider';

type MilestoneFormData = {
    title: string;
    description: string;
    amount: string;
    dueDate: string;
    editCount: number;
    productCount: number;
};

/**
 * Hook để quản lý các thao tác CRUD milestones
 */
export const useMilestoneActions = (
    projectId: number | null,
    refreshMilestones: () => Promise<void>,
    currencyFormatter: Intl.NumberFormat,
    contractAmountLimit: number | null,
    productLimit: number | null,
    editLimit: number | null,
    usedAmount: number,
    usedProducts: number,
    usedEdits: number
) => {
    const { showToast } = useCosmicToast();
    const [deletingMilestoneId, setDeletingMilestoneId] = useState<number | null>(null);

    const deleteMilestone = async (milestone: Milestone) => {
        if (!projectId) {
            showToast({
                type: 'error',
                message: 'Project ID không hợp lệ.',
            });
            return;
        }

        try {
            setDeletingMilestoneId(milestone.id);
            await milestoneService.deleteMilestone(projectId, milestone.id);
            showToast({
                type: 'success',
                message: 'Xóa cột mốc thành công!',
            });
            await refreshMilestones();
        } catch (err: any) {
            console.error('Error deleting milestone:', err);
            showToast({
                type: 'error',
                message: err.message || 'Không thể xóa cột mốc. Vui lòng thử lại.',
            });
        } finally {
            setDeletingMilestoneId(null);
        }
    };

    const submitMilestone = async (
        formData: MilestoneFormData,
        modalMode: 'create' | 'edit',
        editingMilestone: Milestone | null
    ) => {
        if (!projectId) {
            showToast({
                type: 'error',
                message: 'Project ID không hợp lệ.',
            });
            return;
        }

        const originalAmount = modalMode === 'edit' && editingMilestone ? editingMilestone.budget || 0 : 0;
        const originalProductCount = modalMode === 'edit' && editingMilestone ? editingMilestone.productCount || 0 : 0;
        const originalEditCount = modalMode === 'edit' && editingMilestone ? editingMilestone.editCount || 0 : 0;

        // Validation
        const trimmedTitle = formData.title.trim();
        if (!trimmedTitle) {
            showToast({
                type: 'error',
                message: 'Vui lòng nhập tiêu đề cột mốc.',
            });
            return;
        }

        if (!formData.amount.trim()) {
            showToast({
                type: 'error',
                message: 'Vui lòng nhập số tiền.',
            });
            return;
        }

        if (!formData.dueDate) {
            showToast({
                type: 'error',
                message: 'Vui lòng chọn ngày đến hạn.',
            });
            return;
        }

        // Validate ngày đến hạn phải sau ngày hiện tại
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(formData.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate <= today) {
            showToast({
                type: 'error',
                message: 'Ngày đến hạn phải sau ngày hiện tại. Vui lòng chọn ngày khác.',
            });
            return;
        }

        if (!formData.productCount || formData.productCount <= 0) {
            showToast({
                type: 'error',
                message: 'Số lượng sản phẩm phải lớn hơn 0.',
            });
            return;
        }

        // Validate productCount không vượt quá số còn lại (nếu biết tổng)
        if (typeof productLimit === 'number') {
            const remaining = Math.max(0, productLimit - (usedProducts - originalProductCount));
            if (formData.productCount > remaining) {
                showToast({
                    type: 'error',
                    message: `Số lượng sản phẩm vượt quá số còn lại (${remaining}). Vui lòng giảm số lượng.`,
                });
                return;
            }
        }

        // Validate editCount (bắt buộc >= 1)
        if (formData.editCount === undefined || formData.editCount === null || formData.editCount < 1) {
            showToast({
                type: 'error',
                message: 'Số lượt chỉnh sửa là bắt buộc và phải lớn hơn hoặc bằng 1.',
            });
            return;
        }
        if (typeof editLimit === 'number') {
            const remainingEdits = Math.max(0, editLimit - (usedEdits - originalEditCount));
            if (formData.editCount > remainingEdits) {
                showToast({
                    type: 'error',
                    message: `Số lượt chỉnh sửa vượt quá số còn lại (${remainingEdits}). Vui lòng giảm số lượt chỉnh sửa.`,
                });
                return;
            }
        }

        try {
            // Format amount to string with 2 decimal places
            const amountValue = parseFloat(formData.amount);
            if (isNaN(amountValue) || amountValue <= 0) {
                throw new Error('Số tiền không hợp lệ. Số tiền phải lớn hơn 0.');
            }
            const formattedAmount = amountValue.toFixed(2);

            // Validate amount không vượt quá ngân sách còn lại (nếu biết)
            if (typeof contractAmountLimit === 'number') {
                const remainingAmt = Math.max(0, contractAmountLimit - (usedAmount - originalAmount));
                if (amountValue > remainingAmt) {
                    throw new Error(`Số tiền vượt quá ngân sách còn lại (${currencyFormatter.format(remainingAmt)}).`);
                }
            }

            // Validate date format (yyyy-MM-dd)
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(formData.dueDate)) {
                throw new Error('Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng yyyy-MM-dd.');
            }

            if (modalMode === 'create') {
                await milestoneService.createMilestone(projectId, {
                    title: trimmedTitle,
                    description: formData.description.trim() || undefined,
                    amount: formattedAmount,
                    dueDate: formData.dueDate,
                    editCount: formData.editCount,
                    productCount: formData.productCount,
                });

                showToast({
                    type: 'success',
                    message: 'Tạo cột mốc thành công!',
                });
            } else if (modalMode === 'edit' && editingMilestone) {
                await milestoneService.updateMilestone(projectId, editingMilestone.id, {
                    title: trimmedTitle,
                    description: formData.description.trim() || undefined,
                    amount: formattedAmount,
                    dueDate: formData.dueDate,
                    editCount: formData.editCount,
                    productCount: formData.productCount,
                });

                showToast({
                    type: 'success',
                    message: 'Cập nhật cột mốc thành công!',
                });
            }

            // Refresh milestones list
            await refreshMilestones();
            return true; // Success
        } catch (err: any) {
            console.error('Error saving milestone:', err);
            showToast({
                type: 'error',
                message: err.message || (modalMode === 'edit' ? 'Không thể cập nhật cột mốc. Vui lòng thử lại.' : 'Không thể tạo cột mốc. Vui lòng thử lại.'),
            });
            return false; // Failed
        }
    };

    return {
        deletingMilestoneId,
        deleteMilestone,
        submitMilestone,
    };
};

