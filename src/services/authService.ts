import apiInstance from "../config/axiosCustom";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  message?: string;
  result: {
    token: string;
    authenticated: boolean;
  };
}

export interface IntrospectRequest {
  token: string;
}

export interface IntrospectResponse {
  code: number;
  message?: string;
  result: {
    valid: boolean;
    scope?: string;
  };
}

export interface RefreshTokenRequest {
  token: string;
}

export interface LogoutRequest {
  token: string;
}

export interface LogoutResponse {
  code: number;
  message?: string;
  result?: string;
}

export interface RegisterRequest {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // Format: "yyyy/MM/dd" - Expected by backend
}

export interface RegisterResponse {
  code: number;
  message?: string;
  result: {
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    role: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponse {
  code: number;
  message?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}
export interface VerifyOtpResponse {
  code: number;
  message: string;
  result: {
    valid: boolean;
  };
}
export interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result?: T;
}

export interface GoogleAuthRequest {
  code: string;
}

export interface GoogleAuthResponse {
  code: number;
  message?: string;
  result: {
    token: string;
    authenticated: boolean;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  otp: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface SendChangePasswordOtpResponse {
  code: number;
  message?: string;
}
class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiInstance.post<LoginResponse>(
        "/api/v1/auth/login",
        credentials
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Login API error:", error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken(request: RefreshTokenRequest): Promise<LoginResponse> {
    try {
      const response = await apiInstance.post<LoginResponse>(
        "/api/v1/auth/refresh-token",
        request
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Refresh token API error:", error);
      throw error;
    }
  }

  // Introspect token
  async introspectToken(
    request: IntrospectRequest
  ): Promise<IntrospectResponse> {
    try {
      const response = await apiInstance.post<IntrospectResponse>(
        "/api/v1/auth/introspect",
        request
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Introspect token API error:", error);
      throw error;
    }
  }

  // Logout user
  async logout(request: LogoutRequest): Promise<void> {
    try {
      await apiInstance.post("/api/v1/auth/logout", request);
    } catch (error: unknown) {
      console.error("Logout API error:", error);
      throw error;
    }
  }

  // Send OTP for registration
  async sendOtpRegister(request: SendOtpRequest): Promise<SendOtpResponse> {
    try {
      const response = await apiInstance.post<SendOtpResponse>(
        "/api/v1/users/send-otp-register",
        request
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Send OTP Register API error:", error);
      throw error;
    }
  }
  // Register user
  async registerUser(
    request: RegisterRequest,
    otp: string
  ): Promise<{ success: boolean; message?: string; data?: RegisterResponse }> {
    try {
      const payload = { ...request };

      if (payload.dateOfBirth.includes("/")) {
        payload.dateOfBirth = payload.dateOfBirth.replace(/\//g, "-");
      }

      const response = await apiInstance.post<RegisterResponse>(
        `/api/v1/users/register?otp=${otp}`,
        payload
      );

      return {
        success: true,
        message: response.data.message,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Register User API error:", error);

      if (error.response && error.response.data) {
        return {
          success: false,
          message: error.response.data.message,
        };
      }

      return {
        success: false,
        message: error.message || "Có lỗi xảy ra. Vui lòng thử lại.",
      };
    }
  }

  // Send OTP for forgot password
  async sendOtpForgotPassword(
    request: SendOtpRequest
  ): Promise<SendOtpResponse> {
    try {
      const response = await apiInstance.post<SendOtpResponse>(
        "/api/v1/users/send-otp-forgot-password",
        request
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Send OTP Forgot Password API error:", error);
      throw error;
    }
  }
  // Verify OTP
  async verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    try {
      const response = await apiInstance.post<VerifyOtpResponse>(
        "/api/v1/users/verify-otp",
        request
      );
      return response.data;
    } catch (error: any) {
      console.error("Verify OTP API error:", error);
      throw error;
    }
  }
  // Reset password
  async resetPassword(
    payload: ResetPasswordRequest
  ): Promise<ApiResponse<void>> {
    try {
      const res = await apiInstance.post<ApiResponse<void>>(
        "/api/v1/users/reset-password",
        payload
      );
      return res.data;
    } catch (err: any) {
      return (
        err.response?.data || {
          code: 500,
          message: "Có lỗi xảy ra khi reset password",
        }
      );
    }
  }

  // Google OAuth2 Authentication
  async authenticateWithGoogle(request: GoogleAuthRequest): Promise<GoogleAuthResponse> {
    try {
      const response = await apiInstance.post<GoogleAuthResponse>(
        `/api/v1/auth/outbound/authentication?code=${request.code}`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Google Auth API error:", error);
      throw error;
    } 
  }

  async sendOtpChangePassword(): Promise<SendChangePasswordOtpResponse> {
    try {
      const res = await apiInstance.post<SendChangePasswordOtpResponse>(
        "/api/v1/users/send-otp-change-password"
      );
      return res.data;
    } catch (err: any) {
      console.error("Send OTP change password API error:", err);
      return (
        err.response?.data || {
          code: 500,
          message: "Có lỗi xảy ra khi gửi OTP đổi mật khẩu",
        }
      );
    }
  }
async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  try {
    const response = await apiInstance.put<ApiResponse<ChangePasswordResponse>>(
      "/api/v1/users/change-password",
      data
    );
    
    console.log("Change password response:", response.data);
    
    // Check if response is successful (code 200)
    if (response?.data?.code === 200 && response?.data?.result) {
      console.log("Change password success:", response.data.result);
      return response.data.result;
    }
    
    // If response has result but code is not 200, still return it
    if (response?.data?.result) {
      console.log("Change password result (non-200):", response.data.result);
      return response.data.result;
    }
    
    // If no result but has message, return error
    console.warn("Change password: No result in response", response.data);
    return {
      success: false,
      message: response?.data?.message || "Invalid response from server",
    };
  } catch (err: any) {
    console.error("changePassword API error:", err);

    const payload = err?.response?.data;
    if (payload) {
      // If error response has result (some APIs return error in result field)
      if (payload.result) {
        return payload.result;
      }
      // If error response has message
      if (payload.message) {
        return { success: false, message: payload.message };
      }
      // Fallback: return error as string
      return { success: false, message: JSON.stringify(payload) };
    }
    return { success: false, message: err?.message || "Network error" };
  }
}

}

export const authService = new AuthService();
export default authService;
