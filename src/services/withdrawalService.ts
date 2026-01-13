import apiInstance from "../config/axiosCustom";

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface WithdrawalRequest {
  bankId: number;
  accountNumber: string;
  accountHolderName: string;
  amount: number;
}

export interface BankResponse {
  id: number;
  code: string;
  name: string;
  shortName: string;
  bin: string;
  logoUrl: string;
  transferSupported: boolean;
  lookupSupported: boolean;
  swiftCode: string;
}

export interface WithdrawalResponse {
  id: number;
  withdrawalCode: string;
  amount: number;
  bank: BankResponse;
  accountNumber: string;
  accountHolderName: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
  remainingBalance: number;
  qrDataURL?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface RejectWithdrawalRequest {
  rejectionReason: string;
}

export interface BalanceResponse {
  balance: number;
}

export type WithdrawalStatus = "PENDING" | "COMPLETED" | "REJECTED";

export interface SearchWithdrawalsParams {
  keyword?: string;
  status?: WithdrawalStatus;
  minAmount?: number;
  maxAmount?: number;
  fromDate?: string; // ISO date string
  toDate?: string; // ISO date string
  page?: number;
  size?: number;
  sort?: string; // e.g., "createdAt,desc"
}

export interface AdminSearchWithdrawalsParams extends SearchWithdrawalsParams {
  userId?: number;
}

/**
 * Convert datetime-local format to ISO format
 * datetime-local: "yyyy-MM-ddTHH:mm" -> ISO: "yyyy-MM-ddTHH:mm:ss"
 * Backend expects ISO_DATE_TIME format: yyyy-MM-ddTHH:mm:ss
 * 
 * Note: datetime-local input returns local time without timezone info.
 * We preserve the exact local time values and format as ISO (without timezone).
 */
function convertToISODateTime(dateStr: string, isEndDate: boolean = false): string {
  if (!dateStr || !dateStr.trim()) return dateStr;

  try {
    // If already in ISO format with seconds, return as is
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      return dateStr;
    }

    // If it's just a date (no time), add time
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return isEndDate ? `${dateStr}T23:59:59` : `${dateStr}T00:00:00`;
    }

    // If it's datetime-local format (no seconds), add seconds
    // Format: "yyyy-MM-ddTHH:mm"
    // This is the most common case from datetime-local input
    // We directly append seconds without parsing as Date to avoid timezone issues
    const datetimeLocalMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/);
    if (datetimeLocalMatch) {
      const [, datePart, hours, minutes] = datetimeLocalMatch;
      const seconds = isEndDate ? '59' : '00';
      return `${datePart}T${hours}:${minutes}:${seconds}`;
    }

    // Fallback: Try to parse as Date and extract local components
    // This handles edge cases but may have timezone issues
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      // Get local date components to preserve the time values
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = isEndDate ? '59' : '00';

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    // Return as is if format is unknown
    console.warn('Unknown date format:', dateStr);
    return dateStr;
  } catch (error) {
    console.error('Error converting date:', dateStr, error);
    return dateStr;
  }
}

class WithdrawalService {
  async createWithdrawal(
    request: WithdrawalRequest
  ): Promise<WithdrawalResponse> {
    const res = await apiInstance.post<ApiResponse<WithdrawalResponse>>(
      "/api/v1/withdrawals",
      request
    );
    return res.data.result;
  }

