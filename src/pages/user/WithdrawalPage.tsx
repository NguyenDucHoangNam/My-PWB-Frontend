import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  X,
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Filter,
  XCircle,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import withdrawalService, {
  WithdrawalResponse,
  WithdrawalRequest,
  WithdrawalStatus,
} from "../../services/withdrawalService";
import { useDebounce } from "../../component/hooks/useDebounce";
import CosmicSelect from "../../component/CosmicSelect";
import userBankService, { UserBankResponse } from "../../services/userBankService";
import { useNavigate } from "react-router-dom";
import { ROUTER } from "../../routes/router";
import AnimatedBackground from "@/component/background/AnimatedBackground";

const WithdrawalPage: React.FC = () => {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState<WithdrawalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userBanks, setUserBanks] = useState<UserBankResponse[]>([]);
  const [isLoadingUserBanks, setIsLoadingUserBanks] = useState(false);
  const [selectedUserBank, setSelectedUserBank] = useState<UserBankResponse | null>(null);
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const bankDropdownRef = useRef<HTMLDivElement>(null);
  const [amountError, setAmountError] = useState<string>("");
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [showNoBankModal, setShowNoBankModal] = useState(false);

  // Search and filter states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus | "ALL">("ALL");
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
  const [showRejectionReasonModal, setShowRejectionReasonModal] = useState(false);
  const [selectedRejectionWithdrawal, setSelectedRejectionWithdrawal] = useState<WithdrawalResponse | null>(null);

  // Validation constants
  const MIN_WITHDRAWAL_AMOUNT = 50000; // 50,000 VND
  const MAX_WITHDRAWAL_AMOUNT = 100000000; // 100,000,000 VND

  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

  const [formData, setFormData] = useState<WithdrawalRequest>({
    bankId: 0,
    accountNumber: "",
    accountHolderName: "",
    amount: 0,
  });

  // Note: Bank search uses local filtering, no debounce needed

  // Fetch user bank accounts
  const fetchUserBanks = useCallback(async () => {
    try {
      setIsLoadingUserBanks(true);
      const accounts = await userBankService.getUserBanks();
      setUserBanks(accounts);
      return accounts;
    } catch (error: any) {
      console.error("Error fetching user banks:", error);
      toast.error(
        error?.response?.data?.message || "Không thể tải danh sách ngân hàng"
      );
      return [];
    } finally {
      setIsLoadingUserBanks(false);
    }
  }, []);

  // Fetch user balance
  const fetchBalance = useCallback(async () => {
    try {
      setIsLoadingBalance(true);
      const response = await withdrawalService.getUserBalance();
      setBalance(response.balance);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Không thể tải số dư tài khoản"
      );
    } finally {
      setIsLoadingBalance(false);
    }
  }, []);

  // Fetch withdrawals with search and filters
  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true);

      const hasFilters =
        debouncedSearchKeyword.trim() ||
        statusFilter !== "ALL" ||
        minAmount ||
        maxAmount ||
        fromDate ||
        toDate ||
        sortBy; // Nếu có sort thì cũng dùng searchUserWithdrawals

      let response;
      if (hasFilters) {
        response = await withdrawalService.searchUserWithdrawals({
          keyword: debouncedSearchKeyword.trim() || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          minAmount: minAmount ? parseFloat(minAmount) : undefined,
          maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          page,
          size,
          sort: sortBy || undefined,
        });
      } else {
        response = await withdrawalService.getUserWithdrawals(page, size);
      }

      setWithdrawals(response.content || []);
      const elements = response.totalElements || 0;
      const currentSize = response.size || size || 20;
      const contentLength = (response.content || []).length;

      // Tính totalPages từ totalElements và size để đảm bảo chính xác
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
      if (calculatedPages > maxTotalPages) {
        setMaxTotalPages(calculatedPages);
      } else if (elements > 0 && calculatedPages > 0) {
        // Nếu API trả về totalElements > 0, cập nhật maxTotalPages
        setMaxTotalPages(calculatedPages);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Không thể tải danh sách rút tiền"
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchKeyword, statusFilter, minAmount, maxAmount, fromDate, toDate, page, size, sortBy]);


  // Load balance on mount
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Load withdrawals when filters change
  useEffect(() => {
    setPage(0); // Reset to first page when filters change
    setMaxTotalPages(0); // Reset maxTotalPages when filters change
  }, [debouncedSearchKeyword, statusFilter, minAmount, maxAmount, fromDate, toDate, size, sortBy]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleClearFilters = () => {
    setSearchKeyword("");
    setStatusFilter("ALL");
    setMinAmount("");
    setMaxAmount("");
    setFromDate("");
    setToDate("");
    setSortBy("");
    setPage(0);
  };

  const hasActiveFilters =
    searchKeyword.trim() ||
    statusFilter !== "ALL" ||
    minAmount ||
    maxAmount ||
    fromDate ||
    toDate;

  // Close bank dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bankDropdownRef.current &&
        !bankDropdownRef.current.contains(event.target as Node)
      ) {
        setShowBankDropdown(false);
      }
    };

    if (showBankDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showBankDropdown]);

  // Filter user banks based on search query
  const filteredUserBanks = userBanks.filter(
    (userBank) =>
      userBank.bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
      userBank.bank.code.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
      userBank.bank.shortName?.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
      userBank.accountNumber.includes(bankSearchQuery)
  );

  const handleOpenModal = async () => {
    // Check if user has bank accounts
    const accounts = await fetchUserBanks();

    if (accounts.length === 0) {
      setShowNoBankModal(true);
      return;
    }

    setIsModalOpen(true);
    setFormData({
      bankId: 0,
      accountNumber: "",
      accountHolderName: "",
      amount: 0,
    });
    setSelectedUserBank(null);
    setBankSearchQuery("");
    setAmountError("");
    // Reload user banks to ensure fresh data
    await fetchUserBanks();
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setFormData({
        bankId: 0,
        accountNumber: "",
        accountHolderName: "",
        amount: 0,
      });
      setSelectedUserBank(null);
      setBankSearchQuery("");
      setAmountError("");
    }
  };

  const handleUserBankSelect = (userBank: UserBankResponse) => {
    setSelectedUserBank(userBank);
    setFormData({
      ...formData,
      bankId: userBank.bank.id,
      accountNumber: userBank.accountNumber,
      accountHolderName: userBank.accountHolderName,
    });
    setShowBankDropdown(false);
    setBankSearchQuery(`${userBank.bank.name} - ${userBank.accountNumber}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserBank) {
      toast.error("Vui lòng chọn ngân hàng");
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (formData.amount < MIN_WITHDRAWAL_AMOUNT) {
      toast.error(`Số tiền tối thiểu là ${formatCurrency(MIN_WITHDRAWAL_AMOUNT)}`);
      return;
    }

    if (formData.amount > MAX_WITHDRAWAL_AMOUNT) {
      toast.error(`Số tiền tối đa là ${formatCurrency(MAX_WITHDRAWAL_AMOUNT)}`);
      return;
    }

    if (formData.amount > (balance ?? 0)) {
      toast.error("Số tiền rút không được vượt quá số dư tài khoản");
      return;
    }

    try {
      setIsSubmitting(true);
      await withdrawalService.createWithdrawal(formData);
      toast.success("Yêu cầu rút tiền đã được tạo thành công");
      handleCloseModal();
      fetchWithdrawals();
      fetchBalance(); // Refresh balance after withdrawal
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Không thể tạo yêu cầu rút tiền"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowRejectionReason = (withdrawal: WithdrawalResponse) => {
    setSelectedRejectionWithdrawal(withdrawal);
    setShowRejectionReasonModal(true);
  };

  const handleCloseRejectionReasonModal = () => {
    setShowRejectionReasonModal(false);
    setSelectedRejectionWithdrawal(null);
  };

  const getStatusBadge = (withdrawal: WithdrawalResponse) => {
    const status = withdrawal.status.toUpperCase();
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-yellow-900/40 text-yellow-400 min-w-[160px] justify-center">
            <Clock className="w-3 h-3" /> Đang chờ
          </span>
        );
      case "APPROVED":
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-green-900/40 text-green-400 min-w-[160px] justify-center">
            <CheckCircle2 className="w-3 h-3" /> Đã duyệt
          </span>
        );
      case "REJECTED":
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (withdrawal.rejectionReason) {
                handleShowRejectionReason(withdrawal);
              }
            }}
            disabled={!withdrawal.rejectionReason}
            className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-red-900/40 text-red-400 border border-red-500/30 transition-all min-w-[160px] justify-center ${withdrawal.rejectionReason
              ? "hover:bg-red-900/60 hover:border-red-400/50 cursor-pointer hover:scale-105"
              : "cursor-default opacity-75"
              }`}
            title={withdrawal.rejectionReason ? "Click để xem lý do từ chối" : "Không có lý do"}
          >
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span>Từ chối</span>
            {withdrawal.rejectionReason && (
              <>
                <span className="text-red-300/70">•</span>
                <span className="text-[10px] text-red-300/80 underline">Xem lý do</span>
              </>
            )}
          </button>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-gray-900/40 text-gray-400 min-w-[160px] justify-center">
            {withdrawal.status}
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-8 px-4 md:px-8">
      <AnimatedBackground/>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Tài chính</h1>
            </div>
            <div className="flex items-center gap-4">
              {isLoadingBalance ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-gray-700 rounded-lg">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-sm text-gray-400">Đang tải số dư...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-lg">
                  <Wallet className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Số dư:</span>
                  <span className="text-xl font-bold text-green-400">
                    {formatCurrency(balance ?? 0)}
                  </span>
                </div>
              )}
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Wallet className="w-5 h-5" />
                Rút tiền
              </button>
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
                className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${showFilters
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800/50 text-gray-300 hover:bg-slate-700/50"
                  }`}
              >
                <Filter className="w-5 h-5" />
                Bộ lọc
                {hasActiveFilters && (
                  <span className="px-2 py-0.5 bg-purple-500 rounded-full text-xs">
                    {[
                      searchKeyword && 1,
                      statusFilter !== "ALL" && 1,
                      minAmount && 1,
                      maxAmount && 1,
                      fromDate && 1,
                      toDate && 1,
                    ].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-purple-500/20"
                >
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Trạng thái
                    </label>
                    <CosmicSelect
                      label=""
                      value={statusFilter}
                      onChange={(v) => setStatusFilter(v as WithdrawalStatus | "ALL")}
                      options={[
                        { value: "ALL", label: "Tất cả" },
                        { value: "PENDING", label: "Đang chờ" },
                        { value: "COMPLETED", label: "Đã duyệt" },
                        { value: "REJECTED", label: "Từ chối" },
                      ]}
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Withdrawals Table */}
        <div className="bg-white/10 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-xl border border-purple-500/20 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                Lịch sử rút tiền
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
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((withdrawal, index) => (
                      <motion.tr
                        key={withdrawal.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
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
                          {withdrawal.bank?.shortName || withdrawal.bank?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-300">
                          {withdrawal.accountNumber}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {withdrawal.accountHolderName}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(withdrawal)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && withdrawals.length > 0 && (() => {
              // Tính totalPages thực tế
              // Ưu tiên dùng maxTotalPages (đã lưu từ lần fetch đầu tiên) hoặc totalPages hiện tại
              let actualTotalPages = maxTotalPages > 0 ? maxTotalPages : totalPages;

              // Nếu vẫn chưa có, tính từ totalElements
              if (actualTotalPages <= 0) {
                actualTotalPages = totalElements > 0 ? Math.ceil(totalElements / size) : 1;
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
              const shouldShowPagination = page > 0 || actualTotalPages > 1 || withdrawals.length >= size;

              // Tính số hiển thị chính xác
              const startItem = page * size + 1;
              const endItem = totalElements > 0
                ? Math.min((page + 1) * size, totalElements)
                : page * size + withdrawals.length;

              return (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-purple-500/20">
                  <div className="text-sm text-gray-400">
                    Hiển thị {startItem} - {endItem} trong tổng số {totalElements > 0 ? totalElements : 'nhiều'} kết quả
                  </div>
                  {shouldShowPagination && (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          if (page > 0) {
                            setPage(page - 1);
                          }
                        }}
                        disabled={page === 0}
                        className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        style={{ cursor: page === 0 ? 'not-allowed' : 'pointer' }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                      </button>
                      <div className="text-sm text-gray-300">
                        Trang {page + 1} / {actualTotalPages}
                      </div>
                      <button
                        onClick={() => {
                          if (page < actualTotalPages - 1) {
                            setPage(page + 1);
                          }
                        }}
                        disabled={page >= actualTotalPages - 1}
                        className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        style={{ cursor: page >= actualTotalPages - 1 ? 'not-allowed' : 'pointer' }}
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

        {/* Withdrawal Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseModal}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-purple-500/30 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600/30 rounded-lg">
                          <Wallet className="w-5 h-5 text-purple-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                          Yêu cầu rút tiền
                        </h2>
                      </div>
                      <button
                        onClick={handleCloseModal}
                        disabled={isSubmitting}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Balance Display */}
                    <div className="p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-green-400" />
                          <span className="text-sm text-gray-300">Số dư hiện tại:</span>
                        </div>
                        <span className="text-xl font-bold text-green-400">
                          {formatCurrency(balance ?? 0)}
                        </span>
                      </div>
                      {formData.amount > 0 && (
                        <div className="mt-3 pt-3 border-t border-green-500/20 flex items-center justify-between">
                          <span className="text-sm text-gray-300">Số dư sau khi rút:</span>
                          <span className={`text-lg font-semibold ${(balance ?? 0) - formData.amount >= 0 ? "text-green-400" : "text-red-400"
                            }`}>
                            {formatCurrency((balance ?? 0) - formData.amount)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bank Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ngân hàng <span className="text-red-400">*</span>
                      </label>
                      <div className="relative" ref={bankDropdownRef}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={bankSearchQuery}
                            onChange={(e) => {
                              setBankSearchQuery(e.target.value);
                              setShowBankDropdown(true);
                            }}
                            onFocus={() => setShowBankDropdown(true)}
                            placeholder="Tìm kiếm ngân hàng đã lưu..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                          />
                        </div>

                        {/* Bank Dropdown */}
                        <AnimatePresence>
                          {showBankDropdown && !selectedUserBank && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-10 w-full mt-2 bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                            >
                              {isLoadingUserBanks ? (
                                <div className="p-4 text-center">
                                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin mx-auto" />
                                </div>
                              ) : filteredUserBanks.length === 0 ? (
                                <div className="p-4 text-center text-gray-400">
                                  Không tìm thấy ngân hàng
                                </div>
                              ) : (
                                filteredUserBanks.map((userBank) => (
                                  <button
                                    key={userBank.id}
                                    type="button"
                                    onClick={() => handleUserBankSelect(userBank)}
                                    className="w-full px-4 py-3 text-left hover:bg-purple-500/20 transition-colors flex items-center gap-3 border-b border-purple-500/10 last:border-b-0"
                                  >
                                    {userBank.bank.logoUrl ? (
                                      <img
                                        src={userBank.bank.logoUrl}
                                        alt={userBank.bank.name}
                                        className="w-8 h-8 rounded object-contain flex-shrink-0"
                                      />
                                    ) : (
                                      <Building2 className="w-8 h-8 text-purple-400 flex-shrink-0" />
                                    )}
                                    <div className="flex-1">
                                      <div className="text-white font-medium">
                                        {userBank.bank.name}
                                      </div>
                                      <div className="text-sm text-gray-400">
                                        {userBank.accountNumber} - {userBank.accountHolderName}
                                      </div>
                                    </div>
                                  </button>
                                ))
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Selected Bank Info Card */}
                      {selectedUserBank && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 rounded-lg border border-purple-500/30 bg-gradient-to-br from-[#0F081C]/80 to-[#1A0D33]/80 relative overflow-hidden"
                        >
                          <div className="relative z-10 flex items-start gap-4">
                            {/* Bank Logo */}
                            <div className="flex-shrink-0">
                              {selectedUserBank.bank.logoUrl ? (
                                <img
                                  src={selectedUserBank.bank.logoUrl}
                                  alt={selectedUserBank.bank.name}
                                  className="w-12 h-12 rounded object-contain"
                                />
                              ) : (
                                <Building2 className="w-12 h-12 text-purple-400" />
                              )}
                            </div>

                            {/* Bank Info */}
                            <div className="flex-1">
                              <div className="mb-2">
                                <h4 className="text-white font-bold text-lg">
                                  {selectedUserBank.bank.name}
                                </h4>
                                {selectedUserBank.bank.shortName && (
                                  <p className="text-purple-300 text-sm">
                                    {selectedUserBank.bank.shortName}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-1">
                                <div>
                                  <span className="text-purple-400 text-sm">Số tài khoản: </span>
                                  <span className="text-white font-mono">{selectedUserBank.accountNumber}</span>
                                </div>
                                <div>
                                  <span className="text-purple-400 text-sm">Chủ tài khoản: </span>
                                  <span className="text-white">{selectedUserBank.accountHolderName}</span>
                                </div>
                              </div>
                            </div>

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserBank(null);
                                setBankSearchQuery("");
                                setFormData({
                                  ...formData,
                                  bankId: 0,
                                  accountNumber: "",
                                  accountHolderName: "",
                                });
                              }}
                              className="flex-shrink-0 p-1 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Số tiền (VND) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.amount || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setFormData({
                            ...formData,
                            amount: value,
                          });

                          // Validate amount
                          if (value > 0 && value < MIN_WITHDRAWAL_AMOUNT) {
                            setAmountError(
                              `Số tiền tối thiểu là ${formatCurrency(MIN_WITHDRAWAL_AMOUNT)}`
                            );
                          } else if (value > MAX_WITHDRAWAL_AMOUNT) {
                            setAmountError(
                              `Số tiền tối đa là ${formatCurrency(MAX_WITHDRAWAL_AMOUNT)}`
                            );
                          } else {
                            setAmountError("");
                          }
                        }}
                        placeholder={`Tối thiểu ${formatCurrency(MIN_WITHDRAWAL_AMOUNT)}`}
                        min={MIN_WITHDRAWAL_AMOUNT}
                        max={MAX_WITHDRAWAL_AMOUNT}
                        step="1000"
                        className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${amountError
                          ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500"
                          : "border-purple-500/30 focus:ring-purple-500/50 focus:border-purple-500"
                          }`}
                        required
                      />
                      {amountError && (
                        <div className="mt-2 p-3 bg-orange-500/20 border border-orange-500/50 rounded-lg flex items-center gap-2 text-orange-400 text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{amountError}</span>
                        </div>
                      )}
                      <div className="mt-1 text-xs text-gray-400">
                        Số tiền từ {formatCurrency(MIN_WITHDRAWAL_AMOUNT)} đến{" "}
                        {formatCurrency(MAX_WITHDRAWAL_AMOUNT)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !!amountError}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            Gửi yêu cầu
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Rejection Reason Modal */}
        <AnimatePresence>
          {showRejectionReasonModal && selectedRejectionWithdrawal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseRejectionReasonModal}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-red-500/30 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-red-500/20 bg-gradient-to-r from-red-900/50 to-orange-900/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-600/30 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-red-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                          Lý do từ chối
                        </h2>
                      </div>
                      <button
                        onClick={handleCloseRejectionReasonModal}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="text-sm text-gray-300 space-y-2">
                      <p>
                        <span className="text-gray-400">Mã yêu cầu:</span>{" "}
                        <span className="font-mono text-purple-400">
                          {selectedRejectionWithdrawal.withdrawalCode}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-400">Số tiền:</span>{" "}
                        <span className="font-semibold text-green-400">
                          {formatCurrency(selectedRejectionWithdrawal.amount)}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-400">Ngày tạo:</span>{" "}
                        <span className="text-white">
                          {formatDate(selectedRejectionWithdrawal.createdAt)}
                        </span>
                      </p>
                    </div>

                    <div className="pt-4 border-t border-red-500/20">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Lý do từ chối:
                      </label>
                      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <p className="text-white whitespace-pre-wrap">
                          {selectedRejectionWithdrawal.rejectionReason || "Không có lý do cụ thể"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={handleCloseRejectionReasonModal}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Modal thông báo chưa có ngân hàng */}
        <AnimatePresence>
          {showNoBankModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-[#0A0F1A] to-[#1A0A2E] p-8 rounded-2xl w-full max-w-md border border-yellow-500/50 shadow-2xl shadow-yellow-500/20 text-gray-100 relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6 z-10 relative">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                    <h3 className="text-2xl font-extrabold text-yellow-400 tracking-wide">
                      Chưa có ngân hàng
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowNoBankModal(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-gray-300 mb-6 z-10 relative">
                  Bạn chưa có thông tin ngân hàng nào được lưu. Vui lòng thêm thông tin ngân hàng trong trang hồ sơ trước khi thực hiện rút tiền.
                </p>

                <div className="flex justify-end gap-3 z-10 relative">
                  <button
                    onClick={() => setShowNoBankModal(false)}
                    className="px-5 py-2.5 bg-[#2A1A3E] rounded-lg hover:bg-[#3A2A4E] 
                       transition-all text-sm font-medium border border-[#4A0E7E] text-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      setShowNoBankModal(false);
                      navigate(ROUTER.USER.PROFILE);
                    }}
                    className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                      bg-gradient-to-r from-[#9333EA] to-[#6366F1] hover:from-[#A755F2] hover:to-[#7B83F3] 
                      text-white shadow-lg shadow-[#9333EA]/30"
                  >
                    <CreditCard className="w-4 h-4" />
                    Đến trang hồ sơ
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WithdrawalPage;

