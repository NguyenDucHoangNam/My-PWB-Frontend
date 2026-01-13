import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Calendar,
  Download,
  FileText,
  Loader2,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import taxService, {
  TaxGroupBy,
  TaxOverviewResponse,
  TaxTransaction,
} from "../../services/taxService";
import { PageResponse } from "../../types/session";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const numberFormatter = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 0;
  }
  return Number(value);
};

const formatCurrency = (value: number | null | undefined) =>
  currencyFormatter.format(numberFormatter(value));

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

const getDefaultRange = () => {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth() - 12, 1);
  return {
    from: formatDateInput(from),
    to: formatDateInput(today),
  };
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

const sourceLabelMap: Record<string, string> = {
  TERMINATION_TEAM_COMPENSATION: "Đền bù chấm dứt cho thành viên",
  TERMINATION_OWNER_COMPENSATION: "Đền bù chấm dứt cho Owner",
  TERMINATION_CLIENT_REFUND: "Hoàn tiền cho Client khi chấm dứt",
  OWNER_COMPENSATE_TEAM: "Owner đền bù cho Team",
  TERMINATION_COMPENSATION: "Đền bù chấm dứt",
  TAX_REFUND: "Hoàn thuế",
  WITHDRAWAL: "Rút tiền",
  PAYMENT: "Thanh toán hợp đồng",
  MILESTONE_PAYMENT: "Thanh toán mốc",
  REFUND: "Hoàn tiền",
  DEPOSIT: "Nạp tiền",
  ADJUSTMENT: "Điều chỉnh",
  SUBSCRIPTION: "Thanh toán gói",
};

const statusLabelMap: Record<string, string> = {
  COMPLETED: "Hoàn tất",
  PENDING: "Đang xử lý",
  REJECTED: "Từ chối",
};

const formatSourceLabel = (source?: string) =>
  source ? sourceLabelMap[source] || source : "-";

const formatStatusLabel = (status?: string) =>
  status ? statusLabelMap[status] || status : "-";