  async getUserWithdrawals(
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<WithdrawalResponse>> {
    const res = await apiInstance.get<ApiResponse<PageResponse<WithdrawalResponse>>>(
      "/api/v1/withdrawals",
      {
        params: { page, size },
      }
    );
    return res.data.result;
  }

  async searchUserWithdrawals(
    params: SearchWithdrawalsParams
  ): Promise<PageResponse<WithdrawalResponse>> {
    const queryParams: any = {
      page: params.page ?? 0,
      size: params.size ?? 20,
    };

    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.status) queryParams.status = params.status;
    if (params.minAmount) queryParams.minAmount = params.minAmount;
    if (params.maxAmount) queryParams.maxAmount = params.maxAmount;
    if (params.fromDate) {
      const convertedDate = convertToISODateTime(params.fromDate, false);
      queryParams.fromDate = convertedDate;
      console.log('fromDate conversion:', params.fromDate, '->', convertedDate);
    }
    if (params.toDate) {
      const convertedDate = convertToISODateTime(params.toDate, true);
      queryParams.toDate = convertedDate;
      console.log('toDate conversion:', params.toDate, '->', convertedDate);
    }
    if (params.sort) {
      const [property, direction] = params.sort.split(",");
      queryParams.sort = [property, direction].join(",");
    }

    console.log('API queryParams:', queryParams);

    const res = await apiInstance.get<ApiResponse<PageResponse<WithdrawalResponse>>>(
      "/api/v1/withdrawals",
      { params: queryParams }
    );
    return res.data.result;
  }

  async getWithdrawalById(withdrawalId: number): Promise<WithdrawalResponse> {
    const res = await apiInstance.get<ApiResponse<WithdrawalResponse>>(
      `/api/v1/withdrawals/${withdrawalId}`
    );
    return res.data.result;
  }

  async getUserBalance(): Promise<BalanceResponse> {
    const res = await apiInstance.get<ApiResponse<BalanceResponse>>(
      "/api/v1/withdrawals/balance"
    );
    return res.data.result;
  }

  async getAllBanks(keyword?: string): Promise<BankResponse[]> {
    const params = keyword ? { keyword } : {};
    const res = await apiInstance.get<ApiResponse<BankResponse[]>>(
      "/api/v1/banks",
      { params }
    );
    return res.data.result;
  }

  // Admin APIs
  async getAllWithdrawals(
    page: number = 0,
    size: number = 20,
    sort?: string
  ): Promise<PageResponse<WithdrawalResponse>> {
    const params: any = { page, size };
    if (sort) {
      const [property, direction] = sort.split(",");
      params.sort = [property, direction].join(",");
    }
    const res = await apiInstance.get<ApiResponse<PageResponse<WithdrawalResponse>>>(
      "/api/v1/withdrawals/admin/all",
      { params }
    );
    return res.data.result;
  }

  async searchAllWithdrawals(
    params: AdminSearchWithdrawalsParams
  ): Promise<PageResponse<WithdrawalResponse>> {
    const queryParams: any = {
      page: params.page ?? 0,
      size: params.size ?? 20,
    };

    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.status) queryParams.status = params.status;
    if (params.userId) queryParams.userId = params.userId;
    if (params.minAmount) queryParams.minAmount = params.minAmount;
    if (params.maxAmount) queryParams.maxAmount = params.maxAmount;
    if (params.fromDate) queryParams.fromDate = convertToISODateTime(params.fromDate, false);
    if (params.toDate) queryParams.toDate = convertToISODateTime(params.toDate, true);
    if (params.sort) {
      const [property, direction] = params.sort.split(",");
      queryParams.sort = [property, direction].join(",");
    }

    const res = await apiInstance.get<ApiResponse<PageResponse<WithdrawalResponse>>>(
      "/api/v1/withdrawals/admin/all",
      { params: queryParams }
    );
    return res.data.result;
  }

  async approveWithdrawal(withdrawalId: number): Promise<WithdrawalResponse> {
    const res = await apiInstance.put<ApiResponse<WithdrawalResponse>>(
      `/api/v1/withdrawals/admin/${withdrawalId}/approve`
    );
    return res.data.result;
  }

  async rejectWithdrawal(
    withdrawalId: number,
    request: RejectWithdrawalRequest
  ): Promise<WithdrawalResponse> {
    const res = await apiInstance.put<ApiResponse<WithdrawalResponse>>(
      `/api/v1/withdrawals/admin/${withdrawalId}/reject`,
      request
    );
    return res.data.result;
  }
}

const withdrawalService = new WithdrawalService();
export default withdrawalService;

