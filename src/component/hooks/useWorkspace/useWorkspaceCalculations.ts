import { useMemo } from 'react';
import { type Project, type Milestone } from '../../../types/workspace';

/**
 * Hook để tính toán các giới hạn và giá trị còn lại
 */
export const useWorkspaceCalculations = (
    project: Project | null,
    milestones: Milestone[],
    parsedAmountInput: number,
    parsedProductInput: number,
    parsedEditInput: number,
    originalAmountForEditing: number,
    originalProductsForEditing: number,
    originalEditsForEditing: number
) => {
    const currencyFormatter = useMemo(() => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        });
    }, []);

    const numberFormatter = useMemo(() => {
        return new Intl.NumberFormat('vi-VN');
    }, []);

    // Tính tổng đã sử dụng
    const usedAmount = useMemo(() => {
        return milestones.reduce((sum, m) => sum + (m.budget || 0), 0);
    }, [milestones]);

    const usedProducts = useMemo(() => {
        return milestones.reduce((sum, m) => sum + (m.productCount || 0), 0);
    }, [milestones]);

    const usedEdits = useMemo(() => {
        return milestones.reduce((sum, m) => sum + (m.editCount || 0), 0);
    }, [milestones]);

    // Tính giới hạn từ contract hoặc project
    const contractAmountLimit = useMemo(() => {
        const firstWithTotal = milestones.find(m => typeof m.contractTotalAmount === 'number');
        if (typeof firstWithTotal?.contractTotalAmount === 'number') {
            return firstWithTotal.contractTotalAmount;
        }
        if (project && typeof project.totalAmount === 'number' && !Number.isNaN(project.totalAmount)) {
            return project.totalAmount;
        }
        return null;
    }, [milestones, project?.totalAmount]);

    const productLimit = useMemo(() => {
        const firstWithTotal = milestones.find(m => typeof m.contractProductCount === 'number');
        if (typeof firstWithTotal?.contractProductCount === 'number') {
            return firstWithTotal.contractProductCount;
        }
        if (project && typeof project.productCount === 'number') {
            return project.productCount;
        }
        return null;
    }, [milestones, project?.productCount]);

    const editLimit = useMemo(() => {
        const firstWithTotal = milestones.find(m => typeof m.contractFpEditCount === 'number');
        if (typeof firstWithTotal?.contractFpEditCount === 'number') {
            return firstWithTotal.contractFpEditCount;
        }
        if (project && typeof project.fpEditAmount === 'number') {
            return project.fpEditAmount;
        }
        return null;
    }, [milestones, project?.fpEditAmount]);

    // Tính giá trị còn lại
    const remainingAmountForModalRaw = useMemo(() => {
        if (typeof contractAmountLimit === 'number') {
            return contractAmountLimit - usedAmount + originalAmountForEditing;
        }
        return null;
    }, [contractAmountLimit, usedAmount, originalAmountForEditing]);

    const remainingProductsForModalRaw = useMemo(() => {
        if (typeof productLimit === 'number') {
            return productLimit - usedProducts + originalProductsForEditing;
        }
        return null;
    }, [productLimit, usedProducts, originalProductsForEditing]);

    const remainingEditsForModalRaw = useMemo(() => {
        if (typeof editLimit === 'number') {
            return editLimit - usedEdits + originalEditsForEditing;
        }
        return null;
    }, [editLimit, usedEdits, originalEditsForEditing]);

    // Tính giá trị còn lại sau khi nhập
    const remainingAmountAfterRaw = useMemo(() => {
        if (typeof remainingAmountForModalRaw === 'number') {
            return remainingAmountForModalRaw - parsedAmountInput;
        }
        return null;
    }, [remainingAmountForModalRaw, parsedAmountInput]);

    const remainingProductsAfterRaw = useMemo(() => {
        if (typeof remainingProductsForModalRaw === 'number') {
            return remainingProductsForModalRaw - parsedProductInput;
        }
        return null;
    }, [remainingProductsForModalRaw, parsedProductInput]);

    const remainingEditsAfterRaw = useMemo(() => {
        if (typeof remainingEditsForModalRaw === 'number') {
            return remainingEditsForModalRaw - parsedEditInput;
        }
        return null;
    }, [remainingEditsForModalRaw, parsedEditInput]);

    // Normalized remaining values (không âm)
    const remainingAmountForModal = useMemo(() => {
        return typeof remainingAmountForModalRaw === 'number' ? Math.max(0, remainingAmountForModalRaw) : null;
    }, [remainingAmountForModalRaw]);

    const remainingProductsForModal = useMemo(() => {
        return typeof remainingProductsForModalRaw === 'number' ? Math.max(0, remainingProductsForModalRaw) : null;
    }, [remainingProductsForModalRaw]);

    const remainingEditsForModal = useMemo(() => {
        return typeof remainingEditsForModalRaw === 'number' ? Math.max(0, remainingEditsForModalRaw) : null;
    }, [remainingEditsForModalRaw]);

    const remainingAmountAfter = useMemo(() => {
        return typeof remainingAmountAfterRaw === 'number' ? Math.max(0, remainingAmountAfterRaw) : null;
    }, [remainingAmountAfterRaw]);

    const remainingProductsAfter = useMemo(() => {
        return typeof remainingProductsAfterRaw === 'number' ? Math.max(0, remainingProductsAfterRaw) : null;
    }, [remainingProductsAfterRaw]);

    const remainingEditsAfter = useMemo(() => {
        return typeof remainingEditsAfterRaw === 'number' ? Math.max(0, remainingEditsAfterRaw) : null;
    }, [remainingEditsAfterRaw]);

    // Kiểm tra vượt quá giới hạn
    const amountIsOverLimit = useMemo(() => {
        return typeof remainingAmountAfterRaw === 'number' && remainingAmountAfterRaw < 0;
    }, [remainingAmountAfterRaw]);

    const productIsOverLimit = useMemo(() => {
        return typeof remainingProductsAfterRaw === 'number' && remainingProductsAfterRaw < 0;
    }, [remainingProductsAfterRaw]);

    const editIsOverLimit = useMemo(() => {
        return typeof remainingEditsAfterRaw === 'number' && remainingEditsAfterRaw < 0;
    }, [remainingEditsAfterRaw]);

    return {
        // Formatters
        currencyFormatter,
        numberFormatter,
        // Used values
        usedAmount,
        usedProducts,
        usedEdits,
        // Limits
        contractAmountLimit,
        productLimit,
        editLimit,
        // Remaining values (raw)
        remainingAmountForModalRaw,
        remainingProductsForModalRaw,
        remainingEditsForModalRaw,
        remainingAmountAfterRaw,
        remainingProductsAfterRaw,
        remainingEditsAfterRaw,
        // Remaining values (normalized)
        remainingAmountForModal,
        remainingProductsForModal,
        remainingEditsForModal,
        remainingAmountAfter,
        remainingProductsAfter,
        remainingEditsAfter,
        // Over limit flags
        amountIsOverLimit,
        productIsOverLimit,
        editIsOverLimit,
    };
};

