import { type MilestoneResponse } from '../services/milestoneService';
import { type Milestone, type MilestoneStatusVI } from '../types/workspace';

/**
 * Map status từ backend sang tiếng Việt
 */
export const mapStatusToVietnamese = (status: string): MilestoneStatusVI => {
    switch (status) {
        case 'IN_PROGRESS':
            return 'Đang Vận Hành';
        case 'PENDING':
            return 'Đang Chờ Lệnh';
        case 'COMPLETED':
            return 'Nhiệm Vụ Hoàn Thành';
        case 'PAID':
            return 'Chờ Khách hàng duyệt';
        default:
            return 'Đang Chờ Lệnh';
    }
};

/**
 * Convert milestone từ API response sang format local
 */
export const convertMilestoneFromAPI = (apiMilestone: MilestoneResponse): Milestone => {
    return {
        id: apiMilestone.id,
        title: apiMilestone.title,
        description: apiMilestone.description || '',
        status: mapStatusToVietnamese(apiMilestone.status),
        budget: typeof apiMilestone.amount === 'number' ? apiMilestone.amount : 0,
        paymentStatus: apiMilestone.paymentStatus,
        sequence: apiMilestone.sequence,
        productCount: apiMilestone.productCount,
        contractProductCount: apiMilestone.contractProductCount,
        editCount: apiMilestone.editCount,
        contractFpEditCount: apiMilestone.contractFpEditCount,
        contractTotalAmount: apiMilestone.contractTotalAmount,
        dueDate: apiMilestone.dueDate,
    };
};

/**
 * Chuẩn hóa input ngày về định dạng YYYY-MM-DD
 * Xử lý timezone để tránh lệch ngày
 */
export const normalizeDateInput = (raw?: string | null): string => {
    if (!raw) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return raw;
    }
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    const tzAdjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return tzAdjusted.toISOString().split('T')[0];
};

/**
 * Lấy ngày mai dưới dạng YYYY-MM-DD (ngày tối thiểu cho ngày đến hạn)
 * Điều chỉnh timezone để tránh lệch ngày
 */
export const getTomorrowDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tzAdjusted = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000);
    return tzAdjusted.toISOString().split('T')[0];
};

