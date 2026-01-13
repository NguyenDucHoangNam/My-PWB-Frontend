import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import paymentService from "../../../services/paymentService";
import contractService from "../../../services/contractService";
import { ROUTER } from "../../../routes/router";

interface Props {
  mode?: "return" | "cancel";
}

export default function TerminationPaymentReturnPage({ mode = "return" }: Props) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const projectId = params.get("projectId");
  // Backend redirect có thể trả về "id" thay vì "contractId" (ví dụ: ?id=17e77ce78cda432495c13fe00ca3c4a9)
  // Ưu tiên contractId, sau đó là id
  const contractId = params.get("contractId") || params.get("id"); // Support both 'contractId' and 'id'

  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(mode === "cancel" ? "CANCELLED" : "PENDING");
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);

  const storageKey = useMemo(() => (contractId ? `termination_pay_order_${contractId}` : null), [contractId]);

  useEffect(() => {
    if (!storageKey) return;
    // Prefer query param if present, then localStorage, then sessionStorage (fallback)
    // Backend redirect có thể trả về orderCode trong query params
    const fromQuery = params.get("orderCode");
    const stored = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
    setOrderCode(fromQuery ?? stored ?? null);
  }, [storageKey, params]);

  useEffect(() => {
    if (mode === "cancel") return;
    let cancelled = false;
    const startedAt = Date.now();
    const intervalMs = 2500;

    async function tick() {
      try {
        if (orderCode) {
          const res = await paymentService.getPaymentStatus(orderCode);
          if (cancelled) return;
          setStatus(res.status);
          if (res.status !== "PENDING") {
            if (storageKey) {
              localStorage.removeItem(storageKey);
              sessionStorage.removeItem(storageKey);
            }
            if (res.status === "SUCCESSFUL") {
              toast.success("Thanh toán thành công. Đang cập nhật dữ liệu...");
              // Refresh termination detail (BE updates via webhook)
              if (contractId) {
                try {
                  await contractService.getTerminationDetail(contractId);
                } catch (err) {
                  console.warn("Could not refresh termination detail:", err);
                }
              }
              // Navigate về termination page
              setTimeout(() => {
                if (contractId && projectId) {
                  navigate(`${ROUTER.USER.CONTRACT_TERMINATION}?contractId=${contractId}&id=${projectId}`);
                } else if (contractId) {
                  navigate(`${ROUTER.USER.CONTRACT_TERMINATION}?contractId=${contractId}`);
                } else if (projectId) {
                  navigate(`${ROUTER.USER.CONTRACTSPACE}?id=${projectId}`);
                }
              }, 1000);
            } else if (res.status === "FAILED") {
              toast.error("Thanh toán thất bại.");
            }
            return; // stop loop via cancelled flag below
          }
        } else if (projectId && contractId) {
          // Fallback when orderCode is not available (new tab): poll latest-by-contract
          const latest = await paymentService.getLatestByContract(projectId, contractId);
          if (cancelled) return;
          const st = latest?.status || "PENDING";
          setStatus(st);
          if (st !== "PENDING") {
            if (st === "SUCCESSFUL") {
              toast.success("Thanh toán thành công. Đang cập nhật dữ liệu...");
              // Refresh termination detail
              if (contractId) {
                try {
                  await contractService.getTerminationDetail(contractId);
                } catch (err) {
                  console.warn("Could not refresh termination detail:", err);
                }
              }
              setTimeout(() => {
                if (contractId && projectId) {
                  navigate(`${ROUTER.USER.CONTRACT_TERMINATION}?contractId=${contractId}&id=${projectId}`);
                } else if (contractId) {
                  navigate(`${ROUTER.USER.CONTRACT_TERMINATION}?contractId=${contractId}`);
                } else if (projectId) {
                  navigate(`${ROUTER.USER.CONTRACTSPACE}?id=${projectId}`);
                }
              }, 1000);
            } else if (st === "FAILED") {
              toast.error("Thanh toán thất bại.");
            }
            return;
          }
        }
        if (Date.now() - startedAt > 90000) {
          setHasTimedOut(true);
          return;
        }
        if (!cancelled) setTimeout(tick, intervalMs);
      } catch {
        if (!cancelled) setTimeout(tick, intervalMs);
      }
    }

    const timeout = setTimeout(tick, intervalMs);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [orderCode, mode, storageKey, navigate, projectId, contractId]);

  const retryCheck = async () => {
    if (!orderCode) return;
    try {
      const res = await paymentService.getPaymentStatus(orderCode);
      setStatus(res.status);
      setHasTimedOut(false);
    } catch (error: unknown) {
      // Silently fail - user can retry manually
      console.warn("Failed to check payment status:", error instanceof Error ? error.message : String(error));
    }
  };

  const goBack = () => {
    if (contractId && projectId) {
      navigate(`${ROUTER.USER.CONTRACT_TERMINATION}?contractId=${contractId}&id=${projectId}`);
    } else if (contractId) {
      navigate(`${ROUTER.USER.CONTRACT_TERMINATION}?contractId=${contractId}`);
    } else if (projectId) {
      navigate(`${ROUTER.USER.CONTRACTSPACE}?id=${projectId}`);
    } else {
      navigate(ROUTER.USER.PROJECTDETAIL);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-center mb-6">
          {mode === "cancel" ? (
            <XCircle className="text-red-400 w-12 h-12" />
          ) : status === "SUCCESSFUL" ? (
            <CheckCircle2 className="text-emerald-400 w-12 h-12" />
          ) : status === "FAILED" ? (
            <XCircle className="text-red-400 w-12 h-12" />
          ) : (
            <Loader2 className="text-cyan-300 w-12 h-12 animate-spin" />
          )}
        </div>
        <h1 className="text-xl font-bold text-center mb-2">
          {mode === "cancel"
            ? "Bạn đã hủy thanh toán"
            : status === "SUCCESSFUL"
            ? "Thanh toán thành công"
            : status === "FAILED"
            ? "Thanh toán thất bại"
            : orderCode
            ? "Đang xác nhận thanh toán"
            : "Đang đồng bộ trạng thái thanh toán"}
        </h1>
        {orderCode && (
          <p className="text-center text-sm text-gray-300 mb-4">
            Mã giao dịch: <span className="font-mono">{orderCode}</span>
          </p>
        )}
        {status === "SUCCESSFUL" && (
          <p className="text-center text-sm text-gray-300 mb-4">
            Hợp đồng đã được chấm dứt thành công.
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          {(status === "FAILED" || hasTimedOut) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={retryCheck}
              className="rounded-2xl px-6 py-3 font-semibold bg-white/10 border border-white/20 text-white"
            >
              Thử lại kiểm tra
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goBack}
            className="rounded-2xl px-6 py-3 font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
          >
            {status === "SUCCESSFUL" ? "Xem chi tiết chấm dứt" : "Quay về"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
