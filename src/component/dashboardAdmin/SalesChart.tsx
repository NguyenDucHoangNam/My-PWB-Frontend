import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

interface PackageSalesStat {
  date: string;
  sold: number;
}

interface SalesChartProps {
  data: PackageSalesStat[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="bg-purple-900/40 border border-purple-700/40 backdrop-blur-lg rounded-xl p-4 shadow-lg"
    >
      <h2 className="text-lg font-semibold text-purple-200 mb-3">
        Biểu đồ Gói Đã Bán
      </h2>

      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />

            <XAxis
              dataKey="date"
              stroke="#c084fc"
              tick={{ fontSize: 10 }}
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
              formatter={(value: number) =>
                `${value.toLocaleString("vi-VN")} gói`
              }
            />

            <Bar
              dataKey="sold"
              fill="#f472b6"
              radius={[6, 6, 0, 0]}
              maxBarSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default SalesChart;
