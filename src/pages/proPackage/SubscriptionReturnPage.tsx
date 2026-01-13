import { useEffect, useMemo, useState } from "react";
import { subscriptionService, type SubscriptionStatus } from "@/services/subscriptionService";
import { Link } from "react-router-dom";
import { ROUTER } from "@/routes/router";

const SubscriptionReturnPage = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const viStatus = useMemo(() => {
    const s = (status?.status || "").toUpperCase();
    switch (s) {
      case "ACTIVE":
        return "Đang sử dụng gói PRO";
      case "EXPIRED":
        return "Chưa bật gói PRO";
      case "CANCELLED":
        return "Đã hủy gói PRO";
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

  const message = useMemo(() => {
    if (!status) return "Đang kiểm tra trạng thái thanh toán...";
    if (status.status === "ACTIVE" && !status.graceUntil) return "Thanh toán thành công! Gói PRO đã được kích hoạt.";
    if (status.status === "ACTIVE" && status.graceUntil) return `Tài khoản đang trong thời gian ân hạn, cần gia hạn trước ${status.graceUntil}.`;
    return "Thanh toán đang chờ xác nhận hoặc đã bị hủy. Bạn có thể thử lại.";
  }, [status]);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const st = await subscriptionService.getStatus();
        setStatus(st);
      } catch (e: any) {
        setError(e?.message || "Không thể tải trạng thái thanh toán");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-[#0a0226] to-[#1a0033] text-white overflow-hidden flex items-center justify-center">
      {/* Nền sao */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: "0 0 6px rgba(255,255,255,0.8)",
              animation: `floatUp ${6 + Math.random() * 6}s linear infinite`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-2xl mx-auto px-6">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10 text-center shadow-2xl shadow-purple-900/30">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-600/30 rounded-full blur-2xl" />
          <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-fuchsia-500/20 rounded-full blur-2xl" />

          <h1 className="relative z-10 text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Kết quả thanh toán</h1>

          {loading && <p className="relative z-10 text-lg md:text-xl text-gray-200">Đang kiểm tra...</p>}
          {error && <p className="relative z-10 text-lg md:text-xl text-red-300">{error}</p>}

          {!loading && !error && (
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-center">
                <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm md:text-base ${statusColor}`}>
                  <span className="h-2 w-2 rounded-full bg-current"></span>
                  <span className="font-semibold tracking-wide">{viStatus}</span>
                </span>
              </div>
              {status?.graceUntil && (
                <p className="text-yellow-300 text-base md:text-lg">Ân hạn đến: {status.graceUntil}</p>
              )}
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed">{message}</p>

              <div className="mt-6 flex justify-center gap-3">
                <Link className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-base md:text-lg font-medium transition-colors" to={ROUTER.USER.PROPACKAGE}>Về trang gói PRO</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionReturnPage;


