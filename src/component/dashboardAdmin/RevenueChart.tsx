import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface RevenueStat {
  date: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueStat[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      // 1. Giảm padding p-6 -> p-4 và giảm độ bóng/bo góc nhẹ
      className="bg-purple-900/40 border border-purple-700/40 backdrop-blur-lg rounded-xl p-4 shadow-lg"
    >
      {/* 2. Giảm kích thước tiêu đề text-xl -> text-lg và margin bottom mb-4 -> mb-3 */}
      <h2 className="text-lg font-semibold text-purple-200 mb-3">
        Biểu đồ Doanh Thu
      </h2>

      {/* 3. Giảm chiều cao w-full h-72 -> h-60 (hoặc h-56 tùy ý) */}
      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis
              dataKey="date"
              stroke="#c084fc"
              // 4. Giảm kích thước chữ tick
              tick={{ fontSize: 10 }}
            />
            <YAxis
              stroke="#c084fc"
              // 4. Giảm kích thước chữ tick
              tick={{ fontSize: 10 }}
              tickFormatter={(v: number) => v.toLocaleString("vi-VN")}
            />
            <Tooltip
              contentStyle={{
                background: "#1e1b4b",
                border: "1px solid #6d28d9",
                // Giữ nguyên style Tooltip để đảm bảo tính thẩm mỹ
                borderRadius: "8px", 
                color: "#fff",
              }}
              formatter={(value: number) =>
                `${value.toLocaleString("vi-VN")} đ`
              }
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#38bdf8"
              strokeWidth={2} // Giảm độ dày đường line
              dot={{ r: 3, strokeWidth: 1, fill: "#38bdf8" }} // Giảm kích thước dot
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default RevenueChart;