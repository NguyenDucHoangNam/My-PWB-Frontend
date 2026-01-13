import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Rocket, Star, Sparkles, X, Music2 } from "lucide-react"; // Đã loại bỏ 'Moon' vì không dùng

type ToastType = "success" | "error" | "info";
type ToastVariant = "rocket" | "note"; // chọn hiệu ứng

interface CosmicToastProps {
  message: string;
  type?: ToastType;
  duration?: number; // ms
  onClose?: () => void;
  variant?: ToastVariant; // "rocket" (default) | "note"
}

export default function CosmicToast({
  message,
  type = "info",
  duration = 2500,
  onClose,
  variant = "rocket",
}: CosmicToastProps) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  // [REFINED] Thay đổi viền (border) thành hiệu ứng phát sáng (shadow)
  const typeStyles: Record<ToastType, string> = {
    success: "shadow-green-500/20",
    error: "shadow-rose-500/20",
    info: "shadow-accent/20",
  };

  // [REMOVED] Đã loại bỏ accentBarStyles vì nó làm bố cục phức tạp
  // và hiệu ứng shadow mới đã đủ để phân biệt 'type'

  const icons: Record<ToastType, ReactNode> = {
    success: <Rocket className="w-6 h-6 text-green-400" />,
    error: <Star className="w-6 h-6 text-rose-400" />,
    info: <Sparkles className="w-6 h-6 text-accent" />,
  };

  // starfield ngẫu nhiên (nhẹ, trang trí)
  const stars = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 80}%`,
        right: `${Math.random() * 120}%`,
        size: Math.random() > 0.5 ? 2 : 3,
        tw: Math.random() > 0.5 ? "opacity-50" : "opacity-80",
        twDelay: `${Math.floor(Math.random() * 1200)}ms`,
      })),
    []
  );

  // variants chuyển động chính (giữ nguyên)
  const enterExit: Variants =
    variant === "rocket"
      ? {
          initial: { x: 60, y: -20, rotate: 6, opacity: 0, scale: 0.96 },
          animate: {
            x: 0,
            y: 0,
            rotate: 0,
            opacity: 1,
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 520,
              damping: 32,
            },
          },
          exit: {
            x: 80,
            y: -30,
            rotate: 10,
            opacity: 0,
            scale: 0.96,
            transition: { duration: 0.25, ease: "easeIn" },
          },
        }
      : {
          initial: { x: 70, y: 10, opacity: 0, scale: 0.98 },
          animate: {
            x: 0,
            y: [0, -3, 0, 3, 0],
            opacity: 1,
            scale: 1,
            transition: {
              x: { type: "spring", stiffness: 420, damping: 30 },
              y: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
            },
          },
          exit: {
            x: 60,
            y: 20,
            opacity: 0,
            scale: 0.98,
            transition: { duration: 0.22, ease: "easeOut" },
          },
        };

  // trail sau icon (giữ nguyên)
  const Trail =
    variant === "rocket"
      ? () => (
          <div className="pointer-events-none absolute -bottom-1 left-0 translate-x-[-6px]">
            <motion.div
              initial={{ opacity: 0.9, scaleY: 0.8 }}
              animate={{ opacity: [0.8, 0.4, 0.2, 0], scaleY: [0.8, 1.1, 1.3, 1.5] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror" }}
              className="h-3 w-10 rounded-full blur-md"
              style={{
                background:
                  "radial-gradient(60% 120% at 0% 50%, rgba(255,170,0,0.6), rgba(255,0,128,0.0))",
              }}
            />
          </div>
        )
      : () => (
          <div className="pointer-events-none absolute -left-2 -top-1 flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                initial={{ x: 12 + i * 4, y: i * -2, opacity: 0 }}
                animate={{ x: 0, y: [0, -2, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="inline-flex"
              >
                <Music2 className="w-3 h-3 text-accent/70" />
              </motion.span>
            ))}
          </div>
        );

  return (
    <div className="fixed top-6 right-6 z-[9999]">
      <AnimatePresence
        onExitComplete={() => {
          onClose?.();
        }}
      >
        {open && (
          <motion.div {...enterExit} className="relative">
            <div
              className={`relative flex items-start gap-4 rounded-2xl border border-white/10 p-4 shadow-xl bg-dark-surface/95 backdrop-blur text-text-primary max-w-md ${typeStyles[type]}`}
              // [REFINED] Bố cục:
              // - Dùng 'p-4' (padding 4) cho cân đối
              // - Thêm 'border border-white/10' (viền kính)
              // - 'typeStyles' giờ là 'shadow-*' (phát sáng)
            >
              {/* Starfield & nền vũ trụ */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-accent/0 to-purple-500/5" />
                {stars.map((s) => (
                  <motion.span
                    key={s.id}
                    className={`absolute rounded-full bg-white ${s.tw}`}
                    style={{
                      top: s.top,
                      right: s.right,
                      width: s.size,
                      height: s.size,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.6, 0.2, 0.8] }}
                    transition={{
                      duration: 1.2 + Math.random() * 1.2,
                      repeat: Infinity,
                      delay: parseInt(s.twDelay) / 1000,
                    }}
                  />
                ))}
              </div>

              {/* Icon + trail */}
              <div className="relative mt-0.5 flex-shrink-0">
                <motion.div
                  initial={{ rotate: variant === "rocket" ? -10 : 0, y: 0 }}
                  animate={{
                    rotate: variant === "rocket" ? [0, -2, 0, 2, 0] : 0,
                    y: variant === "rocket" ? [0, -1, 0, 1, 0] : 0,
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  {icons[type]}
                  <Trail />
                  {/* glow */}
                  <span className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-br from-accent/15 to-transparent blur-md" />
                </motion.div>
              </div>

              {/* Nội dung */}
              <div className="relative flex-1">
                {/* [REMOVED] Đã bỏ thanh accent bar tuyệt đối (absolute) */}
                {/* tiêu đề/message */}
                <p className="font-semibold text-base leading-6">{message}</p>
                {/* [REMOVED] Đã bỏ mini equalizer cho gọn gàng */}
              </div>

              {/* nút đóng */}
              <button
                type="button"
                aria-label="Close notification"
                onClick={() => setOpen(false)}
                className="relative z-10 ml-auto flex-shrink-0 rounded-md p-1 text-text-secondary hover:text-text-primary hover:bg-dark-bg/60 transition-colors"
                // [REFINED] 'p-1' (gọn hơn), 'flex-shrink-0' (chống co), 'relative z-10' (đảm bảo ở trên)
              >
                <X className="w-4 h-4" />
              </button>

              {/* [REMOVED] Đã bỏ Orbit ring, Moon, Music2 nền */}
              {/* Giữ cho bố cục sạch sẽ hơn */}

              {/* progress bar đếm ngược */}
              <motion.span
                className="pointer-events-none absolute left-0 right-0 -bottom-[1px] h-[2px] bg-gradient-to-r from-accent via-purple-500 to-transparent rounded-b-2xl"
                initial={{ width: "100%" }}
                animate={{ width: 0 }}
                transition={{ duration: duration / 1000, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
