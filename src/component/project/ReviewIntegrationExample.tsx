/**
 * 📘 EXAMPLE: Cách tích hợp Project Review vào ProjectDetailPage
 * 
 * Copy những phần code này vào ProjectDetailPage.tsx của bạn
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Award } from "lucide-react";
import ProjectReviewModal from "./ProjectReviewModal";

// ============================================
// EXAMPLE 1: Thêm State và Logic
// ============================================

function ProjectDetailPageExample() {
  // 1. Import và state cho modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [canReview, setCanReview] = useState(false);
  
  // Mock data - thay bằng data thật từ props/context
  const project = {
    id: 123,
    title: "Sản xuất Beat EDM",
    status: "COMPLETED",
    creator: {
      id: 1,
      fullName: "Trần Văn Producer",
    },
    client: {
      id: 2,
    },
    hasReview: false, // Nếu backend trả về
  };
  
  const currentUserId = 2; // Lấy từ AuthContext

  // 2. Kiểm tra điều kiện có thể review
  useEffect(() => {
    if (project) {
      const isClient = project.client?.id === currentUserId;
      const isCompleted = project.status === "COMPLETED";
      const notReviewed = !project.hasReview;
      
      setCanReview(isClient && isCompleted && notReviewed);
    }
  }, [project, currentUserId]);

  return (
    <div className="min-h-screen bg-[#07051C] text-white">
      {/* Your existing project detail content */}
      
      {/* ============================================ */}
      {/* EXAMPLE 2: Nút Review - Style 1 (Button)    */}
      {/* ============================================ */}
      {canReview && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsReviewModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(251,191,36,0.5)] hover:shadow-[0_0_30px_rgba(251,191,36,0.7)] transition-all"
        >
          <Star size={20} className="fill-white" />
          Đánh giá dự án
        </motion.button>
      )}

      {/* ============================================ */}
      {/* EXAMPLE 3: Nút Review - Style 2 (Banner)    */}
      {/* ============================================ */}
      {canReview && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-400/30 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <Star className="text-yellow-400 fill-yellow-400" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  🎉 Dự án đã hoàn thành!
                </h3>
                <p className="text-gray-300">
                  Hãy chia sẻ trải nghiệm hợp tác của bạn với Producer
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsReviewModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-bold text-white hover:shadow-lg transition-all"
            >
              Đánh giá ngay
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ============================================ */}
      {/* EXAMPLE 4: Nút Review - Style 3 (FAB)       */}
      {/* ============================================ */}
      {canReview && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsReviewModalOpen(true)}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.6)] hover:shadow-[0_0_40px_rgba(251,191,36,0.8)] transition-all z-40 group"
          title="Đánh giá dự án"
        >
          <Star className="text-white fill-white group-hover:rotate-12 transition-transform" size={28} />
        </motion.button>
      )}

      {/* ============================================ */}
      {/* EXAMPLE 5: Modal Component (Required)       */}
      {/* ============================================ */}
      <ProjectReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        projectId={project.id}
        projectTitle={project.title}
        producerName={project.creator.fullName}
        onSubmitSuccess={() => {
          // Callback sau khi review thành công
          setCanReview(false);
          
          // Optional: Refresh project data
          // fetchProjectDetails();
          
          // Optional: Show success message
          console.log("Review submitted successfully!");
        }}
      />
    </div>
  );
}

// ============================================
// EXAMPLE 6: Link to Producer Portfolio
// ============================================

function ProducerCardExample() {
  const producerId = 1;
  const reviewCount = 15;

  return (
    <div className="p-6 bg-white/5 rounded-2xl">
      {/* Producer info */}
      <h3 className="text-xl font-bold mb-4">Trần Văn Producer</h3>
      
      {/* Link to Portfolio */}
      <a
        href={`/producer/${producerId}/portfolio`}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg hover:bg-purple-500/30 transition-all group"
      >
        <Award size={18} className="text-purple-400 group-hover:rotate-12 transition-transform" />
        <span className="text-white font-semibold">
          Xem Portfolio
        </span>
        <span className="px-2 py-0.5 bg-purple-500/30 rounded-full text-xs text-purple-300">
          {reviewCount}
        </span>
      </a>
    </div>
  );
}

// ============================================
// EXAMPLE 7: Route Configuration
// ============================================

/**
 * Thêm vào file routes/router.tsx:
 * 
 * import ProducerPortfolioPage from "../pages/producer/ProducerPortfolioPage";
 * 
 * {
 *   path: "/producer/:producerId/portfolio",
 *   element: <ProducerPortfolioPage />,
 * }
 */

export { ProjectDetailPageExample, ProducerCardExample };

