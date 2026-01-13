import React from "react";
import {
  LineChart,
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

interface ProPackageChartProps {
  data: ProPackageTimeSeriesResponse | null;
}

const ProPackageChart: React.FC<ProPackageChartProps> = ({ data }) => {
  if (!data || !data.timeLabels || data.timeLabels.length === 0) {
    return (
      <div className="w-full h-60 flex items-center justify-center text-gray-400">
        <p>Không có dữ liệu để hiển thị</p>
      </div>
    );
  }

  // Chuyển đổi dữ liệu từ API thành format phù hợp với Recharts
  const chartData = data.timeLabels.map((label, index) => {
    const item: any = {
      timeLabel: label,
      totalSold: data.totalSold[index],
    };
    
    // Thêm dữ liệu từng gói
    data.packageData.forEach((pkg) => {
      item[pkg.packageName] = pkg.soldCounts[index];
    });
    
    return item;
  });

  // Màu sắc cho từng gói
  const colors = [
    "#38bdf8", // cyan
    "#f472b6", // pink
    "#a78bfa", // purple
    "#fbbf24", // yellow
    "#34d399", // green
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="bg-purple-900/40 border border-purple-700/40 backdrop-blur-lg rounded-xl p-4 shadow-lg"
    >
      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis
              dataKey="timeLabel"
              stroke="#c084fc"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="#c084fc"
              tick={{ fontSize: 10 }}
              tickFormatter={(v: number) => v.toLocaleString("vi-VN")}
            />
            <Tooltip
              contentStyle={{
                background: "#1e1b4b",
                border: "1px solid #6d28d9",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number, name: string) => [
                `${value.toLocaleString("vi-VN")} gói`,
                name === "totalSold" ? "Tổng" : name,
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px" }}
              iconType="line"
            />
            
            {/* Đường tổng */}
            <Line
              type="monotone"
              dataKey="totalSold"
              name="Tổng"
              stroke="#fbbf24"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#fbbf24" }}
              activeDot={{ r: 6 }}
            />
            
            {/* Đường từng gói */}
            {data.packageData.map((pkg, index) => (
              <Line
                key={pkg.packageName}
                type="monotone"
                dataKey={pkg.packageName}
                name={pkg.packageName}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1, fill: colors[index % colors.length] }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ProPackageChart;


