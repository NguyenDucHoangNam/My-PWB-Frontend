import apiInstance from "../config/axiosCustom";

type ApiEnvelope<T> = { result: T };

export interface SubscriptionStatus {
  status: "ACTIVE" | "PENDING" | "NONE" | string;
  planName?: string;
  endDate?: string | null;
  autoRenewEnabled?: boolean;
  graceUntil?: string | null;
  // Optional fields depending on BE
  planType?: "MONTHLY" | "YEARLY" | string;
}

export interface ProPackageItem {
  id: number | string;
  name: string;
  description?: string;
  packageType: "MONTHLY" | "YEARLY" | string;
  durationMonths: number;
  price: number;
  currency?: string;
}

export interface PaymentInitResponse {
  paymentUrl: string;
  orderCode: string;
  amount: number;
  status: string;
}

export const subscriptionService = {
  async getStatus(): Promise<SubscriptionStatus> {
    const res = await apiInstance.get<ApiEnvelope<SubscriptionStatus>>(
      "/api/v1/subscriptions/status",
      { headers: { Accept: "application/json" } }
    );
    return res.data.result as SubscriptionStatus;
  },

  async getPackages(page = 0, size = 10, sortBy = "id", sortDir: "asc" | "desc" = "asc"): Promise<ProPackageItem[]> {
    const res = await apiInstance.get<any>(
      `/api/v1/pro-packages?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
      // Public endpoint: DO NOT send Authorization header to avoid 401 on expired tokens
      { headers: { Accept: "application/json" } }
    );
    const result = res.data?.result;
    const content = Array.isArray(result?.content) ? result.content : result || [];
    return content as ProPackageItem[];
  },

  async purchase(params: {
    proPackageId: number | string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<PaymentInitResponse> {
    const res = await apiInstance.post<ApiEnvelope<PaymentInitResponse>>(
      "/api/v1/subscriptions/purchase",
      params,
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data.result as PaymentInitResponse;
  },

  async upgrade(params: {
    newProPackageId: number | string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<PaymentInitResponse> {
    const res = await apiInstance.post<ApiEnvelope<PaymentInitResponse>>(
      "/api/v1/subscriptions/upgrade",
      params,
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data.result as PaymentInitResponse;
  },

  async cancelAutoRenew(): Promise<void> {
    await apiInstance.post(
      "/api/v1/subscriptions/cancel-auto-renew",
      {},
      { headers: { "Content-Type": "application/json" } }
    );
  },

  async reactivateAutoRenew(): Promise<void> {
    await apiInstance.post(
      "/api/v1/subscriptions/reactivate-auto-renew",
      {},
      { headers: { "Content-Type": "application/json" } }
    );
  },
};


