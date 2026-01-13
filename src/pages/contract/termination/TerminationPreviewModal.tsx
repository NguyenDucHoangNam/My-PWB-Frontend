import {
  Calculator,
  X,
  Loader2,
  CheckCircle2,
  Info,
  XCircle,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import type {
  TerminationPreviewResponse,
  TerminationExecuteResponse,
  TerminationDetailResponse,
} from "../../../types/contract";
import { isOwnerResponse } from "../../../utils/contractTermination.helpers";
import {
  PreviewSummaryCards,
  TerminationForm,
  TerminationResultBanner,
  TeamMembersList,
} from "./PreviewComponents";

interface TerminationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  previewData: TerminationPreviewResponse | null;
  error: string | null;
  terminationResult: TerminationExecuteResponse | null;
  terminationReason: string;
  setTerminationReason: (reason: string) => void;
  isExecuting: boolean;
  paymentStatus: string | null;
  paymentOrderCode: string | null;
  contractId: string | null;
  projectId: string | null;
  terminationDetail: TerminationDetailResponse | null;
  onCheckCompensation: () => Promise<void>;
  onExecuteTermination: () => Promise<void>;
  onShowDetailModal: () => void;
  onLoadTerminationDetail: () => Promise<void>;
}

export const TerminationPreviewModal = ({
  isOpen,
  onClose,
  loading,
  previewData,
  error,
  terminationResult,
  terminationReason,
  setTerminationReason,
  isExecuting,
  paymentStatus,
  paymentOrderCode,
  contractId,
  terminationDetail,
  onCheckCompensation,
  onExecuteTermination,
  onShowDetailModal,
  onLoadTerminationDetail,
}: TerminationPreviewModalProps) => {
  const isOwner = previewData ? isOwnerResponse(previewData) : false;
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfirmTermination = () => {
    setShowConfirmModal(false);
    onExecuteTermination();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        {/* Modal Content */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 border border-white/10 rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/50">
                <Calculator className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Mức đền bù chấm dứt hợp đồng
                </h2>
                <p className="text-gray-400 text-xs">
                  {previewData && (isOwner ? "Chủ sở hữu" : "Khách hàng")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
                <p className="text-white text-base">
                  Đang kiểm tra mức đền bù...
                </p>
              </div>
            ) : terminationResult &&
              terminationResult.terminationId &&
              terminationResult.newStatus === "TERMINATED" ? (
              // Success state
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="w-12 h-12 text-green-400 mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Chấm dứt hợp đồng thành công
                </h3>
                <p className="text-gray-300 mb-4 text-center max-w-md text-sm">
                  {terminationResult.message}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onShowDetailModal();
                      if (!terminationDetail && contractId) {
                        onLoadTerminationDetail();
                      }
                    }}
                    className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ) : terminationResult && terminationResult.paymentUrl ? (
              // OWNER termination: waiting for payment
              // Ưu tiên hiển thị trạng thái "Đang chờ thanh toán" khi có paymentUrl
              // KHÔNG hiển thị error state trong trường hợp này
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-cyan-400 mb-3 animate-spin" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Đang chờ thanh toán
                </h3>
                <p className="text-gray-300 mb-4 text-center max-w-md text-sm">
                  {paymentStatus === "PENDING"
                    ? "Vui lòng hoàn tất thanh toán trên PayOS. Hệ thống sẽ tự động cập nhật khi thanh toán thành công."
                    : paymentStatus === "SUCCESSFUL"
                    ? "Thanh toán thành công. Đang cập nhật thông tin..."
                    : paymentStatus === "FAILED"
                    ? "Thanh toán thất bại. Vui lòng thử lại."
                    : "Đang kiểm tra trạng thái thanh toán..."}
                </p>
                {paymentOrderCode && (
                  <p className="text-gray-400 text-xs mb-3">
                    Mã giao dịch:{" "}
                    <span className="font-mono">{paymentOrderCode}</span>
                  </p>
                )}
                {terminationResult.message && (
                  <p className="text-gray-400 text-xs mb-3 italic">
                    {terminationResult.message}
                  </p>
                )}
                <div className="flex gap-2">
                  {terminationResult.paymentUrl &&
                    paymentStatus !== "SUCCESSFUL" && (
                      <button
                        onClick={() =>
                          window.open(
                            terminationResult!.paymentUrl,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                        className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center gap-2 text-sm"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Thanh toán ngay</span>
                      </button>
                    )}
                </div>
              </div>
            ) : error && !terminationResult?.paymentUrl ? (
              // Error state: chỉ hiển thị khi KHÔNG có paymentUrl trong terminationResult
              // Tuyệt đối không hiển thị error khi có paymentUrl
              // Error state
              error === "CONTRACT_ALREADY_TERMINATED_INFO" ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Info className="w-10 h-10 text-blue-400 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">
                    Thông báo
                  </h3>
                  <p className="text-gray-300 mb-4 text-center max-w-md text-sm">
                    Hợp đồng đã chấm dứt rồi.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 text-sm"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <XCircle className="w-10 h-10 text-red-400 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">Lỗi</h3>
                  <p className="text-gray-300 mb-4 text-center max-w-md text-sm">
                    {error}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={onCheckCompensation}
                      className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              )
            ) : previewData ? (
              <>
                {/* Main Content */}
                <div className="space-y-4 mb-4">
                  {/* Summary Cards */}
                  <PreviewSummaryCards previewData={previewData} />

                  {/* Team Members List (Owner only) - Full width below */}
                  {isOwner &&
                    previewData.teamMembers &&
                    previewData.teamMembers.length > 0 && (
                      <TeamMembersList
                        teamMembers={previewData.teamMembers}
                        totalCompensation={
                          previewData.totalTeamCompensation || 0
                        }
                      />
                    )}
                </div>

                {/* Warning Message */}
                {previewData.warning && (
                  <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-3 flex items-start gap-2 mt-4">
                    <Info className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <p className="text-orange-200 text-xs">
                      {previewData.warning}
                    </p>
                  </div>
                )}

                {/* Termination Result */}
                {terminationResult && (
                  <TerminationResultBanner
                    terminationResult={terminationResult}
                    paymentStatus={paymentStatus}
                  />
                )}

                {/* Termination Form */}
                {!terminationResult && (
                  <TerminationForm
                    terminationReason={terminationReason}
                    setTerminationReason={setTerminationReason}
                    isOwner={isOwner}
                  />
                )}
              </>
            ) : (
              // Initial state - show button to check compensation
              <div className="flex flex-col items-center justify-center py-12">
                <Calculator className="w-12 h-12 text-cyan-400 mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Kiểm tra mức đền bù
                </h3>
                <p className="text-gray-300 mb-4 text-center max-w-md text-sm">
                  Nhấn nút bên dưới để xem chi tiết mức đền bù khi chấm dứt hợp
                  đồng
                </p>
                <button
                  onClick={onCheckCompensation}
                  disabled={loading}
                  className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang kiểm tra...</span>
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4" />
                      <span>Kiểm tra đền bù</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-white/10 flex justify-between items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 text-sm"
            >
              {terminationResult ? "Đóng" : "Hủy"}
            </button>

            {!terminationResult && previewData && (
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isExecuting}
                className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Chấm dứt hợp đồng</span>
                  </>
                )}
              </button>
            )}

            {terminationResult &&
              terminationResult.paymentUrl &&
              paymentStatus !== "SUCCESSFUL" && (
                <button
                  onClick={() =>
                    window.open(
                      terminationResult!.paymentUrl,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center gap-2 text-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Thanh toán ngay</span>
                </button>
              )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-md"
          >
            <div className="p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/50 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-orange-400" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Xác nhận chấm dứt hợp đồng
              </h3>

              {/* Message */}
              <p className="text-gray-300 text-center mb-6 text-sm">
                Bạn có chắc chắn muốn chấm dứt hợp đồng này không? Hành động này
                không thể hoàn tác.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 text-sm transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmTermination}
                  disabled={isExecuting}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TerminationPreviewModal;
