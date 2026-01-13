import { useState, useMemo } from 'react';
import { type Milestone } from '../../../types/workspace';
import { normalizeDateInput } from '../../../utils/workspace.helpers';

type MilestoneFormData = {
    title: string;
    description: string;
    amount: string;
    dueDate: string;
    editCount: number;
    productCount: number;
};

type ModalMode = 'create' | 'edit';

/**
 * Hook để quản lý form state cho milestone modal
 */
export const useMilestoneForm = () => {
    const [showMilestoneModal, setShowMilestoneModal] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [createForm, setCreateForm] = useState<MilestoneFormData>({
        title: '',
        description: '',
        amount: '',
        dueDate: '',
        editCount: 1,
        productCount: 1,
    });

    const openCreateModal = () => {
        setModalMode('create');
        setEditingMilestone(null);
        setShowMilestoneModal(true);
        setCreateForm({
            title: '',
            description: '',
            amount: '',
            dueDate: '',
            editCount: 1,
            productCount: 1,
        });
    };

    const openEditModal = (milestone: Milestone) => {
        setModalMode('edit');
        setEditingMilestone(milestone);
        setShowMilestoneModal(true);
        setCreateForm({
            title: milestone.title,
            description: milestone.description,
            amount: typeof milestone.budget === 'number' ? milestone.budget.toString() : '',
            dueDate: normalizeDateInput(milestone.dueDate),
            editCount: milestone.editCount && milestone.editCount > 0 ? milestone.editCount : 1,
            productCount: milestone.productCount && milestone.productCount > 0 ? milestone.productCount : 1,
        });
    };

    const closeModal = () => {
        setShowMilestoneModal(false);
        setEditingMilestone(null);
        setModalMode('create');
        setCreateForm({
            title: '',
            description: '',
            amount: '',
            dueDate: '',
            editCount: 1,
            productCount: 1,
        });
    };

    // Parsed values
    const parsedAmountInput = useMemo(() => {
        const value = parseFloat(createForm.amount);
        if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
        return Math.max(0, value);
    }, [createForm.amount]);

    const parsedProductInput = useMemo(() => {
        if (typeof createForm.productCount !== 'number') return 0;
        if (!Number.isFinite(createForm.productCount)) return 0;
        return Math.max(0, createForm.productCount);
    }, [createForm.productCount]);

    const parsedEditInput = useMemo(() => {
        if (typeof createForm.editCount !== 'number') return 0;
        if (!Number.isFinite(createForm.editCount)) return 0;
        return Math.max(0, createForm.editCount);
    }, [createForm.editCount]);

    // Original values for editing
    const originalAmountForEditing = useMemo(() => {
        return modalMode === 'edit' && editingMilestone ? editingMilestone.budget || 0 : 0;
    }, [modalMode, editingMilestone]);

    const originalProductsForEditing = useMemo(() => {
        return modalMode === 'edit' && editingMilestone ? editingMilestone.productCount || 0 : 0;
    }, [modalMode, editingMilestone]);

    const originalEditsForEditing = useMemo(() => {
        return modalMode === 'edit' && editingMilestone ? editingMilestone.editCount || 0 : 0;
    }, [modalMode, editingMilestone]);

    return {
        // State
        showMilestoneModal,
        modalMode,
        editingMilestone,
        isSubmitting,
        setIsSubmitting,
        createForm,
        setCreateForm,
        // Actions
        openCreateModal,
        openEditModal,
        closeModal,
        // Parsed values
        parsedAmountInput,
        parsedProductInput,
        parsedEditInput,
        // Original values for editing
        originalAmountForEditing,
        originalProductsForEditing,
        originalEditsForEditing,
    };
};

