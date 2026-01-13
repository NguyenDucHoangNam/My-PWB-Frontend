import apiInstance from "@/config/axiosCustom";

export interface RevenueStat {
  date: string;
  revenue: number;
}

export interface PackageSalesStat {
  date: string;
  sold: number;
}

export interface AdminDashboardResponse {
  totalRevenue: number;
  totalPackagesSold: number;

  revenueStats: RevenueStat[];
  packageSalesStats: PackageSalesStat[];
}

export interface DashboardQuery {
  fromDate?: string;  // ISO format: "2025-01-01"
  toDate?: string;
  groupBy?: "month" | "year";
}

export const AdminDashboardService = {
  async getStats(params: DashboardQuery) {
    const response = await apiInstance.get<AdminDashboardResponse>(
      "/api/admin/stats",
      {
        params,
      }
    );
    return response.data;
  },
};
