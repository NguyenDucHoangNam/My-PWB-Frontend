import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket, Eye, Send, CheckCircle2, Users, BadgeAlert, FileText, Loader2, Music, Zap, Star, Satellite, Headphones, Volume2, X, AlertTriangle } from "lucide-react";
import contractService, { type ContractMetadata, calculateIsFunded } from "../../services/contractService";
import projectService, { type ProjectPermissionResponse } from "../../services/projectService";
import paymentService from "../../services/paymentService";
import milestoneService from "../../services/milestoneService";
import { ROUTER } from "../../routes/router";
import toast from "react-hot-toast";
import { useCosmicToast } from "../../component/toast/CosmicToastProvider";
import AnimatedBackground from "@/component/background/AnimatedBackground";
import BackToProjectButton from "@/component/buttons/BackToProjectButton";

// Helper function to translate status to Vietnamese
const translateStatus = (status: string | null | undefined): string => {
  if (!status) return "N/A";

  const statusMap: Record<string, string> = {
    "DRAFT": "Nháp",
    "OUT_FOR_SIGNATURE": "Chờ ký",
    "PARTIALLY_SIGNED": "Ký một phần",
    "SIGNED": "Đã ký",
    "PAID": "Đã thanh toán",
    "COMPLETED": "Hoàn tất",
    "TERMINATED": "Đã chấm dứt",
    "DECLINED": "Từ chối",
    "CANCELLED": "Hủy bỏ",
    "FILLED": "Đã điền",
    "OWNER": "Chủ sở hữu",
    "CLIENT": "Khách hàng",
    "PRODUCER": "Nhà sản xuất"
  };

  return statusMap[status] || status;
};

