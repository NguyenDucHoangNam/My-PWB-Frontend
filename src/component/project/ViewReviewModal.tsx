import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Edit, Trash2, Send, Loader } from "lucide-react";
import { useCosmicToast } from "../toast/CosmicToastProvider";
import projectReviewService from "../../services/projectReviewService";

interface ViewReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  projectTitle: string;
  isOwner: boolean; // true nếu user là owner, false nếu là client
  onReviewUpdated?: () => void; // Callback sau khi update/delete
}

export default function ViewReviewModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  isOwner,
  onReviewUpdated,
}: ViewReviewModalProps) {
  const [review, setReview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit states
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [editAllowPublic, setEditAllowPublic] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const { showToast } = useCosmicToast();

  useEffect(() => {
    if (isOpen) {
      fetchReview();
    }
  }, [isOpen, projectId]);

  const fetchReview = async () => {
    try {
      setIsLoading(true);
      const data = await projectReviewService.getProjectReview(projectId);
      setReview(data);
      setEditRating(data.rating);
      setEditComment(data.comment || "");
      setEditAllowPublic(data.allowPublicPortfolio);
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Lỗi",
        message: error.response?.data?.message || "Không thể tải đánh giá",
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (editRating === 0) {
      showToast({
        type: "error",
        title: "Thiếu thông tin",
        message: "Vui lòng chọn số sao",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await projectReviewService.updateReview(projectId, {
        rating: editRating,
        comment: editComment.trim() || undefined,
        allowPublicPortfolio: editAllowPublic,
      });

      showToast({
        type: "success",
        title: "✅ Cập nhật thành công",
        message: "Đánh giá đã được cập nhật",
      });

      setIsEditing(false);
      await fetchReview();
      onReviewUpdated?.();
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Lỗi",
        message: error.response?.data?.message || "Không thể cập nhật",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    setIsSubmitting(true);
    try {
      await projectReviewService.deleteReview(projectId);

      showToast({
        type: "success",
        title: "✅ Xóa thành công",
        message: "Đánh giá đã được xóa",
      });

      onReviewUpdated?.();
      onClose();
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Lỗi",
        message: error.response?.data?.message || "Không thể xóa",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = isEditing ? (hoveredRating || editRating) : review?.rating;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
              <div className="relative bg-gradient-to-br from-purple-900/30 via-fuchsia-900/20 to-indigo-900/30 backdrop-blur-xl border border-purple-400/20 rounded-3xl overflow-hidden">
                {/* Animated background */}
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
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>

                  <h2 className="text-2xl font-bold text-white mb-1">
                    {isEditing ? "Chỉnh sửa đánh giá" : "Đánh giá dự án"}
                  </h2>
                  <p className="text-gray-400 text-sm">{projectTitle}</p>
                </div>

                {/* Content */}
                <div className="relative p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="animate-spin text-fuchsia-400" size={32} />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Rating */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-3">
                          Đánh giá
                        </label>
                        <div className="flex items-center justify-center gap-2 py-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                              key={star}
                              type="button"
                              disabled={!isEditing}
                              whileHover={isEditing ? { scale: 1.2 } : {}}
                              whileTap={isEditing ? { scale: 0.9 } : {}}
                              onClick={() => isEditing && setEditRating(star)}
                              onMouseEnter={() => isEditing && setHoveredRating(star)}
                              onMouseLeave={() => isEditing && setHoveredRating(0)}
                              className="focus:outline-none disabled:cursor-default"
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
                        {displayRating > 0 && (
                          <p className="text-center text-fuchsia-300 font-semibold">
                            {displayRating === 5 && "🌟 Xuất sắc!"}
                            {displayRating === 4 && "😊 Rất tốt!"}
                            {displayRating === 3 && "👍 Tốt"}
                            {displayRating === 2 && "😐 Ổn"}
                            {displayRating === 1 && "😕 Cần cải thiện"}
                          </p>
                        )}
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-2">
                          Nhận xét
                        </label>
                        {isEditing ? (
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            rows={4}
                            placeholder="Nhận xét của bạn..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-fuchsia-400/50 focus:bg-white/10 transition-all resize-none"
                          />
                        ) : (
                          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-300 min-h-[100px]">
                            {review?.comment || <span className="text-gray-500 italic">Không có nhận xét</span>}
                          </div>
                        )}
                      </div>

                      {/* Public toggle - only when editing */}
                      {isEditing && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                              <input
                                type="checkbox"
                                checked={editAllowPublic}
                                onChange={(e) => setEditAllowPublic(e.target.checked)}
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
                                Đánh giá sẽ hiển thị trong portfolio của producer
                              </p>
                            </div>
                          </label>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="text-sm text-gray-400 border-t border-white/10 pt-4 text-right">
                        <span>Ngày đánh giá: {new Date(review?.createdAt).toLocaleDateString("vi-VN")}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3">
                        {!isOwner && !isEditing && (
                          <>
                            <button
                              onClick={() => setIsEditing(true)}
                              className="flex-1 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center justify-center gap-2"
                            >
                              <Edit size={18} />
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={handleDelete}
                              disabled={isSubmitting}
                              className="flex-1 py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-500 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <Trash2 size={18} />
                              Xóa
                            </button>
                          </>
                        )}
                        
                        {isEditing && (
                          <>
                            <button
                              onClick={() => {
                                setIsEditing(false);
                                setEditRating(review?.rating);
                                setEditComment(review?.comment || "");
                                setEditAllowPublic(review?.allowPublicPortfolio);
                              }}
                              className="flex-1 py-3 rounded-xl font-semibold bg-gray-600 hover:bg-gray-500 text-white transition-all"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={handleUpdate}
                              disabled={isSubmitting}
                              className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {isSubmitting ? (
                                <Loader className="animate-spin" size={18} />
                              ) : (
                                <>
                                  <Send size={18} />
                                  Lưu thay đổi
                                </>
                              )}
                            </button>
                          </>
                        )}
                        
                        {isOwner && (
                          <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl font-semibold bg-gray-600 hover:bg-gray-500 text-white transition-all"
                          >
                            Đóng
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

