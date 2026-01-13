import { useEffect, useMemo, useState } from "react";
import { subscriptionService, type ProPackageItem, type SubscriptionStatus } from "@/services/subscriptionService";
import { ROUTER } from "@/routes/router";

const ManageSubscriptionPage = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [packages, setPackages] = useState<ProPackageItem[]>([]);
  const [selected, setSelected] = useState<string | number>("");
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<{ amount: number; paymentUrl: string } | null>(null);

  const isActive = useMemo(() => status?.status === "ACTIVE", [status]);
  const viStatus = useMemo(() => {
    const s = (status?.status || "").toUpperCase();
    switch (s) {
      case "ACTIVE":
        return "Đang hoạt động";
      case "EXPIRED":
        return "Hết hạn";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status?.status || "Chưa xác định";
    }
  }, [status]);
  const statusColor = useMemo(() => {
    const s = (status?.status || "").toUpperCase();
    if (s === "ACTIVE") return "bg-emerald-500/15 text-emerald-300 border-emerald-400/20";
    if (s === "EXPIRED") return "bg-yellow-500/15 text-yellow-300 border-yellow-400/20";
    if (s === "CANCELLED") return "bg-rose-500/15 text-rose-300 border-rose-400/20";
    return "bg-slate-500/15 text-slate-300 border-slate-400/20";
  }, [status]);
  const currentType = useMemo(() => {
    if (!status) return undefined as undefined | string;
    if (status.planType) return status.planType;
    const name = status.planName?.toLowerCase() || "";
    if (name.includes("year") || name.includes("năm")) return "YEARLY";
    if (name.includes("month") || name.includes("tháng")) return "MONTHLY";
    return undefined as undefined | string;
  }, [status]);

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const load = async () => {
    try {
      setError(null);
      const [st, pk] = await Promise.all([
        subscriptionService.getStatus(),
        subscriptionService.getPackages(0, 10),
      ]);
      setStatus(st);
      setPackages(pk);
    } catch (e: any) {
      setError(e?.message || "Không thể tải dữ liệu");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpgrade = async () => {
    if (!selected) return;
    try {
      setLoading(true);
      const base = window.location.origin;
      const res = await subscriptionService.upgrade({
        newProPackageId: selected,
        returnUrl: `${base}${ROUTER.USER.SUBSCRIPTION_RETURN}`,
        cancelUrl: `${base}${ROUTER.USER.SUBSCRIPTION_CANCEL}`,
      });
      setPendingPayment({ amount: res.amount, paymentUrl: res.paymentUrl });
      setConfirmOpen(true);
    } catch (e: any) {
      const code = e?.response?.data?.code;
      const msgMap: Record<number, string> = {
        8101: "Bạn đang ở gói cao nhất. Không thể nâng cấp thêm.",
        8102: "Không thể nâng cấp sang gói tương tự.",
        8103: "Không hỗ trợ hạ gói trong luồng nâng cấp.",
        8007: "Không tạo được link thanh toán, vui lòng thử lại.",
      };
      setError(msgMap[code] || e?.response?.data?.message || e?.message || "Không thể tạo link nâng cấp");
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoRenew = async () => {
    try {
      setLoading(true);
      if (status?.autoRenewEnabled) {
        await subscriptionService.cancelAutoRenew();
        setStatus((prev) => ({ ...(prev || {}), autoRenewEnabled: false } as SubscriptionStatus));
      } else {
        await subscriptionService.reactivateAutoRenew();
        setStatus((prev) => ({ ...(prev || {}), autoRenewEnabled: true } as SubscriptionStatus));
      }
    } catch (e: any) {
      setError(e?.message || "Không thể cập nhật gia hạn tự động");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-[#0a0226] to-[#1a0033] text-white overflow-hidden pt-24 pb-10">
      {/* Nền sao động nâng cao */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/80 rounded-full"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: "0 0 6px rgba(255,255,255,0.8)",
              opacity: 0.5 + Math.random() * 0.5,
              animation: `floatUp ${5 + Math.random() * 8}s linear infinite`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      {/* Vầng sáng mờ nền */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-fuchsia-500/20 rounded-full blur-3xl" />

      {/* Vùng căn giữa theo viewport, chừa header */}
      <div className="relative min-h-[calc(100vh-6rem)] grid place-items-center px-4">
        {/* Card trung tâm với viền phát sáng */}
        <div className="relative w-full max-w-2xl">
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-fuchsia-500/40 via-purple-500/40 to-indigo-500/40 blur opacity-70" />
          <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md px-6 py-7 md:px-8 md:py-9 shadow-2xl">
            {/* Tiêu đề có hiệu ứng */}
            <div className="relative mb-6 text-center">
              <div className="inline-flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-fuchsia-400 animate-ping" />
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-fuchsia-200 to-white animate-pulse">
                  Quản lý gói PRO
                </h1>
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-400 animate-ping [animation-delay:300ms]" />
              </div>
              <div className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 mt-2 h-px w-40 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>

            {/* Nội dung gộp gọn trong 1 card */}
            <div className="grid grid-cols-1 gap-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-300/80">Trạng thái</p>
                  <span className={`mt-1 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${statusColor}`}>
                    <span className="h-2 w-2 rounded-full bg-current"></span>
                    <span className="font-semibold tracking-wide">{viStatus}</span>
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-300/80">Kế hoạch</p>
                  <div className="mt-1 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-fuchsia-600/20 via-purple-600/20 to-indigo-600/20 px-3 py-1.5 text-sm font-semibold shadow-[0_0_18px_rgba(139,92,246,0.22)]">
                    <span className="relative inline-block">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shine_2.2s_ease-in-out_infinite] [mask-image:linear-gradient(90deg,transparent,black,transparent)] rounded"></span>
                      <span className="relative z-10">{status?.planName || "-"}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-300/80">Hết hạn</p>
                  <p className="font-semibold mt-1">{formatDate(status?.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-300/80">Ân hạn đến</p>
                  <p className="font-semibold mt-1">{formatDate(status?.graceUntil)}</p>
                </div>
              </div>

              {isActive && (
                <div className="flex items-center justify-between gap-3">
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${status?.autoRenewEnabled ? "bg-emerald-500/10 text-emerald-300 border-emerald-400/20" : "bg-slate-500/10 text-slate-300 border-slate-400/20"}`}>
                    <span className={`h-2 w-2 rounded-full ${status?.autoRenewEnabled ? "bg-emerald-300" : "bg-slate-300"} animate-pulse`}></span>
                    <span className="font-medium">{status?.autoRenewEnabled ? "Tự động gia hạn: Bật" : "Tự động gia hạn: Tắt"}</span>
                  </div>
                  <button
                    disabled={loading}
                    onClick={toggleAutoRenew}
                    className="px-4 py-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-white/10 disabled:opacity-60 transition-all shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:shadow-[0_0_24px_rgba(139,92,246,0.25)]"
                  >
                    {status?.autoRenewEnabled ? "Tắt" : "Bật"}
                  </button>
                </div>
              )}

              {/* Nâng cấp trong cùng card */}
              {isActive && (
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold">Nâng cấp gói</h2>
                    {currentType === "YEARLY" && (
                      <span className="text-sm text-yellow-300">Đang ở gói cao nhất</span>
                    )}
                  </div>
                  {currentType !== "YEARLY" && (
                    <>
                      <div className="grid grid-cols-1 gap-3 place-items-stretch">
                        {packages
                          .filter((p) => p.packageType === "YEARLY")
                          .map((p) => (
                          <label key={p.id} className={`group p-4 rounded-2xl border cursor-pointer transition-all ${selected === p.id ? "border-purple-500 bg-purple-500/10 shadow-[0_0_24px_rgba(139,92,246,0.25)]" : "border-white/10 hover:border-white/20"}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{p.name}</div>
                                <div className="text-xs text-gray-400">{p.packageType}</div>
                              </div>
                              <input className="h-4 w-4" type="radio" name="pkg" checked={selected === p.id} onChange={() => setSelected(p.id)} />
                            </div>
                            <div className="mt-2 text-lg font-bold">
                              {p.price.toLocaleString()} {p.currency || "VND"}
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3">
                        <button
                          disabled={!selected || loading || currentType === "YEARLY"}
                          onClick={handleUpgrade}
                          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 font-medium transition-all shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:shadow-[0_0_28px_rgba(139,92,246,0.35)]"
                        >
                          {loading ? "Đang tạo link..." : "Nâng cấp"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal xác nhận thanh toán */}
      {confirmOpen && pendingPayment && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_180ms_ease-out]" onClick={() => { setConfirmOpen(false); setPendingPayment(null); }} />
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-fuchsia-500/40 via-purple-500/40 to-indigo-500/40 blur" />
            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl animate-[popIn_180ms_ease-out]">
              <h3 className="text-xl font-bold mb-2">Xác nhận thanh toán</h3>
              <p className="text-gray-300">Số tiền thanh toán:</p>
              <div className="mt-1 text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-fuchsia-200 to-white">
                {pendingPayment.amount.toLocaleString()} VND
              </div>
              <p className="mt-3 text-gray-400">Tiếp tục đến PayOS để hoàn tất thanh toán?</p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => { setConfirmOpen(false); setPendingPayment(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10"
                >
                  Hủy
                </button>
                <button
                  onClick={() => { const url = pendingPayment.paymentUrl; setConfirmOpen(false); setPendingPayment(null); window.location.href = url; }}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 border border-white/10 shadow-[0_0_20px_rgba(139,92,246,0.25)]"
                >
                  Thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubscriptionPage;


