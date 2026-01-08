import apiInstance from '../config/axiosCustom';


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

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponse {
  code: number;
  message?: string;
}

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiInstance.post<LoginResponse>('/api/v1/auth/token', credentials);
      return response.data;
    } catch (error: unknown) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken(request: RefreshTokenRequest): Promise<LoginResponse> {
    try {
      const response = await apiInstance.post<LoginResponse>('/api/v1/auth/refresh', request);
      return response.data;
    } catch (error: unknown) {
      console.error('Refresh token API error:', error);
      throw error;
    }
  }

  // Introspect token
  async introspectToken(request: IntrospectRequest): Promise<IntrospectResponse> {
    try {
      const response = await apiInstance.post<IntrospectResponse>('/api/v1/auth/introspect', request);
      return response.data;
    } catch (error: unknown) {
      console.error('Introspect token API error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(request: LogoutRequest): Promise<void> {
    try {
      await apiInstance.post('/api/v1/auth/logout', request);
    } catch (error: unknown) {
      console.error('Logout API error:', error);
      throw error;
    }
  }

  // Send OTP for registration
  async sendOtpRegister(request: SendOtpRequest): Promise<SendOtpResponse> {
    try {
      const response = await apiInstance.post<SendOtpResponse>('/api/v1/users/send-otp-register', request);
      return response.data;
    } catch (error: unknown) {
      console.error('Send OTP Register API error:', error);
      throw error;
    }
  }

  // Register user
  async registerUser(request: RegisterRequest, otp: string): Promise<RegisterResponse> {
    try {
      // Validate date format before sending
      if (request.dateOfBirth && !this.isValidDateFormat(request.dateOfBirth)) {
        throw new Error('Ngày sinh phải có định dạng yyyy/MM/dd (ví dụ: 1990/01/01)');
      }

      console.log('Registering with data:', { ...request, passwordHash: '[HIDDEN]' });
      
      const response = await apiInstance.post<RegisterResponse>(`/api/v1/users/register?otp=${otp}`, request);
      return response.data;
    } catch (error: unknown) {
      console.error('Register User API error:', error);
      throw error;
    }
  }

  // Helper method to validate date format
  private isValidDateFormat(dateString: string): boolean {
    const datePattern = /^\d{4}\/\d{2}\/\d{2}$/;
    if (!datePattern.test(dateString)) {
      return false;
    }
    
    const parts = dateString.split('/');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    
    // Check for valid year, month, day
    if (year < 1950 || month < 1 || month > 12 || day < 1 || day > 31) {
      return false;
    }
    
    // Create date to validate day of month
    const date = new Date(year, month - 1, day);
    return (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day);
  }
}

export const authService = new AuthService();
export default authService;
