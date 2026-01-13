import { AdminDashboardResponse, AdminDashboardService, DashboardQuery } from '@/services/revenue';
import { useState, useEffect } from 'react';

interface UseDashboardResult {
  data: AdminDashboardResponse | null;
  loading: boolean;
  error: string | null;
  fetchData: (query: DashboardQuery) => void;
}

export const useDashboardData = (): UseDashboardResult => {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (query: DashboardQuery) => {
    setLoading(true);
    setError(null);
    try {
      const result = await AdminDashboardService.getStats(query);
      console.log("data: ",result)
      setData(result);
    } catch (e) {
      console.error("Failed to fetch dashboard data:", e);
      setError("Không thể kết nối với trạm kiểm soát (API Error)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Tải dữ liệu mặc định khi component mount
    fetchData({ groupBy: "month" });
  }, []);

  return { data, loading, error, fetchData };
};