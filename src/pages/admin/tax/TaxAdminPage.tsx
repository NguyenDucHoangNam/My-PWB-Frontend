import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Calendar,
  Download,
  Filter,
  Loader2,
  Receipt,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  SquareCheck,
  Table2,
} from "lucide-react";
import adminTaxService, {
  AdminTaxGroupBy,
  AdminTaxOverviewResponse,
  AdminTaxPayoutResponse,
} from "../../../services/adminTaxService";
import { PageResponse } from "../../../types/session";

type BooleanFilter = "all" | "true" | "false";

interface FiltersState {
  from?: string;
  to?: string;
  groupBy: AdminTaxGroupBy;
  month?: string;
  year?: string;
  quarter?: string;
  userId?: string;
  projectId?: string;
  contractId?: string;
  source?: string;
  declared: BooleanFilter;
  paid: BooleanFilter;
}

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

const TaxAdminPage: React.FC = () => {
  const defaultRange = useMemo(() => getDefaultRange(), []);

  const [filters, setFilters] = useState<FiltersState>({
    from: defaultRange.from,
    to: defaultRange.to,
    groupBy: "MONTH",
    month: "",
    year: "",
    quarter: "",
    userId: "",
    projectId: "",
    contractId: "",
    source: "",
    declared: "all",
    paid: "all",
  });

  const [overview, setOverview] = useState<AdminTaxOverviewResponse | null>(
    null
  );
  const [_overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [payouts, setPayouts] =
    useState<PageResponse<AdminTaxPayoutResponse> | null>(null);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutsError, setPayoutsError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"CSV" | "XLSX" | "PDF">(
    "CSV"
  );
  const [draftFrom, setDraftFrom] = useState(defaultRange.from);
  const [draftTo, setDraftTo] = useState(defaultRange.to);
  const [marking, setMarking] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toNumber = (value?: string) => {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const toBoolean = (value: BooleanFilter) => {
    if (value === "all") return undefined;
    return value === "true";
  };

  const handleFilterChange = (
    key: keyof FiltersState,
    value?: string | BooleanFilter
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value ?? "",
    }));
    setPage(0);
  };

  const fetchOverview = async () => {
    setOverviewLoading(true);
    setOverviewError(null);
    try {
      const data = await adminTaxService.getOverview({
        from: filters.from,
        to: filters.to,
        groupBy: filters.groupBy,
      });
      setOverview(data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải tổng quan thuế.";
      setOverviewError(message);
    } finally {
      setOverviewLoading(false);
    }
  };

  const fetchPayouts = async () => {
    setPayoutsLoading(true);
    setPayoutsError(null);
    try {
      const data = await adminTaxService.getPayouts({
        from: filters.from || undefined,
        to: filters.to || undefined,
        month: toNumber(filters.month),
        year: toNumber(filters.year),
        quarter: toNumber(filters.quarter),
        userId: toNumber(filters.userId),
        projectId: toNumber(filters.projectId),
        contractId: toNumber(filters.contractId),
        source: filters.source || undefined,
        declared: toBoolean(filters.declared),
        paid: toBoolean(filters.paid),
        page,
        size,
      });
      setPayouts(data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải danh sách payout.";
      setPayoutsError(message);
    } finally {
      setPayoutsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.from, filters.to, filters.groupBy]);

  useEffect(() => {
    fetchPayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.from,
    filters.to,
    filters.month,
    filters.year,
    filters.quarter,
    filters.source,
    filters.declared,
    filters.paid,
    filters.userId,
    filters.projectId,
    filters.contractId,
    page,
    size,
  ]);

  const applyDateRange = () => {
    setFilters((prev) => ({
      ...prev,
      from: draftFrom || undefined,
      to: draftTo || undefined,
    }));
    setPage(0);
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
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { blob, filename } = await adminTaxService.exportPayouts({
        from: filters.from || undefined,
        to: filters.to || undefined,
        month: toNumber(filters.month),
        year: toNumber(filters.year),
        quarter: toNumber(filters.quarter),
        userId: toNumber(filters.userId),
        projectId: toNumber(filters.projectId),
        contractId: toNumber(filters.contractId),
        source: filters.source || undefined,
        declared: toBoolean(filters.declared),
        paid: toBoolean(filters.paid),
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
        "Không thể xuất danh sách payout.";
      setPayoutsError(message);
    } finally {
      setExporting(false);
    }
  };

  const handleMark = async (payload: { declared?: boolean; paid?: boolean }) => {
    if (!selectedIds.length) return;
    setMarking(true);
    try {
      await adminTaxService.markPayouts({
        ...payload,
        ids: selectedIds,
      });
      await Promise.all([fetchPayouts(), fetchOverview()]);
      setSelectedIds([]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể cập nhật trạng thái kê khai/nộp thuế.";
      setPayoutsError(message);
    } finally {
      setMarking(false);
    }
  };

  const toggleSelect = (id: number, isCompleted: boolean) => {
    if (!isCompleted) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (!payouts?.content?.length) return;
    const selectable = payouts.content
      .filter((item) => item.status === "COMPLETED")
      .map((item) => item.id);
    const allSelected =
      selectable.length > 0 &&
      selectable.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : selectable);
  };

  const timeSeriesData = (overview?.timeSeries || []).map((item) => ({
    ...item,
    gross: numberFormatter(item.gross),
    taxWithheld: numberFormatter(item.taxWithheld),
    taxPaid: numberFormatter(item.taxPaid),
    taxDue: numberFormatter(item.taxDue),
  }));

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-300/70">
            Quản trị thuế
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            Thuế & kê khai payout
          </h1>
          <p className="text-slate-200/70 mt-2 max-w-2xl">
            Theo dõi nghĩa vụ thuế theo nguồn thu, xuất báo cáo và đánh dấu kê
            khai / đã nộp cho các giao dịch hoàn tất.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchOverview}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Xuất payout ({exportFormat})
          </button>
          <select
            value={exportFormat}
            onChange={(e) =>
              setExportFormat(e.target.value as "CSV" | "XLSX" | "PDF")
            }
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
          >
            <option value="CSV">CSV</option>
            <option value="XLSX">XLSX</option>
            <option value="PDF">PDF</option>
          </select>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-indigo-200 mb-3">
          <Filter className="w-4 h-4" />
          <span className="font-semibold">Bộ lọc</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-300/80">Từ ngày</label>
            <input
              type="date"
              value={draftFrom}
              onChange={(e) => setDraftFrom(e.target.value)}
              className="bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-300/80">Đến ngày</label>
            <input
              type="date"
              value={draftTo}
              onChange={(e) => setDraftTo(e.target.value)}
              className="bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-300/80">Nhóm theo</label>
            <select
              value={filters.groupBy}
              onChange={(e) =>
                handleFilterChange("groupBy", e.target.value as AdminTaxGroupBy)
              }
              className="bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-sm"
            >
              <option value="MONTH">Tháng</option>
              <option value="YEAR">Năm</option>
            </select>
          </div>
          {/* Các filter kỳ tháng / quý / năm tạm ẩn khỏi giao diện */}
          <div className="flex flex-col gap-1">
            <span className="text-sm text-transparent select-none">.</span>
            <button
              onClick={applyDateRange}
              className="w-full inline-flex justify-center items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
            >
              <Calendar className="w-4 h-4" />
              Áp dụng khoảng thời gian
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-transparent select-none">.</span>
            <button
              onClick={resetDateRange}
              className="w-full inline-flex justify-center items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 transition"
            >
              Đặt lại 12 tháng
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng thu nhập gộp",
            value: formatCurrency(overview?.totalGross),
            accent: "from-emerald-500/20 to-emerald-400/10",
          },
          {
            label: "Thuế đã khấu trừ",
            value: formatCurrency(overview?.totalTaxWithheld),
            accent: "from-amber-500/20 to-amber-400/10",
          },
          {
            label: "Thuế đã nộp",
            value: formatCurrency(overview?.totalTaxPaid),
            accent: "from-indigo-500/20 to-indigo-400/10",
          },
          {
            label: "Thuế còn phải nộp",
            value: formatCurrency(overview?.totalTaxDue),
            accent: "from-rose-500/20 to-rose-400/10",
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`p-4 rounded-xl border border-white/10 bg-gradient-to-br ${card.accent}`}
          >
            <p className="text-sm text-slate-200/70">{card.label}</p>
            <p className="text-2xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-2 text-slate-200 mb-2">
            <Receipt className="w-4 h-4 text-amber-300" />
            <span className="font-semibold">Thống kê số lượng</span>
          </div>
          <div className="space-y-2 text-sm text-slate-200/80">
            <div className="flex justify-between">
              <span>Số payout hoàn tất</span>
              <span className="font-semibold">
                {overview?.totalPayoutCount ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Người dùng liên quan</span>
              <span className="font-semibold">
                {overview?.totalUserCount ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Dự án</span>
              <span className="font-semibold">
                {overview?.totalProjectCount ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-2 text-slate-200 mb-3">
            <Table2 className="w-4 h-4 text-indigo-300" />
            <span className="font-semibold">Nguồn thu</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-300/80">
                <tr>
                  <th className="py-2 pr-3">Nguồn</th>
                  <th className="py-2 pr-3">Gộp</th>
                  <th className="py-2 pr-3">Thuế</th>
                  <th className="py-2 pr-3">Ròng</th>
                  <th className="py-2 pr-3 text-right">Số payout</th>
                </tr>
              </thead>
              <tbody>
                {(overview?.sourceBreakdown || []).map((item) => (
                  <tr key={item.source} className="border-t border-white/5">
                    <td className="py-2 pr-3">
                      {sourceLabelMap[item.source] || item.source}
                    </td>
                    <td className="py-2 pr-3">{formatCurrency(item.gross)}</td>
                    <td className="py-2 pr-3">{formatCurrency(item.tax)}</td>
                    <td className="py-2 pr-3">{formatCurrency(item.net)}</td>
                    <td className="py-2 pr-3 text-right">{item.payoutCount}</td>
                  </tr>
                ))}
                {!overview?.sourceBreakdown?.length && (
                  <tr>
                    <td className="py-2 text-slate-300/60" colSpan={5}>
                      Chưa có dữ liệu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-200">
            <Calendar className="w-4 h-4 text-emerald-300" />
            <span className="font-semibold">Diễn tiến theo kỳ</span>
          </div>
          <p className="text-xs text-slate-300/70">
            {filters.groupBy === "MONTH"
              ? "Kỳ: yyyy-MM"
              : "Kỳ: yyyy"}
          </p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="periodLabel" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#e2e8f0",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area
                type="monotone"
                dataKey="gross"
                stroke="#22d3ee"
                fill="url(#colorGross)"
                name="Thu nhập gộp"
              />
              <Area
                type="monotone"
                dataKey="taxPaid"
                stroke="#a855f7"
                fill="url(#colorPaid)"
                name="Thuế đã nộp"
              />
              <Area
                type="monotone"
                dataKey="taxDue"
                stroke="#f97316"
                fill="url(#colorDue)"
                name="Thuế còn nợ"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-200">
            <Receipt className="w-4 h-4 text-amber-300" />
            <span className="font-semibold">Danh sách payout</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={!selectedIds.length || marking}
              onClick={() => handleMark({ declared: true })}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 transition"
            >
              {marking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              Đánh dấu đã kê khai
            </button>
            <button
              disabled={!selectedIds.length || marking}
              onClick={() => handleMark({ paid: true })}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition"
            >
              {marking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldOff className="w-4 h-4" />
              )}
              Đánh dấu đã nộp
            </button>
            <button
              disabled={!selectedIds.length || marking}
              onClick={() => handleMark({ declared: false, paid: false })}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-60 transition"
            >
              <SquareCheck className="w-4 h-4" />
              Bỏ đánh dấu
            </button>
          </div>
        </div>

        {payoutsError && (
          <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
            {payoutsError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-300/80">
              <tr>
                <th className="py-2 px-3">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={
                      !!payouts?.content?.length &&
                      payouts.content
                        .filter((item) => item.status === "COMPLETED")
                        .every((item) => selectedIds.includes(item.id))
                    }
                  />
                </th>
                <th className="py-2 px-3">Thông tin</th>
                <th className="py-2 px-3">Người dùng</th>
                <th className="py-2 px-3">Dự án/Hợp đồng</th>
                <th className="py-2 px-3 text-right">Thu nhập</th>
                <th className="py-2 px-3 text-right">Thuế</th>
                <th className="py-2 px-3 text-right">Ròng</th>
                <th className="py-2 px-3">Trạng thái thuế</th>
              </tr>
            </thead>
            <tbody>
              {payoutsLoading && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-300">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Đang tải...
                  </td>
                </tr>
              )}
              {!payoutsLoading &&
                (payouts?.content || []).map((item) => {
                  const isCompleted = item.status === "COMPLETED";
                  return (
                    <tr
                      key={item.id}
                      className="border-t border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="py-2 px-3">
                        <input
                          type="checkbox"
                          disabled={!isCompleted}
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id, isCompleted)}
                        />
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-100">
                          {sourceLabelMap[item.payoutSource] ||
                            item.payoutSource}
                        </div>
                        <div className="text-xs text-slate-400">
                          Ngày chi trả: {formatDate(item.payoutDate)}
                        </div>
                        <div className="text-xs text-slate-400">
                          Trạng thái payout: {statusLabelMap[item.status] || item.status}
                        </div>
                        <div className="text-xs text-slate-400">
                          Kỳ thuế:{" "}
                          {item.taxPeriodMonth
                            ? `${item.taxPeriodMonth}/${item.taxPeriodYear || "-"}`
                            : item.taxPeriodQuarter
                            ? `Q${item.taxPeriodQuarter} ${item.taxPeriodYear || ""}`
                            : item.taxPeriodYear || "-"}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-semibold">{item.userName}</div>
                        <div className="text-xs text-slate-400">
                          ID: {item.userId} · {item.userEmail}
                        </div>
                        {item.userCccd && (
                          <div className="text-xs text-slate-400">
                            CCCD: {item.userCccd}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {item.projectTitle ? (
                          <div className="font-semibold">
                            {item.projectTitle}
                          </div>
                        ) : (
                          <div className="text-slate-400">-</div>
                        )}
                        <div className="text-xs text-slate-400">
                          Project ID: {item.projectId ?? "-"}
                        </div>
                        <div className="text-xs text-slate-400">
                          Hợp đồng: {item.contractId ?? "-"}
                        </div>
                        {item.milestoneTitle && (
                          <div className="text-xs text-slate-400">
                            Mốc: {item.milestoneTitle} (ID {item.milestoneId})
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {formatCurrency(item.grossAmount)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {formatCurrency(item.taxAmount)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {formatCurrency(item.netAmount)}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                              item.taxDeclared
                                ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/40"
                                : "bg-white/10 text-slate-200 border border-white/10"
                            }`}
                          >
                            {item.taxDeclared ? (
                              <ShieldCheck className="w-3 h-3" />
                            ) : (
                              <ShieldOff className="w-3 h-3" />
                            )}
                            {item.taxDeclared ? "Đã kê khai" : "Chưa kê khai"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                              item.taxPaid
                                ? "bg-indigo-500/15 text-indigo-200 border border-indigo-500/40"
                                : "bg-white/10 text-slate-200 border border-white/10"
                            }`}
                          >
                            {item.taxPaid ? (
                              <ShieldCheck className="w-3 h-3" />
                            ) : (
                              <ShieldOff className="w-3 h-3" />
                            )}
                            {item.taxPaid ? "Đã nộp" : "Chưa nộp"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {!payoutsLoading && !payouts?.content?.length && (
                <tr>
                  <td
                    className="py-4 text-center text-slate-400"
                    colSpan={8}
                  >
                    Không có payout nào trong bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-300">
          <div>
            Trang {(payouts?.page ?? 0) + 1} / {payouts?.totalPages ?? 1} · Tổng{" "}
            {payouts?.totalElements ?? 0} bản ghi
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 rounded-lg border border-white/10 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() =>
                setPage((p) =>
                  payouts?.last
                    ? p
                    : Math.min((payouts?.totalPages ?? 1) - 1, p + 1)
                )
              }
              disabled={
                payouts?.last ||
                page >= Math.max(0, (payouts?.totalPages ?? 1) - 1)
              }
              className="px-3 py-1 rounded-lg border border-white/10 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {overviewError && (
        <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
          {overviewError}
        </div>
      )}
    </div>
  );
};

export default TaxAdminPage;

