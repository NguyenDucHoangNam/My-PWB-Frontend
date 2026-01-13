import apiInstance from "../config/axiosCustom";
import { ApiResponse, PageResponse } from "../types/session";

export type TaxGroupBy = "MONTH" | "YEAR";

export interface TaxOverviewResponse {
  totalGross: number;
  totalTax: number;
  totalNet: number;
  totalPayoutCount: number;
  totalContractCount: number;
  totalProjectCount: number;
  sourceBreakdown: Array<{
    source: string;
    gross: number;
    tax: number;
    net: number;
    payoutCount: number;
  }>;
  timeSeries: Array<{
    periodLabel: string;
    gross: number;
    tax: number;
    net: number;
  }>;
}

export interface TaxOverviewParams {
  from?: string;
  to?: string;
  groupBy?: TaxGroupBy;
}

export interface TaxTransaction {
  id: number;
  payoutDate: string;
  payoutSource: string;
  status: string;
  referenceCode: string;
  grossAmount: number;
  taxAmount: number;
  netAmount: number;
  projectId?: number;
  projectTitle?: string;
  contractId?: number;
  milestoneId?: number;
  milestoneTitle?: string;
  taxPeriodMonth?: number;
  taxPeriodYear?: number;
  taxPeriodQuarter?: number;
}

export interface TaxTransactionsParams {
  from?: string;
  to?: string;
  source?: string;
  page?: number;
  size?: number;
}

export interface ExportTransactionsParams extends TaxTransactionsParams {
  format?: "CSV" | "XLSX" | "PDF" | string;
}

class TaxService {
  async getOverview(
    params: TaxOverviewParams
  ): Promise<TaxOverviewResponse> {
    const res = await apiInstance.get<ApiResponse<TaxOverviewResponse>>(
      "/api/v1/taxes/overview",
      { params }
    );
    return res.data.result;
  }

  async getTransactions(
    params: TaxTransactionsParams
  ): Promise<PageResponse<TaxTransaction>> {
    const res = await apiInstance.get<ApiResponse<PageResponse<TaxTransaction>>>(
      "/api/v1/taxes/transactions",
      { params }
    );
    return res.data.result;
  }

  async exportTransactions(
    params: ExportTransactionsParams = {}
  ): Promise<{ blob: Blob; filename: string }> {
    const response = await apiInstance.get<Blob>(
      "/api/v1/taxes/transactions/export",
      {
        params: {
          format: params.format ?? "CSV",
          ...params,
        },
        responseType: "blob",
      }
    );

    const disposition =
      (response.headers && (response.headers["content-disposition"] as string)) ||
      (response.headers && (response.headers["Content-Disposition"] as string));

    const filenameMatch = disposition?.match(
      /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i
    );

    const today = new Date().toISOString().slice(0, 10);
    const fallbackName = `tax_transactions_${today}.${(params.format || "CSV").toLowerCase()}`;

    return {
      blob: response.data,
      filename: filenameMatch?.[1] ?? fallbackName,
    };
  }
}

const taxService = new TaxService();

export default taxService;

