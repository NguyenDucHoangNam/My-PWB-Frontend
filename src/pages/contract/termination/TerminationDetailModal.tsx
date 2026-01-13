import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, Loader2, XCircle, Wallet } from "lucide-react";
import type { TerminationDetailResponse } from "../../../types/contract";
import {
  formatCurrency,
  formatDateTime,
} from "../../../utils/contractTermination.helpers";
import { TeamPaymentsSection } from "./PreviewComponents";
import type { ProjectRole } from "../../../types/permission";

interface TerminationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  terminationDetail: TerminationDetailResponse | null;
  projectRole: ProjectRole;
}

export const TerminationDetailModal = ({
  isOpen,
  onClose,
  isLoading,
  terminationDetail,
  projectRole,
}: TerminationDetailModalProps) => {
  const isOwner = projectRole === "OWNER";
  const isClient = projectRole === "CLIENT";

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
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/50">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Chi tiết chấm dứt hợp đồng
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Thông tin chi tiết về quá trình chấm dứt
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mb-4" />
                    <p className="text-white text-lg">Đang tải chi tiết...</p>
                  </div>
                ) : terminationDetail ? (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white/10 border border-white/20 rounded-xl p-3 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-400 text-xs">
                            Người chấm dứt
                          </p>
                          <p className="text-white font-semibold text-sm">
                            {terminationDetail.terminatedBy === "CLIENT"
                              ? isClient
                                ? "Bạn (Khách hàng)"
                                : "Khách hàng"
                              : isOwner
                              ? "Bạn (Chủ sở hữu)"
                              : "Chủ sở hữu"}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white/10 border border-white/20 rounded-xl p-3 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-400 text-xs">Loại chấm dứt</p>
                          <p className="text-white font-semibold text-sm">
                            {terminationDetail.terminationType ===
                            "BEFORE_DAY_20"
                              ? "Trước ngày 20"
                              : "Sau ngày 20"}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white/10 border border-white/20 rounded-xl p-3 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-400 text-xs">Ngày chấm dứt</p>
                          <p className="text-white font-semibold text-sm">
                            {formatDateTime(terminationDetail.terminationDate)}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white/10 border border-white/20 rounded-xl p-3 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-400 text-xs">Trạng thái</p>
                          <p
                            className={`font-semibold text-sm ${
                              terminationDetail.status === "COMPLETED"
                                ? "text-green-400"
                                : terminationDetail.status ===
                                  "PARTIAL_COMPLETED"
                                ? "text-yellow-400"
                                : terminationDetail.status === "PROCESSING"
                                ? "text-blue-400"
                                : "text-red-400"
                            }`}
                          >
                            {terminationDetail.status === "COMPLETED"
                              ? "Hoàn tất"
                              : terminationDetail.status === "PARTIAL_COMPLETED"
                              ? "Hoàn tất một phần"
                              : terminationDetail.status === "PROCESSING"
                              ? "Đang xử lý"
                              : "Thất bại"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-400/30">
                          <Wallet className="w-4 h-4 text-cyan-400" />
                        </div>
                        <h3 className="text-base font-semibold text-white">
                          Tổng quan tài chính
                        </h3>
                      </div>

                      {isOwner ? (
                        // OWNER view
                        <>
                          {/* Total Contract Amount - Full width */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                              <p className="text-gray-400 text-xs">
                                Tổng giá trị hợp đồng
                              </p>
                              <p className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                {formatCurrency(
                                  terminationDetail.totalContractAmount
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Team Compensation and Client Refund - Same row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                              <p className="text-gray-400 text-xs">
                                Tổng đền bù Team
                              </p>
                              <p className="text-base font-bold text-blue-400">
                                {formatCurrency(
                                  terminationDetail.totalTeamCompensation
                                )}
                              </p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                              <p className="text-gray-400 text-xs">
                                Tổng hoàn cho Khách Hàng
                              </p>
                              <p className="text-base font-bold text-green-400">
                                {formatCurrency(
                                  terminationDetail.totalClientRefund
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Owner Compensation */}
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-gray-400 text-xs">Bạn sẽ nhận</p>
                            <p className="text-base font-bold text-purple-400">
                              {formatCurrency(
                                terminationDetail.totalOwnerCompensation
                              )}
                            </p>
                          </div>
                        </>
                      ) : (
                        // CLIENT view
                        <>
                          {/* Total Contract Amount - Full width */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                              <p className="text-gray-400 text-xs">
                                Tổng giá trị hợp đồng
                              </p>
                              <p className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                {formatCurrency(
                                  terminationDetail.totalContractAmount
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Total Compensation (Team + Owner) and Client Will Receive - Same row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                              <p className="text-gray-400 text-xs">
                                Số tiền đền bù
                              </p>
                              <p className="text-base font-bold text-blue-400">
                                {formatCurrency(
                                  terminationDetail.totalTeamCompensation +
                                    terminationDetail.totalOwnerCompensation
                                )}
                              </p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                              <p className="text-gray-400 text-xs">
                                Bạn sẽ nhận
                              </p>
                              <p className="text-base font-bold text-green-400">
                                {formatCurrency(
                                  terminationDetail.totalClientRefund
                                )}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Reason */}
                    {terminationDetail.reason && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-3">
                          Lý do chấm dứt
                        </h3>
                        <p className="text-gray-300">
                          {terminationDetail.terminatedBy === "CLIENT"
                            ? isClient
                              ? `Bạn đã chấm dứt: ${terminationDetail.reason}`
                              : `Khách hàng đã chấm dứt: ${terminationDetail.reason}`
                            : isOwner
                            ? `Bạn đã chấm dứt: ${terminationDetail.reason}`
                            : `Chủ sở hữu đã chấm dứt: ${terminationDetail.reason}`}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {terminationDetail.notes && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-3">
                          Ghi chú
                        </h3>
                        <p className="text-gray-300">
                          {terminationDetail.notes}
                        </p>
                      </div>
                    )}

                    {/* Team Payments */}
                    {terminationDetail.teamPayments && (
                      <TeamPaymentsSection
                        teamPayments={terminationDetail.teamPayments}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <XCircle className="w-12 h-12 text-red-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">
                      Không tìm thấy dữ liệu
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Không thể tải thông tin chi tiết chấm dứt.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
                >
                  Đóng
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
