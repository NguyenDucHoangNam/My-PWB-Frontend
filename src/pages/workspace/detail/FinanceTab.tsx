import { useState, useMemo, useEffect, useRef } from 'react';
import { UserPlus, Save, X, Trash2, Edit, EyeOff } from 'lucide-react';
import milestoneService, {
    type MoneySplitResponse,
    type ExpenseResponse
} from '../../../services/milestoneService';
import projectService, { type ProjectPermissionResponse } from '../../../services/projectService';
import { useCosmicToast } from '../../../component/toast/CosmicToastProvider';
import { useAuth } from '../../../contexts/AuthContext';
import { type FinanceTabProps } from '../../../types/projectWorkspaceDetail';
import { getRoleBadge, generateAvatarUrl } from '../../../utils/projectWorkspaceDetail.helpers';

const FinanceTab = ({ assignedMembers, totalBudget, projectId, milestoneId, permission: permissionProp, onMoneySplitStatusChange }: FinanceTabProps) => {
    const { showToast } = useCosmicToast();
    const { user } = useAuth();
    
    const [moneySplits, setMoneySplits] = useState<MoneySplitResponse[]>([]);
    const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [totalAllocated, setTotalAllocated] = useState<number>(0);
    const [remainingAmount, setRemainingAmount] = useState<number>(0);
    
    // Use permission from props if available, otherwise fallback to local state
    const [permission, setPermission] = useState<ProjectPermissionResponse | null>(permissionProp || null);
    const [loadingPermission, setLoadingPermission] = useState<boolean>(!permissionProp);
    const [showMoneySplitModal, setShowMoneySplitModal] = useState<boolean>(false);
    const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
    const [editingMoneySplit, setEditingMoneySplit] = useState<MoneySplitResponse | null>(null);
    const [editingExpense, setEditingExpense] = useState<ExpenseResponse | null>(null);
    const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
    const [rejectingMoneySplit, setRejectingMoneySplit] = useState<MoneySplitResponse | null>(null);
    
    const [moneySplitForm, setMoneySplitForm] = useState({ userId: '', amount: '', note: '' });
    const [expenseForm, setExpenseForm] = useState({ name: '', description: '', amount: '' });
    const [rejectReason, setRejectReason] = useState<string>('');
    const [saving, setSaving] = useState<boolean>(false);
    const errorToastShown = useRef(false);
    
    const availableMembersForSplit = useMemo(() => {
        return assignedMembers.filter(m => m.role !== 'OWNER' && m.role !== 'CLIENT');
    }, [assignedMembers]);
    
    const formatAmountForAPI = (amount: string | number): string => {
        if (!amount) return '0.00';
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(num)) return '0.00';
        return num.toFixed(2);
    };
    
    // Kiểm tra nếu là CLIENT thì chỉ hiển thị tổng ngân sách (phải khai báo trước khi dùng trong useEffect)
    const isClient = permission?.role?.projectRole === 'CLIENT';
    
    useEffect(() => {
        // Only load permission if not provided via props
        if (permissionProp) {
            setPermission(permissionProp);
            setLoadingPermission(false);
            return;
        }
        
        const loadPermission = async () => {
            try {
                setLoadingPermission(true);
                const perm = await projectService.getProjectPermissionByProjectId(projectId);
                setPermission(perm);
            } catch (err: any) {
                console.error('Error loading project permission:', err);
            } finally {
                setLoadingPermission(false);
            }
        };
        if (projectId) {
            loadPermission();
        }
    }, [projectId, permissionProp]);
    
    useEffect(() => {
        const loadData = async () => {
            // Nếu là CLIENT thì không cần gọi API phân chia tiền
            if (isClient) {
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                setError(null);
                const data = await milestoneService.getMoneySplitDetail(projectId, milestoneId);
                setMoneySplits(data.moneySplits || []);
                setExpenses(data.expenses || []);
                setTotalAllocated(data.totalAllocated || 0);
                setRemainingAmount(data.remainingAmount || 0);
            } catch (err: any) {
                console.error('Error loading money split detail:', err);
                setError(err.message || 'Không thể tải chi tiết phân chia tiền.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [projectId, milestoneId, isClient]);
    
    const formattedTotalBudget = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalBudget);
    const formattedTotalAllocated = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAllocated);
    const formattedRemaining = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(remainingAmount);
    
    // Show toast for errors
    useEffect(() => {
        if (error && !errorToastShown.current) {
            errorToastShown.current = true;
            showToast({
                type: 'error',
                title: '❌ Lỗi',
                message: error
            });
        } else if (!error) {
            errorToastShown.current = false;
        }
    }, [error, showToast]);
    
    const getMemberAvatar = (userId: number): string => {
        const member = assignedMembers.find(m => Number(m.id) === userId);
        return member?.avatar || generateAvatarUrl(`User ${userId}`, 40);
    };
    
    const isMemberAnonymous = (userId: number): boolean => {
        const member = assignedMembers.find(m => Number(m.id) === userId);
        return member?.isAnonymous || false;
    };
    
    
    const isCurrentUserRecipient = (moneySplit: MoneySplitResponse): boolean => {
        if (moneySplit.isCurrentUserRecipient !== undefined && moneySplit.isCurrentUserRecipient !== null) {
            const result = moneySplit.isCurrentUserRecipient === true;
            console.log('[isCurrentUserRecipient] Using API field:', {
                moneySplitId: moneySplit.id,
                moneySplitUserId: moneySplit.userId,
                moneySplitUserEmail: moneySplit.userEmail,
                isCurrentUserRecipient: moneySplit.isCurrentUserRecipient,
                result: result
            });
            return result;
        }
        
        const userEmail = user?.email;
        
        console.log('[isCurrentUserRecipient] Fallback: Checking email (API field is null/undefined):', {
            moneySplitId: moneySplit.id,
            moneySplitUserId: moneySplit.userId,
            moneySplitUserEmail: moneySplit.userEmail,
            currentUserEmail: userEmail
        });
        
        if (!userEmail || !moneySplit.userEmail) {
            console.warn('[isCurrentUserRecipient] Cannot compare: missing email', {
                hasUserEmail: !!userEmail,
                hasMoneySplitUserEmail: !!moneySplit.userEmail
            });
            return false;
        }
        
        const emailMatch = userEmail.toLowerCase().trim() === moneySplit.userEmail.toLowerCase().trim();
        console.log('[isCurrentUserRecipient] Email comparison result:', {
            userEmail: userEmail.toLowerCase().trim(),
            moneySplitUserEmail: moneySplit.userEmail.toLowerCase().trim(),
            match: emailMatch
        });
        return emailMatch;
    };
    
    const handleCreateMoneySplit = async () => {
        if (!moneySplitForm.userId || !moneySplitForm.amount) {
            setError('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        
        try {
            setSaving(true);
            setError(null);
            await milestoneService.createMoneySplit(projectId, milestoneId, {
                userId: Number(moneySplitForm.userId),
                amount: formatAmountForAPI(moneySplitForm.amount),
                note: moneySplitForm.note || undefined,
            });
            
            const data = await milestoneService.getMoneySplitDetail(projectId, milestoneId);
            setMoneySplits(data.moneySplits || []);
            setExpenses(data.expenses || []);
            setTotalAllocated(data.totalAllocated || 0);
            setRemainingAmount(data.remainingAmount || 0);
            
            setMoneySplitForm({ userId: '', amount: '', note: '' });
            setShowMoneySplitModal(false);
        } catch (err: any) {
            setError(err.message || 'Không thể tạo phân chia tiền.');
        } finally {
            setSaving(false);
        }
    };
    
    const handleUpdateMoneySplit = async () => {
        if (!editingMoneySplit || !moneySplitForm.amount) {
            return;
        }
        
        try {
            setSaving(true);
            setError(null);
            await milestoneService.updateMoneySplit(projectId, milestoneId, editingMoneySplit.id, {
                amount: formatAmountForAPI(moneySplitForm.amount),
                note: moneySplitForm.note || undefined,
            });
            
            const data = await milestoneService.getMoneySplitDetail(projectId, milestoneId);
            setMoneySplits(data.moneySplits || []);
            setExpenses(data.expenses || []);
            setTotalAllocated(data.totalAllocated || 0);
            setRemainingAmount(data.remainingAmount || 0);
            
            setEditingMoneySplit(null);
            setMoneySplitForm({ userId: '', amount: '', note: '' });
            setShowMoneySplitModal(false);
        } catch (err: any) {
            setError(err.message || 'Không thể cập nhật phân chia tiền.');
        } finally {
            setSaving(false);
        }
    };
    
    const handleDeleteMoneySplit = async (moneySplitId: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa phân chia tiền này?')) {
            return;
        }
        
        try {
            setSaving(true);
            setError(null);
            console.log('[handleDeleteMoneySplit] Starting delete:', {
                projectId,
                milestoneId,
                moneySplitId
            });
            
            await milestoneService.deleteMoneySplit(projectId, milestoneId, moneySplitId);
            
            console.log('[handleDeleteMoneySplit] Delete successful');
            
            showToast({
                type: 'success',
                title: '✅ Xóa thành công',
                message: 'Đã xóa phân chia tiền thành công.'
            });
            
            const data = await milestoneService.getMoneySplitDetail(projectId, milestoneId);
            setMoneySplits(data.moneySplits || []);
            setExpenses(data.expenses || []);
            setTotalAllocated(data.totalAllocated || 0);
            setRemainingAmount(data.remainingAmount || 0);
        } catch (err: any) {
            console.error('[handleDeleteMoneySplit] Error:', err);
            const errorMessage = err.message || 'Không thể xóa phân chia tiền.';
            setError(errorMessage);
            showToast({
                type: 'error',
                title: '❌ Lỗi',
                message: errorMessage
            });
        } finally {
            setSaving(false);
        }
    };
    
    const handleApproveMoneySplit = async (moneySplitId: number) => {
        try {
            setSaving(true);
            setError(null);
            console.log('[handleApproveMoneySplit] Starting approve:', {
                projectId,
                milestoneId,
                moneySplitId
            });
            
            const result = await milestoneService.approveMoneySplit(projectId, milestoneId, moneySplitId, {
                rejectionReason: null
            });
            
            console.log('[handleApproveMoneySplit] Approve successful:', result);
            
            showToast({
                type: 'success',
                title: '✅ Chấp nhận thành công',
                message: 'Bạn đã chấp nhận phân chia tiền này.'
            });
            
            const data = await milestoneService.getMoneySplitDetail(projectId, milestoneId);
            setMoneySplits(data.moneySplits || []);
            setExpenses(data.expenses || []);
            setTotalAllocated(data.totalAllocated || 0);
            setRemainingAmount(data.remainingAmount || 0);
            
            // Refresh trạng thái money split approval để cập nhật allMoneySplitsApproved
            if (onMoneySplitStatusChange) {
                await onMoneySplitStatusChange();
            }
        } catch (err: any) {
            console.error('[handleApproveMoneySplit] Error:', err);
            const errorMessage = err.message || 'Không thể phê duyệt phân chia tiền.';
            setError(errorMessage);
            showToast({
                type: 'error',
                title: '❌ Lỗi',
                message: errorMessage
            });
        } finally {
            setSaving(false);
        }
    };
    
    const handleRejectMoneySplit = async () => {
        if (!rejectingMoneySplit) {
            return;
        }
        
        try {
            setSaving(true);
            setError(null);
            console.log('[handleRejectMoneySplit] Starting reject:', {
                projectId,
                milestoneId,
                moneySplitId: rejectingMoneySplit.id,
                rejectionReason: rejectReason
            });
            
            await milestoneService.rejectMoneySplit(projectId, milestoneId, rejectingMoneySplit.id, {
                rejectionReason: rejectReason || undefined,
            });
            
            console.log('[handleRejectMoneySplit] Reject successful');
            
            showToast({
                type: 'success',
                title: '✅ Từ chối thành công',
                message: 'Bạn đã từ chối phân chia tiền này.'
            });
            
            const data = await milestoneService.getMoneySplitDetail(projectId, milestoneId);
            setMoneySplits(data.moneySplits || []);
            setExpenses(data.expenses || []);
            setTotalAllocated(data.totalAllocated || 0);
            setRemainingAmount(data.remainingAmount || 0);
            
            setRejectingMoneySplit(null);
            setRejectReason('');
            setShowRejectModal(false);
        } catch (err: any) {
            console.error('[handleRejectMoneySplit] Error:', err);
            const errorMessage = err.message || 'Không thể từ chối phân chia tiền.';
            setError(errorMessage);
            showToast({
                type: 'error',
                title: '❌ Lỗi',
                message: errorMessage
            });
        } finally {
            setSaving(false);
        }
    };
    
    const handleCreateExpense = async () => {
        if (!expenseForm.name || !expenseForm.amount) {
            setError('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        
        try {
            setSaving(true);
            setError(null);
            await milestoneService.createExpense(projectId, milestoneId, {
                name: expenseForm.name,
                description: expenseForm.description || undefined,
                amount: formatAmountForAPI(expenseForm.amount),
            });
            
            const data = await milestoneService.getMoneySplitDetail(projectId, milestoneId);
            setMoneySplits(data.moneySplits || []);
            setExpenses(data.expenses || []);
            setTotalAllocated(data.totalAllocated || 0);
            setRemainingAmount(data.remainingAmount || 0);
            
            setExpenseForm({ name: '', description: '', amount: '' });
            setShowExpenseModal(false);
        } catch (err: any) {
            setError(err.message || 'Không thể tạo chi phí.');
        } finally {
            setSaving(false);
        }
    };
    
    const handleUpdateExpense = async () => {
        if (!editingExpense || !expenseForm.name || !expenseForm.amount) {
            return;
        }
        
        try {
            setSaving(true);
            setError(null);
            await milestoneService.updateExpense(projectId, milestoneId, editingExpense.id, {
                name: expenseForm.name,
                description: expenseForm.description || undefined,
                amount: formatAmountForAPI(expenseForm.amount),
            });
            
            const data = await milestoneService.getMoneySplitDetail(projectId, milestoneId);
            setMoneySplits(data.moneySplits || []);
            setExpenses(data.expenses || []);
            setTotalAllocated(data.totalAllocated || 0);
            setRemainingAmount(data.remainingAmount || 0);
            
            setEditingExpense(null);
            setExpenseForm({ name: '', description: '', amount: '' });
            setShowExpenseModal(false);
        } catch (err: any) {
            setError(err.message || 'Không thể cập nhật chi phí.');
        } finally {
            setSaving(false);
        }
    };
    
    const handleDeleteExpense = async (expenseId: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa chi phí này?')) {
            return;
        }
        
        try {
            setError(null);
            await milestoneService.deleteExpense(projectId, milestoneId, expenseId);
            
            const data = await milestoneService.getMoneySplitDetail(projectId, milestoneId);
            setMoneySplits(data.moneySplits || []);
            setExpenses(data.expenses || []);
            setTotalAllocated(data.totalAllocated || 0);
            setRemainingAmount(data.remainingAmount || 0);
        } catch (err: any) {
            setError(err.message || 'Không thể xóa chi phí.');
        }
    };
    
    const openCreateMoneySplitModal = () => {
        setEditingMoneySplit(null);
        setMoneySplitForm({ userId: '', amount: '', note: '' });
        setShowMoneySplitModal(true);
    };
    
    const openEditMoneySplitModal = (moneySplit: MoneySplitResponse) => {
        setEditingMoneySplit(moneySplit);
        setMoneySplitForm({ 
            userId: String(moneySplit.userId), 
            amount: String(moneySplit.amount), 
            note: moneySplit.note || '' 
        });
        setShowMoneySplitModal(true);
    };
    
    const openCreateExpenseModal = () => {
        setEditingExpense(null);
        setExpenseForm({ name: '', description: '', amount: '' });
        setShowExpenseModal(true);
    };
    
    const openEditExpenseModal = (expense: ExpenseResponse) => {
        setEditingExpense(expense);
        setExpenseForm({ 
            name: expense.name, 
            description: expense.description || '', 
            amount: String(expense.amount) 
        });
        setShowExpenseModal(true);
    };
    
    const openRejectModal = (moneySplit: MoneySplitResponse) => {
        setRejectingMoneySplit(moneySplit);
        setRejectReason('');
        setShowRejectModal(true);
    };
    
    const MoneySplitStatusTag = ({ status }: { status: 'PENDING' | 'APPROVED' | 'REJECTED' }) => {
        switch (status) {
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-900/60 to-orange-900/60 border border-yellow-500/50 text-yellow-300 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.3)] animate-pulse">
                        <span className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></span>
                        Đang chờ duyệt
                    </span>
                );
            case 'APPROVED':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-green-900/60 to-emerald-900/60 border border-green-500/50 text-green-300 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                        <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                        Đã duyệt
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-red-900/60 to-orange-900/60 border border-red-500/50 text-red-300 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                        Đã từ chối
                    </span>
                );
            default:
                return null;
        }
    };
    
    if (loading || loadingPermission) {
        return (
            <div className="relative bg-[#0B0E1E]/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.1)] p-6 md:p-8 animate-fade-in overflow-hidden">
                <div className="absolute -top-1/2 -right-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-1/2 -left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 border border-purple-400/30 mb-4">
                        <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-300 text-lg">Đang tải dữ liệu phân chia năng lượng...</p>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="relative bg-[#0B0E1E]/60 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.1)] p-4 md:p-5 animate-fade-in overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-1/2 -right-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-1/2 -left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-400/30">
                            <UserPlus size={18} className="text-purple-300" />
                        </div>
                        <h3 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-purple-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
                            Phân Phối Năng Lượng
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {permission?.moneySplit?.canCreateMoneySplit && (
                            <button 
                                onClick={openCreateMoneySplitModal}
                                className="group relative flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-1.5 px-3 text-sm rounded-lg shadow-lg shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/50 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                <UserPlus size={14} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                                <span className="relative z-10 hidden md:inline">Chỉ Định Phân Phối</span>
                            </button>
                        )}
                        {permission?.expense?.canCreateExpense && (
                            <button 
                                onClick={openCreateExpenseModal}
                                className="group relative flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-1.5 px-3 text-sm rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/50 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                <Save size={14} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
                                <span className="relative z-10 hidden md:inline">Khai Báo Tiêu Thụ</span>
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Budget Display Cards */}
                <div className={`grid gap-2 mb-4 ${isClient ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                    <div className="relative p-3 bg-gradient-to-br from-[#0B0E1E]/80 to-[#1a1a2e]/80 backdrop-blur-sm rounded-lg border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                            <span className="text-xs text-gray-400 mb-0.5 block">Tổng Năng Lượng Của Trạm</span>
                            <p className="text-base font-extrabold bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">
                                {formattedTotalBudget}
                            </p>
                        </div>
                    </div>
                    {!isClient && (
                        <div className="relative p-3 bg-gradient-to-br from-[#0B0E1E]/80 to-[#1a1a2e]/80 backdrop-blur-sm rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <span className="text-xs text-gray-400 mb-0.5 block">Năng Lượng Đã Phân Phối</span>
                                <p className="text-base font-extrabold mb-0.5 text-purple-300">
                                    {formattedTotalAllocated}
                                </p>
                                <span className="text-xs font-medium text-cyan-300">
                                    ✨ Còn lại: {formattedRemaining}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            {!isClient && (
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                        <h4 className="text-base font-extrabold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                            Phân Phối Cho Phi Hành Đoàn
                        </h4>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                    </div>
                    <div className="flex flex-col gap-3">
                        {moneySplits.length > 0 ? moneySplits.map((moneySplit, index) => (
                            <div 
                                key={moneySplit.id} 
                                className="group relative p-3 bg-gradient-to-r from-[#0B0E1E]/80 to-[#1a1a2e]/80 backdrop-blur-sm rounded-lg border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                
                                <div className="relative z-10 flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="relative flex-shrink-0">
                                            <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <img 
                                                src={getMemberAvatar(moneySplit.userId)} 
                                                alt={moneySplit.userName || moneySplit.userEmail || 'Thành viên'} 
                                                className="relative w-10 h-10 rounded-full border-2 border-purple-400/50 group-hover:border-purple-300 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
                                            />
                                            {isMemberAnonymous(moneySplit.userId) && (
                                                <div className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-0.5 shadow-[0_0_10px_rgba(251,146,60,0.6)]" title="Thành viên ẩn danh">
                                                    <EyeOff size={8} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                                <span className="text-white font-semibold text-sm group-hover:text-purple-200 transition-colors duration-300">
                                                    {moneySplit.userName || moneySplit.userEmail || 'Thành viên'}
                                                </span>
                                                {isMemberAnonymous(moneySplit.userId) && (
                                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-xs bg-gradient-to-r from-orange-900/60 to-red-900/60 border border-orange-500/50 text-orange-300 rounded-full shadow-[0_0_10px_rgba(251,146,60,0.3)]">
                                                        <EyeOff size={10} />
                                                        Ẩn danh
                                                    </span>
                                                )}
                                                <MoneySplitStatusTag status={moneySplit.status} />
                                            </div>
                                            <p className="text-base font-extrabold bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent mb-0.5">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(moneySplit.amount)}
                                            </p>
                                            {moneySplit.note && (
                                                <p className="text-xs text-gray-300 italic mt-0.5 pl-1 border-l-2 border-purple-500/30">
                                                    "{moneySplit.note}"
                                                </p>
                                            )}
                                            {moneySplit.rejectionReason && (
                                                <p className="text-xs text-red-400 mt-1 pl-1 border-l-2 border-red-500/30">
                                                    <span className="font-semibold">Lý do từ chối:</span> "{moneySplit.rejectionReason}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {permission?.moneySplit?.canUpdateMoneySplit && moneySplit.status === 'PENDING' && (
                                            <button 
                                                onClick={() => openEditMoneySplitModal(moneySplit)}
                                                className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-300 group/edit"
                                                title="Sửa"
                                            >
                                                <Edit size={14} className="group-hover/edit:scale-110 transition-transform duration-300" />
                                            </button>
                                        )}
                                        {permission?.moneySplit?.canDeleteMoneySplit && (moneySplit.status === 'PENDING' || moneySplit.status === 'REJECTED') && !isCurrentUserRecipient(moneySplit) && (
                                            <button 
                                                onClick={() => handleDeleteMoneySplit(moneySplit.id)}
                                                disabled={saving}
                                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group/delete"
                                                title="Xóa"
                                            >
                                                <Trash2 size={14} className="group-hover/delete:scale-110 transition-transform duration-300" />
                                            </button>
                                        )}
                                        
                                        {(() => {
                                            const isRecipient = isCurrentUserRecipient(moneySplit);
                                            const canApprove = isRecipient && permission?.moneySplit?.canApproveMoneySplit && moneySplit.status === 'PENDING';
                                            const canReject = isRecipient && permission?.moneySplit?.canRejectMoneySplit && moneySplit.status === 'PENDING';
                                            const canDelete = isRecipient && permission?.moneySplit?.canDeleteMoneySplit && (moneySplit.status === 'PENDING' || moneySplit.status === 'REJECTED');
                                            
                                            if (canApprove || canReject || canDelete) {
                                                console.log('[Render] Money Split:', {
                                                    moneySplitId: moneySplit.id,
                                                    moneySplitUserId: moneySplit.userId,
                                                    moneySplitStatus: moneySplit.status,
                                                    isRecipient,
                                                    canApprove,
                                                    canReject,
                                                    canDelete
                                                });
                                            }
                                            
                                            return canApprove || canReject || canDelete;
                                        })() && (
                                            <>
                                                {(() => {
                                                    const isRecipient = isCurrentUserRecipient(moneySplit);
                                                    const canApprove = isRecipient && permission?.moneySplit?.canApproveMoneySplit && moneySplit.status === 'PENDING';
                                                    const canReject = isRecipient && permission?.moneySplit?.canRejectMoneySplit && moneySplit.status === 'PENDING';
                                                    const canDelete = isRecipient && permission?.moneySplit?.canDeleteMoneySplit && (moneySplit.status === 'PENDING' || moneySplit.status === 'REJECTED');
                                                    
                                                    return (
                                                        <>
                                                            {canApprove && (
                                                                <button 
                                                                    onClick={() => handleApproveMoneySplit(moneySplit.id)}
                                                                    disabled={saving}
                                                                    className="group relative px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-green-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                                                                >
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                                                    <span className="relative z-10">{saving ? 'Đang xử lý...' : 'Chấp nhận'}</span>
                                                                </button>
                                                            )}
                                                            {canReject && (
                                                                <button 
                                                                    onClick={() => openRejectModal(moneySplit)}
                                                                    disabled={saving}
                                                                    className="group relative px-3 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                                                                >
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                                                    <span className="relative z-10">Từ chối</span>
                                                                </button>
                                                            )}
                                                            {canDelete && (
                                                                <button 
                                                                    onClick={() => handleDeleteMoneySplit(moneySplit.id)}
                                                                    disabled={saving}
                                                                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group/delete"
                                                                    title="Xóa"
                                                                >
                                                                    <Trash2 size={14} className="group-hover/delete:scale-110 transition-transform duration-300" />
                                                                </button>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="relative p-8 text-center rounded-lg border border-purple-500/20 bg-gradient-to-br from-[#0B0E1E]/40 to-[#1a1a2e]/40 backdrop-blur-sm">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-purple-500/5 rounded-lg"></div>
                                <div className="relative z-10">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/30 mb-3">
                                        <UserPlus size={24} className="text-purple-300/50" />
                                    </div>
                                    <p className="text-gray-400 italic text-sm">Chưa có phân chia năng lượng nào.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {!isClient && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                        <h4 className="text-base font-extrabold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                            Các Tiêu Thụ Khác
                        </h4>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                    </div>
                    <div className="flex flex-col gap-3">
                        {expenses.length > 0 ? expenses.map((expense, index) => (
                            <div 
                                key={expense.id} 
                                className="group relative p-3 bg-gradient-to-r from-[#0B0E1E]/80 to-[#1a1a2e]/80 backdrop-blur-sm rounded-lg border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                
                                <div className="relative z-10 flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-white font-semibold text-sm mb-0.5 group-hover:text-blue-200 transition-colors duration-300">{expense.name}</h5>
                                        {expense.description && (
                                            <p className="text-xs text-gray-300 mb-1 italic pl-1 border-l-2 border-blue-500/30">
                                                "{expense.description}"
                                            </p>
                                        )}
                                        <p className="text-base font-extrabold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(expense.amount)}
                                        </p>
                                    </div>
                                    {(permission?.expense?.canUpdateExpense || permission?.expense?.canDeleteExpense) && (
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            {permission?.expense?.canUpdateExpense && (
                                                <button 
                                                    onClick={() => openEditExpenseModal(expense)}
                                                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-300 group/edit"
                                                    title="Sửa"
                                                >
                                                    <Edit size={14} className="group-hover/edit:scale-110 transition-transform duration-300" />
                                                </button>
                                            )}
                                            {permission?.expense?.canDeleteExpense && (
                                                <button 
                                                    onClick={() => handleDeleteExpense(expense.id)}
                                                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300 group/delete"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={14} className="group-hover/delete:scale-110 transition-transform duration-300" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="relative p-8 text-center rounded-lg border border-blue-500/20 bg-gradient-to-br from-[#0B0E1E]/40 to-[#1a1a2e]/40 backdrop-blur-sm">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 rounded-lg"></div>
                                <div className="relative z-10">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400/30 mb-3">
                                        <Save size={24} className="text-blue-300/50" />
                                    </div>
                                    <p className="text-gray-400 italic text-sm">Chưa có tiêu thụ nào.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {showMoneySplitModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="relative bg-[#0B0E1E]/95 backdrop-blur-xl border-2 border-purple-500/40 rounded-xl shadow-[0_0_50px_rgba(168,85,247,0.3)] w-full max-w-md max-h-[90vh] z-[10000] overflow-hidden flex flex-col">
                        {/* Background Glow */}
                        <div className="absolute -top-1/2 -right-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-1/2 -left-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-center p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/20 via-transparent to-cyan-900/20 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-400/30">
                                        <UserPlus size={16} className="text-purple-300" />
                                    </div>
                                    <h4 className="text-base font-extrabold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                                        {editingMoneySplit ? 'Sửa Phân Phối' : 'Tạo Phân Phối'}
                                    </h4>
                                </div>
                                <button 
                                    onClick={() => setShowMoneySplitModal(false)} 
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto flex-1 min-h-0">
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-300 mb-1.5 font-medium">Thành viên *</label>
                                        <select
                                            value={moneySplitForm.userId}
                                            onChange={(e) => setMoneySplitForm({ ...moneySplitForm, userId: e.target.value })}
                                            disabled={!!editingMoneySplit}
                                            className="w-full bg-[#0B0E1E]/60 border border-purple-500/30 text-white text-sm rounded-lg p-2 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 disabled:bg-[#0B0E1E]/40 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Chọn thành viên</option>
                                            {availableMembersForSplit.map(member => (
                                                <option key={member.id} value={member.id}>
                                                    {member.name} {getRoleBadge(member.role)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-300 mb-1.5 font-medium">Số tiền (VNĐ) *</label>
                                        <input
                                            type="number"
                                            placeholder="Nhập số tiền"
                                            value={moneySplitForm.amount}
                                            onChange={(e) => setMoneySplitForm({ ...moneySplitForm, amount: e.target.value })}
                                            className="w-full bg-[#0B0E1E]/60 border border-purple-500/30 text-white text-sm rounded-lg p-2 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 placeholder-gray-500"
                                        />
                                        <p className="text-xs text-cyan-300 mt-1.5 font-medium">
                                            ✨ Còn lại: {formattedRemaining}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-300 mb-1.5 font-medium">Ghi chú (tùy chọn)</label>
                                        <textarea
                                            placeholder="Nhập ghi chú"
                                            value={moneySplitForm.note}
                                            onChange={(e) => setMoneySplitForm({ ...moneySplitForm, note: e.target.value })}
                                            rows={3}
                                            className="w-full bg-[#0B0E1E]/60 border border-purple-500/30 text-white text-sm rounded-lg p-2 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 placeholder-gray-500 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-purple-500/30 bg-gradient-to-r from-purple-900/10 via-transparent to-cyan-900/10 flex justify-end gap-2 flex-shrink-0">
                                <button 
                                    onClick={() => setShowMoneySplitModal(false)}
                                    disabled={saving}
                                    className="flex items-center justify-center gap-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-white font-semibold py-1.5 px-3 text-sm rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600/50"
                                >
                                    Hủy
                                </button>
                                <button 
                                    onClick={editingMoneySplit ? handleUpdateMoneySplit : handleCreateMoneySplit}
                                    disabled={saving || !moneySplitForm.userId || !moneySplitForm.amount}
                                    className="group relative flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-1.5 px-3 text-sm rounded-lg shadow-lg shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    {saving ? (
                                        <>
                                            <div className="relative z-10 w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span className="relative z-10">Đang lưu...</span>
                                        </>
                                    ) : (
                                        <span className="relative z-10">{editingMoneySplit ? 'Cập nhật' : 'Tạo'}</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {showExpenseModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="relative bg-[#0B0E1E]/95 backdrop-blur-xl border-2 border-blue-500/40 rounded-xl shadow-[0_0_50px_rgba(59,130,246,0.3)] w-full max-w-md max-h-[90vh] z-[10000] overflow-hidden flex flex-col">
                        {/* Background Glow */}
                        <div className="absolute -top-1/2 -right-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-1/2 -left-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-center p-4 border-b border-blue-500/30 bg-gradient-to-r from-blue-900/20 via-transparent to-cyan-900/20 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30">
                                        <Save size={16} className="text-blue-300" />
                                    </div>
                                    <h4 className="text-base font-extrabold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                                        {editingExpense ? 'Sửa Tiêu Thụ' : 'Tạo Tiêu Thụ'}
                                    </h4>
                                </div>
                                <button 
                                    onClick={() => setShowExpenseModal(false)} 
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto flex-1 min-h-0">
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-300 mb-1.5 font-medium">Tên chi phí *</label>
                                        <input 
                                            type="text"
                                            placeholder="Ví dụ: Thuê piano"
                                            value={expenseForm.name}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                                            className="w-full bg-[#0B0E1E]/60 border border-blue-500/30 text-white text-sm rounded-lg p-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 placeholder-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-300 mb-1.5 font-medium">Mô tả (tùy chọn)</label>
                                        <textarea
                                            placeholder="Nhập mô tả"
                                            value={expenseForm.description}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                            rows={3}
                                            className="w-full bg-[#0B0E1E]/60 border border-blue-500/30 text-white text-sm rounded-lg p-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 placeholder-gray-500 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-300 mb-1.5 font-medium">Số tiền (VNĐ) *</label>
                                        <input 
                                            type="number"
                                            placeholder="Nhập số tiền"
                                            value={expenseForm.amount}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                            className="w-full bg-[#0B0E1E]/60 border border-blue-500/30 text-white text-sm rounded-lg p-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 placeholder-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-blue-500/30 bg-gradient-to-r from-blue-900/10 via-transparent to-cyan-900/10 flex justify-end gap-2 flex-shrink-0">
                                <button 
                                    onClick={() => setShowExpenseModal(false)}
                                    disabled={saving}
                                    className="flex items-center justify-center gap-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-white font-semibold py-1.5 px-3 text-sm rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600/50"
                                >
                                    Hủy
                                </button>
                                <button 
                                    onClick={editingExpense ? handleUpdateExpense : handleCreateExpense}
                                    disabled={saving || !expenseForm.name || !expenseForm.amount}
                                    className="group relative flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-1.5 px-3 text-sm rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    {saving ? (
                                        <>
                                            <div className="relative z-10 w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span className="relative z-10">Đang lưu...</span>
                                        </>
                                    ) : (
                                        <span className="relative z-10">{editingExpense ? 'Cập nhật' : 'Tạo'}</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {showRejectModal && rejectingMoneySplit && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="relative bg-[#0B0E1E]/95 backdrop-blur-xl border-2 border-red-500/40 rounded-xl shadow-[0_0_50px_rgba(239,68,68,0.3)] w-full max-w-md max-h-[90vh] z-[10000] overflow-hidden flex flex-col">
                        {/* Background Glow */}
                        <div className="absolute -top-1/2 -right-1/2 w-64 h-64 bg-red-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-1/2 -left-1/2 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-center p-4 border-b border-red-500/30 bg-gradient-to-r from-red-900/20 via-transparent to-orange-900/20 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-400/30">
                                        <X size={16} className="text-red-300" />
                                    </div>
                                    <h4 className="text-base font-extrabold bg-gradient-to-r from-red-300 to-orange-300 bg-clip-text text-transparent">
                                        Từ chối Phân Phối
                                    </h4>
                                </div>
                                <button 
                                    onClick={() => setShowRejectModal(false)} 
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto flex-1 min-h-0">
                                <div className="mb-3 p-3 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-lg">
                                    <p className="text-gray-300 text-sm">
                                        Bạn có chắc chắn muốn từ chối phân phối năng lượng cho <strong className="text-white">{rejectingMoneySplit.userName || rejectingMoneySplit.userEmail || 'Thành viên'}</strong>?
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-300 mb-1.5 font-medium">Lý do từ chối (tùy chọn)</label>
                                    <textarea
                                        placeholder="Nhập lý do từ chối"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        rows={3}
                                        className="w-full bg-[#0B0E1E]/60 border border-red-500/30 text-white text-sm rounded-lg p-2 focus:ring-2 focus:ring-red-500/50 focus:border-red-400 transition-all duration-300 placeholder-gray-500 resize-none"
                                    />
                                </div>
                            </div>
                            <div className="p-4 border-t border-red-500/30 bg-gradient-to-r from-red-900/10 via-transparent to-orange-900/10 flex justify-end gap-2 flex-shrink-0">
                                <button 
                                    onClick={() => setShowRejectModal(false)}
                                    disabled={saving}
                                    className="flex items-center justify-center gap-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-white font-semibold py-1.5 px-3 text-sm rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600/50"
                                >
                                    Hủy
                                </button>
                                <button 
                                    onClick={handleRejectMoneySplit}
                                    disabled={saving}
                                    className="group relative flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-1.5 px-3 text-sm rounded-lg shadow-lg shadow-red-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    {saving ? (
                                        <>
                                            <div className="relative z-10 w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span className="relative z-10">Đang xử lý...</span>
                                        </>
                                    ) : (
                                        <span className="relative z-10">Từ chối</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
        </>
    );
};

export default FinanceTab;

