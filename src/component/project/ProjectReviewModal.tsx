import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Send, Sparkles, CheckCircle } from "lucide-react";
import { useCosmicToast } from "../toast/CosmicToastProvider";
import projectReviewService from "../../services/projectReviewService";

interface ProjectReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  projectTitle: string;
  producerName: string;
  onSubmitSuccess?: () => void;
}

export default function ProjectReviewModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  producerName,
  onSubmitSuccess,
}: ProjectReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [allowPublicPortfolio, setAllowPublicPortfolio] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showToast } = useCosmicToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      showToast({
        type: "error",
        title: "Thiếu đánh giá",
        message: "Vui lòng chọn số sao đánh giá",
      });
      return;
    }

    setIsLoading(true);

    try {
      await projectReviewService.createReview(projectId, {
        rating,
        comment: comment.trim() || undefined,
        allowPublicPortfolio,
      });

      // Show success animation
      setIsSuccess(true);
      
      setTimeout(() => {
        showToast({
          type: "success",
          title: "✨ Đánh giá thành công!",
          message: "Cảm ơn bạn đã chia sẻ trải nghiệm",
        });
        onSubmitSuccess?.();
        handleClose();
      }, 1500);
    } catch (error: any) {
      // Extract error message from API response
      let errorMessage = "Không thể gửi đánh giá";
      let errorTitle = "Lỗi";
      
      if (error.response?.data?.message) {
        // Backend error message
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorTitle = "Không có quyền";
        errorMessage = "Bạn không có quyền đánh giá dự án này";
      } else if (error.response?.status === 400) {
        errorTitle = "Dữ liệu không hợp lệ";
        errorMessage = error.response.data?.message || "Vui lòng kiểm tra lại thông tin đánh giá";
      } else if (error.response?.status === 409) {
        errorTitle = "Đã tồn tại";
        errorMessage = "Bạn đã đánh giá dự án này rồi";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast({
        type: "error",
        title: errorTitle,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment("");
    setAllowPublicPortfolio(false);
    setIsSuccess(false);
    onClose();
  };

  const displayRating = hoveredRating || rating;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl pointer-events-auto"
            >
              {/* Success State */}
              {isSuccess ? (
                <div className="bg-gradient-to-br from-green-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-xl border border-green-400/30 rounded-3xl p-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <CheckCircle className="mx-auto text-green-400 mb-4" size={80} />
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Cảm ơn bạn! 🌟
                    </h2>
                    <p className="text-gray-300">
                      Đánh giá của bạn đã được ghi nhận
                    </p>
                  </motion.div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="relative bg-gradient-to-br from-purple-900/30 via-fuchsia-900/20 to-indigo-900/30 backdrop-blur-xl border border-purple-400/20 rounded-3xl overflow-hidden"
                >
                  {/* Animated background elements */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute -top-20 -right-20 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl"
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                      }}
                      transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"
                    />
                  </div>

                  {/* Header */}
                  <div className="relative p-6 border-b border-white/10">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <X size={20} className="text-gray-400" />
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="text-fuchsia-400" size={24} />
                      <h2 className="text-2xl font-bold text-white">
                        Đánh giá Dự án
                      </h2>
                    </div>
                    <p className="text-gray-400 text-sm">
                      <span className="font-semibold text-white">
                        {projectTitle}
                      </span>{" "}
                      • Producer: {producerName}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="relative p-6 space-y-6">
                    {/* Rating Stars */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-3">
                        Đánh giá của bạn <span className="text-red-400">*</span>
                      </label>
                      <div className="flex items-center justify-center gap-2 py-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="focus:outline-none"
                          >
                            <Star
                              size={40}
                              className={`transition-all duration-200 ${
                                star <= displayRating
                                  ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
                                  : "text-gray-600"
                              }`}
                            />
                          </motion.button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center text-fuchsia-300 font-semibold"
                        >
                          {rating === 5 && "🌟 Xuất sắc!"}
                          {rating === 4 && "😊 Rất tốt!"}
                          {rating === 3 && "👍 Tốt"}
                          {rating === 2 && "😐 Ổn"}
                          {rating === 1 && "😕 Cần cải thiện"}
                        </motion.p>
                      )}
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-2">
                        Nhận xét{" "}
                        <span className="text-gray-500 font-normal">
                          (Không bắt buộc)
                        </span>
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        placeholder="Chia sẻ trải nghiệm của bạn về dự án này..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-fuchsia-400/50 focus:bg-white/10 transition-all resize-none"
                      />
                    </div>

                    {/* Public Portfolio Toggle */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={allowPublicPortfolio}
                            onChange={(e) =>
                              setAllowPublicPortfolio(e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-fuchsia-500 peer-checked:to-purple-500 transition-all duration-300">
                            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5" />
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">
                            Cho phép hiển thị công khai
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Đánh giá của bạn sẽ xuất hiện trong portfolio của
                            producer để những người khác tham khảo
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading || rating === 0}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:via-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Gửi đánh giá
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

