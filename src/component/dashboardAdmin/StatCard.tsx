import React from "react";
import { IconType } from "react-icons";

interface StatCardProps {
  title: string;
  value: number;
  icon: IconType;
  unit: string;
  // Prop 'color' đã được thêm vào interface
  color: string; // Tailwind class string, e.g., "text-green-400"
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  unit,
  color,
}) => {
  const formattedValue = value.toLocaleString("vi-VN");

  return (
    // 1. Giảm padding p-6 -> p-4
    <div className="bg-purple-900/40 backdrop-blur-sm p-4 rounded-lg border border-purple-600/50 shadow-xl shadow-purple-900/60 transition-transform duration-300 hover:scale-[1.03] hover:border-cyan-400/50">
      {/* 2. Giảm space-x-5 -> space-x-4 */}
      <div className="flex items-center space-x-4">
        {/* 3. Giảm kích thước icon text-5xl -> text-4xl */}
        <Icon className={`text-4xl ${color} drop-shadow-lg`} />

        <div>
          {/* 4. Giảm text-sm -> text-xs và margin mb-1 -> mb-0 */}
          <p className="text-xs font-medium text-purple-300 uppercase tracking-widest mb-0">
            {title}
          </p>

          <p
            // 5. Giảm kích thước giá trị text-4xl -> text-3xl và margin mt-1 -> mt-0.5
            className={`text-3xl font-extrabold font-['Orbitron'] ${color} mt-0.5`}
          >
            {formattedValue}

            {/* 6. Giảm kích thước đơn vị text-xl -> text-base */}
            <span className={`text-base font-normal ml-2 ${color}`}>{unit}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;