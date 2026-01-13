import { ProPackageStatsService, ProPackageStatsQuery, ProPackageTimeSeriesResponse } from '@/services/proPackageStats';
import { useState, useEffect } from 'react';

interface UseProPackageStatsResult {
  data: ProPackageTimeSeriesResponse | null;
  loading: boolean;
  error: string | null;
  fetchData: (query?: ProPackageStatsQuery) => void;
}

export const useProPackageStats = (): UseProPackageStatsResult => {
  const [data, setData] = useState<ProPackageTimeSeriesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (query?: ProPackageStatsQuery) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ProPackageStatsService.getTimeSeriesStats(query);
      setData(result);
    } catch (e: any) {
      console.error("Failed to fetch pro package stats:", e);
      const errorMessage = e?.response?.data?.message || e?.message || "Không thể kết nối với trạm kiểm soát (API Error)";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Tải dữ liệu mặc định khi component mount
    fetchData({ period: "month", year: new Date().getFullYear() });
  }, []);

  return { data, loading, error, fetchData };
};

