import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import apiInstance from "../config/axiosCustom";
import authService, { type RegisterRequest } from "../services/authService";

interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    registerData: RegisterRequest,
    otp: string
  ) => Promise<{ success: boolean; message?: string }>;
  sendOtpForRegister: (
    email: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          // Validate token by making a request to introspect endpoint
          const response = await apiInstance.post("/api/v1/auth/introspect", {
            token: token,
          });

          if (response.data.result?.valid) {
            // Token is valid, try to get user info if there's an endpoint for that
            setIsAuthenticated(true);
            setUser({ email: "" }); // You might want to extract user info from token or make another API call
          } else {
            logout();
          }
        } catch (error: unknown) {
          console.log("Token validation failed:", error);
          // Token is invalid, clear everything
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiInstance.post("/api/v1/auth/token", {
        username: email,
        password: password,
      });

      const { code, data } = response.data;
      const result = data?.result || response.data?.result;

      if (code === 200 && result?.authenticated) {
        // Store token
        localStorage.setItem("accessToken", result.token);

        // Update auth state
        setIsAuthenticated(true);
        setUser({ email });

        return { success: true };
      } else {
        return {
          success: false,
          message:
            data?.message ||
            response.data?.message ||
            "Login failed. Please try again.",
        };
      }
    } catch (error: unknown) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please try again.";
      if (error && typeof error === "object" && "response" in error) {
        const errorWithResponse = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        if (errorWithResponse.response?.data?.message) {
          errorMessage = errorWithResponse.response.data.message;
        } else if (errorWithResponse.response?.status === 401) {
          errorMessage = "Invalid email or password.";
        }
      }

      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Get current token before clearing it
    const token = localStorage.getItem("accessToken");

    // Clear all auth data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Update state
    setIsAuthenticated(false);
    setUser(null);

    // Call backend logout if token exists
    if (token) {
      apiInstance.post("/api/v1/auth/logout", { token }).catch((error) => {
        console.log("Logout error:", error);
        // Don't show error to user as they're already logged out
      });
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem("refreshToken");
      if (!refreshTokenValue) {
        return false;
      }

      const response = await apiInstance.post("/api/v1/auth/refresh", {
        token: refreshTokenValue,
      });

      const { code, result } = response.data;
      if (code === 200 && result?.authenticated) {
        localStorage.setItem("accessToken", result.token);
        return true;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }

    return false;
  };

  const sendOtpForRegister = async (
    email: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response = await authService.sendOtpRegister({ email });

      if (response.code === 200) {
        return {
          success: true,
          message: response.message || "OTP đã được gửi đến email của bạn",
        };
      } else {
        return {
          success: false,
          message: response.message || "Không thể gửi OTP. Vui lòng thử lại",
        };
      }
    } catch (error: unknown) {
      console.error("Send OTP error:", error);

      let errorMessage = "Không thể gửi OTP. Vui lòng thử lại";
      if (error && typeof error === "object" && "response" in error) {
        const errorWithResponse = error as {
          response?: { data?: { message?: string } };
        };
        if (errorWithResponse.response?.data?.message) {
          errorMessage = errorWithResponse.response.data.message;
        }
      }

      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    registerData: RegisterRequest,
    otp: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      // Validate registerData before sending
      if (
        !registerData.email ||
        !registerData.passwordHash ||
        !registerData.firstName ||
        !registerData.lastName ||
        !registerData.dateOfBirth
      ) {
        return { success: false, message: "Vui lòng nhập đầy đủ thông tin" };
      }

      if (!otp || otp.trim() === "") {
        return { success: false, message: "Vui lòng nhập mã OTP" };
      }

      // Validate password length
      if (registerData.passwordHash.length < 6) {
        return { success: false, message: "Mật khẩu phải có ít nhất 6 ký tự" };
      }

      const response = await authService.registerUser(registerData, otp);

      if (response.code === 201) {
        return {
          success: true,
          message: response.message || "Đăng ký thành công",
        };
      } else {
        return {
          success: false,
          message: response.message || "Đăng ký thất bại. Vui lòng thử lại",
        };
      }
    } catch (error: unknown) {
      console.error("Register error:", error);

      let errorMessage = "Đăng ký thất bại. Vui lòng thử lại";

      if (error && typeof error === "object" && "response" in error) {
        const errorWithResponse = error as {
          response?: {
            data?: { code?: number; message?: string };
            status?: number;
          };
        };

        if (errorWithResponse.response?.data?.message) {
          errorMessage = errorWithResponse.response.data.message;
        } else if (errorWithResponse.response?.status === 400) {
          errorMessage =
            "Thông tin không hợp lệ. Vui lòng kiểm tra lại dữ liệu đã nhập.";
        } else if (errorWithResponse.response?.status === 401) {
          errorMessage = "Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.";
        }
      }

      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    sendOtpForRegister,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
