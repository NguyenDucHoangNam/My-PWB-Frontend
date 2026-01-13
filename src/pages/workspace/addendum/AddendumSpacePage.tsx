import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Rocket,
  FileText,
  Loader2,
  BadgeAlert,
  Satellite,
  Calendar,
  DollarSign,
  CheckCircle2,
  X,
  AlertTriangle,
} from "lucide-react";
import contractService, { type LatestAddendumMetadata, type AddendumItem } from "../../../services/contractService";
import projectService, { type ProjectPermissionResponse } from "../../../services/projectService";
import { ROUTER } from "../../../routes/router";
import AnimatedBackground from "@/component/background/AnimatedBackground";
import BackToProjectButton from "@/component/buttons/BackToProjectButton";
import { useCosmicToast } from "@/component/toast/CosmicToastProvider";
import paymentService from "../../../services/paymentService";

// Helper function to translate status to Vietnamese
const translateStatus = (status: string | null | undefined): string => {
  if (!status) return "N/A";

  const map: Record<string, string> = {
    DRAFT: "Nháp",
    OUT_FOR_SIGNATURE: "Chờ ký",
    PARTIALLY_SIGNED: "Đang ký",
    SIGNED: "Đã ký",
    PAID: "Đã thanh toán",
    COMPLETED: "Hoàn tất",
    DECLINED: "Từ chối",
    CANCELLED: "Hủy",
    VOIDED: "Hủy hiệu lực",
    EXPIRED: "Hết hạn",
    PENDING: "Đang xử lý",
    FILLED: "Đã điền",
  };

  return map[status] || status;
};

