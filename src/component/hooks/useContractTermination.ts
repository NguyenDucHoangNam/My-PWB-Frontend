import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import contractService from "../../services/contractService";
import paymentService from "../../services/paymentService";
import toast from "react-hot-toast";
import { ROUTER } from "../../routes/router";
import type {
  TerminationPreviewResponse,
  TerminationExecuteResponse,
  TerminationDetailResponse,
} from "../../types/contract";

interface UseContractTerminationOptions {
  contractId: string | null;
  projectId?: string | null;
}

interface UseContractTerminationReturn {
  // Modal state
  isModalOpen: boolean;
  handleOpenModal: () => Promise<void>;
  handleCloseModal: () => void;

  // Preview state
  loading: boolean;
  previewData: TerminationPreviewResponse | null;
  error: string | null;
  handleCheckCompensation: () => Promise<void>;

  // Termination execution state
  terminationReason: string;
  setTerminationReason: (reason: string) => void;
  isExecuting: boolean;
  terminationResult: TerminationExecuteResponse | null;
  handleExecuteTermination: () => Promise<void>;

  // Payment state
  paymentOrderCode: string | null;
  paymentStatus: string | null;

  // Termination detail state
  terminationDetail: TerminationDetailResponse | null;
  isLoadingDetail: boolean;
  isLoadingTerminationDetail: boolean;
  hasNoTermination: boolean;
  handleLoadTerminationDetail: () => Promise<void>;
}