export default function ContractSpacePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const projectId = params.get("id");
  const { showToast } = useCosmicToast();
  const [metadata, setMetadata] = useState<ContractMetadata | null>(null);
  const [permissions, setPermissions] = useState<ProjectPermissionResponse | null>(null);
  const [pdfBlobUrl] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<string | null>(null);
  const [hasCheckedContract, setHasCheckedContract] = useState<boolean>(false);
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [showDeclineModal, setShowDeclineModal] = useState<boolean>(false);
  const [declineInput, setDeclineInput] = useState<string>("");
  const [isDeclining, setIsDeclining] = useState<boolean>(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState<boolean>(false);
  const [paymentOrderCode, setPaymentOrderCode] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [latestPayment, setLatestPayment] = useState<{ orderCode: string; status: string; amount: number; projectId: number; contractId: number } | null>(null);
  const [isLoadingLatest, setIsLoadingLatest] = useState<boolean>(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState<boolean>(true);
  const [paymentType, setPaymentType] = useState<string | null>(null);
  const [firstMilestoneId, setFirstMilestoneId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

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
        const errorMsg = error instanceof Error ? error.message : "Không thể tải thông tin truy cập trạm.";
        toast.error(errorMsg);
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    loadPermissions();
  }, [projectId]);

  useEffect(() => {
    const loadProjectPaymentTypeAndMilestone = async () => {
      if (!projectId) {
        setPaymentType(null);
        setFirstMilestoneId(null);
        return;
      }

      try {
        const details = await projectService.getProjectDetails(Number(projectId));
        const rawPaymentType = details?.paymentType ?? null;
        setPaymentType(
          typeof rawPaymentType === "string" ? rawPaymentType.toUpperCase() : null
        );

        if (typeof rawPaymentType === "string" && rawPaymentType.toUpperCase() === "MILESTONE") {
          try {
            const milestones = await milestoneService.getMilestones(Number(projectId));
            if (Array.isArray(milestones) && milestones.length > 0) {
              const sorted = [...milestones].sort(
                (a, b) => (a.sequence ?? 0) - (b.sequence ?? 0)
              );
              setFirstMilestoneId(sorted[0].id);
            } else {
              setFirstMilestoneId(null);
            }
          } catch (milestoneError) {
            console.warn("Không thể tải danh sách cột mốc:", milestoneError);
            setFirstMilestoneId(null);
          }
        } else {
          setFirstMilestoneId(null);
        }
      } catch (error) {
        console.warn("Không thể tải thông tin loại thanh toán của dự án:", error);
        setPaymentType(null);
        setFirstMilestoneId(null);
      }
    };

    loadProjectPaymentTypeAndMilestone();
  }, [projectId]);

  const canInvite = useMemo(() =>
    permissions?.contract?.canInviteToSign &&
    metadata &&
    metadata.signnowStatus &&
    ["DRAFT", "DECLINED", "OUT_FOR_SIGNATURE", "PARTIALLY_SIGNED"].includes(metadata.signnowStatus),
    [permissions, metadata]
  );

  // Tính isFunded từ status
  const isFunded = useMemo(() => {
    if (!metadata?.signnowStatus) return false;
    return calculateIsFunded(metadata.signnowStatus);
  }, [metadata]);

  // Kiểm tra đã ký: SIGNED, PAID, COMPLETED, hoặc TERMINATED
  const isSigned = useMemo(() => {
    if (!metadata?.signnowStatus) return false;
    return ["SIGNED", "PAID", "COMPLETED", "TERMINATED"].includes(metadata.signnowStatus);
  }, [metadata]);

  // Kiểm tra có thể thanh toán: chỉ khi SIGNED
  const canPay = useMemo(() => {
    if (!metadata?.signnowStatus) return false;
    return metadata.signnowStatus === "SIGNED";
  }, [metadata]);

  // Kiểm tra đã thanh toán: PAID, COMPLETED, hoặc TERMINATED
  const isPaid = useMemo(() => {
    if (!metadata?.signnowStatus) return false;
    return ["PAID", "COMPLETED", "TERMINATED"].includes(metadata.signnowStatus);
  }, [metadata]);

  // Logic mới: "Chưa nhận tiền thì chưa chốt, vẫn được phép xé nháp làm lại"
  // Cho phép tạo mới khi: chưa có hợp đồng HOẶC chưa thanh toán (chưa PAID/COMPLETED/TERMINATED)
  const canCreateNew = useMemo(() => {
    // Phải có quyền tạo hợp đồng
    if (!permissions?.contract?.canCreateContract) return false;

    // Nếu chưa có hợp đồng → cho phép
    if (!metadata) return true;

    // Nếu đã thanh toán (PAID, COMPLETED, hoặc TERMINATED) → không cho phép
    if (isPaid) return false;

    // Các trạng thái còn lại (DRAFT, OUT_FOR_SIGNATURE, PARTIALLY_SIGNED, SIGNED, DECLINED, v.v.) → cho phép
    return true;
  }, [permissions, metadata, isPaid]);

  // Client (bất kể userRole) có thể từ chối khi hợp đồng chưa ký (chưa SIGNED/PAID/COMPLETED/TERMINATED) và chưa bị từ chối
  const canDecline = useMemo(() => {
    const result = permissions?.role.projectRole === "CLIENT" &&
      metadata &&
      metadata.signnowStatus &&
      metadata.signnowStatus !== "SIGNED" &&
      metadata.signnowStatus !== "PAID" &&
      metadata.signnowStatus !== "COMPLETED" &&
      metadata.signnowStatus !== "TERMINATED" &&
      metadata.signnowStatus !== "DECLINED";

    // Debug logging
    console.log("Debug canDecline:", {
      userRole: permissions?.role.userRole,
      projectRole: permissions?.role.projectRole,
      metadata: metadata,
      signnowStatus: metadata?.signnowStatus,
      canDecline: result
    });

    return result;
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

  const paymentStorageKey = useMemo(() => metadata ? `pay_order_${metadata.id}` : null, [metadata]);

  // Resume polling if we have a stored order code (after return from PayOS)
  useEffect(() => {
    if (!paymentStorageKey) return;
    const stored = localStorage.getItem(paymentStorageKey) || sessionStorage.getItem(paymentStorageKey);
    if (stored) {
      setPaymentOrderCode(stored);
      setPaymentStatus("PENDING");
    }
  }, [paymentStorageKey]);

  // Load latest payment (Luồng 2): from any page
  useEffect(() => {
    const loadLatest = async () => {
      if (!projectId || !metadata) return;
      try {
        setIsLoadingLatest(true);
        const latest = await paymentService.getLatestByContract(projectId, metadata.id);
        setLatestPayment(latest);
        // Tính isFunded từ status, nếu đã funded thì set status thành công
        const calculatedFunded = calculateIsFunded(metadata.signnowStatus);
        const fundedValue = metadata.isFunded ?? metadata.is_funded;
        const isFundedValue = calculatedFunded || fundedValue === 1 || fundedValue === true;

        if (isFundedValue) {
          setPaymentStatus("SUCCESSFUL");
        } else {
          setPaymentStatus(latest?.status || null);
        }
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        console.warn("Could not load latest payment:", errorMsg);
      } finally {
        setIsLoadingLatest(false);
      }
    };
    if (permissions?.contract?.canViewContract && metadata) {
      // Tính isFunded từ status, nếu đã funded thì tự động set payment status thành công
      const calculatedFunded = calculateIsFunded(metadata.signnowStatus);
      const fundedValue = metadata.isFunded ?? metadata.is_funded;
      const isFundedValue = calculatedFunded || fundedValue === 1 || fundedValue === true;

      if (isFundedValue) {
        setPaymentStatus("SUCCESSFUL");
      }
      // Vẫn load latest payment để hiển thị thông tin chi tiết nếu có
      loadLatest();
    }
  }, [permissions?.contract?.canViewContract, metadata, projectId]);

  async function onInvite() {
    if (!metadata || isInviting) return;
    setIsInviting(true);
    try {
      await contractService.sendInvites(metadata.id, {});
      showToast("Đã phát tín hiệu Giao ước đến Đối tác Chỉ huy.", "success");
      const meta = await contractService.getContractMetadata(projectId!);
      setMetadata(meta);
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Không thể phát tín hiệu mời.";
      showToast(errorMsg, "error");
    } finally {
      setIsInviting(false);
    }
  }

  function onDecline() {
    if (!metadata) return;
    setShowDeclineModal(true);
    setDeclineInput("");
  }

  async function handleDeclineSubmit() {
    if (!metadata || !declineInput.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setIsDeclining(true);
    try {
      await contractService.decline(metadata.id, declineInput.trim());
      showToast("Đã hủy Giao ước.", "success");
      const meta = await contractService.getContractMetadata(projectId!);
      setMetadata(meta);
      setShowDeclineModal(false);
      setDeclineInput("");
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Không thể hủy Giao ước.";
      showToast(errorMsg, "error");
    } finally {
      setIsDeclining(false);
    }
  }

  function handleDeclineCancel() {
    setShowDeclineModal(false);
    setDeclineInput("");
  }

  async function handleCreatePaymentLink() {
    if (!projectId || !metadata || isCreatingPayment) return;
    try {
      setIsCreatingPayment(true);
      const base = window.location.origin;
      const returnUrl = `${base}${ROUTER.USER.CONTRACT_PAYMENT_RETURN}?projectId=${projectId}&contractId=${metadata.id}`;
      const cancelUrl = `${base}${ROUTER.USER.CONTRACT_PAYMENT_CANCEL}?projectId=${projectId}&contractId=${metadata.id}`;

      const body: {
        returnUrl: string;
        cancelUrl: string;
        milestoneId?: number;
      } = {
        returnUrl,
        cancelUrl,
      };

      if (paymentType === "MILESTONE" && firstMilestoneId != null) {
        body.milestoneId = firstMilestoneId;
      }

      const result = await paymentService.createContractPaymentLink(
        projectId,
        metadata.id,
        body
      );
      // Persist orderCode to resume after redirect (use localStorage for _blank tab support)
      const key = `pay_order_${metadata.id}`;
      localStorage.setItem(key, result.orderCode);
      sessionStorage.setItem(key, result.orderCode); // Keep for backward compatibility
      setPaymentOrderCode(result.orderCode);
      setPaymentStatus(result.status || "PENDING");
      // Open PayOS checkout in a new tab
      window.open(result.paymentUrl, "_blank", "noopener,noreferrer");
      toast.success("Đã tạo liên kết thanh toán. Vui lòng hoàn tất trên PayOS.");
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Không thể tạo liên kết thanh toán";
      toast.error(errorMsg);
    } finally {
      setIsCreatingPayment(false);
    }
  }

  async function handleRestartPayment() {
    if (!metadata) return;
    // Clear existing orderCode and status, stop local polling
    const key = `pay_order_${metadata.id}`;
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
    setPaymentOrderCode(null);
    setPaymentStatus(null);
    await handleCreatePaymentLink();
  }

  // Poll payment status every ~2.5s when we have an orderCode
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
          if (status.status === "SUCCESSFUL") {
            toast.success("Thanh toán thành công. Đang cập nhật dữ liệu...");
            // Refresh contract metadata (BE updates via webhook)
            if (projectId) {
              try {
                const meta = await contractService.getContractMetadata(projectId);
                setMetadata(meta);
              } catch {
                // ignore
              }
            }
          } else if (status.status === "FAILED") {
            toast.error("Thanh toán thất bại. Vui lòng thử lại.");
          }
        }
      } catch (e: unknown) {
        // Soft-fail: keep trying, but surface a hint once
        const errorMsg = e instanceof Error ? e.message : String(e);
        console.warn("Payment status polling error:", errorMsg);
      }
    }, 2500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [paymentOrderCode, paymentStorageKey, projectId]);

  async function loadContractMetadata() {
    if (!projectId) return;
    try {
      const meta = await contractService.getContractMetadata(projectId);
      setMetadata(meta);
      setHasCheckedContract(true); // Đánh dấu đã kiểm tra hợp đồng

      if (meta) {
        toast.success("Đã tải thông tin Giao ước.");

        // Tính isFunded từ status, nếu đã funded thì tự động set payment status thành công
        const calculatedFunded = calculateIsFunded(meta.signnowStatus);
        const fundedValue = meta.isFunded ?? meta.is_funded;
        const isFundedValue = calculatedFunded || fundedValue === 1 || fundedValue === true;

        if (isFundedValue) {
          setPaymentStatus("SUCCESSFUL");
          // Load latest payment để hiển thị thông tin chi tiết nếu có
          if (permissions?.contract?.canViewContract) {
            try {
              const latest = await paymentService.getLatestByContract(projectId, meta.id);
              setLatestPayment(latest);
            } catch (e: unknown) {
              const errorMsg = e instanceof Error ? e.message : String(e);
              console.warn("Could not load latest payment:", errorMsg);
            }
          }
        }

        // Load decline reason if contract is declined
        if (meta.signnowStatus === "DECLINED") {
          try {
            const reason = await contractService.getDeclineReason(meta.id);
            setDeclineReason(reason);
          } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : "Unknown error";
            console.warn("Could not load decline reason:", errorMsg);
            setDeclineReason(null);
          }
        } else {
          setDeclineReason(null);
        }
      } else {
        toast.success("Chưa có Giao ước nào cho phi vụ này.");
        setDeclineReason(null);
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Không thể tải thông tin Giao ước.";
      toast.error(errorMsg);
      setHasCheckedContract(true); // Vẫn đánh dấu đã kiểm tra dù có lỗi
    }
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden mt-[73px]">
      <AnimatedBackground />


      {/* Animated Space Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Stars */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '2s', animationDuration: '3.5s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '3s', animationDuration: '2.5s' }} />

        {/* Musical Notes */}
        <div className="absolute top-1/5 left-1/5 text-cyan-400/30 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>
          <Music size={16} />
        </div>
        <div className="absolute top-2/3 right-1/5 text-yellow-400/30 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.5s' }}>
          <Volume2 size={14} />
        </div>
        <div className="absolute bottom-1/5 left-2/3 text-purple-400/30 animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '3s' }}>
          <Headphones size={18} />
        </div>

        {/* Space Elements */}
        <div className="absolute top-1/6 right-1/6 text-blue-400/20 animate-spin" style={{ animationDuration: '20s' }}>
          <Star size={24} />
        </div>
        <div className="absolute bottom-1/6 left-1/6 text-green-400/20 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
          <Satellite size={20} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 p-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="relative p-4 rounded-3xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/40 backdrop-blur-sm shadow-2xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400/20 to-blue-400/20 animate-pulse" />
              <Rocket className="relative text-cyan-300 w-8 h-8 animate-bounce" style={{ animationDuration: '2s' }} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
            </div>
            <div>
              <h1 className="mt-1 text-3xl md:text-4xl font-extrabold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 glow-text drop-shadow-[0_0_20px_rgba(59,130,246,0.35)]">
                  Hiệp định vũ trụ — Giao ước liên sao
                </span>
              </h1>
              <div className="relative mt-3 h-1 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-70" />
                <div className="absolute -left-1/3 top-0 h-full w-1/3 bg-white/60 blur-md animate-[pulse_2s_ease-in-out_infinite]" />
              </div>
              <div className="mt-2 flex items-center gap-2 text-cyan-200/80 text-sm">
                <Satellite className="w-4 h-4 text-blue-400 animate-pulse" />
                <span>Liên kết hai bờ thiên hà bằng chữ ký số</span>
              </div>
            </div>
          </div>
          <BackToProjectButton projectId={projectId} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {!isLoadingPermissions && permissions && permissions.contract?.canViewContract === false && (
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
                      CẢNH BÁO KHÔNG GIAN
                    </h3>
                    <p className="text-red-200/90 text-base mt-2 font-semibold">
                      🚫 {permissions.reason || "Không có quyền truy cập vào trạm hợp đồng này."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Section - On Top */}
          {!isLoadingPermissions && (permissions == null || permissions.contract.canViewContract !== false) && (
            <div className="lg:col-span-12">
              <div className="relative bg-gradient-to-br from-slate-900/70 via-slate-800/70 to-slate-900/70 backdrop-blur-xl border border-cyan-400/40 rounded-2xl p-4 shadow-2xl overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-blue-500/5 animate-pulse" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 opacity-60" />

                <div className="relative z-10 flex flex-wrap items-center gap-3">
                  {/* SignNow Badge */}
                  <div
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 via-blue-600/15 to-blue-500/20 border border-blue-400/40 px-3 py-2.5 backdrop-blur-sm hover:border-blue-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-blue-400/50 flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-200" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs text-blue-300/70 font-medium leading-tight">Trạng thái hợp đồng</p>
                        <p className="text-xs font-bold text-blue-100 leading-tight whitespace-nowrap">{translateStatus(metadata?.signnowStatus)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Version Badge */}
                  <div
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/20 via-green-600/15 to-green-500/20 border border-green-400/40 px-3 py-2.5 backdrop-blur-sm hover:border-green-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500/30 to-green-600/30 border border-green-400/50 flex-shrink-0">
                        <BadgeAlert className="w-4 h-4 text-green-200" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs text-green-300/70 font-medium leading-tight">Version</p>
                        <p className="text-xs font-bold text-green-100 leading-tight whitespace-nowrap">{metadata?.documentVersion ?? "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vai trò Badge */}
                  <div
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-500/20 via-teal-600/15 to-teal-500/20 border border-teal-400/40 px-3 py-2.5 backdrop-blur-sm hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/30 to-teal-600/30 border border-teal-400/50 flex-shrink-0">
                        <Users className="w-4 h-4 text-teal-200" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs text-teal-300/70 font-medium leading-tight">Vai trò</p>
                        <p className="text-xs font-bold text-teal-100 leading-tight whitespace-nowrap">{translateStatus(permissions?.role.projectRole)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Badges - Từ chối (Button) */}
                  {canDecline && (
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-red-600/60 via-red-500/60 to-rose-600/60 border-2 border-red-400/60 px-4 py-2.5 backdrop-blur-sm hover:from-red-500 hover:via-red-400 hover:to-rose-500 hover:border-red-300/80 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/40 cursor-pointer"
                      onClick={onDecline}
                    >
                      {/* Animated glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-rose-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <div className="relative flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-400/50 to-red-500/50 border border-red-300/60 flex-shrink-0 group-hover:border-red-200/80 transition-all duration-300">
                          <BadgeAlert className="w-4 h-4 text-red-100 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <span className="text-white font-bold text-xs whitespace-nowrap drop-shadow-sm">Từ chối</span>
                      </div>
                    </motion.button>
                  )}

                  {/* Status Badges - PARTIALLY_SIGNED */}
                  {metadata?.signnowStatus === "PARTIALLY_SIGNED" && (
                    <div
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-500/20 via-amber-600/15 to-yellow-500/20 border border-yellow-400/40 px-3 py-2.5 backdrop-blur-sm hover:border-yellow-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-yellow-400/30 to-amber-400/30 border border-yellow-300/40 flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-yellow-200" />
                        </div>
                        <span className="text-yellow-100 font-bold text-xs whitespace-nowrap">{getPartiallySignedMessage}</span>
                      </div>
                    </div>
                  )}

                  {/* Status Badges - SIGNED */}
                  {isSigned && (
                    <div
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/20 via-emerald-600/15 to-green-500/20 border border-green-400/40 px-3 py-2.5 backdrop-blur-sm hover:border-green-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-400/30 to-emerald-400/30 border border-green-300/40 flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-200" />
                        </div>
                        <span className="text-green-100 font-bold text-xs whitespace-nowrap">
                          {isPaid
                            ? metadata?.signnowStatus === "TERMINATED"
                              ? "Giao ước đã chấm dứt"
                              : "Giao ước đã ký và đã thanh toán (Hoàn tất)"
                            : "Giao ước đã ký, chưa thanh toán"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Status Badges - DECLINED */}
                  {metadata?.signnowStatus === "DECLINED" && (
                    <div
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500/20 via-rose-600/15 to-red-500/20 border border-red-400/40 px-3 py-2.5 backdrop-blur-sm hover:border-red-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-400/30 to-rose-400/30 border border-red-300/40 flex-shrink-0">
                          <BadgeAlert className="w-4 h-4 text-red-200" />
                        </div>
                        <span className="text-red-100 font-bold text-xs whitespace-nowrap">Giao ước đã bị từ chối</span>
                      </div>
                    </div>
                  )}

                  {/* Button - Chấm dứt hợp đồng (Owner/Client và đã ký, nhưng không hiển thị khi TERMINATED hoặc COMPLETED) */}
                  {(permissions?.role.projectRole === "OWNER" || permissions?.role.projectRole === "CLIENT") &&
                    isSigned &&
                    metadata?.signnowStatus !== "TERMINATED" &&
                    metadata?.signnowStatus !== "COMPLETED" && (
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`${ROUTER.USER.CONTRACT_TERMINATION}?id=${projectId}&contractId=${metadata?.id}`)}
                        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-600/60 via-red-500/60 to-orange-600/60 border-2 border-orange-400/60 px-4 py-2.5 backdrop-blur-sm hover:from-orange-500 hover:via-red-400 hover:to-orange-500 hover:border-orange-300/80 transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/40 cursor-pointer"
                      >
                        {/* Animated glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-red-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <div className="relative flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-400/50 to-red-500/50 border border-orange-300/60 flex-shrink-0 group-hover:border-orange-200/80 transition-all duration-300">
                            <AlertTriangle className="w-4 h-4 text-orange-100 group-hover:text-white transition-colors duration-300" />
                          </div>
                          <span className="text-white font-bold text-xs whitespace-nowrap drop-shadow-sm">Chấm dứt hợp đồng</span>
                        </div>
                      </motion.button>
                    )}

                  {/* Button - Xem chi tiết chấm dứt (khi hợp đồng đã TERMINATED) */}
                  {(permissions?.role.projectRole === "OWNER" || permissions?.role.projectRole === "CLIENT") &&
                    metadata?.signnowStatus === "TERMINATED" && (
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`${ROUTER.USER.CONTRACT_TERMINATION}?id=${projectId}&contractId=${metadata?.id}`)}
                        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600/60 via-blue-500/60 to-cyan-600/60 border-2 border-cyan-400/60 px-4 py-2.5 backdrop-blur-sm hover:from-cyan-500 hover:via-blue-400 hover:to-cyan-500 hover:border-cyan-300/80 transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/40 cursor-pointer"
                      >
                        {/* Animated glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <div className="relative flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-400/50 to-blue-500/50 border border-cyan-300/60 flex-shrink-0 group-hover:border-cyan-200/80 transition-all duration-300">
                            <Eye className="w-4 h-4 text-cyan-100 group-hover:text-white transition-colors duration-300" />
                          </div>
                          <span className="text-white font-bold text-xs whitespace-nowrap drop-shadow-sm">Xem chi tiết chấm dứt</span>
                        </div>
                      </motion.button>
                    )}
                </div>
              </div>
            </div>
          )}

          {!isLoadingPermissions && (permissions == null || permissions.contract.canViewContract !== false) && (
            <section className="lg:col-span-5 flex flex-col gap-6">
              {/* Bước 1: Contract Management Card */}
              <div className="relative bg-gradient-to-br from-purple-900/60 to-indigo-900/60 rounded-2xl p-5 shadow-xl hover:shadow-purple-500/50 transition-all duration-500 border border-purple-400/30">
                {/* Step Number Badge */}
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 border-2 border-purple-300/50 flex items-center justify-center shadow-lg z-10">
                  <span className="text-white font-black text-lg">1</span>
                </div>

                <div className="flex items-center justify-between mb-4 mt-2">
                  <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300 flex items-center gap-2">
                    <Music className="w-6 h-6 text-purple-400 animate-pulse" />
                    Bước 1: TRUNG TÂM GIAO ƯỚC
                  </h3>
                </div>

                {!isLoadingPermissions && (permissions == null || permissions.contract?.canViewContract !== false) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Logic mới: Cho phép tạo mới khi chưa thanh toán (chưa PAID/COMPLETED) */}
                    {canCreateNew && hasCheckedContract && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`${ROUTER.USER.CONTRACT}?id=${projectId || ''}`)}
                        className={`group relative rounded-xl px-4 py-3 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden ${!metadata
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                          : "bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600"
                          }`}
                      >
                        <Rocket size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                        <span>KHỞI TẠO GIAO ƯỚC MỚI</span>
                        {!metadata && <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={loadContractMetadata}
                      className="group relative rounded-xl px-4 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-white font-medium text-sm shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Eye size={16} className="group-hover:scale-110 transition-transform duration-300" />
                      <span>Quét Dữ Liệu Giao Ước</span>
                    </motion.button>
                  </div>
                )}

                <div className="mt-4">
                  {!hasCheckedContract && (
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
                      <p className="text-blue-200/90 text-xs font-medium">
                        💡 Bấm "Quét Dữ Liệu Giao Ước" để kiểm tra trạng thái Giao ước.
                      </p>
                    </div>
                  )}
                  {hasCheckedContract && !metadata && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
                      <p className="text-amber-200/90 text-xs font-medium">
                        📄 Chưa có giao ước nào. Khởi tạo "Giao Ước Mới" để bắt đầu.
                      </p>
                    </div>
                  )}
                  {/* Ẩn thông báo PARTIALLY_SIGNED ở trung tâm giao ước vì đã có ở Bước 2 (PHÁT TÍN HIỆU KÝ) cho cả CLIENT và OWNER/PRODUCER */}
                  {hasCheckedContract && metadata && isSigned && (
                    <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 backdrop-blur-sm">
                      <p className="text-green-200/90 text-xs font-medium">
                        ✅ {isPaid ? "Hợp đồng đã ký và đã thanh toán (Hoàn tất)." : "Hợp đồng đã ký, chưa thanh toán."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Step Connector */}
              <div className="flex items-center justify-center -my-2 relative z-0">
                <div className="w-0.5 h-8 bg-gradient-to-b from-purple-400/50 via-teal-400/50 to-teal-400/50" />
              </div>

              {/* Bước 2: Invite to Sign Card */}
              <div className="relative bg-gradient-to-br from-teal-900/60 to-emerald-900/60 rounded-2xl p-5 shadow-xl hover:shadow-teal-500/50 transition-all duration-500 border border-teal-400/30">
                {/* Step Number Badge */}
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 border-2 border-teal-300/50 flex items-center justify-center shadow-lg z-10">
                  <span className="text-white font-black text-lg">2</span>
                </div>

                <div className="flex items-center mb-4 gap-2 mt-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-5 h-5 text-teal-300" />
                  </div>
                  <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-emerald-200">
                    Bước 2: PHÁT TÍN HIỆU KÝ
                  </h3>
                </div>
                {/* Signing order is now defaulted by the backend (SEQUENTIAL). No chooser needed. */}
                {/* Nút "Gửi Tín Hiệu Ký" chỉ hiện khi DRAFT */}
                {permissions?.contract?.canInviteToSign && metadata && metadata.signnowStatus === "DRAFT" && (
                  <div className="flex justify-center mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!canInvite || isInviting}
                      onClick={onInvite}
                      className={`rounded-xl px-6 py-3 font-semibold text-sm transition-all duration-300 ${!canInvite || isInviting
                        ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-xl hover:shadow-teal-500/25'
                        }`}
                    >
                      {isInviting ? (
                        <div className="flex items-center gap-2 justify-center">
                          <Loader2 className="animate-spin w-5 h-5" />
                          <span>Đang phát tín hiệu...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-center">
                          <Send size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                          <span>Gửi Tín Hiệu Ký</span>
                        </div>
                      )}
                    </motion.button>
                  </div>
                )}
                {/* Thông báo khi PARTIALLY_SIGNED và là OWNER/PRODUCER */}
                {metadata?.signnowStatus === "PARTIALLY_SIGNED" && (permissions?.role?.projectRole === "OWNER" || permissions?.role?.userRole === "PRODUCER") && (
                  <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm mt-4">
                    <p className="text-yellow-200/90 text-xs font-medium text-center">
                      ⚠️ Bạn đã ký rồi, đang đợi khách hàng ký
                    </p>
                  </div>
                )}
                {/* Thông báo khi PARTIALLY_SIGNED và là CLIENT */}
                {metadata?.signnowStatus === "PARTIALLY_SIGNED" && permissions?.role?.projectRole === "CLIENT" && (
                  <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm mt-4">
                    <p className="text-yellow-200/90 text-xs font-medium text-center">
                      ⚠️ Chủ dự án đã ký, mời bạn kiểm tra email và ký
                    </p>
                  </div>
                )}
                {/* Thông báo khi OUT_FOR_SIGNATURE - Đã phát tín hiệu, đang chờ ký */}
                {metadata?.signnowStatus === "OUT_FOR_SIGNATURE" && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm mt-4">
                    <p className="text-blue-200/90 text-xs font-medium text-center">
                      📨 Đã phát tín hiệu ký, đang chờ các bên ký
                    </p>
                  </div>
                )}
                {/* Thông báo khi SIGNED, PAID, COMPLETED, TERMINATED */}
                {metadata && metadata.signnowStatus && ["SIGNED", "PAID", "COMPLETED", "TERMINATED"].includes(metadata.signnowStatus) && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 backdrop-blur-sm mt-4">
                    <p className="text-green-200/90 text-xs font-medium text-center">
                      ✅ {metadata.signnowStatus === "SIGNED"
                        ? "Giao ước đã được ký"
                        : metadata.signnowStatus === "PAID"
                          ? "Giao ước đã được thanh toán"
                          : metadata.signnowStatus === "COMPLETED"
                            ? "Giao ước đã hoàn tất"
                            : "Giao ước đã chấm dứt"}
                    </p>
                  </div>
                )}
                {/* Thông báo khi DECLINED, VOIDED, EXPIRED */}
                {metadata && metadata.signnowStatus && ["DECLINED", "VOIDED", "EXPIRED"].includes(metadata.signnowStatus) && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm mt-4">
                    <p className="text-red-200/90 text-xs font-medium text-center">
                      {metadata.signnowStatus === "DECLINED"
                        ? "❌ Giao ước đã bị từ chối"
                        : metadata.signnowStatus === "VOIDED"
                          ? "🚫 Giao ước đã bị hủy"
                          : "⏰ Giao ước đã hết hạn"}
                    </p>
                  </div>
                )}
                {/* Thông báo mặc định cho các trường hợp khác */}
                {metadata && metadata.signnowStatus && !["DRAFT", "PARTIALLY_SIGNED", "OUT_FOR_SIGNATURE", "SIGNED", "PAID", "COMPLETED", "TERMINATED", "DECLINED", "VOIDED", "EXPIRED"].includes(metadata.signnowStatus) && (
                  <div className="p-3 rounded-xl bg-gray-500/10 border border-gray-500/20 backdrop-blur-sm mt-4">
                    <p className="text-gray-300/70 text-xs font-medium text-center">
                      {!metadata
                        ? "⏳ Chờ hoàn thành Bước 1"
                        : permissions?.role?.projectRole === "CLIENT" && (metadata.signnowStatus === "DRAFT")
                          ? "Tín hiệu chưa được phát"
                          : "⏸️ Chưa thể phát tín hiệu ký"}
                    </p>
                  </div>
                )}
                {/* Thông báo khi chưa có metadata */}
                {!metadata && permissions?.contract?.canInviteToSign && (
                  <div className="p-3 rounded-xl bg-gray-500/10 border border-gray-500/20 backdrop-blur-sm mt-4">
                    <p className="text-gray-300/70 text-xs font-medium text-center">
                      ⏳ Chờ hoàn thành Bước 1
                    </p>
                  </div>
                )}
              </div>

              {/* Step Connector */}
              <div className="flex items-center justify-center -my-2 relative z-0">
                <div className="w-0.5 h-8 bg-gradient-to-b from-teal-400/50 via-emerald-400/50 to-emerald-400/50" />
              </div>

              {/* Bước 3: Payment Card */}
              <div className="relative bg-gradient-to-br from-emerald-900/60 to-green-900/60 rounded-2xl p-5 shadow-xl hover:shadow-emerald-500/40 transition-all duration-500 border border-emerald-400/30">
                {/* Step Number Badge */}
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 border-2 border-emerald-300/50 flex items-center justify-center shadow-lg z-10">
                  <span className="text-white font-black text-lg">3</span>
                </div>

                <div className="flex items-center justify-between mb-3 mt-2">
                  <h3 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-green-200 flex items-center gap-2">
                    💳 Bước 3: THANH TOÁN THEO GIAO ƯỚC
                  </h3>
                  {canPay && (paymentStatus || isPaid || isFunded) && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold border border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
                      {isPaid || isFunded || paymentStatus === "SUCCESSFUL"
                        ? "THÀNH CÔNG"
                        : paymentStatus === "PENDING"
                          ? "ĐANG CHỜ"
                          : paymentStatus === "FAILED"
                            ? "THẤT BẠI"
                            : paymentStatus || "CHƯA THANH TOÁN"}
                    </span>
                  )}
                </div>
                {/* Content by latest status */}
                {canPay ? (
                  <>
                    {isLoadingLatest ? (
                      <div className="flex items-center gap-2 text-emerald-200">
                        <Loader2 className="animate-spin w-4 h-4" />
                        <span className="text-xs">Đang tải trạng thái thanh toán...</span>
                      </div>
                    ) : (isPaid || isFunded) ? (
                      <div>
                        <p className="text-emerald-200/90 text-xs mb-1.5 font-semibold">✅ Thanh toán thành công.</p>
                        <div className="text-xs text-emerald-100/90 space-y-0.5">
                          {latestPayment && (
                            <div>Số tiền: <span className="font-semibold">{latestPayment.amount?.toLocaleString()} đ</span></div>
                          )}
                        </div>
                      </div>
                    ) : paymentStatus === "SUCCESSFUL" && latestPayment ? (
                      <div>
                        <p className="text-emerald-200/90 text-xs mb-1.5">Thanh toán thành công.</p>
                        <div className="text-xs text-emerald-100/90 space-y-0.5">
                          <div>Số tiền: <span className="font-semibold">{latestPayment.amount?.toLocaleString()} đ</span></div>
                        </div>
                      </div>
                    ) : paymentStatus === "PENDING" ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Loader2 className="animate-spin w-4 h-4 text-emerald-300" />
                        <span className="text-emerald-200/80 text-xs">Đang xác nhận...</span>
                        <button
                          onClick={async () => {
                            if (!projectId || !metadata) return;
                            try {
                              setIsLoadingLatest(true);
                              const latest = await paymentService.getLatestByContract(projectId, metadata.id);
                              setLatestPayment(latest);
                              setPaymentStatus(latest?.status || null);
                            } finally {
                              setIsLoadingLatest(false);
                            }
                          }}
                          className="px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-xs"
                        >
                          Tải lại
                        </button>
                        {permissions?.role.projectRole === "CLIENT" && (
                          <button
                            onClick={handleRestartPayment}
                            className="px-2 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs"
                          >
                            Tạo mới
                          </button>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-emerald-200/80 text-xs mb-3">
                          {permissions?.role.projectRole === "OWNER"
                            ? "Đang chờ đợi khách hàng thanh toán. Sau khi khách hàng thanh toán xong, trạng thái sẽ tự cập nhật."
                            : "Tạo liên kết PayOS để thanh toán. Sau khi thanh toán xong, trạng thái sẽ tự cập nhật."}
                        </p>
                        <div className="flex items-center gap-2">
                          {permissions?.role.projectRole === "CLIENT" && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              disabled={isCreatingPayment}
                              onClick={handleCreatePaymentLink}
                              className={`rounded-xl px-4 py-2 font-medium text-xs transition-all duration-300 ${isCreatingPayment
                                ? 'bg-gray-600/50 text-gray-300 cursor-not-allowed'
                                : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-md hover:shadow-lg hover:shadow-emerald-500/25'
                                }`}
                            >
                              {isCreatingPayment ? (
                                <div className="flex items-center gap-1.5">
                                  <Loader2 className="animate-spin w-4 h-4" />
                                  <span>Đang tạo...</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <Send size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                                  <span>Thanh toán ngay</span>
                                </div>
                              )}
                            </motion.button>
                          )}
                          {paymentOrderCode && paymentStatus === "PENDING" && (
                            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
                              <Loader2 className="animate-spin w-3 h-3" />
                              <span className="text-xs">Đang kiểm tra...</span>
                            </div>
                          )}
                        </div>
                        {paymentOrderCode && (
                          <p className="text-xs text-emerald-200/70 mt-2">
                            Mã: <span className="font-mono text-xs">{paymentOrderCode}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Thông báo khi đã thanh toán (PAID, COMPLETED, hoặc TERMINATED) */}
                    {isPaid ? (
                      <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 backdrop-blur-sm">
                        <p className="text-green-200/90 text-xs font-medium text-center mb-2">
                          ✅ {metadata?.signnowStatus === "TERMINATED"
                            ? "Giao ước đã chấm dứt"
                            : "Giao ước đã được thanh toán thành công"}
                        </p>
                        {latestPayment && (
                          <div className="text-xs text-green-100/90 space-y-0.5 text-center">
                            <div>Số tiền: <span className="font-semibold">{latestPayment.amount?.toLocaleString()} đ</span></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-gray-500/10 border border-gray-500/20 backdrop-blur-sm">
                        <p className="text-gray-300/70 text-xs font-medium text-center">
                          {!isSigned
                            ? "⏳ Chờ hoàn thành Bước 1 và Bước 2"
                            : "⏸️ Chưa thể thanh toán"}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          )}


          {(permissions == null || permissions.contract.canViewContract !== false) && (
            <aside className="lg:col-span-7">
              <div className="dashboard-card group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
                <div>
                  <div className="h-[620px] w-full bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl border border-white/20 flex items-center justify-center overflow-hidden backdrop-blur-sm shadow-lg">
                    {pdfBlobUrl ? (
                      <iframe
                        src={pdfBlobUrl}
                        className="w-full h-full rounded-xl"
                      />
                    ) : metadata?.documentUrl ? (
                      <iframe
                        src={metadata.documentUrl}
                        className="w-full h-full rounded-xl"
                      />
                    ) : (
                      <div className="text-center p-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-blue-400" />
                        </div>
                        <p className="text-gray-300 text-sm font-medium">Không có dữ liệu để quét</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Decline Reason Section */}
          {(permissions == null || permissions.contract.canViewContract !== false) && metadata?.signnowStatus === "DECLINED" && declineReason && (
            <div className="lg:col-span-12">
              <div className="dashboard-card border-red-500/50 bg-red-500/10">
                <div className="card-header">
                  <BadgeAlert className="icon text-red-400" />
                  <h3 className="card-title text-red-300">Lý do từ chối Giao ước</h3>
                </div>
                <div className="mt-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-200 text-sm leading-relaxed">
                      {declineReason}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
                  Hủy bỏ Giao ước
                </h3>
                <p className="text-red-200/80 text-sm">
                  Vui lòng cung cấp lý do từ chối
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
                  placeholder="Nhập lý do từ chối hợp đồng..."
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
                    Hành động này không thể hoàn tác. Giao ước sẽ bị hủy bỏ vĩnh viễn.
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
                  "Xác nhận hủy"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .space-station-card { 
          @apply bg-gradient-to-br from-slate-900/60 to-slate-800/80 backdrop-blur-xl border border-cyan-400/30 rounded-3xl p-8 shadow-2xl;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.8) 100%);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.6), 
            0 0 0 1px rgba(34, 211, 238, 0.2),
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
          background: linear-gradient(45deg, rgba(34, 211, 238, 0.3), rgba(168, 85, 247, 0.3), rgba(34, 197, 94, 0.3));
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          opacity: 0.6;
        }
        .card-header { @apply flex items-center gap-6; }
        .card-title { @apply text-3xl font-black; }
        .card-description { @apply text-cyan-200/90 text-lg; }
        .btn-primary-glow { 
          @apply inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black hover:opacity-90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/30 border border-cyan-400/30; 
        }
        .btn-secondary-glow { 
          @apply inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-800/50 border border-cyan-400/30 hover:bg-slate-700/50 transition-all duration-300 backdrop-blur-sm hover:shadow-xl hover:shadow-cyan-500/20; 
        }
        .icon { @apply w-8 h-8; }
        
        /* Space Music Animations */
        @keyframes spaceFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes musicWave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        .space-float { animation: spaceFloat 3s ease-in-out infinite; }
        .music-wave { animation: musicWave 2s ease-in-out infinite; }
        .star-twinkle { animation: starTwinkle 2s ease-in-out infinite; }
        
        /* Custom scrollbar - Space Theme */
        ::-webkit-scrollbar {
          width: 12px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 6px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, rgba(34, 211, 238, 0.6), rgba(168, 85, 247, 0.6));
          border-radius: 6px;
          border: 2px solid rgba(15, 23, 42, 0.3);
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, rgba(34, 211, 238, 0.8), rgba(168, 85, 247, 0.8));
        }
        
        /* Glowing text effect */
        .glow-text {
          text-shadow: 
            0 0 10px rgba(34, 211, 238, 0.5),
            0 0 20px rgba(34, 211, 238, 0.3),
            0 0 30px rgba(34, 211, 238, 0.2);
        }
      `}</style>
    </div>
  );
}