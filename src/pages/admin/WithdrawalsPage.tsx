import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  QrCode,
  XCircle,
  Send,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import withdrawalService, {
  WithdrawalResponse,
  WithdrawalStatus,
} from "../../services/withdrawalService";
import { useDebounce } from "../../component/hooks/useDebounce";
import CosmicSelect from "../../component/CosmicSelect";

const WithdrawalsPage: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalResponse | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Search and filter states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus | "ALL">(
    "ALL"
  );
  const [userIdFilter, setUserIdFilter] = useState<string>("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [maxTotalPages, setMaxTotalPages] = useState(0); // Lưu totalPages lớn nhất để không bị mất khi sang trang sau
  const [sortBy, setSortBy] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true);

      const hasFilters =
        debouncedSearchKeyword.trim() ||
        statusFilter !== "ALL" ||
        userIdFilter ||
        minAmount ||
        maxAmount ||
        fromDate ||
        toDate;

      let response;
      if (hasFilters) {
        response = await withdrawalService.searchAllWithdrawals({
          keyword: debouncedSearchKeyword.trim() || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          userId: userIdFilter ? parseInt(userIdFilter) : undefined,
          minAmount: minAmount ? parseFloat(minAmount) : undefined,
          maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          page,
          size,
          sort: sortBy || undefined,
        });
      } else {
        response = await withdrawalService.getAllWithdrawals(
          page,
          size,
          sortBy || undefined
        );
      }

      setWithdrawals(response.content || []);
      const elements = response.totalElements || 0;
      const currentSize = response.size || size || 20;
      const contentLength = (response.content || []).length;

      // Debug: Log toàn bộ response để kiểm tra
      console.log("API Response:", {
        fullResponse: response,
        totalElements: elements,
        totalPages: response.totalPages,
        size: currentSize,
        number: response.number,
        contentLength: contentLength,
      });

      // Tính totalPages từ totalElements và size để đảm bảo chính xác
      // Nếu API trả về totalElements = 0 hoặc không có, nhưng có content và content.length >= size
      // thì có thể còn trang tiếp theo
      let calculatedPages = 1;
      if (elements > 0) {
        calculatedPages = Math.ceil(elements / currentSize);
      } else if (contentLength >= currentSize) {
        // Nếu không có totalElements nhưng content đầy page, giả định có trang tiếp theo
        calculatedPages = page + 2; // Ít nhất là page hiện tại + 1 trang nữa
      }

      setTotalElements(elements);
      setTotalPages(calculatedPages);

      // Lưu totalPages lớn nhất để không bị mất khi sang trang sau
      // Điều này đảm bảo pagination vẫn hiển thị ngay cả khi trang hiện tại có ít items
      if (calculatedPages > maxTotalPages) {
        setMaxTotalPages(calculatedPages);
      } else if (elements > 0 && calculatedPages > 0) {
        // Nếu API trả về totalElements > 0, cập nhật maxTotalPages
        setMaxTotalPages(calculatedPages);
      }

      // Debug log
      console.log("Pagination Debug:", {
        totalElements: elements,
        size: currentSize,
        totalPages: calculatedPages,
        page: response.number || page,
        contentLength: contentLength,
        calculatedPages: calculatedPages,
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Không thể tải danh sách rút tiền"
      );
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearchKeyword,
    statusFilter,
    userIdFilter,
    minAmount,
    maxAmount,
    fromDate,
    toDate,
    page,
    size,
    sortBy,
  ]);

  useEffect(() => {
    setPage(0); // Reset to first page when filters change
    setMaxTotalPages(0); // Reset maxTotalPages when filters change
  }, [
    debouncedSearchKeyword,
    statusFilter,
    userIdFilter,
    minAmount,
    maxAmount,
    fromDate,
    toDate,
    size,
    sortBy,
  ]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleClearFilters = () => {
    setSearchKeyword("");
    setStatusFilter("ALL");
    setUserIdFilter("");
    setMinAmount("");
    setMaxAmount("");
    setFromDate("");
    setToDate("");
    setSortBy("");
    setPage(0);
    setMaxTotalPages(0); // Reset maxTotalPages khi clear filters
  };

  const hasActiveFilters =
    searchKeyword.trim() ||
    statusFilter !== "ALL" ||
    userIdFilter ||
    minAmount ||
    maxAmount ||
    fromDate ||
    toDate;

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-yellow-900/40 text-yellow-400 border border-yellow-400/20">
            <Clock className="w-3 h-3" /> Đang chờ
          </span>
        );
      case "APPROVED":
      case "COMPLETED":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-green-900/40 text-green-400 border border-green-400/20">
            <CheckCircle2 className="w-3 h-3" /> Đã duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-red-900/40 text-red-400 border border-red-400/20">
            <AlertCircle className="w-3 h-3" /> Từ chối
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-gray-900/40 text-gray-400 border border-gray-400/20">
            {status}
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleShowQr = (withdrawal: WithdrawalResponse) => {
    setSelectedWithdrawal(withdrawal);
    setShowQrModal(true);
  };

  const handleCloseQrModal = () => {
    setShowQrModal(false);
    setSelectedWithdrawal(null);
  };

  const handleShowReject = (withdrawal: WithdrawalResponse) => {
    setSelectedWithdrawal(withdrawal);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setSelectedWithdrawal(null);
    setRejectionReason("");
  };

  const handleApprove = async (withdrawal: WithdrawalResponse) => {
    if (
      !window.confirm(
        `Xác nhận chuyển tiền thành công cho yêu cầu ${withdrawal.withdrawalCode}?`
      )
    ) {
      return;
    }

    try {
      setIsProcessing(true);
      await withdrawalService.approveWithdrawal(withdrawal.id);
      toast.success("Xác nhận chuyển tiền thành công");
      fetchWithdrawals();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Không thể xác nhận chuyển tiền"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    if (!selectedWithdrawal) return;

    try {
      setIsProcessing(true);
      await withdrawalService.rejectWithdrawal(selectedWithdrawal.id, {
        rejectionReason: rejectionReason.trim(),
      });
      toast.success("Từ chối yêu cầu rút tiền thành công");
      handleCloseRejectModal();
      fetchWithdrawals();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Không thể từ chối yêu cầu"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Lịch sử rút tiền</h1>
            <p className="text-gray-400 mt-1">
              Quản lý và xử lý các yêu cầu rút tiền
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-xl border border-purple-500/20 p-6 mb-6 relative z-10">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm kiếm theo mã rút tiền, số tài khoản..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                showFilters
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800/50 text-gray-300 hover:bg-slate-700/50"
              }`}
            >
              <Filter className="w-5 h-5" />
              Bộ lọc
              {hasActiveFilters && (
                <span className="px-2 py-0.5 bg-purple-500 rounded-full text-xs">
                  {
                    [
                      searchKeyword && 1,
                      statusFilter !== "ALL" && 1,
                      userIdFilter && 1,
                      minAmount && 1,
                      maxAmount && 1,
                      fromDate && 1,
                      toDate && 1,
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-purple-500/20">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Trạng thái
                </label>
                <CosmicSelect
                  label=""
                  value={statusFilter}
                  onChange={(v) =>
                    setStatusFilter(v as WithdrawalStatus | "ALL")
                  }
                  options={[
                    { value: "ALL", label: "Tất cả" },
                    { value: "PENDING", label: "Đang chờ" },
                    { value: "COMPLETED", label: "Đã duyệt" },
                    { value: "REJECTED", label: "Từ chối" },
                  ]}
                />
              </div>

              {/* User ID Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User ID
                </label>
                <input
                  type="number"
                  value={userIdFilter}
                  onChange={(e) => setUserIdFilter(e.target.value)}
                  placeholder="Nhập User ID"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* Min Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số tiền từ (VND)
                </label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="Tối thiểu"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* Max Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số tiền đến (VND)
                </label>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="Tối đa"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* From Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Từ ngày
                </label>
                <input
                  type="datetime-local"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Đến ngày
                </label>
                <input
                  type="datetime-local"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sắp xếp
                </label>
                <CosmicSelect
                  label=""
                  value={sortBy || ""}
                  onChange={(v) => setSortBy(v || "")}
                  options={[
                    { value: "", label: "Không sắp xếp" },
                    { value: "createdAt,desc", label: "Mới nhất" },
                    { value: "createdAt,asc", label: "Cũ nhất" },
                    { value: "amount,desc", label: "Số tiền: Cao → Thấp" },
                    { value: "amount,asc", label: "Số tiền: Thấp → Cao" },
                  ]}
                />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={handleClearFilters}
                    className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-xl border border-purple-500/20 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Danh sách yêu cầu rút tiền
            </h2>
            <div className="flex items-center gap-4">
              <CosmicSelect
                label="Hiển thị"
                value={String(size)}
                onChange={(v) => {
                  setPage(0);
                  setSize(Number(v));
                  setMaxTotalPages(0); // Reset maxTotalPages khi thay đổi size
                }}
                options={[
                  { value: "10", label: "10 / trang" },
                  { value: "20", label: "20 / trang" },
                  { value: "50", label: "50 / trang" },
                ]}
              />
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có yêu cầu rút tiền nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 dark:bg-[#111827] text-gray-600 dark:text-gray-400 text-sm">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Mã rút tiền</th>
                    <th className="px-4 py-3 text-left">Số tiền</th>
                    <th className="px-4 py-3 text-left">Ngân hàng</th>
                    <th className="px-4 py-3 text-left">Số tài khoản</th>
                    <th className="px-4 py-3 text-left">Chủ tài khoản</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                    <th className="px-4 py-3 text-left">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal) => (
                    <tr
                      key={withdrawal.id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#1F2937] transition"
                    >
                      <td className="px-4 py-3 font-mono text-sm text-gray-300">
                        {withdrawal.id}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-purple-400">
                        {withdrawal.withdrawalCode}
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-400">
                        {formatCurrency(withdrawal.amount)}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {withdrawal.bank?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-300">
                        {withdrawal.accountNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {withdrawal.accountHolderName}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(withdrawal.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {withdrawal.status.toUpperCase() === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleShowQr(withdrawal)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                                title="Chuyển tiền"
                              >
                                <Send className="w-3 h-3" />
                                Chuyển tiền
                              </button>
                              <button
                                onClick={() => handleShowReject(withdrawal)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                                title="Từ chối"
                              >
                                <XCircle className="w-3 h-3" />
                                Từ chối
                              </button>
                            </>
                          )}
                          {withdrawal.status.toUpperCase() !== "PENDING" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-gray-700/50 text-gray-300 border border-gray-600/50">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                              Đã xử lý
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading &&
            withdrawals.length > 0 &&
            (() => {
              // Tính totalPages thực tế
              // Ưu tiên dùng maxTotalPages (đã lưu từ lần fetch đầu tiên) hoặc totalPages hiện tại
              let actualTotalPages =
                maxTotalPages > 0 ? maxTotalPages : totalPages;

              // Nếu vẫn chưa có, tính từ totalElements
              if (actualTotalPages <= 0) {
                actualTotalPages =
                  totalElements > 0 ? Math.ceil(totalElements / size) : 1;
              }

              // Nếu đang ở trang > 0, đảm bảo có ít nhất page + 1 trang
              if (page > 0 && actualTotalPages <= page) {
                actualTotalPages = page + 1;
              }

              // Nếu withdrawals.length >= size, có thể còn trang tiếp theo
              if (withdrawals.length >= size && actualTotalPages <= page + 1) {
                actualTotalPages = page + 2;
              }

              // Luôn hiển thị pagination nếu:
              // - Đang ở trang > 0 (cần nút Trước)
              // - Hoặc có nhiều hơn 1 trang
              // - Hoặc withdrawals.length >= size (có thể còn trang tiếp theo)
              const shouldShowPagination =
                page > 0 || actualTotalPages > 1 || withdrawals.length >= size;

              // Tính số hiển thị chính xác
              const startItem = page * size + 1;
              const endItem =
                totalElements > 0
                  ? Math.min((page + 1) * size, totalElements)
                  : page * size + withdrawals.length;

              console.log("Pagination Render Check:", {
                actualTotalPages,
                maxTotalPages,
                totalPages,
                totalElements,
                size,
                withdrawalsLength: withdrawals.length,
                shouldShowPagination,
                currentPage: page,
                canGoNext: page < actualTotalPages - 1,
                canGoPrev: page > 0,
                startItem,
                endItem,
              });

              return (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-purple-500/20">
                  <div className="text-sm text-gray-400">
                    Hiển thị {startItem} - {endItem} trong tổng số{" "}
                    {totalElements > 0 ? totalElements : "nhiều"} kết quả
                  </div>
                  {shouldShowPagination && (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          console.log("Previous clicked, current page:", page);
                          if (page > 0) {
                            setPage(page - 1);
                          }
                        }}
                        disabled={page === 0}
                        className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        style={{
                          cursor: page === 0 ? "not-allowed" : "pointer",
                        }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                      </button>
                      <div className="text-sm text-gray-300">
                        Trang {page + 1} / {actualTotalPages}
                      </div>
                      <button
                        onClick={() => {
                          console.log(
                            "Next clicked, current page:",
                            page,
                            "totalPages:",
                            actualTotalPages,
                            "canGoNext:",
                            page < actualTotalPages - 1
                          );
                          if (page < actualTotalPages - 1) {
                            setPage(page + 1);
                          }
                        }}
                        disabled={page >= actualTotalPages - 1}
                        className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        style={{
                          cursor:
                            page >= actualTotalPages - 1
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        Sau
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && selectedWithdrawal && (
        <>
          <div
            onClick={handleCloseQrModal}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-purple-500/30 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600/30 rounded-lg">
                      <QrCode className="w-5 h-5 text-purple-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Mã QR chuyển tiền
                    </h2>
                  </div>
                  <button
                    onClick={handleCloseQrModal}
                    disabled={isProcessing}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-gray-300 mb-2">
                    Mã:{" "}
                    <span className="font-mono text-purple-400">
                      {selectedWithdrawal.withdrawalCode}
                    </span>
                  </p>
                  <p className="text-gray-300 mb-4">
                    Số tiền:{" "}
                    <span className="font-semibold text-green-400">
                      {formatCurrency(selectedWithdrawal.amount)}
                    </span>
                  </p>
                </div>

                {selectedWithdrawal.qrDataURL ? (
                  <div className="flex justify-center">
                    <img
                      src={selectedWithdrawal.qrDataURL}
                      alt="QR Code"
                      className="w-64 h-64 border-2 border-purple-500/30 rounded-lg p-2 bg-white"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Không có mã QR</p>
                  </div>
                )}

                <div className="text-sm text-gray-400 text-center">
                  <p>Ngân hàng: {selectedWithdrawal.bank?.name || "N/A"}</p>
                  <p>Số TK: {selectedWithdrawal.accountNumber}</p>
                  <p>Chủ TK: {selectedWithdrawal.accountHolderName}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseQrModal}
                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseQrModal();
                      handleApprove(selectedWithdrawal);
                    }}
                    disabled={isProcessing}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Thành công
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedWithdrawal && (
        <>
          <div
            onClick={handleCloseRejectModal}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-red-500/30 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-red-500/20 bg-gradient-to-r from-red-900/50 to-orange-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600/30 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Từ chối yêu cầu
                    </h2>
                  </div>
                  <button
                    onClick={handleCloseRejectModal}
                    disabled={isProcessing}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="text-sm text-gray-300">
                  <p className="mb-2">
                    Mã yêu cầu:{" "}
                    <span className="font-mono text-purple-400">
                      {selectedWithdrawal.withdrawalCode}
                    </span>
                  </p>
                  <p className="mb-4">
                    Số tiền:{" "}
                    <span className="font-semibold text-green-400">
                      {formatCurrency(selectedWithdrawal.amount)}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lý do từ chối <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Nhập lý do từ chối yêu cầu rút tiền..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-red-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 resize-none"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseRejectModal}
                    disabled={isProcessing}
                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isProcessing || !rejectionReason.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Xác nhận từ chối
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WithdrawalsPage;
