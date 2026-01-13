import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  subscriptionService,
  type ProPackageItem,
  type SubscriptionStatus,
} from "@/services/subscriptionService";
import { ROUTER } from "@/routes/router";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Check,
  Rocket,
  Zap,
  Crown,
  Star,
  ArrowRight,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import AnimatedBackground from "@/component/background/AnimatedBackground";

const ProPackagePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // State
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [packages, setPackages] = useState<ProPackageItem[]>([]); // Khởi tạo mảng rỗng, không dùng Dummy
  const [isPageLoading, setIsPageLoading] = useState(true); // State loading cho lần tải trang đầu tiên
  const [loadingPacketId, setLoadingPacketId] = useState<
    string | number | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  // Memoized Values
  const isActive = useMemo(() => status?.status === "ACTIVE", [status]);

  const viStatus = useMemo(() => {
    const s = (status?.status || "").toUpperCase();
    switch (s) {
      case "ACTIVE":
        return "TRẠNG THÁI: ĐANG BAY (PRO)";
      case "EXPIRED":
        return "TRẠNG THÁI: Chưa có gói PRO";
      case "CANCELLED":
        return "TRẠNG THÁI: Đã hủy gói";
      default:
        return status?.status || "Chưa xác định";
    }
  }, [status]);
  const currentPackageName = useMemo(() => {
    if (!status || status.status !== "ACTIVE") return null;

    const activeStatus = status as SubscriptionStatus & {
      proPackageId?: string | number;
    };

    const currentPackage = packages.find(
      (p) => p.id === activeStatus.proPackageId
    );

    return currentPackage
      ? currentPackage.name.toUpperCase()
      : "GÓI KHÔNG GIAN";
  }, [status, packages]);

  // Gọi API lấy dữ liệu thật
  useEffect(() => {
    const load = async () => {
      setIsPageLoading(true); // Bắt đầu loading
      try {
        setError(null);

        // 1. Lấy trạng thái gói hiện tại của User
        let st: SubscriptionStatus | null = null;
        try {
          st = await subscriptionService.getStatus();
        } catch {
          st = null;
        }
        setStatus(st);

        // 2. Lấy danh sách gói từ Server
        const pk = await subscriptionService.getPackages(0, 10, "id", "asc");
        if (pk && pk.length > 0) {
          setPackages(pk);
        } else {
          setError("Không tìm thấy gói dịch vụ nào từ trạm không gian.");
        }
      } catch (e: any) {
        console.error(e);
        setError(
          e?.message || "Mất kết nối với trạm không gian (Lỗi tải dữ liệu)"
        );
      } finally {
        setIsPageLoading(false); // Kết thúc loading
      }
    };
    load();
  }, []);

  const handleBuy = async (proPackageId: string | number) => {
    try {
      setLoadingPacketId(proPackageId);
      if (!isAuthenticated) {
        navigate(ROUTER.USER.LOGIN);
        return;
      }
      const base = window.location.origin;
      const res = await subscriptionService.purchase({
        proPackageId,
        returnUrl: `${base}${ROUTER.USER.SUBSCRIPTION_RETURN}`,
        cancelUrl: `${base}${ROUTER.USER.SUBSCRIPTION_CANCEL}`,
      });
      window.location.href = res.paymentUrl;
    } catch (e: any) {
      setError(e?.response?.data?.message || "Lỗi khởi động module thanh toán");
    } finally {
      setLoadingPacketId(null);
    }
  };

  // Lọc dữ liệu thật từ API (Có kiểm tra null an toàn)
  const producerProData = useMemo(
    () =>
      packages.find(
        (p) => p.packageType === "MONTHLY" || p.packageType.includes("MONTHLY")
      ),
    [packages]
  );

  const masterCosmosData = useMemo(
    () =>
      packages.find(
        (p) => p.packageType === "YEARLY" || p.packageType.includes("YEARLY")
      ),
    [packages]
  );

  const isProducerProDisabled = useMemo(() => {
    return loadingPacketId === producerProData?.id || isActive;
  }, [loadingPacketId, isActive, producerProData]);

  const isMasterCosmosDisabled = useMemo(() => {
    return (
      loadingPacketId === masterCosmosData?.id ||
      (isActive && masterCosmosData?.name.toUpperCase() === currentPackageName)
    );
  }, [loadingPacketId, isActive, masterCosmosData, currentPackageName]);

  // --- MÀN HÌNH LOADING (Khi đang gọi API) ---
  if (isPageLoading) {
    return (
      <div className="relative min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center font-sans">
        <AnimatedBackground />
        <div className="relative z-10 flex flex-col items-center">
          <Loader2 size={64} className="text-cyan-400 animate-spin mb-4" />
          <p className="text-xl font-['Orbitron'] text-cyan-200 tracking-widest animate-pulse">
            ĐANG KẾT NỐI VỆ TINH...
          </p>
        </div>
      </div>
    );
  }

  // --- MÀN HÌNH CHÍNH (Sau khi có dữ liệu) ---
  return (
    <div className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans flex flex-col">
      <AnimatedBackground />

      {/* Ambient Lights */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <main className="relative z-10 mt-16 flex-grow flex flex-col px-4 py-4 md:py-6">
        {/* --- Header Section --- */}
        <div className="w-full max-w-6xl mx-auto text-center mb-4 space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight"
          >
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              🪐 Chọn Tàu Của Bạn
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm md:text-base text-gray-300 max-w-xl mx-auto"
          >
            Khám phá sức mạnh vũ trụ với các gói dịch vụ PRO của chúng tôi
          </motion.p>
        </div>

        {/* --- Status & Manage Button (Gộp thành 1 ô) --- */}
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`w-full max-w-4xl mx-auto mb-4 p-4 rounded-xl border backdrop-blur-md
              ${
                isActive
                  ? "bg-gradient-to-r from-slate-800/80 via-slate-800/70 to-slate-800/80 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : status.status === "EXPIRED" || status.status === "CANCELLED"
                  ? "bg-gradient-to-r from-slate-800/80 via-slate-800/70 to-slate-800/80 border-yellow-500/30"
                  : "bg-gradient-to-r from-slate-800/80 via-slate-800/70 to-slate-800/80 border-slate-600/30"
              }
            `}
          >
            <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap">
              {/* Status Info - Left */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    isActive
                      ? "bg-emerald-500/20 border border-emerald-500/30"
                      : "bg-yellow-500/20 border border-yellow-500/30"
                  }`}
                >
                  {isActive ? (
                    <Crown size={18} className="text-emerald-400" />
                  ) : (
                    <Zap size={18} className="text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-sm text-white uppercase tracking-wide">
                      {viStatus}
                    </p>
                  </div>
                  {isActive && status.endDate && (
                    <p className="text-xs text-slate-400">
                      Hạn bay:{" "}
                      <span className="text-slate-300 font-medium">
                        {new Date(status.endDate).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Package Name Badge - Center */}
              {isActive && currentPackageName && (
                <div className="flex items-center">
                  <span className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                    {currentPackageName}
                  </span>
                </div>
              )}

              {/* Manage Button - Right */}
              {isActive && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-2.5 rounded-lg 
                             bg-slate-700/90 hover:bg-slate-600/90
                             border border-slate-500/50 hover:border-slate-400/60
                             text-white font-semibold text-xs
                             transition-all duration-200
                             flex items-center gap-2 shrink-0
                             shadow-lg hover:shadow-xl"
                  onClick={() => navigate(ROUTER.USER.PROPACKAGE_MANAGE)}
                >
                  <ArrowLeft size={14} className="rotate-180" />
                  Quản lý
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* --- Error Message (Nếu API lỗi) --- */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl mx-auto mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 backdrop-blur-sm text-center text-sm"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* --- MAIN PACKAGES CONTAINER --- */}
        {producerProData && masterCosmosData && (
          <div className="w-full max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              {/* --- GÓI PRODUCER PRO (Nhỏ hơn) --- */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative group"
              >
                {/* Glow effect - nhỏ hơn */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-cyan-500/15 rounded-lg blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>

                <div className="relative p-4 bg-[#0B0F1A]/90 backdrop-blur-xl border border-cyan-500/20 rounded-lg h-full flex flex-col shadow-lg hover:border-cyan-500/40 transition-all duration-300">
                  {/* Header */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-md border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
                        <Rocket size={16} />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-white uppercase">
                          {producerProData.name}
                        </h3>
                        <p className="text-[10px] text-cyan-400/70 mt-0.5">
                          Gói hàng tháng
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-2 p-2 rounded-md bg-white/5 border border-white/10 backdrop-blur-sm">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                          ${producerProData.price}
                        </span>
                        <span className="text-slate-400 text-sm">
                          {producerProData.currency}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {producerProData.description ||
                          "Nâng cấp lên PRODUCER, tạo và quản lý dự án chuyên nghiệp."}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-grow mb-3">
                    <ul className="space-y-1.5">
                      {[
                        "Nâng cấp vai trò từ CUSTOMER lên PRODUCER",
                        "Tạo và quản lý dự án không giới hạn",
                        "Quản lý Milestone, Hợp đồng và Phụ lục",
                        "Quản lý Track, Chi phí và Phân chia tiền",
                        "Quản lý Giao hàng cho Client (Client Delivery)",
                        "Truy cập Customer Room và Internal Room",
                        "Mời và quản lý thành viên dự án",
                      ].map((feat, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="flex items-start gap-1.5 text-[11px] text-slate-300"
                        >
                          <div className="mt-0.5 p-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30">
                            <Check
                              size={10}
                              className="text-cyan-400 shrink-0"
                            />
                          </div>
                          <span>{feat}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Button */}
                  <motion.button
                    onClick={() => handleBuy(producerProData.id)}
                    disabled={isProducerProDisabled}
                    whileHover={!isProducerProDisabled ? { scale: 1.02 } : {}}
                    whileTap={!isProducerProDisabled ? { scale: 0.98 } : {}}
                    className={`w-full py-2 rounded-lg text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 group/btn relative overflow-hidden
                      ${
                        isProducerProDisabled
                          ? "bg-slate-700/50 cursor-not-allowed text-slate-400"
                          : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]"
                      }
                    `}
                  >
                    {loadingPacketId === producerProData.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : isActive &&
                      producerProData.name.toUpperCase() ===
                        currentPackageName ? (
                      "ĐANG SỬ DỤNG GÓI NÀY"
                    ) : (
                      <>
                        Chọn Gói Này
                        {!isProducerProDisabled && (
                          <ArrowRight
                            size={12}
                            className="group-hover/btn:translate-x-1 transition-transform"
                          />
                        )}
                      </>
                    )}
                    {!isProducerProDisabled && (
                      <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:left-full transition-all duration-700"></div>
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {/* --- GÓI MASTER COSMOS (Nổi bật hơn) --- */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="relative group lg:scale-[1.03]"
              >
                {/* Premium Glow effect - mạnh hơn */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/40 via-fuchsia-500/40 to-pink-500/40 rounded-lg blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400/20 via-fuchsia-400/20 to-pink-400/20 rounded-lg blur-md opacity-50"></div>

                <div className="relative p-4 bg-gradient-to-br from-[#1a0f2e] via-[#120f26] to-[#0f0b1a] border-2 border-purple-500/50 rounded-lg h-full flex flex-col shadow-2xl hover:border-purple-400/70 transition-all duration-300 overflow-hidden">
                  {/* Background effects */}
                  <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-purple-600/15 rounded-full blur-[60px] pointer-events-none"></div>
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay"></div>

                  {/* Best Value Badge - lớn hơn */}
                  <div className="absolute top-3 right-3 z-10">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: "spring" }}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-500/40 to-orange-500/40 border-2 border-amber-400/60 rounded-full text-amber-200 text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.6)] backdrop-blur-sm"
                    >
                      <Star
                        size={10}
                        fill="currentColor"
                        className="text-amber-300"
                      />
                      Best Value
                    </motion.span>
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-lg shadow-[0_0_25px_rgba(192,38,211,0.7)] text-white">
                          <Crown size={20} strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-1.5 uppercase">
                            {masterCosmosData.name}
                          </h3>
                          <p className="text-fuchsia-300/80 text-xs mt-0.5 font-medium">
                            Toàn quyền kiểm soát vũ trụ âm thanh
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-3 p-2.5 rounded-md bg-white/8 border border-white/15 backdrop-blur-sm shadow-lg">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            ${masterCosmosData.price}
                          </span>
                          <span className="text-slate-200 text-base font-semibold">
                            {masterCosmosData.currency}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-400 mt-1.5 font-bold flex items-center gap-1">
                          <Zap size={10} fill="currentColor" />
                          Tiết kiệm 20% so với gói hàng tháng
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex-grow mb-3">
                      <ul className="space-y-1.5">
                        {[
                          "Tất cả tính năng của gói PRO hàng tháng",
                          "Tiết kiệm 20% so với gói hàng tháng",
                        ].map((feat, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="flex items-start gap-2 text-[11px] text-slate-100 font-medium"
                          >
                            <div className="mt-0.5 p-0.5 rounded-full bg-gradient-to-r from-fuchsia-500/40 to-purple-500/40 border border-fuchsia-400/50 shadow-[0_0_6px_rgba(192,38,211,0.3)]">
                              <Check
                                size={10}
                                strokeWidth={2.5}
                                className="text-fuchsia-200"
                              />
                            </div>
                            <span>{feat}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Button - nổi bật hơn */}
                    <motion.button
                      onClick={() => handleBuy(masterCosmosData.id)}
                      disabled={isMasterCosmosDisabled}
                      whileHover={
                        !isMasterCosmosDisabled ? { scale: 1.05 } : {}
                      }
                      whileTap={!isMasterCosmosDisabled ? { scale: 0.98 } : {}}
                      className={`w-full py-2.5 rounded-lg font-bold text-white text-xs tracking-wide uppercase transition-all shadow-xl relative overflow-hidden group
                        ${
                          isMasterCosmosDisabled
                            ? "bg-slate-700/50 cursor-not-allowed text-slate-400"
                            : "bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:via-purple-500 hover:to-indigo-500 hover:shadow-purple-500/60 shadow-purple-500/40"
                        }
                      `}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-1.5">
                        {loadingPacketId === masterCosmosData.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : isActive &&
                          masterCosmosData.name.toUpperCase() ===
                            currentPackageName ? (
                          "ĐANG SỬ DỤNG GÓI NÀY"
                        ) : (
                          <>
                            KÍCH HOẠT SỨC MẠNH NGAY
                            {!isMasterCosmosDisabled && (
                              <Zap size={14} fill="currentColor" />
                            )}
                          </>
                        )}
                      </span>
                      {!isMasterCosmosDisabled && (
                        <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:left-full transition-all duration-700"></div>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProPackagePage;
