import { Loader2, X, Target, FileText, DollarSign, Calendar, Edit, Package, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { getTomorrowDate } from '../../../utils/workspace.helpers';

interface MilestoneFormData {
    title: string;
    description: string;
    amount: string;
    dueDate: string;
    editCount: number;
    productCount: number;
}

interface MilestoneFormModalProps {
    isOpen: boolean;
    modalMode: 'create' | 'edit';
    isSubmitting: boolean;
    formData: MilestoneFormData;
    onFormChange: (data: MilestoneFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    // Calculation values
    currencyFormatter: Intl.NumberFormat;
    numberFormatter: Intl.NumberFormat;
    usedAmount: number;
    usedProducts: number;
    usedEdits: number;
    contractAmountLimit: number | null;
    productLimit: number | null;
    editLimit: number | null;
    remainingAmountForModal: number | null;
    remainingProductsForModal: number | null;
    remainingEditsForModal: number | null;
    remainingAmountAfter: number | null;
    remainingProductsAfter: number | null;
    remainingEditsAfter: number | null;
    remainingAmountAfterRaw: number | null;
    remainingProductsAfterRaw: number | null;
    remainingEditsAfterRaw: number | null;
    amountIsOverLimit: boolean;
    productIsOverLimit: boolean;
    editIsOverLimit: boolean;
}

export default function MilestoneFormModal({
    isOpen,
    modalMode,
    isSubmitting,
    formData,
    onFormChange,
    onSubmit,
    onClose,
    currencyFormatter,
    numberFormatter,
    usedAmount,
    usedProducts,
    usedEdits,
    contractAmountLimit,
    productLimit,
    editLimit,
    remainingAmountForModal,
    remainingProductsForModal,
    remainingEditsForModal,
    remainingAmountAfter,
    remainingProductsAfter,
    remainingEditsAfter,
    remainingAmountAfterRaw,
    remainingProductsAfterRaw,
    remainingEditsAfterRaw,
    amountIsOverLimit,
    productIsOverLimit,
    editIsOverLimit,
}: MilestoneFormModalProps) {
    if (!isOpen) return null;

    const handleInputChange = (field: keyof MilestoneFormData, value: string | number) => {
        onFormChange({ ...formData, [field]: value });
    };

    // Calculate progress percentages
    const amountProgress = contractAmountLimit ? (usedAmount / contractAmountLimit) * 100 : 0;
    const productProgress = productLimit ? (usedProducts / productLimit) * 100 : 0;
    const editProgress = editLimit ? (usedEdits / editLimit) * 100 : 0;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-w-2xl w-full overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-600/20 rounded border border-blue-500/30">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white">
                                {modalMode === 'edit' ? 'Cập nhật Cột mốc' : 'Tạo Cột mốc Mới'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">

                    <form onSubmit={onSubmit} className="space-y-3">
                        {/* Title Field */}
                        <div className="space-y-1">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                                <Target className="w-4 h-4 text-blue-400" />
                                Tiêu đề <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                placeholder="Nhập tiêu đề cột mốc"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Description Field */}
                        <div className="space-y-1">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                                <FileText className="w-4 h-4 text-blue-400" />
                                Mô tả
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                placeholder="Nhập mô tả cột mốc (tùy chọn)"
                                rows={2}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Amount Field */}
                            <div className="space-y-1">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                                    <DollarSign className="w-4 h-4 text-blue-400" />
                                    Số tiền (VND) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.amount}
                                    onChange={(e) => handleInputChange('amount', e.target.value)}
                                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base ${
                                        amountIsOverLimit ? 'border-red-500' : 'border-slate-600'
                                    }`}
                                    placeholder="0.00"
                                    required
                                    disabled={isSubmitting}
                                />
                                {typeof contractAmountLimit === 'number' && (
                                    <div className="mt-1.5 space-y-1">
                                        {/* Progress Bar */}
                                        <div className="space-y-0.5">
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Đã phân bổ</span>
                                                <span className="font-medium text-gray-300">
                                                    {currencyFormatter.format(usedAmount)} / {currencyFormatter.format(contractAmountLimit)}
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-500 transition-all duration-300"
                                                    style={{ width: `${Math.min(amountProgress, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Remaining Info */}
                                        <div className="flex items-center gap-1.5 text-xs">
                                            {amountIsOverLimit ? (
                                                <>
                                                    <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                                    <span className="text-red-400 font-medium">
                                                        Thiếu {currencyFormatter.format(Math.abs(remainingAmountAfterRaw ?? 0))}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                                    <span className="text-gray-400">
                                                        Còn lại:{' '}
                                                        <span className="text-green-400 font-medium">
                                                            {currencyFormatter.format(remainingAmountAfter ?? remainingAmountForModal ?? 0)}
                                                        </span>
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Due Date Field */}
                            <div className="space-y-1">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                                    <Calendar className="w-4 h-4 text-blue-400" />
                                    Ngày đến hạn <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                    min={getTomorrowDate()}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                    required
                                    disabled={isSubmitting}
                                />
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Phải sau ngày hiện tại
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Edit Count Field */}
                            <div className="space-y-1">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                                    <Edit className="w-4 h-4 text-blue-400" />
                                    Số lượt chỉnh sửa
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.editCount}
                                    onChange={(e) => {
                                        const v = parseInt(e.target.value);
                                        handleInputChange('editCount', isNaN(v) ? 1 : Math.max(1, v));
                                    }}
                                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base ${
                                        editIsOverLimit ? 'border-red-500' : 'border-slate-600'
                                    }`}
                                    disabled={isSubmitting}
                                    required
                                />
                                {typeof editLimit === 'number' && (
                                    <div className="mt-1.5 space-y-1">
                                        {/* Progress Bar */}
                                        <div className="space-y-0.5">
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Đã phân bổ</span>
                                                <span className="font-medium text-gray-300">
                                                    {numberFormatter.format(usedEdits)} / {numberFormatter.format(editLimit)}
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-500 transition-all duration-300"
                                                    style={{ width: `${Math.min(editProgress, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Remaining Info */}
                                        <div className="flex items-center gap-1.5 text-xs">
                                            {editIsOverLimit ? (
                                                <>
                                                    <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                                    <span className="text-red-400 font-medium">
                                                        Thiếu {numberFormatter.format(Math.abs(remainingEditsAfterRaw ?? 0))} lượt
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                                    <span className="text-gray-400">
                                                        Còn lại:{' '}
                                                        <span className="text-green-400 font-medium">
                                                            {numberFormatter.format(remainingEditsAfter ?? remainingEditsForModal ?? 0)}
                                                        </span>
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Product Count Field */}
                            <div className="space-y-1">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                                    <Package className="w-4 h-4 text-blue-400" />
                                    Số lượng sản phẩm <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.productCount}
                                    onChange={(e) => handleInputChange('productCount', parseInt(e.target.value) || 1)}
                                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base ${
                                        productIsOverLimit ? 'border-red-500' : 'border-slate-600'
                                    }`}
                                    required
                                    disabled={isSubmitting}
                                />
                                {typeof productLimit === 'number' && (
                                    <div className="mt-1.5 space-y-1">
                                        {/* Progress Bar */}
                                        <div className="space-y-0.5">
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Đã phân bổ</span>
                                                <span className="font-medium text-gray-300">
                                                    {numberFormatter.format(usedProducts)} / {numberFormatter.format(productLimit)}
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-500 transition-all duration-300"
                                                    style={{ width: `${Math.min(productProgress, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Remaining Info */}
                                        <div className="flex items-center gap-1.5 text-xs">
                                            {productIsOverLimit ? (
                                                <>
                                                    <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                                    <span className="text-red-400 font-medium">
                                                        Thiếu {numberFormatter.format(Math.abs(remainingProductsAfterRaw ?? 0))} sản phẩm
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                                    <span className="text-gray-400">
                                                        Còn lại:{' '}
                                                        <span className="text-green-400 font-medium">
                                                            {numberFormatter.format(remainingProductsAfter ?? remainingProductsForModal ?? 0)}
                                                        </span>
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        {modalMode === 'edit' ? 'Đang lưu...' : 'Đang tạo...'}
                                    </>
                                ) : (
                                    <>
                                        {modalMode === 'edit' ? (
                                            <>
                                                <CheckCircle2 className="w-3 h-3" />
                                                Lưu thay đổi
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-3 h-3" />
                                                Tạo Cột mốc
                                            </>
                                        )}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

