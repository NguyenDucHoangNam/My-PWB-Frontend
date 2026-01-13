import apiInstance from "@/config/axiosCustom";

export interface PackageTimeSeriesData {
  packageName: string;
  soldCounts: number[];
  revenues: number[];
}

export interface ProPackageTimeSeriesResponse {
  timeLabels: string[];
  packageData: PackageTimeSeriesData[];
  totalSold: number[];
  totalRevenue: number[];
  totalRevenueForPeriod: number;
}

export interface ProPackageStatsQuery {
  year?: number;
  period?: "month" | "year";
}

export const ProPackageStatsService = {
  async getTimeSeriesStats(params?: ProPackageStatsQuery) {
    const response = await apiInstance.get<ProPackageTimeSeriesResponse>(
      "/api/admin/stats/pro-package-time-series",
      {
        params,
      }
    );
    return response.data;
  },
};


