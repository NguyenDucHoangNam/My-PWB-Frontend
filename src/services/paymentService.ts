import apiInstance from "../config/axiosCustom";

export interface CreatePaymentLinkBody {
  returnUrl?: string;
  cancelUrl?: string;
  milestoneId?: number;
}

export interface CreatePaymentLinkResult {
  paymentUrl: string;
  orderCode: string;
  amount: number;
  status: "PENDING" | "SUCCESSFUL" | "FAILED" | string;
}

export interface CreatePaymentLinkResponse {
  code: number;
  message?: string;
  result: CreatePaymentLinkResult;
}

export interface PaymentStatusResult {
  orderCode: string;
  status: "PENDING" | "SUCCESSFUL" | "FAILED" | string;
  amount: number;
  projectId: number;
  contractId: number;
  addendumId?: number | null;
}

export interface PaymentStatusResponse {
  code: number;
  result: PaymentStatusResult;
}

class PaymentService {
  async createContractPaymentLink(
    projectId: number | string,
    contractId: number | string,
    body?: CreatePaymentLinkBody
  ): Promise<CreatePaymentLinkResult> {
    const res = await apiInstance.post<CreatePaymentLinkResponse>(
      `/api/v1/payments/create/projects/${projectId}/contracts/${contractId}`,
      body || {}
    );
    return res.data.result;
  }

  async getPaymentStatus(orderCode: string): Promise<PaymentStatusResult> {
    const res = await apiInstance.get<PaymentStatusResponse>(
      `/api/v1/payments/status/${orderCode}`
    );
    return res.data.result;
  }

  async getLatestByContract(
    projectId: number | string,
    contractId: number | string
  ): Promise<PaymentStatusResult | null> {
    const res = await apiInstance.get<{ code: number; result: PaymentStatusResult | null }>(
      `/api/v1/payments/projects/${projectId}/contracts/${contractId}/latest`
    );
    return res.data.result ?? null;
  }

  async createAddendumPaymentLink(
    projectId: number | string,
    contractId: number | string,
    body?: CreatePaymentLinkBody
  ): Promise<CreatePaymentLinkResult> {
    const res = await apiInstance.post<CreatePaymentLinkResponse>(
      `/api/v1/payments/create/projects/${projectId}/contracts/${contractId}/addendum`,
      body || {}
    );
    return res.data.result;
  }

  async getLatestByAddendum(
    projectId: number | string,
    contractId: number | string
  ): Promise<PaymentStatusResult | null> {
    const res = await apiInstance.get<{ code: number; result: PaymentStatusResult | null }>(
      `/api/v1/payments/projects/${projectId}/contracts/${contractId}/addendum/latest`
    );
    return res.data.result ?? null;
  }

}

const paymentService = new PaymentService();
export default paymentService;


