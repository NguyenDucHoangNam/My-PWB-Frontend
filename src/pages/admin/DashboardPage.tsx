import { useProPackageStats } from "@/component/hooks/dashboardAdmin/useProPackageStats";
import { ProPackageStatsQuery } from "@/services/proPackageStats";
import { useState } from "react";
import { MdOutlineRocketLaunch, MdOutlineMoney } from "react-icons/md";
import ProPackageCombinedChart from "@/component/dashboardAdmin/ProPackageCombinedChart";

const AdminDashboard: React.FC = () => {
  const { data, loading, error, fetchData } = useProPackageStats();
  const [query, setQuery] = useState<ProPackageStatsQuery>({
    period: "month",
    year: new Date().getFullYear(),
  });

  const handlePeriodChange = (period: "month" | "year") => {
    // Khi chuyển sang "year", không cần gửi year vì API tự động trả về 5 năm gần nhất
    const newQuery: ProPackageStatsQuery =
      period === "year"
        ? { period }
        : { period, year: new Date().getFullYear() };
    setQuery(newQuery);
    fetchData(newQuery);
  };

  const handleYearChange = (year: number) => {
    const newQuery = { ...query, year };
    setQuery(newQuery);
    fetchData(newQuery);
  };

  // --- PHẦN CODE XỬ LÝ LOADING VÀ ERROR ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="animate-spin text-7xl text-cyan-400">
          <MdOutlineRocketLaunch />
        </div>
        <p className="ml-6 text-2xl text-cyan-300">
          Đang đồng bộ dữ liệu với Trạm Vũ Trụ Apollo...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 p-10">
        <p className="text-3xl font-bold">🚨 Lỗi Hệ Thống Lớn: {error}</p>
        <p className="mt-3 text-xl text-gray-400">
          Không thể thiết lập kết nối. Vui lòng kiểm tra lại hệ thống liên lạc.
        </p>
      </div>
    );
  }
  // --------------------------------------------------------

  // Tính tổng số gói đã bán
  const totalSold = data?.totalSold.reduce((sum, val) => sum + val, 0) ?? 0;
  // Tổng doanh thu của cả khoảng thời gian
  const totalRevenueForPeriod = data?.totalRevenueForPeriod ?? 0;
  // Lấy label cho period hiện tại
  const periodLabel =
    query.period === "month" && query.year
      ? `năm ${query.year}`
      : query.period === "year"
      ? "5 năm gần nhất"
      : "";

  return (
    <div className="min-h-screen p-4 sm:p-6 text-white font-sans">
      {/* Page Title */}
      <header className="mb-8 border-b border-cyan-500/50 pb-3">
        <h1 className="text-3xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-cyan-400 to-purple-500 font-['Orbitron'] tracking-wider flex items-center">
          <MdOutlineRocketLaunch className="mr-3 text-3xl sm:text-2xl text-cyan-400" />
          THỐNG KÊ GÓI PRO
        </h1>
        <p className="text-purple-300 mt-2 text-base">
          Biểu đồ thống kê gói Pro theo thời gian trong **Vũ Trụ Âm Nhạc**.
        </p>
      </header>

      {/* Filters */}
      <div className="mb-8 p-3 bg-gray-800/70 rounded-lg border border-purple-600/50 shadow-inner shadow-gray-700/50 flex flex-wrap gap-4 items-center">
        <label className="text-base font-medium text-cyan-300 font-['Orbitron'] mr-2">
          Hiển Thị Dữ Liệu Theo:
        </label>

        {(["month", "year"] as const).map((period) => (
          <button
            key={period}
            onClick={() => handlePeriodChange(period)}
            className={`px-4 py-1 rounded-full text-sm font-bold transition-all border ${
              query.period === period
                ? "bg-yellow-500 text-gray-900 border-yellow-500 shadow-neon-yellow"
                : "bg-gray-700/50 text-purple-200 border-purple-500/50 hover:bg-gray-600/70"
            }`}
          >
            {period === "month" ? "THEO THÁNG" : "THEO NĂM"}
          </button>
        ))}

        {query.period === "month" && (
          <>
            <label className="text-base font-medium text-cyan-300 font-['Orbitron'] ml-4 mr-2">
              Năm:
            </label>
            <select
              value={query.year}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="px-4 py-1 rounded-full text-sm font-bold bg-gray-700/50 text-purple-200 border border-purple-500/50 hover:bg-gray-600/70 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </>
        )}
      </div>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Stat Card - Tổng số gói đã bán */}
        <div className="bg-gray-800/70 p-6 rounded-xl border border-cyan-500/50 shadow-neon-cyan/60">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-200 mb-1">
                Tổng Số Gói Đã Bán
              </h3>
              <p className="text-3xl font-bold text-yellow-300">
                {totalSold.toLocaleString("vi-VN")}{" "}
                <span className="text-xl">gói</span>
              </p>
            </div>
            <div className="text-6xl text-cyan-400 opacity-50">
              <MdOutlineRocketLaunch />
            </div>
          </div>
        </div>

        {/* Stat Card - Tổng doanh thu */}
        <div className="bg-gray-800/70 p-6 rounded-xl border border-cyan-500/50 shadow-neon-cyan/60">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-200 mb-1">
                Tổng Doanh Thu{" "}
                {periodLabel === "5 năm gần nhất" ? "" : periodLabel}
              </h3>
              <p className="text-3xl font-bold text-green-400">
                {totalRevenueForPeriod.toLocaleString("vi-VN")}{" "}
                <span className="text-xl">VNĐ</span>
              </p>
            </div>
            <div className="text-6xl text-green-400 opacity-50">
              <MdOutlineMoney />
            </div>
          </div>
        </div>
      </section>

      {/* Chart */}
      <div className="bg-gray-800/70 p-4 rounded-xl border border-cyan-500/50 shadow-neon-cyan/60">
        <h2 className="text-xl font-bold text-yellow-300 mb-4 font-['Orbitron'] border-b border-gray-600 pb-1">
          Biểu Đồ Thống Kê Gói Pro
        </h2>
        <ProPackageCombinedChart data={data} />
      </div>
    </div>
  );
};

export default AdminDashboard;
