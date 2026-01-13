import React from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { ProPackageTimeSeriesResponse } from "@/services/proPackageStats";

interface ProPackageCombinedChartProps {
  data: ProPackageTimeSeriesResponse | null;
}

const ProPackageCombinedChart: React.FC<ProPackageCombinedChartProps> = ({ data }) => {
  if (!data || !data.timeLabels || data.timeLabels.length === 0) {
    return (
      <div className="w-full h-60 flex items-center justify-center text-gray-400">
        <p>Không có dữ liệu để hiển thị</p>
      </div>
    );
  }

  // Chuyển đổi dữ liệu từ API thành format phù hợp với Recharts
  const chartData = data.timeLabels.map((label, index) => ({
    timeLabel: label,
    totalSold: data.totalSold[index],
    totalRevenue: data.totalRevenue?.[index] ?? 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="bg-purple-900/40 border border-purple-700/40 backdrop-blur-lg rounded-xl p-4 shadow-lg"
    >
      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis
              dataKey="timeLabel"
              stroke="#c084fc"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            {/* Trục Y bên trái - Số gói */}
            <YAxis
              yAxisId="left"
              stroke="#fbbf24"
              tick={{ fontSize: 10 }}
              tickFormatter={(v: number) => v.toLocaleString("vi-VN")}
              label={{ value: "Số gói", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fill: "#fbbf24" } }}
            />
            {/* Trục Y bên phải - Doanh thu */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#34d399"
              tick={{ fontSize: 10 }}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              label={{ value: "Doanh thu (VNĐ)", angle: 90, position: "insideRight", style: { textAnchor: "middle", fill: "#34d399" } }}
            />
            <Tooltip
              contentStyle={{
                background: "#1e1b4b",
                border: "1px solid #6d28d9",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number, name: string) => {
                if (name === "totalSold") {
                  return [`${value.toLocaleString("vi-VN")} gói`, "Tổng Số Gói"];
                }
                if (name === "totalRevenue") {
                  return [`${value.toLocaleString("vi-VN")} VNĐ`, "Tổng Doanh Thu"];
                }
                return [value, name];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px" }}
              iconType="line"
            />
            
            {/* Đường tổng số gói */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="totalSold"
              name="Tổng Số Gói"
              stroke="#fbbf24"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#fbbf24" }}
              activeDot={{ r: 6 }}
            />
            
            {/* Đường tổng doanh thu */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalRevenue"
              name="Tổng Doanh Thu"
              stroke="#34d399"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#34d399" }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ProPackageCombinedChart;

