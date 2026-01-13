import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Quote, Calendar, Music, Sparkles, Award } from "lucide-react";
import projectReviewService, {
  type ProjectReviewResponse,
} from "../../services/projectReviewService";
import { useCosmicToast } from "../../component/toast/CosmicToastProvider";

export default function ProducerPortfolioPage() {
  const { producerId } = useParams<{ producerId: string }>();
  const [reviews, setReviews] = useState<ProjectReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [producerName, setProducerName] = useState("");
  const { showToast } = useCosmicToast();

  useEffect(() => {
    if (producerId) {
      fetchPortfolio();
    }
  }, [producerId]);

  const fetchPortfolio = async () => {
    if (!producerId) return;

    try {
      setIsLoading(true);
      const data = await projectReviewService.getProducerPortfolio(
        parseInt(producerId)
      );

      if (data && data.length > 0) {
        setReviews(data);
        setProducerName(data[0].producerName);
      }
    } catch (error: any) {
      console.error("Error fetching portfolio:", error);
      
      // Show error toast
      let errorMessage = "Không thể tải portfolio";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = "Không tìm thấy producer này";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast({
        type: "error",
        title: "Lỗi tải dữ liệu",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      reviews.length > 0
        ? ((reviews.filter((r) => r.rating === star).length / reviews.length) *
            100
          ).toFixed(0)
        : "0",
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07051C] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07051C] text-white font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-fuchsia-600/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-2xl animation-delay-4000 animate-blob" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-purple-500/10 border border-purple-400/20 rounded-full">
            <Award className="text-fuchsia-400" size={20} />
            <span className="text-sm font-semibold text-fuchsia-300">
              Portfolio Công Khai
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 mb-3">
            {producerName || "Producer"}
          </h1>
          <p className="text-gray-400">
            Đánh giá từ những khách hàng đã hợp tác
          </p>
        </motion.div>

        {reviews.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Sparkles className="mx-auto text-gray-600 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">
              Chưa có đánh giá
            </h2>
            <p className="text-gray-500">
              Producer này chưa có đánh giá công khai nào
            </p>
          </motion.div>
        ) : (
          <>
            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              {/* Average Rating Card */}
              <div className="bg-gradient-to-br from-purple-900/30 via-fuchsia-900/20 to-indigo-900/30 backdrop-blur-xl border border-purple-400/20 rounded-2xl p-6 text-center">
                <div className="text-5xl font-bold text-yellow-400 mb-2">
                  {averageRating}
                </div>
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      className={
                        star <= Math.round(parseFloat(averageRating))
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-600"
                      }
                    />
                  ))}
                </div>
                <p className="text-gray-400 text-sm">Điểm trung bình</p>
              </div>

              {/* Total Reviews Card */}
              <div className="bg-gradient-to-br from-blue-900/30 via-cyan-900/20 to-teal-900/30 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-6 text-center">
                <Music className="mx-auto text-blue-400 mb-3" size={40} />
                <div className="text-3xl font-bold text-white mb-1">
                  {reviews.length}
                </div>
                <p className="text-gray-400 text-sm">Dự án hoàn thành</p>
              </div>

              {/* Rating Distribution */}
              <div className="bg-gradient-to-br from-pink-900/30 via-rose-900/20 to-red-900/30 backdrop-blur-xl border border-pink-400/20 rounded-2xl p-6">
                <p className="text-sm font-semibold text-gray-300 mb-3">
                  Phân bố đánh giá
                </p>
                {ratingDistribution.map(({ star, count, percentage }) => (
                  <div key={star} className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400 w-8">{star}⭐</span>
                    <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8">{count}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-400/30 transition-all duration-300"
                >
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Music size={18} className="text-purple-400" />
                        {review.projectTitle}
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-600"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(review.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review Comment */}
                  {review.comment && (
                    <div className="relative pl-8">
                      <Quote
                        className="absolute left-0 top-0 text-purple-400/30"
                        size={24}
                      />
                      <p className="text-gray-300 italic leading-relaxed">
                        "{review.comment}"
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

