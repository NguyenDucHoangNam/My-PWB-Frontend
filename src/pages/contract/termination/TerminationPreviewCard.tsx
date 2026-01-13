import { Calculator, AlertCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface TerminationPreviewCardProps {
  contractId: string | null;
  hasNoTermination: boolean;
  error: string | null;
  isModalOpen: boolean;
  onOpenModal: () => Promise<void>;
  onLoadTerminationDetail: () => Promise<void>;
}

export const TerminationPreviewCard = ({
  contractId,
  hasNoTermination,
  error,
  isModalOpen,
  onOpenModal,
  onLoadTerminationDetail,
}: TerminationPreviewCardProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="relative max-w-2xl w-full bg-gradient-to-br from-gray-900 via-blue-900/30 to-gray-900 border border-white/10 rounded-2xl p-6 text-center shadow-lg">
        <div className="relative">
          {/* Icon Container */}
          <div className="relative mb-6">
            <div className="relative w-16 h-16 mx-auto mb-4">
              {/* Icon container */}
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 border-2 border-cyan-400/30 flex items-center justify-center backdrop-blur-sm shadow-md">
                <Calculator className="w-8 h-8 text-cyan-300" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-3">
              Kiểm tra mức đền bù
            </h2>

            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-300 text-base mb-2">
                Nhấn nút bên dưới để xem chi tiết mức đền bù khi chấm dứt hợp
                đồng
              </p>
              <p className="text-gray-400 text-sm">
                Hệ thống sẽ tính toán và hiển thị các thông tin về đền bù cho
                Đội ngũ, Khách hàng và Chủ sở hữu
              </p>
            </div>
          </div>

          {/* Status Messages */}
          <div className="space-y-3 mb-5">
            {hasNoTermination && !isModalOpen && (
              <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-300" />
                  <p className="text-blue-200 text-sm font-medium">
                    Hợp đồng chưa chấm dứt
                  </p>
                </div>
              </div>
            )}

            {error && !isModalOpen && !hasNoTermination && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-300 mt-0.5 flex-shrink-0" />
                  <p className="text-red-200 text-sm text-left flex-1">
                    {error}
                  </p>
                </div>

                {/* Retry button */}
                {(error.includes("đã được chấm dứt") ||
                  error.includes("không thể tải") ||
                  error.includes("CONTRACT_ALREADY_TERMINATED")) &&
                  contractId && (
                    <button
                      onClick={async () => {
                        try {
                          await onLoadTerminationDetail();
                        } catch (err: unknown) {
                          const errorMsg =
                            err instanceof Error
                              ? err.message
                              : "Không thể tải thông tin chấm dứt.";
                          toast.error(errorMsg);
                        }
                      }}
                      className="w-full md:w-auto px-5 py-2 rounded-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 flex items-center justify-center gap-2 mx-auto text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Tải lại thông tin chấm dứt
                    </button>
                  )}
              </div>
            )}
          </div>

          {/* Main Action Button */}
          <div>
            <button
              onClick={onOpenModal}
              disabled={!contractId}
              className="w-full md:w-auto px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto text-base"
            >
              <Calculator className="w-4 h-4" />
              Kiểm tra mức đền bù
            </button>

            {!contractId && (
              <p className="text-red-400 text-sm mt-3 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Thiếu contractId. Vui lòng kiểm tra lại URL.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
