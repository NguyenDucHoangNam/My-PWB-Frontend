export interface TeamMemberPreview {
  userId: number;
  userName: string;
  userEmail: string;
  avatarUrl: string;
  description: string | null;
  milestoneId: number;
  milestoneName: string;
  amount: number;
}

// Union type để xử lý cả ClientTerminationPreviewResponse và OwnerTerminationPreviewResponse
// CLIENT response: totalAmount, compensationAmount, clientWillReceive, warning
// OWNER response: totalAmount, totalTeamCompensation, clientWillReceive, teamMembers, warning
export interface TerminationPreviewResponse {
  totalAmount: number; // Tổng giá trị hợp đồng
  clientWillReceive: number; // Số tiền Client được hoàn lại
  warning: string | null; // Cảnh báo (nếu có)
  
  // Fields cho CLIENT termination preview
  compensationAmount?: number; // Số tiền đền bù (Client mất) - chỉ có cho CLIENT
  
  // Fields cho OWNER termination preview
  totalTeamCompensation?: number; // Tổng đền bù cho Team (gross, chưa trừ thuế) - chỉ có cho OWNER
  teamMembers?: TeamMemberPreview[]; // Danh sách thành viên nhận đền bù (chỉ có cho OWNER)
  
  // Deprecated fields (giữ lại để backward compatibility - có thể không còn trong response mới)
  ownerWillReceive?: number; // Deprecated - không còn trong response mới
  requiredPaymentAmount?: number; // Deprecated - không còn trong response mới
  hasTwoPayments?: boolean; // Deprecated - không còn trong response mới
  secondPaymentDate?: string | null; // Deprecated - không còn trong response mới
  secondPaymentAmount?: number | null; // Deprecated - không còn trong response mới
  teamWillReceive?: number; // Deprecated, dùng totalTeamCompensation
  taxDeducted?: number; // Optional, không có cho Client
  
  // Optional breakdown (thường không có cho Client)
  breakdown?: {
    totalTax: number;
    totalAmount: number;
    teamGross: number;
    teamTax: number;
    teamNet: number;
    ownerCompensation: number;
    ownerActualReceive: number;
    ownerTax: number | null;
    ownerNet: number;
    clientRefund: number;
  };
}

// Response sau khi thực hiện chấm dứt hợp đồng
// CLIENT termination: terminationId, contractId, newStatus, terminationType, compensationAmount, clientRefund, message
// OWNER termination (chưa thanh toán): terminationId=null, newStatus=null, contractId, teamCompensation,
//                                      ownerCompensationPaymentId, paymentUrl, paymentOrderCode, message
// OWNER termination (sau khi thanh toán): giống CLIENT termination (nhưng không có compensationAmount)
export interface TerminationExecuteResponse {
  contractId: number; // ID của contract (luôn có)
  terminationId: number | null; // ID của termination record (null nếu OWNER chưa thanh toán)
  newStatus: string | null; // TERMINATED hoặc null (nếu đang chờ thanh toán)
  terminationType?: "BEFORE_DAY_20" | "AFTER_DAY_20";
  
  // Fields cho CLIENT termination
  compensationAmount?: number; // Số tiền đền bù (Client mất) - chỉ có trong CLIENT termination response
  clientRefund?: number; // Hoàn cho Client
  
  // Fields cho OWNER termination
  teamCompensation?: number; // Tổng đền bù Team (gross) - có trong OWNER termination response
  ownerCompensation?: number; // Đền bù Owner (gross)
  
  // Fields chung (có thể không có trong response mới)
  taxDeducted?: number; // Tổng thuế đã khấu trừ
  hasSecondPayment?: boolean; // Có thanh toán lần 2 không
  secondPaymentDate?: string | null; // Ngày thanh toán lần 2 (nếu có)
  secondPaymentAmount?: number | null; // Số tiền lần 2 (nếu có)
  
  // Fields cho OWNER termination (khi cần thanh toán qua PayOS)
  ownerCompensationPaymentId?: number; // ID payment order (có trong OWNER termination response)
  paymentUrl?: string; // Link thanh toán PayOS
  paymentOrderCode?: string; // Mã đơn hàng
  paymentAmount?: number; // Số tiền cần thanh toán
  paymentExpiresAt?: string; // Thời gian hết hạn thanh toán
  
  message: string; // Thông báo
}

export interface TeamPaymentDetail {
  userId: number;
  userName: string;
  grossAmount: number;
  taxAmount: number;
  netAmount: number;
  paidAt: string;
}

export interface TaxRecordDetail {
  userId: number;
  userName: string;
  taxAmount: number;
  status: string;
  refundScheduledDate: string | null;
}

export interface TerminationDetailResponse {
  terminationId: number;
  contractId: number;
  terminatedBy: "CLIENT" | "OWNER";
  terminationType: "BEFORE_DAY_20" | "AFTER_DAY_20";
  status: "COMPLETED" | "PARTIAL_COMPLETED" | "PROCESSING" | "FAILED";
  terminationDate: string; // Ngày giờ chấm dứt (ISO format)
  totalContractAmount: number; // Tổng giá trị hợp đồng
  totalTeamCompensation: number; // Tổng đền bù Team
  totalOwnerCompensation: number; // Tổng đền bù Owner
  totalClientRefund: number; // Tổng hoàn cho Client
  totalTaxDeducted: number; // Tổng thuế đã khấu trừ
  originalTax?: number; // Thuế gốc (nếu sau ngày 20)
  actualTax?: number; // Thuế thực tế phải nộp
  refundedTax?: number; // Thuế được hoàn lại
  reason: string | null; // Lý do chấm dứt
  notes?: string | null; // Ghi chú
  ownerCompensationPaymentStatus?: string | null;
  ownerCompensationPaymentUrl?: string | null;
  teamPayments?: TeamPaymentDetail[];
  taxRecords?: TaxRecordDetail[];
}