const TaxPage: React.FC = () => {
  const defaultRange = useMemo(() => getDefaultRange(), []);

  const [filters, setFilters] = useState<{
    from?: string;
    to?: string;
    groupBy: TaxGroupBy;
    source?: string;
  }>({
    from: defaultRange.from,
    to: defaultRange.to,
    groupBy: "MONTH",
    source: undefined,
  });

  const [overview, setOverview] = useState<TaxOverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [transactions, setTransactions] =
    useState<PageResponse<TaxTransaction> | null>(null);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null
  );
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"CSV" | "XLSX" | "PDF">(
    "CSV"
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [draftFrom, setDraftFrom] = useState(defaultRange.from);
  const [draftTo, setDraftTo] = useState(defaultRange.to);

  const availableSources = useMemo(() => {
    const sources =
      overview?.sourceBreakdown?.map((item) => item.source).filter(Boolean) ||
      [];
    return Array.from(new Set(sources));
  }, [overview]);

  const handleFilterChange = (
    key: "from" | "to" | "groupBy" | "source",
    value?: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setPage(0);
  };

  useEffect(() => {
    const fetchOverview = async () => {
      setOverviewLoading(true);
      setOverviewError(null);
      try {
        const data = await taxService.getOverview({
          from: filters.from,
          to: filters.to,
          groupBy: filters.groupBy,
        });
        setOverview(data);
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Không thể tải tổng quan thuế/thu nhập.";
        setOverviewError(message);
      } finally {
        setOverviewLoading(false);
      }
    };

    fetchOverview();
  }, [filters.from, filters.to, filters.groupBy]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setTransactionsLoading(true);
      setTransactionsError(null);
      try {
        const data = await taxService.getTransactions({
          from: filters.from,
          to: filters.to,
          source: filters.source || undefined,
          page,
          size,
        });
        setTransactions(data);
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách giao dịch.";
        setTransactionsError(message);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [filters.from, filters.to, filters.source, page, size]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { blob, filename } = await taxService.exportTransactions({
        from: filters.from,
        to: filters.to,
        source: filters.source || undefined,
        format: exportFormat,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể xuất giao dịch.";
      setTransactionsError(message);
    } finally {
      setExporting(false);
    }
  };

  const applyDateRange = () => {
    setFilters((prev) => ({
      ...prev,
      from: draftFrom || undefined,
      to: draftTo || undefined,
    }));
    setPage(0);
    setShowDatePicker(false);
  };

  const resetDateRange = () => {
    const { from, to } = getDefaultRange();
    setDraftFrom(from);
    setDraftTo(to);
    setFilters((prev) => ({
      ...prev,
      from,
      to,
    }));
    setPage(0);
    setShowDatePicker(false);
  };

  const overviewCards = [
    {
      label: "Tổng thu nhập gộp",
      value: formatCurrency(overview?.totalGross),
      icon: <TrendingUp className="w-5 h-5 text-emerald-300" />,
      accent: "from-emerald-500/20 to-emerald-400/10",
    },
    {
      label: "Tổng thuế phải nộp",
      value: formatCurrency(overview?.totalTax),
      icon: <Receipt className="w-5 h-5 text-rose-300" />,
      accent: "from-rose-500/20 to-rose-400/10",
    },
    {
      label: "Thu nhập ròng",
      value: formatCurrency(overview?.totalNet),
      icon: <Wallet className="w-5 h-5 text-indigo-300" />,
      accent: "from-indigo-500/20 to-indigo-400/10",
    },
    {
      label: "Số giao dịch đã chi trả",
      value: overview?.totalPayoutCount ?? 0,
      icon: <FileText className="w-5 h-5 text-amber-300" />,
      accent: "from-amber-500/20 to-amber-400/10",
    },
  ];

  const secondaryCards = [
    {
      label: "Số hợp đồng",
      value: overview?.totalContractCount ?? 0,
    },
    {
      label: "Số dự án",
      value: overview?.totalProjectCount ?? 0,
    },
  ];

  const timeSeriesData = (overview?.timeSeries || []).map((item) => ({
    ...item,
    gross: numberFormatter(item.gross),
    net: numberFormatter(item.net),
    tax: numberFormatter(item.tax),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-24 md:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300/70">
              Thuế & Thu nhập
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              Tổng quan nghĩa vụ thuế
            </h1>
            <p className="text-slate-300/80 mt-2 max-w-2xl">
              Theo dõi giao dịch đã hoàn tất, thu nhập gộp, thuế phải nộp và
              xuất báo cáo.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <button
                onClick={() => setShowDatePicker((v) => !v)}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 hover:border-indigo-400/60 transition-colors"
              >
                <Calendar className="w-4 h-4 text-indigo-300" />
                <span className="text-sm text-slate-200/80">
                  {filters.from} → {filters.to}
                </span>
              </button>
              {showDatePicker && (
                <div className="absolute right-0 mt-2 w-[320px] p-4 rounded-xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur z-20 space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-300/80">Từ ngày</label>
                    <input
                      type="date"
                      value={draftFrom || ""}
                      onChange={(e) => setDraftFrom(e.target.value)}
                      className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-300/80">
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      value={draftTo || ""}
                      onChange={(e) => setDraftTo(e.target.value)}
                      className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={resetDateRange}
                      className="px-3 py-2 text-sm rounded-lg bg-slate-800 border border-white/10 hover:border-indigo-400/60"
                    >
                      Đặt lại 12 tháng
                    </button>
                    <button
                      onClick={applyDateRange}
                      className="px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold shadow-lg hover:shadow-indigo-500/30"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <label className="text-sm text-slate-200/80">Định dạng</label>
              <select
                value={exportFormat}
                onChange={(e) =>
                  setExportFormat(e.target.value as "CSV" | "XLSX" | "PDF")
                }
                className="bg-transparent border border-white/10 rounded-lg px-2 py-1 text-sm focus:border-indigo-400 focus:outline-none"
              >
                <option value="CSV">CSV</option>
                <option value="XLSX">XLSX</option>
                <option value="PDF">PDF</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Xuất
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {overviewCards.map((card) => (
            <div
              key={card.label}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur shadow-lg"
            >
              <div
                className={`flex items-center justify-between rounded-xl bg-gradient-to-r ${card.accent} px-4 py-3 mb-4`}
              >
                <span className="text-sm text-slate-200/80">{card.label}</span>
                {card.icon}
              </div>
              <p className="text-2xl font-semibold">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {secondaryCards.map((card) => (
            <div
              key={card.label}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur"
            >
              <p className="text-sm text-slate-300/80">{card.label}</p>
              <p className="text-xl font-semibold mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300/80">Từ ngày</label>
              <input
                type="date"
                value={filters.from || ""}
                onChange={(e) => handleFilterChange("from", e.target.value)}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300/80">Đến ngày</label>
              <input
                type="date"
                value={filters.to || ""}
                onChange={(e) => handleFilterChange("to", e.target.value)}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300/80">Nhóm theo</label>
              <select
                value={filters.groupBy}
                onChange={(e) =>
                  handleFilterChange("groupBy", e.target.value as TaxGroupBy)
                }
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 focus:border-indigo-400 focus:outline-none"
              >
                <option value="MONTH">Tháng</option>
                <option value="YEAR">Năm</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300/80">Nguồn thu</label>
              <select
                value={filters.source || ""}
                onChange={(e) => handleFilterChange("source", e.target.value)}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 focus:border-indigo-400 focus:outline-none"
              >
                <option value="">Tất cả</option>
                {availableSources.map((src) => (
                  <option key={src} value={src}>
                    {formatSourceLabel(src)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {overviewLoading ? (
            <div className="flex items-center gap-2 text-slate-200/80">
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tải tổng quan...
            </div>
          ) : overviewError ? (
            <div className="text-rose-300 bg-rose-500/10 border border-rose-400/20 rounded-xl p-4">
              {overviewError}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-80 bg-slate-900/40 border border-white/5 rounded-2xl p-4">
                  {timeSeriesData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-300/70">
                      Không có dữ liệu biểu đồ.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesData}>
                        <defs>
                          <linearGradient
                            id="gross"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#4f46e5"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="#4f46e5"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient id="net" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor="#22c55e"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="#22c55e"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient id="tax" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor="#f97316"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="#f97316"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="periodLabel" stroke="#cbd5f5" />
                        <YAxis
                          stroke="#cbd5f5"
                          tickFormatter={(value) =>
                            `${Math.round(Number(value) / 1_000_000)}tr`
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#0f172a",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "0.75rem",
                          }}
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="gross"
                          name="Thu nhập gộp"
                          stroke="#4f46e5"
                          fill="url(#gross)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="tax"
                          name="Thuế"
                          stroke="#f97316"
                          fill="url(#tax)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="net"
                          name="Thu nhập ròng"
                          stroke="#22c55e"
                          fill="url(#net)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-amber-300" />
                    Phân bổ theo nguồn
                  </h3>
                  <div className="space-y-3">
                    {(overview?.sourceBreakdown || []).map((item) => (
                      <div
                        key={item.source}
                        className="p-4 rounded-xl bg-slate-900/50 border border-white/5"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-slate-300/80">
                              {formatSourceLabel(item.source)}
                            </p>
                            <p className="text-lg font-semibold">
                              {formatCurrency(item.net)}
                            </p>
                          </div>
                          <div className="text-right text-sm text-slate-300/70">
                            <p>Gộp: {formatCurrency(item.gross)}</p>
                            <p>Thuế: {formatCurrency(item.tax)}</p>
                            <p>Giao dịch: {item.payoutCount}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(overview?.sourceBreakdown?.length || 0) === 0 && (
                      <div className="text-slate-300/70">
                        Chưa có dữ liệu phân bổ theo nguồn.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm text-slate-300/80">
                Giao dịch chịu thuế (đã chi trả hoàn tất)
              </p>
              <h3 className="text-xl font-semibold">Chi tiết giao dịch</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300/80">
              <TrendingUp className="w-4 h-4 text-indigo-300" />
              <span>Tổng số bản ghi: {transactions?.totalElements ?? 0}</span>
            </div>
          </div>

          {transactionsLoading ? (
            <div className="flex items-center gap-2 text-slate-200/80">
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tải danh sách giao dịch...
            </div>
          ) : transactionsError ? (
            <div className="text-rose-300 bg-rose-500/10 border border-rose-400/20 rounded-xl p-4">
              {transactionsError}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="text-slate-300 border-b border-white/10">
                      <th className="px-3 py-2 whitespace-nowrap">
                        Ngày chi trả
                      </th>
                      <th className="px-3 py-2 whitespace-nowrap">Nguồn</th>
                      <th className="px-3 py-2 whitespace-nowrap">Dự án</th>
                      <th className="px-3 py-2 whitespace-nowrap">
                        Mã hợp đồng
                      </th>
                      <th className="px-3 py-2 whitespace-nowrap">
                        Mốc thanh toán
                      </th>
                      <th className="px-3 py-2 whitespace-nowrap">
                        Mã tham chiếu
                      </th>
                      <th className="px-3 py-2 whitespace-nowrap text-right">
                        Gộp
                      </th>
                      <th className="px-3 py-2 whitespace-nowrap text-right">
                        Thuế
                      </th>
                      <th className="px-3 py-2 whitespace-nowrap text-right">
                        Ròng
                      </th>
                      <th className="px-3 py-2 whitespace-nowrap">
                        Trạng thái
                      </th>
                      <th className="px-3 py-2 whitespace-nowrap">Năm thuế</th>
                      <th className="px-3 py-2 whitespace-nowrap">
                        Tháng thuế
                      </th>
                      <th className="px-3 py-2 whitespace-nowrap">Quý thuế</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(transactions?.content || []).map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-3 py-2 whitespace-nowrap">
                          {formatDate(item.payoutDate)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {formatSourceLabel(item.payoutSource)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {item.projectTitle || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {item.contractId ?? "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {item.milestoneTitle || item.milestoneId || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {item.referenceCode || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          {formatCurrency(item.grossAmount)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          {formatCurrency(item.taxAmount)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          {formatCurrency(item.netAmount)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {formatStatusLabel(item.status)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {item.taxPeriodYear ?? "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {item.taxPeriodMonth ?? "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {item.taxPeriodQuarter ?? "-"}
                        </td>
                      </tr>
                    ))}
                    {(transactions?.content?.length || 0) === 0 && (
                      <tr>
                        <td
                          className="px-3 py-4 text-center text-slate-300/70"
                          colSpan={13}
                        >
                          Chưa có giao dịch phù hợp bộ lọc.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-slate-300/80">
                  Trang {page + 1} / {transactions?.totalPages ?? 1}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-white/10 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) =>
                        p + 1 < (transactions?.totalPages || 1) ? p + 1 : p
                      )
                    }
                    disabled={
                      !transactions?.totalPages ||
                      page + 1 >= (transactions?.totalPages || 1)
                    }
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-white/10 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxPage;
