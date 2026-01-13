import {
  Wallet,
  Users,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Loader2,
  XCircle,
  Info,
  Target,
  DollarSign,
  Mail,
} from "lucide-react";
import type {
  TerminationPreviewResponse,
  TerminationExecuteResponse,
  TeamMemberPreview,
  TeamPaymentDetail,
} from "../../../types/contract";
import {
  formatCurrency,
  formatDateTime,
} from "../../../utils/contractTermination.helpers";

// PreviewSummaryCards
interface PreviewSummaryCardsProps {
  previewData: TerminationPreviewResponse;
}

export const PreviewSummaryCards = ({
  previewData,
}: PreviewSummaryCardsProps) => {
  // Xác định là CLIENT hay OWNER dựa trên response
  const isOwner = previewData.totalTeamCompensation !== undefined;
  const compensationAmount = isOwner
    ? previewData.totalTeamCompensation
    : previewData.compensationAmount;

  return (
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
          <p className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {formatCurrency(previewData.totalAmount)}
          </p>
        </div>
      </div>

      {/* Second Row: Compensation and Will Receive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Compensation - Team (OWNER) hoặc Đền bù (CLIENT) */}
        {compensationAmount !== undefined && (
          <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-400/30">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                {isOwner ? "Tổng đền bù Team" : "Số tiền đền bù"}
              </h3>
              <p className="text-lg font-bold text-blue-400">
                {formatCurrency(compensationAmount)}
              </p>
            </div>
          </div>
        )}

        {/* Will Receive - Khách hàng (OWNER) hoặc Bạn (CLIENT) */}
        <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-400/30">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">
              {isOwner ? "Khách hàng sẽ nhận" : "Bạn sẽ nhận"}
            </h3>
            <p className="text-lg font-bold text-green-400">
              {formatCurrency(previewData.clientWillReceive)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// TerminationForm
interface TerminationFormProps {
  terminationReason: string;
  setTerminationReason: (reason: string) => void;
  isOwner: boolean;
}

export const TerminationForm = ({
  terminationReason,
  setTerminationReason,
  isOwner,
}: TerminationFormProps) => {
  return (
    <div className="mt-3 bg-white/10 border border-white/20 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
        Xác nhận chấm dứt hợp đồng
      </h3>
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Lý do chấm dứt (tùy chọn)
          </label>
          <textarea
            value={terminationReason}
            onChange={(e) => setTerminationReason(e.target.value)}
            placeholder="Nhập lý do chấm dứt hợp đồng (nếu có)..."
            className="w-full h-20 px-2.5 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 resize-none text-sm"
          />
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2">
          <div className="flex items-start gap-1.5">
            <AlertTriangle
              size={12}
              className="text-orange-400 mt-0.5 flex-shrink-0"
            />
            <p className="text-orange-200/90 text-xs">
              {isOwner
                ? "Bạn sẽ cần thanh toán qua PayOS để hoàn tất chấm dứt hợp đồng."
                : "Hợp đồng sẽ được chấm dứt ngay sau khi bạn xác nhận."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// TerminationResultBanner
interface TerminationResultBannerProps {
  terminationResult: TerminationExecuteResponse;
  paymentStatus: string | null;
}

export const TerminationResultBanner = ({
  terminationResult,
  paymentStatus,
}: TerminationResultBannerProps) => {
  const isTerminated = terminationResult.newStatus === "TERMINATED";

  return (
    <div
      className={`mt-3 rounded-lg p-2.5 flex items-start gap-1.5 ${
        isTerminated
          ? "bg-green-500/20 border border-green-500/50"
          : "bg-blue-500/20 border border-blue-500/50"
      }`}
    >
      {isTerminated ? (
        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
      ) : (
        <CreditCard className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <h3
          className={`font-semibold mb-0.5 text-xs ${
            isTerminated ? "text-green-300" : "text-blue-300"
          }`}
        >
          {isTerminated
            ? "Chấm dứt hợp đồng thành công"
            : "Chờ thanh toán để hoàn tất chấm dứt"}
        </h3>
        <p
          className={`text-xs ${
            isTerminated ? "text-green-200" : "text-blue-200"
          }`}
        >
          {terminationResult.message}
        </p>
        {terminationResult.paymentUrl && (
          <div className="mt-1.5">
            <a
              href={terminationResult.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
            >
              <CreditCard className="w-3 h-3" />
              Mở trang thanh toán
            </a>
          </div>
        )}
        {paymentStatus === "PENDING" && (
          <div className="mt-1.5 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
            <span className="text-blue-200 text-xs">
              Đang chờ thanh toán...
            </span>
          </div>
        )}
        {paymentStatus === "SUCCESSFUL" && (
          <div className="mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-400" />
            <span className="text-green-200 text-xs">
              Thanh toán thành công
            </span>
          </div>
        )}
        {paymentStatus === "FAILED" && (
          <div className="mt-1.5 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-400" />
            <span className="text-red-200 text-xs">Thanh toán thất bại</span>
          </div>
        )}
      </div>
    </div>
  );
};

// TaxDetailsSection
interface TaxDetailsSectionProps {
  originalTax?: number;
  actualTax?: number;
  refundedTax?: number;
}

export const TaxDetailsSection = ({
  originalTax,
  actualTax,
  refundedTax,
}: TaxDetailsSectionProps) => {
  return (
    <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3">
      <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-1.5">
        <Info className="w-4 h-4 text-blue-400" />
        Chi tiết thuế
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {originalTax !== undefined && (
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Thuế gốc đã nộp</p>
            <p className="text-white font-bold text-base">
              {formatCurrency(originalTax)}
            </p>
          </div>
        )}
        {actualTax !== undefined && (
          <div>
            <p className="text-gray-400 text-xs mb-0.5">
              Thuế thực tế phải nộp
            </p>
            <p className="text-white font-bold text-base">
              {formatCurrency(actualTax)}
            </p>
          </div>
        )}
        {refundedTax !== undefined && (
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Thuế được hoàn lại</p>
            <p className="text-green-400 font-bold text-base">
              {formatCurrency(refundedTax)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// TeamPaymentsSection
interface TeamPaymentsSectionProps {
  teamPayments: TeamPaymentDetail[];
}

export const TeamPaymentsSection = ({
  teamPayments,
}: TeamPaymentsSectionProps) => {
  if (!teamPayments || teamPayments.length === 0) return null;

  return (
    <div className="bg-white/10 border border-white/20 rounded-lg p-3">
      <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-1.5">
        <Users className="w-4 h-4 text-cyan-400" />
        Thanh toán cho Team
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {teamPayments.map((payment, index: number) => (
          <div
            key={index}
            className="bg-white/10 border border-white/20 rounded-lg p-2.5"
          >
            <div className="flex justify-between items-start mb-1">
              <div>
                <p className="text-white font-semibold text-xs">
                  {payment.userName}
                </p>
                <p className="text-gray-400 text-xs">
                  Gross: {formatCurrency(payment.grossAmount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold text-xs">
                  Net: {formatCurrency(payment.netAmount)}
                </p>
                <p className="text-gray-400 text-xs">
                  Thuế: {formatCurrency(payment.taxAmount)}
                </p>
              </div>
            </div>
            {payment.paidAt && (
              <p className="text-gray-400 text-xs">
                Thanh toán: {formatDateTime(payment.paidAt)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// TeamMembersList
interface TeamMembersListProps {
  teamMembers: TeamMemberPreview[];
  totalCompensation: number;
}

export const TeamMembersList = ({
  teamMembers,
  totalCompensation,
}: TeamMembersListProps) => {
  if (!teamMembers || teamMembers.length === 0) return null;

  return (
    <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-400/30">
          <Users className="w-4 h-4 text-cyan-400" />
        </div>
        <h3 className="text-base font-semibold text-white">
          Danh sách thành viên nhận đền bù
        </h3>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {teamMembers.map((member) => (
          <div
            key={member.userId}
            className="bg-white/10 border border-white/20 rounded-lg p-3.5"
          >
            <div className="flex items-start gap-3.5">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.userName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400/50 shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-base shadow-lg">
                    {member.userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {/* Name and Description */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="text-white font-semibold text-base">
                      {member.userName}
                    </h4>
                    {member.description && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-medium">
                        {member.description}
                      </span>
                    )}
                  </div>

                  {/* Email with icon */}
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    <p className="text-gray-400 text-xs truncate">
                      {member.userEmail}
                    </p>
                  </div>
                </div>

                {/* Milestone and Amount */}
                <div className="pt-2.5 mt-2.5 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Milestone */}
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-6 h-6 rounded bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                        <Target className="w-3 h-3 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-400 text-xs mb-0.5">Cột mốc</p>
                        <p className="text-white text-sm font-semibold truncate">
                          {member.milestoneName}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-6 h-6 rounded bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                        <DollarSign className="w-3 h-3 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-400 text-xs mb-0.5">Số tiền</p>
                        <p className="text-cyan-400 text-sm font-bold truncate">
                          {formatCurrency(member.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Summary */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-200 font-semibold text-sm">
              Tổng đền bù
            </span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {formatCurrency(totalCompensation)}
          </span>
        </div>
      </div>
    </div>
  );
};