export default function AddendumSpacePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const projectId = params.get("id");
  const contractId = params.get("contractId");
  const addendumNumberParam = params.get("addendumNumber");
  const selectedAddendumNumber = addendumNumberParam ? Number(addendumNumberParam) : null;
  const { showToast } = useCosmicToast();

  const [permissions, setPermissions] = useState<ProjectPermissionResponse | null>(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState<boolean>(true);

  const [metadata, setMetadata] = useState<LatestAddendumMetadata | null>(null);
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);
  const [declineReason, setDeclineReason] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState<boolean>(false);
  const [paymentOrderCode, setPaymentOrderCode] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  // (Optional) latest payment - hiện chưa dùng để render UI, nhưng có thể dùng sau này nếu cần chi tiết giao dịch
  // const [latestPayment, setLatestPayment] = useState<PaymentStatusResult | null>(null);

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
      } catch (error: any) {
        showToast(error.message || "Không thể tải thông tin quyền truy cập phụ lục.", "error");
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    loadPermissions();
  }, [projectId, showToast]);

  const canViewAddendum = useMemo(
    () => permissions == null || permissions.addendum?.canViewAddendum !== false,
    [permissions]
  );

  const canCreateAddendumPayment = useMemo(
    () => permissions?.addendum?.canCreateAddendumPayment === true,
    [permissions]
  );

  const canCreateAddendum = useMemo(
    () => permissions?.addendum?.canCreateAddendum === true,
    [permissions]
  );

  const canInviteToSignAddendum = useMemo(
    () => permissions?.addendum?.canInviteToSign === true,
    [permissions]
  );

  const canDeclineAddendum = useMemo(() => {
    if (!permissions || !metadata) return false;
    const isAdmin = permissions.role.userRole === "ADMIN";
    const isClient = permissions.role.projectRole === "CLIENT";
    // Không thể từ chối khi đã ký (SIGNED, PAID) hoặc đã từ chối
    if (metadata.signnowStatus === "SIGNED" || 
        metadata.signnowStatus === "PAID" || 
        metadata.signnowStatus === "DECLINED") return false;
    return isAdmin || isClient;
  }, [permissions, metadata]);

  // Helper function to get PARTIALLY_SIGNED message based on user role
  const getPartiallySignedMessage = useMemo(() => {
    if (!permissions?.role) return "Đang ký một phần";
    const projectRole = permissions.role.projectRole;
    const userRole = permissions.role.userRole;
    // Owner or Producer (project owner) has already signed, waiting for client
    if (projectRole === "OWNER" || userRole === "PRODUCER") {
      return "Bạn đã ký rồi, đang đợi khách hàng ký";
    } else if (projectRole === "CLIENT") {
      return "Đang đợi bạn ký để hoàn thành";
    }
    return "Đang ký một phần";
  }, [permissions]);

  // Kiểm tra đã thanh toán: PAID hoặc COMPLETED (vì COMPLETED đã bao gồm PAID)
  const isPaid = useMemo(() => {
    if (!metadata?.signnowStatus) return false;
    return metadata.signnowStatus === "PAID" || metadata.signnowStatus === "COMPLETED";
  }, [metadata]);

  const paymentStatusLabel = useMemo(() => {
    if (!metadata) return "CHƯA THANH TOÁN";
    
    if (isPaid || paymentStatus === "SUCCESSFUL") return "ĐÃ THANH TOÁN";
    if (paymentStatus === "PENDING") return "ĐANG CHỜ";
    if (paymentStatus === "FAILED") return "THẤT BẠI";
    return "CHƯA THANH TOÁN";
  }, [metadata, paymentStatus, isPaid]);

  // Kiểm tra đã ký: SIGNED hoặc PAID
  const isSigned = useMemo(() => {
    if (!metadata?.signnowStatus) return false;
    return ["SIGNED", "PAID"].includes(metadata.signnowStatus);
  }, [metadata]);

  // Kiểm tra có thể thanh toán: chỉ khi SIGNED
  const canPay = useMemo(() => {
    if (!metadata?.signnowStatus) return false;
    return metadata.signnowStatus === "SIGNED";
  }, [metadata]);

  // Chỉ hiển thị nút tạo phụ lục khi:
  // - Có quyền tạo phụ lục
  // - Đã quét dữ liệu (hasChecked)
  // - Phụ lục hiện tại CHƯA được thanh toán (dựa trên status hoặc paymentStatus)
  const canShowCreateAddendumButton = useMemo(() => {
    if (!canCreateAddendum || !hasChecked) return false;
    if (!metadata) return true; // Chưa có phụ lục nào -> cho tạo
    
    if (isPaid) return false;
    if (paymentStatus === "SUCCESSFUL") return false;
    return true;
  }, [canCreateAddendum, hasChecked, metadata, paymentStatus, isPaid]);

  const paymentStorageKey = useMemo(
    () => (metadata ? `pay_addendum_order_${metadata.id}` : null),
    [metadata]
  );

  async function handleLoadLatestAddendum() {
    if (!contractId) {
      showToast("Không tìm thấy contractId cho phụ lục.", "error");
      return;
    }
    try {
      setIsLoadingMetadata(true);

      // Lấy danh sách phụ lục: mỗi phần tử đã là phiên bản mới nhất của từng số phụ lục (BE đã group theo addendumNumber)
      const items: AddendumItem[] = await contractService.getAllAddendums(contractId);
      setHasChecked(true);

      if (!items || items.length === 0) {
        showToast("Chưa có phụ lục nào cho hợp đồng này.", "success");
        setMetadata(null);
        setDeclineReason(null);
        return;
      }

      // Nếu có addendumNumber trên URL → chọn đúng phụ lục đó (phiên bản mới nhất của số phụ lục đó)
      let latest: AddendumItem | null = null;
      if (selectedAddendumNumber && !Number.isNaN(selectedAddendumNumber)) {
        latest = items.find((i) => i.addendumNumber === selectedAddendumNumber) || null;
      }

      // Nếu không truyền addendumNumber, hoặc không tìm thấy phụ lục tương ứng → fallback lấy phụ lục có addendumNumber lớn nhất
      if (!latest) {
        latest = items.reduce((prev, cur) =>
          cur.addendumNumber > prev.addendumNumber ? cur : prev
        );
      }

      // Map AddendumItem -> LatestAddendumMetadata (các field chi tiết tiền thuế sẽ được cập nhật qua API/payment khác nếu cần)
      const meta: LatestAddendumMetadata = {
        id: latest.id,
        addendumNumber: latest.addendumNumber,
        title: latest.title,
        version: latest.version,
        effectiveDate: latest.effectiveDate,
        signnowStatus: latest.signnowStatus,
        numOfMoney: null,
        numOfEdit: null,
        numOfRefresh: null,
        pitTax: null,
        vatTax: null,
        // isPaid được tính từ status: PAID hoặc COMPLETED
        isPaid: latest.signnowStatus === "PAID" || latest.signnowStatus === "COMPLETED",
        documentVersion: latest.version,
        documentType: latest.documentType,
        documentUrl: latest.documentUrl,
      };

      setMetadata(meta);
      showToast("Đã tải dữ liệu phụ lục (phiên bản mới nhất cho từng phụ lục).", "success");

      if (meta.signnowStatus === "DECLINED") {
        try {
          const reason = await contractService.getLatestAddendumDeclineReason(contractId);
          setDeclineReason(reason);
        } catch (e: any) {
          console.warn("Could not load addendum decline reason:", e?.message || e);
          setDeclineReason(null);
        }
      } else {
        setDeclineReason(null);
      }
      // Trạng thái thanh toán sẽ được đồng bộ tự động qua các effect khác (polling + load latest payment).
    } catch (e: any) {
      showToast(e.message || "Không thể tải thông tin phụ lục.", "error");
      setHasChecked(true);
    } finally {
      setIsLoadingMetadata(false);
    }
  }

  const handleOpenFilledFile = async () => {
    if (!contractId) return;
    try {
      await contractService.openLatestAddendumFilledFile(contractId);
    } catch (e: any) {
      showToast(e.message || "Không thể mở file phụ lục đã điền.", "error");
    }
  };

  const handleOpenSignedFile = async () => {
    if (!contractId) return;
    try {
      await contractService.openLatestAddendumSignedFile(contractId);
    } catch (e: any) {
      showToast(e.message || "Không thể mở file phụ lục đã ký.", "error");
    }
  };

  const handleInviteSigning = async () => {
    if (!contractId || !metadata || isInviting) return;
    try {
      setIsInviting(true);
      await contractService.sendAddendumInvites(contractId, {});
      showToast("Đã gửi tín hiệu ký phụ lục.", "success");
      // Reload latest addendum to reflect new status
      const meta = await contractService.getLatestAddendum(contractId);
      setMetadata(meta);
    } catch (e: any) {
      showToast(e.message || "Không thể gửi tín hiệu ký phụ lục.", "error");
    } finally {
      setIsInviting(false);
    }
  };

  const handleCreateAddendumPayment = async () => {
    if (!projectId || !contractId || !metadata || isCreatingPayment) return;
    try {
      setIsCreatingPayment(true);
      const base = window.location.origin;
      const returnUrl = `${base}${ROUTER.USER.CONTRACT_PAYMENT_RETURN}?projectId=${projectId}&contractId=${contractId}`;
      const cancelUrl = `${base}${ROUTER.USER.CONTRACT_PAYMENT_CANCEL}?projectId=${projectId}&contractId=${contractId}`;
      const result = await paymentService.createAddendumPaymentLink(projectId, contractId, {
        returnUrl,
        cancelUrl,
      });
      // Lưu orderCode vào localStorage để có thể resume poll sau redirect (use localStorage for _blank tab support)
      const storageKey = `pay_addendum_order_${metadata.id}`;
      localStorage.setItem(storageKey, result.orderCode);
      sessionStorage.setItem(storageKey, result.orderCode); // Keep for backward compatibility
      setPaymentOrderCode(result.orderCode);
      setPaymentStatus(result.status || "PENDING");
      window.open(result.paymentUrl, "_blank", "noopener,noreferrer");
      showToast("Đã tạo liên kết thanh toán phụ lục. Vui lòng hoàn tất trên PayOS.", "success");
    } catch (e: any) {
      showToast(e.message || "Không thể tạo liên kết thanh toán phụ lục.", "error");
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleDeclineClick = () => {
    if (!metadata) return;
    setShowDeclineModal(true);
    setDeclineInput("");
  };

  const handleDeclineCancel = () => {
    setShowDeclineModal(false);
    setDeclineInput("");
  };

  const handleDeclineSubmit = async () => {
    if (!contractId || !declineInput.trim() || !metadata) {
      showToast("Vui lòng nhập lý do từ chối", "error");
      return;
    }

    if (declineInput.trim().length < 10) {
      showToast("Lý do từ chối phải có ít nhất 10 ký tự", "error");
      return;
    }

    setIsDeclining(true);
    try {
      await contractService.declineAddendum(contractId, declineInput.trim());
      showToast("Đã từ chối phụ lục.", "success");
      const meta = await contractService.getLatestAddendum(contractId);
      setMetadata(meta);

      if (meta && meta.signnowStatus === "DECLINED") {
        try {
          const reason = await contractService.getLatestAddendumDeclineReason(contractId);
          setDeclineReason(reason);
        } catch (e: any) {
          console.warn("Could not load addendum decline reason after decline:", e?.message || e);
          setDeclineReason(null);
        }
      } else {
        setDeclineReason(null);
      }

      setShowDeclineModal(false);
      setDeclineInput("");
    } catch (e: any) {
      showToast(e.message || "Không thể từ chối phụ lục.", "error");
    } finally {
      setIsDeclining(false);
    }
  };

  // Decline modal state
  const [showDeclineModal, setShowDeclineModal] = useState<boolean>(false);
  const [declineInput, setDeclineInput] = useState<string>("");
  const [isDeclining, setIsDeclining] = useState<boolean>(false);

  // Resume polling nếu có orderCode lưu trong sessionStorage (sau khi quay lại từ PayOS)
  useEffect(() => {
    if (!paymentStorageKey) return;
    const stored = localStorage.getItem(paymentStorageKey) || sessionStorage.getItem(paymentStorageKey);
    if (stored) {
      setPaymentOrderCode(stored);
      setPaymentStatus((prev) => prev || "PENDING");
    }
  }, [paymentStorageKey]);

  // Tự động load payment mới nhất khi đã có metadata & quyền xem thanh toán phụ lục
  useEffect(() => {
    const loadLatest = async () => {
      if (!projectId || !contractId || !metadata || !canCreateAddendumPayment) return;
      try {
        const latest = await paymentService.getLatestByAddendum(projectId, contractId);
        
        if (isPaid) {
          setPaymentStatus("SUCCESSFUL");
        } else if (latest?.status) {
          setPaymentStatus(latest.status);
        }
      } catch (e: any) {
        console.warn("Could not load latest addendum payment on mount:", e?.message || e);
      }
    };

    if (canCreateAddendumPayment && metadata) {
      // Nếu đã paid thì ưu tiên SUCCESSFUL
      if (isPaid) {
        setPaymentStatus("SUCCESSFUL");
      }
      loadLatest();
    }
  }, [projectId, contractId, metadata, canCreateAddendumPayment, isPaid]);

  // Poll trạng thái thanh toán theo orderCode (giống ContractSpacePage) để bắt webhook real-time
  useEffect(() => {
    if (!paymentOrderCode) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const status = await paymentService.getPaymentStatus(paymentOrderCode);
        if (cancelled) return;
        setPaymentStatus(status.status);

        if (status.status !== "PENDING") {
          clearInterval(interval);
          // Clear stored order code
          if (paymentStorageKey) {
            localStorage.removeItem(paymentStorageKey);
            sessionStorage.removeItem(paymentStorageKey);
          }
          // Ngừng polling cho orderCode hiện tại
          setPaymentOrderCode(null);

          if (status.status === "SUCCESSFUL") {
            showToast("Thanh toán phụ lục thành công. Đang cập nhật dữ liệu...", "success");
            // Refresh latest addendum metadata (BE đã update isPaid qua webhook)
            if (contractId) {
              try {
                const meta = await contractService.getLatestAddendum(contractId);
                setMetadata(meta);
              } catch (e) {
                console.warn("Could not refresh addendum metadata after successful payment:", e);
              }
            }
          } else if (status.status === "FAILED") {
            showToast("Thanh toán phụ lục thất bại. Vui lòng thử lại.", "error");
          }
        }
      } catch (e: any) {
        console.warn("Addendum payment status polling error:", e?.message || e);
      }
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [paymentOrderCode, paymentStorageKey, contractId, showToast]);

  return (
    <div className="relative min-h-screen text-white overflow-hidden mt-[73px]">
      <AnimatedBackground />

      <div className="max-w-7xl mx-auto relative z-10 p-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="relative p-4 rounded-3xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-400/40 backdrop-blur-sm shadow-2xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 animate-pulse" />
              <Rocket className="relative text-purple-300 w-8 h-8 animate-bounce" style={{ animationDuration: "2s" }} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
            </div>
            <div>
              <h1 className="mt-1 text-3xl md:text-4xl font-extrabold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.35)]">
                  Trạm Phụ Lục — Giao ước Bổ sung
                </span>
              </h1>
              <div className="relative mt-3 h-1 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-70" />
                <div className="absolute -left-1/3 top-0 h-full w-1/3 bg-white/60 blur-md animate-[pulse_2s_ease-in-out_infinite]" />
              </div>
              <div className="mt-2 flex items-center gap-2 text-pink-200/80 text-sm">
                <Satellite className="w-4 h-4 text-pink-400 animate-pulse" />
                <span>Theo dõi phụ lục mới nhất của Giao ước</span>
              </div>
            </div>
          </div>

          <BackToProjectButton projectId={projectId} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {!isLoadingPermissions && permissions && permissions.addendum?.canViewAddendum === false && (
            <div className="lg:col-span-12">
              <div className="space-station-card border-red-500/50 bg-gradient-to-br from-red-500/10 to-red-600/5 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/40">
                    <BadgeAlert className="text-red-400" size={28} />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                  </div>
                  <div>
                    <h3 className="text-red-300 font-black text-xl flex items-center gap-2">
                      <Satellite className="w-6 h-6 text-red-400 animate-pulse" />
                      CẢNH BÁO TRUY CẬP
                    </h3>
                    <p className="text-red-200/90 text-base mt-2 font-semibold">
                      🚫 {permissions.reason || "Không có quyền truy cập vào trạm phụ lục này."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {canViewAddendum && (
            <>
              <section className="lg:col-span-7 flex flex-col gap-8">
                {/* Addendum Management Card */}
                <div className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 rounded-3xl p-6 shadow-2xl hover:shadow-purple-500/50 transition-all duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300 flex items-center gap-3">
                      <FileText className="w-8 h-8 text-purple-400 animate-pulse" />
                      TRUNG TÂM PHỤ LỤC
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Create Addendum Button - logic khác ContractSpace: luôn cho phép tạo mới,
                        bất kể phụ lục hiện tại đã PAID hay chưa (BE xử lý version/addendumNumber). */}
                    {canShowCreateAddendumButton && (
                      <button
                        onClick={() =>
                          navigate(
                            `${ROUTER.USER.CREATE_ADDENDUM}?id=${projectId || ""}&contractId=${contractId || ""}`
                          )
                        }
                        className="group relative rounded-2xl px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-xl hover:shadow-2xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
                      >
                        <Rocket size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                        <span>
                          {!metadata
                            ? "KHỞI TẠO PHỤ LỤC MỚI"
                            : metadata.signnowStatus !== "PAID"
                            ? `TẠO PHIÊN BẢN MỚI CHO PHỤ LỤC ${metadata.addendumNumber}`
                            : "TẠO PHỤ LỤC MỚI (SỐ TIẾP THEO)"}
                        </span>
                      </button>
                    )}

                    {/* Scan & Actions Column */}
                    <div className="space-y-3">
                      <button
                        onClick={handleLoadLatestAddendum}
                        disabled={!contractId || isLoadingMetadata}
                        className="group relative w-full rounded-2xl px-6 py-4 bg-white/10 border border-white/20 backdrop-blur-sm text-white font-semibold shadow-md hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingMetadata ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Đang quét phụ lục...</span>
                          </>
                        ) : (
                          <>
                            <FileText size={18} className="group-hover:scale-110 transition-transform duration-300" />
                            <span>Quét Dữ Liệu Phụ Lục</span>
                          </>
                        )}
                      </button>

                      {metadata && (
                        <div className="space-y-3">
                          {canInviteToSignAddendum && metadata.signnowStatus && metadata.signnowStatus !== "SIGNED" && metadata.signnowStatus !== "PAID" && metadata.signnowStatus !== "DECLINED" && (
                            <button
                              onClick={handleInviteSigning}
                              disabled={isInviting}
                              className={`w-full rounded-2xl px-4 py-3 font-semibold text-sm transition-all duration-300 ${
                                isInviting
                                  ? "bg-gray-600/50 text-gray-300 cursor-not-allowed"
                                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-xl hover:shadow-pink-500/25"
                              }`}
                            >
                              {isInviting ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Đang gửi tín hiệu ký...</span>
                                </div>
                              ) : (
                                <span>Mời ký phụ lục</span>
                              )}
                            </button>
                          )}

                          {canCreateAddendumPayment && (
                            <div className="rounded-2xl px-4 py-3 bg-emerald-500/10 border border-emerald-400/40 text-emerald-100 text-sm flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-300" />
                                <span className="font-semibold">Trạng thái thanh toán:</span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold border border-emerald-400/40 bg-emerald-500/10">
                                  {paymentStatusLabel}
                                </span>
                              </div>
                              {typeof metadata.numOfMoney === "number" && (
                                <span className="text-xs text-emerald-200/80">
                                  Giá trị phụ lục:{" "}
                                  <span className="font-semibold">{metadata.numOfMoney.toLocaleString()} đ</span>
                                </span>
                              )}

                              {paymentStatus !== "SUCCESSFUL" && !isPaid && (
                                <button
                                  onClick={handleCreateAddendumPayment}
                                  disabled={isCreatingPayment || !canPay}
                                  className={`mt-1 inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                                    isCreatingPayment || !canPay
                                      ? "bg-gray-600/60 text-gray-300 cursor-not-allowed"
                                      : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-md hover:shadow-lg hover:shadow-emerald-500/30"
                                  }`}
                                >
                                  {isCreatingPayment ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                      <span>Đang tạo liên kết...</span>
                                    </>
                                  ) : (
                                    <span>Thanh toán phụ lục</span>
                                  )}
                                </button>
                              )}

                              {paymentOrderCode && (
                                <p className="text-[11px] text-emerald-200/70">
                                  Mã giao dịch phụ lục: <span className="font-mono">{paymentOrderCode}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    {!hasChecked && (
                      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
                        <p className="text-blue-200/90 text-sm font-medium">
                          💡 Bấm "Quét Dữ Liệu Phụ Lục" để kiểm tra phụ lục mới nhất của hợp đồng.
                        </p>
                      </div>
                    )}
                    {hasChecked && !metadata && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
                        <p className="text-amber-200/90 text-sm font-medium">
                          📄 Chưa có phụ lục nào cho hợp đồng này.
                        </p>
                      </div>
                    )}
                    {hasChecked && metadata && metadata.signnowStatus === "PARTIALLY_SIGNED" && (
                      <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
                        <p className="text-yellow-200/90 text-sm font-medium">
                          ⚠️ {getPartiallySignedMessage}
                        </p>
                      </div>
                    )}
                    {hasChecked && metadata && isSigned && (
                      <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 backdrop-blur-sm">
                        <p className="text-green-200/90 text-sm font-medium">
                          ✅ {isPaid ? "Phụ lục đã ký và đã thanh toán (Hoàn tất)." : "Phụ lục đã ký, chưa thanh toán."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Right side: preview & actions */}
              <aside className="lg:col-span-5 space-y-8">
                <div className="dashboard-card group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
                  <div>
                    <div className="aspect-[3/4] w-full bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl border border-white/20 flex items-center justify-center overflow-hidden backdrop-blur-sm shadow-lg">
                      {metadata?.documentUrl ? (
                        <iframe
                          src={metadata.documentUrl}
                          className="w-full h-full rounded-xl"
                        />
                      ) : (
                        <div className="text-center p-8">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-purple-400" />
                          </div>
                          <p className="text-gray-300 text-sm font-medium">Không có dữ liệu phụ lục để hiển thị</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <span className="px-3 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/30 text-blue-200 text-sm font-medium">
                        📄 Trạng thái: {translateStatus(metadata?.signnowStatus)}
                      </span>
                      <span className="px-3 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/10 border border-purple-500/30 text-purple-200 text-sm font-medium">
                        🔢 Version: {metadata?.documentVersion ?? metadata?.version ?? "-"}
                      </span>
                      <span className="px-3 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/10 border border-orange-500/30 text-orange-200 text-sm font-medium">
                        📋 Type: {translateStatus(metadata?.documentType)}
                      </span>
                      {metadata && (
                        <span className="px-3 py-2 rounded-full bg-gradient-to-r from-teal-500/20 to-teal-600/10 border border-teal-500/30 text-teal-200 text-sm font-medium">
                          👑 Phụ lục số {metadata.addendumNumber} — Version {metadata.version}
                        </span>
                      )}
                      {typeof metadata?.effectiveDate === "string" && (
                        <span className="px-3 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-green-600/10 border border-green-500/30 text-green-200 text-sm font-medium">
                          <Calendar className="inline-block w-4 h-4 mr-1" />
                          Ngày hiệu lực: {metadata.effectiveDate}
                        </span>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 items-center">
                      {metadata && canDeclineAddendum && (
                        <button
                          onClick={handleDeclineClick}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-sm font-medium text-white shadow-lg hover:shadow-red-500/30 transition-all duration-200"
                        >
                          <BadgeAlert size={18} className="text-red-200" />
                          <span>Từ chối phụ lục</span>
                        </button>
                      )}

                      {metadata && (
                        <>
                          {metadata?.signnowStatus === "PARTIALLY_SIGNED" && (
                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
                              <CheckCircle2 size={20} className="text-yellow-400" />
                              <span className="text-yellow-300 font-semibold">{getPartiallySignedMessage}</span>
                            </div>
                          )}
                          {isSigned && (
                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                              <CheckCircle2 size={20} className="text-green-400" />
                              <span className="text-green-300 font-semibold">
                                {isPaid ? "Phụ lục đã ký và đã thanh toán (Hoàn tất)" : "Phụ lục đã ký, chưa thanh toán"}
                              </span>
                            </div>
                          )}

                          <button
                            onClick={handleOpenFilledFile}
                            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm font-medium hover:bg-white/20 transition-colors duration-200"
                          >
                            Xem bản đã điền
                          </button>

                          {(metadata.documentType === "SIGNED" ||
                            isSigned ||
                            metadata.signnowStatus === "PARTIALLY_SIGNED" ||
                            metadata.signnowStatus === "DECLINED") && (
                            <button
                              onClick={handleOpenSignedFile}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm font-medium shadow-lg hover:shadow-pink-500/30 transition-all duration-200"
                            >
                              Xem bản đã ký
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {metadata?.signnowStatus === "DECLINED" && declineReason && (
                  <div className="dashboard-card border-red-500/50 bg-red-500/10">
                    <div className="card-header">
                      <BadgeAlert className="icon text-red-400" />
                      <h3 className="card-title text-red-300">Lý do từ chối phụ lục</h3>
                    </div>
                    <div className="mt-4">
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <p className="text-red-200 text-sm leading-relaxed">{declineReason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </aside>
            </>
          )}
        </div>
      </div>

      <style>{`
        .space-station-card { 
          @apply bg-gradient-to-br from-slate-900/60 to-slate-800/80 backdrop-blur-xl border border-purple-400/30 rounded-3xl p-8 shadow-2xl;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.8) 100%);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.6), 
            0 0 0 1px rgba(168, 85, 247, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
        }
        .space-station-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 24px;
          padding: 2px;
          background: linear-gradient(45deg, rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3), rgba(34, 197, 94, 0.3));
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          opacity: 0.6;
        }
        .card-header { @apply flex items-center gap-6; }
        .card-title { @apply text-2xl font-black; }
        .dashboard-card {
          @apply bg-gradient-to-br from-slate-900/70 to-slate-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl;
        }
      `}</style>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleDeclineCancel}
        >
          <div
            className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
              {/* Close Button */}
              <button
                onClick={handleDeclineCancel}
                className="absolute top-4 right-4 p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-colors duration-200"
              >
                <X size={20} className="text-red-400" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/40">
                  <AlertTriangle className="text-red-400" size={24} />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-300">
                    Từ chối Phụ lục
                  </h3>
                  <p className="text-red-200/80 text-sm">
                    Vui lòng cung cấp lý do từ chối phụ lục
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lý do từ chối <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={declineInput}
                    onChange={(e) => setDeclineInput(e.target.value)}
                    placeholder="Nhập lý do từ chối phụ lục..."
                    className="w-full h-48 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 resize-none"
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Tối thiểu 10 ký tự
                  </p>
                </div>

                {/* Warning */}
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-200/90 text-sm">
                      Hành động này không thể hoàn tác. Phụ lục sẽ bị từ chối vĩnh viễn.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleDeclineCancel}
                  disabled={isDeclining}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-colors duration-200 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeclineSubmit}
                  disabled={isDeclining || !declineInput.trim() || declineInput.trim().length < 10}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/25"
                >
                  {isDeclining ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    "Xác nhận từ chối"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
