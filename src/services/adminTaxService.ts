import apiInstance from "../config/axiosCustom";
import { ApiResponse, PageResponse } from "../types/session";

export type AdminTaxGroupBy = "MONTH" | "YEAR";

export interface AdminTaxSourceBreakdown {
  source: string;
  gross: number;
  tax: number;
  net: number;
  payoutCount: number;
}

export interface AdminTaxTimeSeries {
  periodLabel: string;
  gross: number;
  taxWithheld: number;
  taxPaid: number;
  taxDue: number;
}

export interface AdminTaxOverviewResponse {
  totalGross: number;
  totalTaxWithheld: number;
  totalTaxPaid: number;
  totalTaxDue: number;
  totalPayoutCount: number;
  totalUserCount: number;
  totalProjectCount: number;
  sourceBreakdown: AdminTaxSourceBreakdown[];
  timeSeries: AdminTaxTimeSeries[];
}

export interface AdminTaxOverviewParams {
  from?: string;
  to?: string;
  groupBy?: AdminTaxGroupBy;
}

export interface AdminTaxPayoutResponse {
  id: number;
  payoutDate: string;
  payoutSource: string;
  status: string;
  grossAmount: number;
  taxAmount: number;
  netAmount: number;
  userId: number;
  userName: string;
  userEmail: string;
  userCccd?: string;
  projectId?: number;
  projectTitle?: string;
  contractId?: number;
  milestoneId?: number;
  milestoneTitle?: string;
  taxPeriodMonth?: number;
  taxPeriodYear?: number;
  taxPeriodQuarter?: number;
  taxDeclared: boolean;
  taxPaid: boolean;
}

export interface AdminTaxPayoutQuery {
  from?: string;
  to?: string;
  month?: number;
  year?: number;
  quarter?: number;
  userId?: number;
  projectId?: number;
  contractId?: number;
  source?: string;
  declared?: boolean;
  paid?: boolean;
  page?: number;
  size?: number;
}

export interface AdminTaxExportParams extends AdminTaxPayoutQuery {
  format?: "CSV" | "XLSX" | "PDF" | string;
}

class AdminTaxService {
  async getOverview(
    params: AdminTaxOverviewParams
  ): Promise<AdminTaxOverviewResponse> {
    const res = await apiInstance.get<ApiResponse<AdminTaxOverviewResponse>>(
      "/api/admin/taxes/overview",
      { params }
    );
    return res.data.result;
  }

  async getPayouts(
    params: AdminTaxPayoutQuery
  ): Promise<PageResponse<AdminTaxPayoutResponse>> {
    const res = await apiInstance.get<
      ApiResponse<PageResponse<AdminTaxPayoutResponse>>
    >("/api/admin/taxes/payouts", {
      params,
    });
    return res.data.result;
  }

  async exportPayouts(
    params: AdminTaxExportParams
  ): Promise<{ blob: Blob; filename: string }> {
    const res = await apiInstance.get<Blob>("/api/admin/taxes/payouts/export", {
      params: {
        format: params.format ?? "CSV",
        ...params,
      },
      responseType: "blob",
    });

    const disposition =
      (res.headers && (res.headers["content-disposition"] as string)) ||
      (res.headers && (res.headers["Content-Disposition"] as string));

    const filenameMatch = disposition?.match(
      /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i
    );

    const today = new Date().toISOString().slice(0, 10);
    const fallbackName = `admin_tax_payouts_${today}.${(
      params.format || "CSV"
    ).toLowerCase()}`;

    return {
      blob: res.data,
      filename: filenameMatch?.[1] ?? fallbackName,
    };
  }

  async markPayouts(params: {
    declared?: boolean;
    paid?: boolean;
    ids: number[];
  }): Promise<void> {
    await apiInstance.post<ApiResponse<void>>(
      "/api/admin/taxes/payouts/mark",
      null,
      {
        params: {
          declared: params.declared,
          paid: params.paid,
          ids: params.ids.join(","),
        },
      }
    );
  }
}

const adminTaxService = new AdminTaxService();

export default adminTaxService;