export const useContractTermination = ({
  contractId,
  projectId,
}: UseContractTerminationOptions): UseContractTerminationReturn => {
  const navigate = useNavigate();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Preview state
  const [loading, setLoading] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<TerminationPreviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Termination execution states
  const [terminationReason, setTerminationReason] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [terminationResult, setTerminationResult] = useState<TerminationExecuteResponse | null>(null);
  const [paymentOrderCode, setPaymentOrderCode] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  // Termination detail states
  const [terminationDetail, setTerminationDetail] = useState<TerminationDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [isLoadingTerminationDetail, setIsLoadingTerminationDetail] = useState<boolean>(false);
  const [hasNoTermination, setHasNoTermination] = useState<boolean>(false);

  // Payment storage key for sessionStorage
  const paymentStorageKey = contractId ? `termination_pay_order_${contractId}` : null;

  // Define handleCloseModal before useEffect that uses it
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Reset termination states when closing modal
    setTerminationReason("");
    setTerminationResult(null);
    setPaymentOrderCode(null);
    setPaymentStatus(null);
  }, []);

  const handleOpenModal = useCallback(async () => {
    setIsModalOpen(true);
    setError(null);
    // Tự động gọi API khi mở modal nếu chưa có previewData
    // Để tránh phải bấm thêm 1 lần nữa
    if (!previewData && contractId) {
      // Gọi handleCheckCompensation ngay khi mở modal
      try {
        setLoading(true);
        setError(null);
        const data = await contractService.previewTermination(contractId);
        setPreviewData(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Không thể tải thông tin chấm dứt hợp đồng.";

        // Nếu hợp đồng đã được chấm dứt, hiển thị thông báo thông tin (không phải lỗi)
        if (errorMessage.includes("đã được chấm dứt") || errorMessage.includes("CONTRACT_ALREADY_TERMINATED")) {
          // Set error với message đặc biệt để hiển thị như thông báo thông tin
          setError("CONTRACT_ALREADY_TERMINATED_INFO");
        } else {
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    }
  }, [contractId, previewData]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isModalOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModalOpen, handleCloseModal]);

  // Tự động đóng modal khi CLIENT termination thành công và đã có termination detail
  // OWNER termination sẽ KHÔNG đóng modal để user thấy success state (giống ContractSpacePage - không reload)
  useEffect(() => {
    if (
      isModalOpen &&
      terminationResult &&
      terminationResult.terminationId &&
      terminationResult.newStatus === "TERMINATED" &&
      terminationDetail &&
      terminationDetail.terminatedBy === "CLIENT" // Chỉ đóng modal cho CLIENT termination
    ) {
      // Đóng modal sau một chút để user thấy success message
      const timer = setTimeout(() => {
        setIsModalOpen(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen, terminationResult, terminationDetail]);

  const handleCheckCompensation = useCallback(async () => {
    if (!contractId) {
      setError("Thiếu contractId. Vui lòng kiểm tra lại URL.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await contractService.previewTermination(contractId);
      setPreviewData(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Không thể tải thông tin chấm dứt hợp đồng.";

      // Nếu hợp đồng đã được chấm dứt, hiển thị thông báo thông tin (không phải lỗi)
      if (errorMessage.includes("đã được chấm dứt") || errorMessage.includes("CONTRACT_ALREADY_TERMINATED")) {
        // Set error với message đặc biệt để hiển thị như thông báo thông tin
        setError("CONTRACT_ALREADY_TERMINATED_INFO");
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  // Resume polling if we have a stored order code (after return from PayOS)
  useEffect(() => {
    if (!paymentStorageKey) return;
    const stored = localStorage.getItem(paymentStorageKey) || sessionStorage.getItem(paymentStorageKey);
    if (stored) {
      setPaymentOrderCode(stored);
      setPaymentStatus("PENDING");
    }
  }, [paymentStorageKey]);

  // Poll payment status every ~2.5s when we have an orderCode
  useEffect(() => {
    if (!paymentOrderCode) return;
    let cancelled = false;
    let notFoundRetryCount = 0;
    const maxNotFoundRetries = 3; // Stop after 3 consecutive "Not Found" errors
    const interval = setInterval(async () => {
      try {
        const status = await paymentService.getPaymentStatus(paymentOrderCode);
        if (cancelled) return;
        // Reset not found retry count on successful API call
        notFoundRetryCount = 0;
        setPaymentStatus(status.status);
        if (status.status !== "PENDING") {
          clearInterval(interval);
          // Clear stored order code
          if (paymentStorageKey) {
            localStorage.removeItem(paymentStorageKey);
            sessionStorage.removeItem(paymentStorageKey);
          }
          if (status.status === "SUCCESSFUL") {
            toast.success("Thanh toán thành công. Đang cập nhật dữ liệu...");
            // Clear payment order code để dừng polling
            setPaymentOrderCode(null);
            // Refresh termination detail (BE updates via webhook)
            if (contractId) {
              try {
                const detail = await contractService.getTerminationDetail(contractId);
                setTerminationDetail(detail);
                // Update termination result with completed status để UI tự động chuyển sang success state
                setTerminationResult({
                  terminationId: detail.terminationId,
                  contractId: detail.contractId,
                  newStatus: "TERMINATED",
                  terminationType: detail.terminationType,
                  message: "Hợp đồng đã được chấm dứt thành công.",
                  // Xóa paymentUrl để UI không còn hiển thị payment state
                  paymentUrl: undefined,
                  paymentOrderCode: undefined,
                });
                // Clear error and preview data
                setError(null);
                setPreviewData(null);
                // KHÔNG đóng modal, KHÔNG navigate - để user thấy success state trong modal
                // Modal sẽ tự động hiển thị success state vì terminationResult có terminationId và newStatus === "TERMINATED"
              } catch (err) {
                // Nếu load detail fail, vẫn cập nhật state để UI hiển thị success
                console.warn("Could not load termination detail after payment:", err);
                // Vẫn update terminationResult với thông tin từ payment status
                setTerminationResult(prev => prev ? {
                  ...prev,
                  newStatus: "TERMINATED",
                  message: "Thanh toán thành công. Hợp đồng đã được chấm dứt.",
                  paymentUrl: undefined,
                  paymentOrderCode: undefined,
                } : null);
                setPaymentOrderCode(null);
              }
            }
          } else if (status.status === "FAILED") {
            toast.error("Thanh toán thất bại. Vui lòng thử lại.");
            // Giữ nguyên terminationResult với paymentUrl để user có thể thử lại
            // Không clear paymentOrderCode để có thể retry
          }
        }
      } catch (e: unknown) {
        // Check if error is "Not Found" (8002)
        const errorWithResponse = e as {
          response?: {
            data?: {
              code?: number | string;
              error?: string;
              message?: string;
            };
            status?: number;
          };
          message?: string;
        };
        
        const errorCode = errorWithResponse?.response?.data?.code;
        const errorMessage = errorWithResponse?.response?.data?.message || errorWithResponse?.message || "";
        const isNotFound = 
          errorCode === 8002 || 
          errorCode === "8002" ||
          errorMessage.toLowerCase().includes("không tìm thấy") ||
          errorMessage.toLowerCase().includes("not found");
        
        if (isNotFound) {
          notFoundRetryCount++;
          console.warn(`Payment order code not found (attempt ${notFoundRetryCount}/${maxNotFoundRetries}):`, paymentOrderCode);
          
          // If we've retried multiple times and still get "Not Found", stop polling
          if (notFoundRetryCount >= maxNotFoundRetries) {
            clearInterval(interval);
            console.warn("Stopped polling: payment order code not found after multiple attempts");
            // Don't clear paymentOrderCode or show error - let user manually check or retry
            // The payment might still be processing on PayOS side
            return;
          }
        } else {
          // Reset counter for other errors
          notFoundRetryCount = 0;
        }
        
        // For other errors, continue polling (soft-fail)
        const errorMsg = e instanceof Error ? e.message : String(e);
        console.warn("Termination payment status polling error:", errorMsg);
      }
    }, 2500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [paymentOrderCode, paymentStorageKey, contractId]);

  // Load termination detail
  const handleLoadTerminationDetail = useCallback(async () => {
    if (!contractId) return;
    try {
      setIsLoadingDetail(true);
      const detail = await contractService.getTerminationDetail(contractId);
      setTerminationDetail(detail);
      // Set termination result để hiển thị success state
      setTerminationResult({
        terminationId: detail.terminationId,
        contractId: detail.contractId,
        newStatus: "TERMINATED",
        terminationType: detail.terminationType,
        message: "Hợp đồng đã được chấm dứt thành công.",
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.warn("Could not load termination detail:", errorMsg);
    } finally {
      setIsLoadingDetail(false);
    }
  }, [contractId]);

  // Auto-load termination detail on mount - gọi ngay khi vào trang
  useEffect(() => {
    if (!contractId) return;

    const loadTerminationInfoOnMount = async () => {
      try {
        setIsLoadingTerminationDetail(true);
        // Gọi API termination detail trước
        try {
          const detail = await contractService.getTerminationDetail(contractId);
          setTerminationDetail(detail);
          // Set termination result để hiển thị success state
          setTerminationResult({
            terminationId: detail.terminationId,
            contractId: detail.contractId,
            newStatus: "TERMINATED",
            terminationType: detail.terminationType,
            message: "Hợp đồng đã được chấm dứt thành công.",
          });
          setError(null); // Clear any error
          setHasNoTermination(false); // Clear no termination flag
          return; // Success, exit early
        } catch (detailErr: unknown) {
          // Kiểm tra nếu là lỗi 4001 (Not Found) - có nghĩa là chưa có chấm dứt
          const errorObj = detailErr as { 
            errorCode?: number | string; 
            status?: number;
            response?: { 
              data?: { 
                code?: number | string; 
                error?: string;
                message?: string;
              }; 
              status?: number;
            };
            message?: string;
          };
          
          // Lấy error code từ nhiều nguồn có thể
          const errorCode = errorObj?.errorCode || errorObj?.response?.data?.code || errorObj?.response?.data?.error;
          const status = errorObj?.status || errorObj?.response?.status;
          const errorMessage = (errorObj?.message || errorObj?.response?.data?.message || "").toLowerCase();
          
          // Kiểm tra các trường hợp lỗi "chưa chấm dứt" - bao gồm cả error code, status và message
          const isNotFoundError = 
            errorCode === 4001 || 
            errorCode === "4001" || 
            errorCode === "RESOURCE_NOT_FOUND" || 
            status === 404 ||
            errorMessage.includes("không tìm thấy") ||
            errorMessage.includes("not found") ||
            errorMessage.includes("chưa chấm dứt") ||
            errorMessage.includes("404");
          
          if (isNotFoundError) {
            // Chưa có thông tin chấm dứt - đây là trạng thái bình thường, không phải lỗi
            setError(null);
            setTerminationDetail(null);
            setTerminationResult(null);
            setHasNoTermination(true); // Mark that we checked and found no termination
            return;
          }
          
          // Nếu là lỗi khác, log và set error để hiển thị
          const errorMsg = errorObj?.message || "Unknown error";
          console.warn("Could not load termination detail:", errorMsg);
          setError(errorMsg);
          setHasNoTermination(false);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        console.error("Error loading termination info:", errorMsg);
      } finally {
        setIsLoadingTerminationDetail(false);
      }
    };

    loadTerminationInfoOnMount();
  }, [contractId]);

  // Handle termination execution
  const handleExecuteTermination = useCallback(async () => {
    if (!contractId) {
      toast.error("Thiếu contractId. Vui lòng kiểm tra lại URL.");
      return;
    }

    try {
      setIsExecuting(true);
      setError(null);

      const reason = terminationReason.trim() || undefined;
      
      // Tạo returnUrl và cancelUrl giống ContractSpacePage
      const base = window.location.origin;
      const returnUrl = `${base}${ROUTER.USER.TERMINATION_PAYMENT_RETURN}?projectId=${projectId || ''}&contractId=${contractId}`;
      const cancelUrl = `${base}${ROUTER.USER.TERMINATION_PAYMENT_CANCEL}?projectId=${projectId || ''}&contractId=${contractId}`;
      
      const result = await contractService.executeTermination(contractId, reason, returnUrl, cancelUrl);
      
      // Phân loại response theo 3 trạng thái:
      // 1. SUCCESS: terminationId tồn tại và newStatus === "TERMINATED"
      // 2. PAYMENT_REQUIRED: có paymentUrl (Owner cần thanh toán)
      // 3. ERROR: không có paymentUrl và không phải success
      
      // Trạng thái 1: SUCCESS ngay
      if (result.terminationId && result.newStatus === "TERMINATED") {
        setError(null); // Clear error
        setTerminationResult(result);
        setPreviewData(null); // Clear preview data
        toast.success(result.message || "Hợp đồng đã được chấm dứt thành công.");
        
        // Đóng modal ngay lập tức
        setIsModalOpen(false);
        
        // Gọi API termination detail và navigate về trang gốc
        if (contractId) {
          // Gọi API termination detail
          try {
            await handleLoadTerminationDetail();
          } catch (err) {
            // Nếu load detail fail, vẫn tiếp tục navigate
            console.warn("Could not load termination detail after termination:", err);
          }
          
          // Navigate về trang contract-termination để xem chi tiết
          if (contractId) {
            const params = new URLSearchParams();
            params.set("contractId", contractId);
            if (projectId) {
              params.set("id", projectId);
            }
            navigate(`${ROUTER.USER.CONTRACT_TERMINATION}?${params.toString()}`);
          }
        }
        return; // Exit early
      }
      
      // Trạng thái 2: PAYMENT_REQUIRED (Owner phải thanh toán)
      if (result.paymentUrl) {
        // Tuyệt đối không setError khi có paymentUrl - đây là flow bình thường
        setError(null);
        setTerminationResult(result);
        
        // Store order code to resume polling after redirect (use localStorage for _blank tab support)
        if (result.paymentOrderCode) {
          if (paymentStorageKey) {
            localStorage.setItem(paymentStorageKey, result.paymentOrderCode);
            sessionStorage.setItem(paymentStorageKey, result.paymentOrderCode); // Keep for backward compatibility
          }
          setPaymentOrderCode(result.paymentOrderCode);
        }
        setPaymentStatus("PENDING");

        toast.success("Đã tạo yêu cầu thanh toán. Đang mở trang thanh toán...");
        // Open PayOS checkout in a new tab
        window.open(result.paymentUrl, "_blank", "noopener,noreferrer");
        return; // Exit early
      }
      
      // Trạng thái 3: ERROR thật sự (không có paymentUrl và không phải success)
      setTerminationResult(result);
      const errorMessage = result.message || "Không thể thực hiện chấm dứt hợp đồng.";
      setError(errorMessage);
      toast.error(errorMessage);
    } catch (err: unknown) {
      // Trong catch, chỉ setError nếu không có paymentUrl trong response
      // (Service đã xử lý unwrap và return nếu có paymentUrl, nên nếu vào catch thì là lỗi thật)
      const errorMessage = err instanceof Error ? err.message : "Không thể thực hiện chấm dứt hợp đồng.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  }, [contractId, terminationReason, paymentStorageKey, handleLoadTerminationDetail, projectId, navigate]);

  return {
    // Modal state
    isModalOpen,
    handleOpenModal,
    handleCloseModal,

    // Preview state
    loading,
    previewData,
    error,
    handleCheckCompensation,

    // Termination execution state
    terminationReason,
    setTerminationReason,
    isExecuting,
    terminationResult,
    handleExecuteTermination,

    // Payment state
    paymentOrderCode,
    paymentStatus,

    // Termination detail state
    terminationDetail,
    isLoadingDetail,
    isLoadingTerminationDetail,
    hasNoTermination,
    handleLoadTerminationDetail,
  };
};
