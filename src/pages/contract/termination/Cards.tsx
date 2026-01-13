import { LucideIcon, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../../../utils/contractTermination.helpers";

// FinancialSummaryCard
interface FinancialSummaryCardProps {
  icon: LucideIcon;
  title: string;
  amount: number;
  color: string;
  delay?: number;
  gradient?: boolean;
}

export const FinancialSummaryCard = ({
  icon: Icon,
  title,
  amount,
  color,
  delay: _delay = 0,
  gradient = false,
}: FinancialSummaryCardProps) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <p
        className={`text-2xl font-bold ${
          gradient
            ? "bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
            : color
        }`}
      >
        {formatCurrency(amount)}
      </p>
    </div>
  );
};

// StatusCard
interface StatusCardProps {
  status: "COMPLETED" | "PARTIAL_COMPLETED" | "PROCESSING" | "FAILED";
  delay?: number;
}

const statusConfig = {
  COMPLETED: {
    text: "Hoàn tất",
    color: "text-green-400",
  },
  PARTIAL_COMPLETED: {
    text: "Hoàn tất một phần",
    color: "text-yellow-400",
  },
  PROCESSING: {
    text: "Đang xử lý",
    color: "text-blue-400",
  },
  FAILED: {
    text: "Thất bại",
    color: "text-red-400",
  },
};

export const StatusCard = ({ status, delay: _delay = 0 }: StatusCardProps) => {
  const config = statusConfig[status];

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-5 h-5 text-cyan-400" />
        <h3 className="text-base font-semibold text-white">Trạng thái</h3>
      </div>
      <p className={`text-xl font-bold ${config.color}`}>{config.text}</p>
    </div>
  );
};
