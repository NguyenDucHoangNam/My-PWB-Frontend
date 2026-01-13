import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Users,
  ShoppingCart,
  Wallet,
  FileText,
  ArrowLeft,
  Loader2,
  AlertCircle,
  PieChart,
  X,
  User,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import projectService, {
  ProjectExpenseChartResponse,
  ProjectExpenseDetailResponse,
  ProjectMoneySplitDetailResponse,
} from "../../services/projectService";
import { ProjectPermissionResponse } from "../../types/permission";
import AnimatedBackground from "../../component/background/AnimatedBackground";
import NoContractNotification from "../../component/project/NoContractNotification";
import { ROUTER } from "../../routes/router";

const ProjectExpenseStatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id") || searchParams.get("projectId");

  const [chartData, setChartData] =
    useState<ProjectExpenseChartResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCustomer, setIsCustomer] = useState<boolean>(false);
  const [hasNoContract, setHasNoContract] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<ProjectPermissionResponse | null>(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState<boolean>(true);

  // Modal states
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [showMoneySplitModal, setShowMoneySplitModal] =
    useState<boolean>(false);
  const [expenseDetails, setExpenseDetails] = useState<
    ProjectExpenseDetailResponse[]
  >([]);
  const [moneySplitDetails, setMoneySplitDetails] = useState<
    ProjectMoneySplitDetailResponse[]
  >([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Load permissions để kiểm tra quyền truy cập
  useEffect(() => {
    const loadPermissions = async () => {
      if (!projectId) {
        setPermissions(null);
        setIsLoadingPermissions(false);
        return;
      }

      try {
        setIsLoadingPermissions(true);
        const perms = await projectService.getProjectPermissionByProjectId(projectId);
        setPermissions(perms);
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Không thể tải thông tin truy cập.";
        console.error("Error loading permissions:", errorMsg);
        setPermissions(null);
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    loadPermissions();
  }, [projectId]);

  useEffect(() => {
    const fetchExpenseChart = async () => {
      if (!projectId) {
        setError("Project ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await projectService.getProjectExpenseChart(
          parseInt(projectId)
        );
        setChartData(data);

        // Kiểm tra xem có phải customer không (chỉ có contractTotalAmount)
        const parseNum = (val: number | string | undefined | null): number => {
          if (val === null || val === undefined) return 0;
          const num = typeof val === "string" ? parseFloat(val) : val;
          return isNaN(num) ? 0 : num;
        };

        const contractTotal = parseNum(data.contractTotalAmount);

        // Kiểm tra nếu không có hợp đồng (contractTotalAmount = 0, null, hoặc undefined)
        if (contractTotal === 0 || !data.contractTotalAmount) {
          setHasNoContract(true);
          setIsCustomer(false);
        } else {
          setHasNoContract(false);
          const isCustomerUser =
            parseNum(data.totalExpenseAmount) === 0 &&
            parseNum(data.totalMoneySplitAmount) === 0 &&
            parseNum(data.remainingAmount) === 0 &&
            parseNum(data.remainingAfterTax) === 0 &&
            parseNum(data.totalTax) === 0 &&
            contractTotal > 0;
          setIsCustomer(isCustomerUser);
        }
      } catch (err: any) {
        console.error("Error fetching expense chart:", err);
        const errorMessage = err.message || err.toString() || "";
        const lowerMessage = errorMessage.toLowerCase();

        // Kiểm tra nếu là lỗi 404 (không tìm thấy hợp đồng)
        // Kiểm tra cả status code (đã được preserve từ projectService) và error message
        const is404Error =
          err.status === 404 ||
          err.response?.status === 404 ||
          err.originalError?.response?.status === 404 ||
          err.originalError?.status === 404 ||
          lowerMessage.includes("404") ||
          lowerMessage.includes("not found") ||
          lowerMessage.includes("không tìm thấy") ||
          lowerMessage.includes("không tìm thấy hợp đồng");

        if (is404Error) {
          setHasNoContract(true);
          setError(null);
        } else {
          setError(errorMessage || "Không thể tải thống kê chi phí dự án.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseChart();
  }, [projectId]);

  // Format tiền VNĐ
  const formatCurrency = (
    amount: number | string | undefined | null
  ): string => {
    if (amount === null || amount === undefined) return "0 ₫";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numAmount);
  };

  // Format phần trăm
  const formatPercent = (value: number | string | undefined | null): string => {
    if (value === null || value === undefined) return "0.00";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "0.00";
    return numValue.toFixed(2);
  };

  // Chuẩn bị dữ liệu cho biểu đồ tròn
  const getPieChartData = () => {
    if (!chartData || isCustomer) return [];

    const { percentages } = chartData;
    const parseValue = (val: number | string | undefined): number => {
      if (val === undefined || val === null) return 0;
      const num = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(num) ? 0 : num;
    };

    const expensePercent = parseValue(percentages?.expense);
    const moneySplitPercent = parseValue(percentages?.moneySplit);
    const taxPercent = parseValue(percentages?.tax);
    const remainingPercent = parseValue(percentages?.remaining);

    const parseAmount = (val: number | string | undefined | null): number => {
      if (val === null || val === undefined) return 0;
      const num = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(num) ? 0 : num;
    };

    const data = [
      {
        name: "Chi phí dịch vụ",
        value: expensePercent,
        amount: parseAmount(chartData.totalExpenseAmount),
        color: "#f472b6", // Pink
      },
      {
        name: "Chia cho thành viên",
        value: moneySplitPercent,
        amount: parseAmount(chartData.totalMoneySplitAmount),
        color: "#60a5fa", // Blue
      },
      {
        name: "Tổng thuế",
        value: taxPercent,
        amount: parseAmount(chartData.totalTax),
        color: "#fb923c", // Orange
      },
      {
        name: "Tiền còn lại (sau thuế)",
        value: remainingPercent,
        amount: parseAmount(chartData.remainingAfterTax),
        color: "#4ade80", // Green
      },
    ];

    return data.filter((item) => item.value > 0);
  };

  const pieData = getPieChartData();

  // Custom tooltip cho biểu đồ
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-black/90 backdrop-blur-lg border border-purple-500/50 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{data.name}</p>
          <p className="text-purple-300 text-sm">
            Phần trăm:{" "}
            <span className="font-bold">{formatPercent(data.value)}%</span>
          </p>
          <p className="text-purple-300 text-sm">
            Số tiền:{" "}
            <span className="font-bold">
              {formatCurrency(data.payload.amount)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label cho biểu đồ - sử dụng giá trị từ backend
  const renderCustomLabel = (entry: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value } = entry;

    if (!value || value <= 0) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-sm font-semibold"
        style={{ textShadow: "0 0 8px rgba(0,0,0,0.8)" }}
      >
        {`${formatPercent(value)}%`}
      </text>
    );
  };

  // Handle click on expense breakdown
  const handleExpenseClick = async () => {
    if (!projectId) return;

    try {
      setLoadingDetails(true);
      const details = await projectService.getProjectExpenseDetails(
        parseInt(projectId)
      );
      setExpenseDetails(details);
      setShowExpenseModal(true);
    } catch (err: any) {
      console.error("Error fetching expense details:", err);
      // You can add toast notification here
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle click on money split breakdown
  const handleMoneySplitClick = async () => {
    if (!projectId) return;

    try {
      setLoadingDetails(true);
      const details = await projectService.getProjectMoneySplitDetails(
        parseInt(projectId)
      );
      setMoneySplitDetails(details);
      setShowMoneySplitModal(true);
    } catch (err: any) {
      console.error("Error fetching money split details:", err);
      // You can add toast notification here
    } finally {
      setLoadingDetails(false);
    }
  };

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "-";
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle2 className="w-3 h-3 inline mr-1" />
            Đã duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3 inline mr-1" />
            Đã từ chối
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock className="w-3 h-3 inline mr-1" />
            Chờ duyệt
          </span>
        );
    }
  };

  // Kiểm tra nếu là collaborator thì chặn không cho xem
  const isCollaborator = permissions?.role.projectRole === "COLLABORATOR";

  if (isLoadingPermissions || loading) {
    return (
      <div className="min-h-screen bg-aurora flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center">
          <Loader2 className="w-16 h-16 animate-spin text-teal-400 mx-auto mb-4" />
          <p className="text-xl text-teal-300 font-semibold">
            Đang tải dữ liệu thống kê...
          </p>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo không có quyền nếu là collaborator
  if (isCollaborator) {
    return (
      <div className="min-h-screen bg-aurora flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center max-w-md mx-auto px-4">
          <div className="bg-gradient-to-br from-red-900/60 to-red-800/60 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 shadow-2xl">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-300 mb-4">
              Không có quyền truy cập
            </h2>
            <p className="text-lg text-red-200/90 mb-6">
              Collaborator không được phép xem trang thống kê chi phí dự án này.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-aurora flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-xl text-red-300 font-semibold mb-2">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (hasNoContract) {
    return (
      <div className="min-h-screen bg-aurora relative overflow-hidden">
        <AnimatedBackground />
        <NoContractNotification
          onNavigateToContract={() => {
            if (projectId) {
              navigate(`${ROUTER.USER.CONTRACTSPACE}?id=${projectId}`);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aurora relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-8 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {/* Title Section */}
          <header className="mb-8 animate-fade-in relative">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute top-0 left-1/4 w-1 h-1 bg-teal-400 rounded-full animate-pulse opacity-60"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="absolute top-0 right-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse opacity-70"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute bottom-0 left-1/3 w-1 h-1 bg-teal-300 rounded-full animate-pulse opacity-50"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute bottom-0 right-1/4 w-1 h-1 bg-cyan-300 rounded-full animate-pulse opacity-65"
                style={{ animationDelay: "1.5s" }}
              ></div>
            </div>

            {/* Header Row: Back Button + Title */}
            <div className="relative flex items-center justify-between mb-4">
              {/* Back Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-teal-400/30 hover:border-teal-300/50 transition-all duration-300 backdrop-blur-sm hover:shadow-xl hover:shadow-teal-500/20 flex items-center gap-2.5 flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-teal-300 group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold text-teal-200">Quay lại</span>
              </motion.button>

              {/* Main Title - Centered */}
              <div className="flex items-center justify-center gap-4 flex-1">
                <div className="p-3 bg-teal-500/20 rounded-2xl border border-teal-500/30 shadow-lg shadow-teal-500/20">
                  <DollarSign className="w-10 h-10 text-teal-300" />
                </div>
                <h1
                  className="text-4xl pt-5 font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight drop-shadow-lg"
                  style={{ textShadow: "0 0 30px rgba(45, 212, 191, 0.5)" }}
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400">
                    Kho Bạc Ngân Hà
                  </span>
                </h1>
              </div>

              {/* Spacer to balance layout */}
              <div className="w-24 flex-shrink-0"></div>
            </div>

            {/* Subtitle */}
            <p className="text-center text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Thống kê chi phí và phân phối ngân sách dự án
            </p>
          </header>
        </motion.div>

        {isCustomer ? (
          // View cho Customer (chỉ hiển thị số tiền hợp đồng)
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="dashboard-card teal-glow"
          >
            <div className="card-header mb-6">
              <FileText className="icon text-teal-300" />
              <h2 className="card-title">Thông tin Hợp đồng</h2>
            </div>

            <div className="bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-teal-500/20 rounded-2xl p-8 border border-teal-400/30">
              <div className="text-center">
                <p className="text-gray-400 text-lg mb-2">
                  Tổng giá trị hợp đồng
                </p>
                <p className="text-5xl font-bold text-teal-300">
                  {chartData
                    ? formatCurrency(chartData.contractTotalAmount)
                    : "0 ₫"}
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                💡 Bạn đang xem ở chế độ Customer. Thông tin chi tiết về chi phí
                và phân phối sẽ được bổ sung trong tương lai.
              </p>
            </div>
          </motion.div>
        ) : (
          // View cho Producer (đầy đủ thông tin)
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Biểu đồ tròn */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="dashboard-card teal-glow h-full">
                <div className="card-header mb-6">
                  <PieChart className="icon text-teal-300" />
                  <h2 className="card-title">Phân bổ Ngân sách</h2>
                </div>

                {pieData.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="w-full h-96 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry: any) => renderCustomLabel(entry)}
                            outerRadius={140}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={800}
                          >
                            {pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="#1e1b4b"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value, entry: any) => (
                              <span className="text-white text-sm">
                                {value} ({formatPercent(entry.payload.value)}%)
                              </span>
                            )}
                            wrapperStyle={{
                              paddingTop: "20px",
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend với số tiền cụ thể */}
                    <div className="w-full space-y-3">
                      {pieData.map((item, index) => {
                        const isExpense = item.name === "Chi phí dịch vụ";
                        const isMoneySplit =
                          item.name === "Chia cho thành viên";
                        const isClickable = isExpense || isMoneySplit;

                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            onClick={() => {
                              if (isExpense) handleExpenseClick();
                              if (isMoneySplit) handleMoneySplitClick();
                            }}
                            className={`flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 transition-all ${
                              isClickable
                                ? "hover:border-white/30 cursor-pointer hover:bg-white/10"
                                : "hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-white font-semibold">
                                {item.name}
                              </span>
                              {isClickable && (
                                <ArrowLeft className="w-3 h-3 text-gray-400 rotate-180" />
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-gray-300 text-sm">
                                {formatCurrency(item.amount)}
                              </p>
                              <p className="text-teal-400 text-xs font-semibold">
                                {formatPercent(item.value)}%
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PieChart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">
                      Chưa có dữ liệu để hiển thị biểu đồ
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Column: 2 ô lớn chứa thông tin */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Ô lớn 1: Tổng tiền hợp đồng + Chi phí bên trong */}
              <div className="dashboard-card teal-glow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-teal-500/20 rounded-xl">
                    <FileText className="w-6 h-6 text-teal-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Tổng tiền hợp đồng
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Tổng giá trị hợp đồng dự án
                    </p>
                  </div>
                </div>

                <div className="mb-6 pb-6 border-b border-white/10">
                  <p className="text-4xl font-bold text-teal-300 mb-1">
                    {chartData
                      ? formatCurrency(chartData.contractTotalAmount)
                      : "0 ₫"}
                  </p>
                </div>

                {/* Chi phí dịch vụ - Clickable */}
                <div className="mb-4">
                  <button
                    onClick={handleExpenseClick}
                    disabled={loadingDetails}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-white/10 hover:border-pink-400/50 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-pink-400 group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                        Chi phí dịch vụ
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="text-lg font-bold text-pink-300">
                          {chartData
                            ? formatCurrency(chartData.totalExpenseAmount)
                            : "0 ₫"}
                        </p>
                        {chartData &&
                          chartData.percentages?.expense !== undefined && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatPercent(chartData.percentages.expense)}%
                            </p>
                          )}
                      </div>
                      <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180 group-hover:text-pink-400 transition-colors" />
                    </div>
                  </button>
                </div>

                {/* Chia cho thành viên - Clickable */}
                <div>
                  <button
                    onClick={handleMoneySplitClick}
                    disabled={loadingDetails}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-white/10 hover:border-blue-400/50 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-400 group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                        Chia cho thành viên
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="text-lg font-bold text-blue-300">
                          {chartData
                            ? formatCurrency(chartData.totalMoneySplitAmount)
                            : "0 ₫"}
                        </p>
                        {chartData &&
                          chartData.percentages?.moneySplit !== undefined && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatPercent(chartData.percentages.moneySplit)}%
                            </p>
                          )}
                      </div>
                      <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Ô lớn 2: Tiền còn lại (trước thuế) + Thuế và Còn lại sau thuế bên trong */}
              <div className="dashboard-card yellow-glow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-yellow-500/20 rounded-xl">
                    <Wallet className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Tiền còn lại (trước thuế)
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Số tiền còn lại sau khi trừ chi phí
                    </p>
                  </div>
                </div>

                <div className="mb-6 pb-6 border-b border-white/10">
                  <p className="text-4xl font-bold text-yellow-300 mb-1">
                    {chartData
                      ? formatCurrency(chartData.remainingAmount)
                      : "0 ₫"}
                  </p>
                </div>

                {/* Tổng thuế */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                      <span className="text-sm font-medium text-gray-300">
                        Tổng thuế
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-300">
                        {chartData ? formatCurrency(chartData.totalTax) : "0 ₫"}
                      </p>
                      {chartData &&
                        chartData.percentages?.tax !== undefined && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatPercent(chartData.percentages.tax)}%
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                {/* Tiền còn lại sau thuế */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-sm font-medium text-gray-300">
                        Tiền còn lại (sau thuế)
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-300">
                        {chartData
                          ? formatCurrency(chartData.remainingAfterTax)
                          : "0 ₫"}
                      </p>
                      {chartData &&
                        chartData.percentages?.remaining !== undefined && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatPercent(chartData.percentages.remaining)}%
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* CSS Styles */}
      <style>{`
        :root { 
          --noise-bg-pattern: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgNTAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbnoaXNlKSIvPjwvc3ZnPg==); 
        }
        .bg-aurora { background-color: #0d0c1d; }

        .dashboard-card {
          @apply bg-black/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/20 transition-all duration-300 relative overflow-hidden;
        }
        .dashboard-card:hover {
          transform: translateY(-4px);
          border-color: var(--glow-color);
          box-shadow: 0 0 40px 0 rgba(var(--glow-rgb), 0.3);
        }

        .dashboard-card.teal-glow { --glow-color: #2dd4bf; --glow-rgb: 45, 212, 191; }
        .dashboard-card.pink-glow { --glow-color: #f472b6; --glow-rgb: 244, 114, 182; }
        .dashboard-card.blue-glow { --glow-color: #60a5fa; --glow-rgb: 96, 165, 250; }
        .dashboard-card.yellow-glow { --glow-color: #facc15; --glow-rgb: 250, 204, 21; }
        .dashboard-card.orange-glow { --glow-color: #fb923c; --glow-rgb: 251, 146, 60; }
        .dashboard-card.green-glow { --glow-color: #4ade80; --glow-rgb: 74, 222, 128; }
        
        .card-header { @apply flex items-center gap-4; }
        .card-title { @apply text-2xl font-bold text-white; }
        .icon { @apply transition-transform duration-300; }
      `}</style>

      {/* Expense Details Modal */}
      <AnimatePresence>
        {showExpenseModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExpenseModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full border border-purple-500/30 overflow-hidden max-h-[90vh] flex flex-col"
              >
                {/* Header */}
                <div className="p-6 border-b border-purple-500/20 bg-gradient-to-r from-pink-900/50 to-purple-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-600/30 rounded-lg">
                        <ShoppingCart className="w-5 h-5 text-pink-300" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        Chi tiết Chi phí Dịch vụ
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowExpenseModal(false)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {loadingDetails ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
                    </div>
                  ) : expenseDetails.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">
                        Chưa có chi phí dịch vụ nào
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {expenseDetails.map((milestone) => (
                        <div
                          key={milestone.milestoneId}
                          className="bg-white/5 rounded-xl border border-white/10 p-5"
                        >
                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-purple-400 bg-purple-500/20 px-2 py-1 rounded">
                                  Milestone {milestone.milestoneSequence}
                                </span>
                                <h3 className="text-lg font-bold text-white">
                                  {milestone.milestoneTitle}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-400">
                                Tổng chi phí:{" "}
                                <span className="font-semibold text-pink-300">
                                  {formatCurrency(milestone.totalExpenseAmount)}
                                </span>
                              </p>
                            </div>
                          </div>

                          {milestone.expenses.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                                      Tên chi phí
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                                      Mô tả
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
                                      Số tiền
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                                      Ngày tạo
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {milestone.expenses.map((expense) => (
                                    <tr
                                      key={expense.id}
                                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                      <td className="py-3 px-4 text-white font-medium">
                                        {expense.name}
                                      </td>
                                      <td className="py-3 px-4 text-gray-400 text-sm">
                                        {expense.description || "-"}
                                      </td>
                                      <td className="py-3 px-4 text-right text-pink-300 font-semibold">
                                        {formatCurrency(expense.amount)}
                                      </td>
                                      <td className="py-3 px-4 text-gray-400 text-sm">
                                        {formatDate(expense.createdAt)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm text-center py-4">
                              Không có chi phí nào trong milestone này
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Money Split Details Modal */}
      <AnimatePresence>
        {showMoneySplitModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoneySplitModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full border border-blue-500/30 overflow-hidden max-h-[90vh] flex flex-col"
              >
                {/* Header */}
                <div className="p-6 border-b border-blue-500/20 bg-gradient-to-r from-blue-900/50 to-cyan-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600/30 rounded-lg">
                        <Users className="w-5 h-5 text-blue-300" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        Chi tiết Chia tiền cho Thành viên
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowMoneySplitModal(false)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {loadingDetails ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    </div>
                  ) : moneySplitDetails.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">
                        Chưa có chia tiền cho thành viên nào
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {moneySplitDetails.map((milestone) => (
                        <div
                          key={milestone.milestoneId}
                          className="bg-white/5 rounded-xl border border-white/10 p-5"
                        >
                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/20 px-2 py-1 rounded">
                                  Milestone {milestone.milestoneSequence}
                                </span>
                                <h3 className="text-lg font-bold text-white">
                                  {milestone.milestoneTitle}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-400">
                                Tổng chia tiền:{" "}
                                <span className="font-semibold text-blue-300">
                                  {formatCurrency(
                                    milestone.totalMoneySplitAmount
                                  )}
                                </span>
                              </p>
                            </div>
                          </div>

                          {milestone.moneySplits.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                                      Thành viên
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
                                      Số tiền
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">
                                      Trạng thái
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                                      Ghi chú
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                                      Ngày tạo
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {milestone.moneySplits.map((split) => (
                                    <tr
                                      key={split.id}
                                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <User className="w-4 h-4 text-blue-300" />
                                          </div>
                                          <div>
                                            <p className="text-white font-medium">
                                              {split.userName || "N/A"}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                              {split.userEmail || ""}
                                            </p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-right text-blue-300 font-semibold">
                                        {formatCurrency(split.amount)}
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        {getStatusBadge(split.status)}
                                      </td>
                                      <td className="py-3 px-4 text-gray-400 text-sm">
                                        {split.note ||
                                          split.rejectionReason ||
                                          "-"}
                                      </td>
                                      <td className="py-3 px-4 text-gray-400 text-sm">
                                        {formatDate(split.createdAt)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm text-center py-4">
                              Không có chia tiền nào trong milestone này
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectExpenseStatisticsPage;
