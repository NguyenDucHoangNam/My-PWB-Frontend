import apiInstance from "../config/axiosCustom";
import { BankResponse } from "./withdrawalService";

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface SendBankAccountOtpRequest {
  bankId: number;
  accountNumber: string;
  accountHolderName: string;
}

export interface AddBankAccountRequest {
  bankId: number;
  accountNumber: string;
  accountHolderName: string;
  otp: string;
}

export interface UserBankResponse {
  id: number;
  bank: BankResponse;
  accountNumber: string;
  accountHolderName: string;
  isVerified: boolean;
}

class UserBankService {
  async sendBankAccountOtp(
    request: SendBankAccountOtpRequest
  ): Promise<void> {
    const res = await apiInstance.post<ApiResponse<void>>(
      "/api/v1/user-banks/send-otp",
      request
    );
    return res.data.result;
  }

  async addBankAccount(
    request: AddBankAccountRequest
  ): Promise<UserBankResponse> {
    const res = await apiInstance.post<ApiResponse<UserBankResponse>>(
      "/api/v1/user-banks",
      request
    );
    return res.data.result;
  }

  async getUserBanks(): Promise<UserBankResponse[]> {
    const res = await apiInstance.get<ApiResponse<UserBankResponse[]>>(
      "/api/v1/user-banks"
    );
    return res.data.result;
  }

  async deleteUserBank(bankAccountId: number): Promise<void> {
    const res = await apiInstance.delete<ApiResponse<void>>(
      `/api/v1/user-banks/${bankAccountId}`
    );
    return res.data.result;
  }
}

const userBankService = new UserBankService();
export default userBankService;
