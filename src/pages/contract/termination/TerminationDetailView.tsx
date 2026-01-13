import { motion } from "framer-motion";
import { CheckCircle2, Wallet, Users } from "lucide-react";
import type { TerminationDetailResponse } from "../../../types/contract";
import {
  formatDateTime,
  formatCurrency,
} from "../../../utils/contractTermination.helpers";
import { TaxDetailsSection, TeamPaymentsSection } from "./PreviewComponents";
import type { ProjectRole } from "../../../types/permission";

interface TerminationDetailViewProps {
  terminationDetail: TerminationDetailResponse;
  projectId: string | null;
  onShowDetailModal: () => void;
  projectRole: ProjectRole;
}

export const TerminationDetailView = ({
  terminationDetail,
  onShowDetailModal,
  projectRole,
}: TerminationDetailViewProps) => {
  const isOwner = projectRole === "OWNER";
  const isClient = projectRole === "CLIENT";

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 flex items-start gap-4"
      >
        <CheckCircle2 className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">
            Hợp đồng đã được chấm dứt
          </h2>
          <p className="text-gray-300">
            Ngày chấm dứt: {formatDateTime(terminationDetail.terminationDate)} |
            Người chấm dứt:{" "}
            {terminationDetail.terminatedBy === "CLIENT"
              ? isClient
                ? "Bạn (Khách hàng)"
                : "Khách hàng"
              : isOwner
              ? "Bạn (Chủ sở hữu)"
              : "Chủ sở hữu"}{" "}
            | Loại:{" "}
            {terminationDetail.terminationType === "BEFORE_DAY_20"
              ? "Trước ngày 20"
              : "Sau ngày 20"}
          </p>
        </div>
      </motion.div>

      {/* Financial Summary - Gộp lại thành layout đẹp hơn */}
      <div className="space-y-3">
        {/* Total Contract Amount - Full width */}
        <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-400/30">
              <Wallet className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">
              Tổng giá trị hợp đồng
            </h3>
            <p className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex-shrink-0 ml-auto">
              {formatCurrency(terminationDetail.totalContractAmount)}
            </p>
          </div>
        </div>

        {/* Second Row: Conditional based on role */}
        {isOwner ? (
          // OWNER view: Team Compensation, Client Refund, Owner Compensation, Status
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Team Compensation */}
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-400/30">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-white flex-1 min-w-0">
                  Tổng đền bù Team
                </h3>
                <p className="text-lg font-bold text-blue-400 flex-shrink-0">
                  {formatCurrency(terminationDetail.totalTeamCompensation)}
                </p>
              </div>
            </div>

            {/* Client Refund */}
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-400/30">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <h3 className="text-sm font-semibold text-white flex-1 min-w-0">
                  Tổng hoàn cho Khách Hàng
                </h3>
                <p className="text-lg font-bold text-green-400 flex-shrink-0">
                  {formatCurrency(terminationDetail.totalClientRefund)}
                </p>
              </div>
            </div>

            {/* Owner Compensation - Show when CLIENT terminated */}
            {terminationDetail.terminatedBy === "CLIENT" && (
              <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2.5">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-400/30">
                    <Wallet className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white flex-1 min-w-0">
                    Bạn sẽ nhận
                  </h3>
                  <p className="text-lg font-bold text-purple-400 flex-shrink-0">
                    {formatCurrency(terminationDetail.totalOwnerCompensation)}
                  </p>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-400/30">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-sm font-semibold text-white flex-1 min-w-0">
                  Trạng thái
                </h3>
                <p
                  className={`text-lg font-bold flex-shrink-0 ${
                    terminationDetail.status === "COMPLETED"
                      ? "text-green-400"
                      : terminationDetail.status === "PARTIAL_COMPLETED"
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
        ) : (
          // CLIENT view: Total Compensation, Client Will Receive, Status
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Total Compensation (Team + Owner) */}
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-400/30">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-white flex-1 min-w-0">
                  Số tiền đền bù
                </h3>
                <p className="text-lg font-bold text-blue-400 flex-shrink-0">
                  {formatCurrency(
                    terminationDetail.totalTeamCompensation +
                      terminationDetail.totalOwnerCompensation
                  )}
                </p>
              </div>
            </div>

            {/* Client Will Receive */}
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-400/30">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <h3 className="text-sm font-semibold text-white flex-1 min-w-0">
                  Bạn sẽ nhận
                </h3>
                <p className="text-lg font-bold text-green-400 flex-shrink-0">
                  {formatCurrency(terminationDetail.totalClientRefund)}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-400/30">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-sm font-semibold text-white flex-1 min-w-0">
                  Trạng thái
                </h3>
                <p
                  className={`text-lg font-bold flex-shrink-0 ${
                    terminationDetail.status === "COMPLETED"
                      ? "text-green-400"
                      : terminationDetail.status === "PARTIAL_COMPLETED"
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
        )}
      </div>

      {/* Tax Details (if after day 20) */}
      {terminationDetail.terminationType === "AFTER_DAY_20" && (
        <TaxDetailsSection
          originalTax={terminationDetail.originalTax}
          actualTax={terminationDetail.actualTax}
          refundedTax={terminationDetail.refundedTax}
        />
      )}

      {/* Reason */}
      {terminationDetail.reason && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 border border-white/20 rounded-2xl p-6"
        >
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
        </motion.div>
      )}

      {/* Team Payments */}
      {terminationDetail.teamPayments && (
        <TeamPaymentsSection teamPayments={terminationDetail.teamPayments} />
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShowDetailModal}
          className="px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
        >
          Xem chi tiết đầy đủ
        </motion.button>
      </div>
    </div>
  );
};
