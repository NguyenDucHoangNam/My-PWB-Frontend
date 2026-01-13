import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import apiInstance from "../config/axiosCustom";
import authService, { type RegisterRequest } from "../services/authService";
import { generateGoogleAuthUrl } from "../config/googleOAuth";
import { webSocketService } from "../libs/websocket";
import { ConnectionStatus } from "../types/chat";
import { getToken, setToken as setTokenInStore, clearToken } from "../utils/tokenStore";
import { pushNotificationService } from "../services/pushNotificationService";

interface User {
  email: string;
  name?: string;
  userRole?: "CUSTOMER" | "PRODUCER" | "ADMIN";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: "CUSTOMER" | "PRODUCER" | "ADMIN" | null;
  setToken: (token: string | null) => void;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string; role?: "CUSTOMER" | "PRODUCER" | "ADMIN" | null }>;
  loginWithGoogle: () => void;
  handleGoogleCallback: (
    code: string
  ) => Promise<{ success: boolean; message?: string; role?: "CUSTOMER" | "PRODUCER" | "ADMIN" | null }>;
  register: (
    registerData: RegisterRequest,
    otp: string
  ) => Promise<{ success: boolean; message?: string }>;
  sendOtpForRegister: (
    email: string
  ) => Promise<{ success: boolean; message?: string }>;
  sendOtpForgotPassword: (
    email: string
  ) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (
    email: string,
    otp: string
  ) => Promise<{ success: boolean; message?: string }>;
  sendOtpChangePassword: () => Promise<{ success: boolean; message?: string }>;
  resetPassword: (
    email: string,
    otp: string,
    newPassword: string
  ) => Promise<{ success: boolean; message?: string }>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
    otp: string
  ) => Promise<{ success: boolean; message?: string }>
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
  const [token, setTokenState] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"CUSTOMER" | "PRODUCER" | "ADMIN" | null>(null);

  const allowedRoles = new Set<"ADMIN" | "PRODUCER" | "CUSTOMER">(["ADMIN", "PRODUCER", "CUSTOMER"]);

  function safeDecodeJwt(tokenStr: string): Record<string, any> | null {
    try {
      const payload = tokenStr.split(".")[1];
      if (!payload) return null;
      const json = decodeURIComponent(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  function deriveUserFromToken(tokenStr: string): { email?: string; role?: "CUSTOMER" | "PRODUCER" | "ADMIN"; name?: string } {
    const decoded = safeDecodeJwt(tokenStr);
    if (!decoded) return {};

    const email = decoded.email || decoded.sub || decoded.username || "";

    const possibleRoles: unknown[] = [
      decoded.role,
      decoded.userRole,
      decoded["roles"],
      decoded["authorities"],
      decoded["realm_access"]?.roles,
      decoded["realm_access"]?.role,
      decoded["resource_access"]?.roles,
      decoded["scope"],
      decoded["scp"],
    ].filter(Boolean);

    const normalizedCandidates: string[] = possibleRoles
      .flatMap((raw) => {
        if (Array.isArray(raw)) return raw;
        if (typeof raw === "string") {
          return raw.split(/[\s,]+/).filter(Boolean);
        }
        return [raw];
      })
      .filter((r): r is string => typeof r === "string")
      .map((r) => r.toUpperCase().replace(/^ROLE_/, ""));

    const firstMatch = normalizedCandidates.find((r) => allowedRoles.has(r as any)) as
      | "ADMIN"
      | "PRODUCER"
      | "CUSTOMER"
      | undefined;

    // Extract name from token
    const name = decoded.name || decoded.fullName || decoded.given_name || "";

    return { email, role: firstMatch, name };
  }

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("accessToken", newToken);
      setTokenInStore(newToken);
    } else {
      localStorage.removeItem("accessToken");
      clearToken();
    }
  };

  // Connect WebSocket when authenticated
  // This establishes the connection so backend can save session to Redis
  // Components will subscribe to specific topics when needed
  const connectWebSocket = useCallback(async () => {
    if (!webSocketService.isConnected()) {
      try {
        // Connect WebSocket with minimal handlers
        // The connection itself is enough for backend to save session and broadcast online status
        await webSocketService.connect(
          () => {
            // Empty message handler - just log for debugging
            // Components will handle their own messages when they subscribe
          },
          (status: ConnectionStatus) => {
            console.log('🔌 WebSocket connection status:', status);
          },
          undefined // onConversationUpdate
        );
        console.log('✅ WebSocket connected after login - backend should have saved session to Redis');
      } catch (error) {
        console.error('❌ Failed to connect WebSocket after login:', error);
      }
    } else {
      console.log('✅ WebSocket already connected');
    }
  }, []);

  // Disconnect WebSocket when logout
  const disconnectWebSocket = useCallback(() => {
    if (webSocketService.isConnected()) {
      webSocketService.disconnect();
      console.log('🔌 WebSocket disconnected after logout');
    }
  }, []);

  const logout = useCallback(() => {
    const current = getToken() || localStorage.getItem("accessToken");

    disconnectWebSocket();

    // Cleanup push notifications
    pushNotificationService.cleanupPushNotifications().catch((error) => {
      console.error('Failed to cleanup push notifications:', error);
    });

    // Clear only accessToken
    setToken(null);

    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
    setIsLoading(false); // Reset loading state để có thể đăng nhập lại

    if (current) {
      apiInstance.post("/api/v1/auth/logout", { token: current }).catch((error) => {
        console.log("Logout error:", error);
      });
    }
  }, [disconnectWebSocket]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const existingToken = localStorage.getItem("accessToken");
      if (existingToken) {
        setTokenState(existingToken);
        setTokenInStore(existingToken);
        try {
          const response = await authService.introspectToken({ token: existingToken })
          if (response.result?.valid) {
            setIsAuthenticated(true);
            // Derive user info from token FIRST, before WebSocket connection
            const derived = deriveUserFromToken(existingToken);
            console.log("derived from token:", derived);
            setUser({
              email: derived.email || "",
              userRole: derived.role || undefined,
              name: derived.name
            });
            setUserRole(derived.role || null);

            // Connect WebSocket if token is valid
            connectWebSocket();

            // Initialize push notifications for returning users
            pushNotificationService.initializePushNotifications().catch((error) => {
              console.error('Failed to initialize push notifications:', error);
            });
          } else {
            // Token invalid, clear everything
            setToken(null);
            setIsAuthenticated(false);
            setUser(null);
            setUserRole(null);
          }
        } catch (error: unknown) {
          console.log("Token validation failed:", error);
          // Token is invalid, clear everything
          setToken(null);
          setIsAuthenticated(false);
          setUser(null);
          setUserRole(null);
        }
      } else {
        // No token, ensure everything is cleared
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
      }
      setIsLoading(false);
    };

    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi mount, không phụ thuộc vào các function

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ username: email, password })


      const { code, message, result } = response;

      if (code === 200 && result?.authenticated) {
        // Store token
        setToken(result.token);

        setIsAuthenticated(true);
        const derived = deriveUserFromToken(result.token);
        setUser({ email: derived.email || email, userRole: derived.role || undefined });
        setUserRole(derived.role || null);

        // Connect WebSocket immediately after successful login
        connectWebSocket().catch((error: unknown) => {
          console.error('Failed to connect WebSocket after login:', error);
        });

        // Initialize push notifications after successful login
        pushNotificationService.initializePushNotifications().catch((error: unknown) => {
          console.error('Failed to initialize push notifications:', error);
        });

        return { success: true, message: message || "Đăng nhập thành công", role: derived.role || null };
      } else {
        return {
          success: false,
          message: message || "Đăng nhập thất bại. Vui lòng thử lại",
        };
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid email or password.";
      }
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const currentToken = getToken() || localStorage.getItem("accessToken");
      if (!currentToken) return false;

      const response = await authService.refreshToken({ token: currentToken })

      const { code, result } = response;
      if (code === 200 && result?.authenticated) {
        setToken(result.token);
        const derived = deriveUserFromToken(result.token);
        setUser((prev) => ({
          email: derived.email || prev?.email || "",
          userRole: derived.role || prev?.userRole,
          name: prev?.name
        }));
        setUserRole(derived.role || null);
        return true;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Logout if refresh fails to clear invalid state
      logout();
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

      if (response.success) {
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
  const sendOtpForgotPassword = async (
    email: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response = await authService.sendOtpForgotPassword({ email });

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
  const verifyOtp = async (email: string, otp: string) => {
    try {
      const response = await authService.verifyOtp({ email, otp });
      if (response.result.valid) {
        return { success: true, message: response.message };
      }
      return { success: false, message: "OTP không hợp lệ" };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Có lỗi xảy ra",
      };
    }
  };
  const resetPassword = async (
    email: string,
    otp: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response = await authService.resetPassword({
        email,
        otp,
        password,
      });

      if (response.code === 200) {
        return {
          success: true,
          message: response.message || "Đặt lại mật khẩu thành công",
        };
      } else {
        return {
          success: false,
          message: response.message || "Đặt lại mật khẩu thất bại",
        };
      }
    } catch (error: unknown) {
      console.error("Reset password error:", error);

      let errorMessage = "Không thể đặt lại mật khẩu. Vui lòng thử lại";
      if (error && typeof error === "object" && "response" in error) {
        const errorWithResponse = error as {
          response?: { data?: { message?: string }; status?: number };
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
  const sendOtpChangePassword = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response = await authService.sendOtpChangePassword();
      if (response.code === 200) {
        return { success: true, message: response.message || "Mã OTP đã được gửi tới email của bạn" };
      }
      return { success: false, message: response.message || "Không thể gửi OTP đổi mật khẩu" };
    } catch (error: unknown) {
      console.error("Send OTP change password error:", error);
      return { success: false, message: "Không thể gửi OTP đổi mật khẩu" };
    } finally {
      setIsLoading(false);
    }
  };
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
    otp: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      if (!currentPassword || !newPassword || !confirmPassword || !otp) {
        return { success: false, message: "Vui lòng nhập đầy đủ thông tin" };
      }
      if (newPassword.length < 6) {
        return { success: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự" };
      }
      if (newPassword !== confirmPassword) {
        return { success: false, message: "Xác nhận mật khẩu không khớp" };
      }

      const response = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
        otp,
      });

      if (response.success) {
        return {
          success: true,
          message: response.message || "Đổi mật khẩu thành công",
        };
      } else {
        return {
          success: false,
          message: response.message || "Đổi mật khẩu thất bại. Vui lòng thử lại",
        };
      }
    } catch (error: any) {
      console.error("Change password error:", error);
      let errorMessage = "Không thể đổi mật khẩu. Vui lòng thử lại";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };


  // Google OAuth2 Login
  const loginWithGoogle = () => {
    const authUrl = generateGoogleAuthUrl();
    window.location.href = authUrl;
  };

  // Handle Google OAuth2 Callback
  const handleGoogleCallback = async (code: string) => {
    try {
      setIsLoading(true);
      const response = await authService.authenticateWithGoogle({ code });

      const { code: responseCode, message, result } = response;

      if (responseCode === 200 && result?.authenticated) {
        // Store token
        setToken(result.token);

        setIsAuthenticated(true);
        const derived = deriveUserFromToken(result.token);
        setUser({ email: derived.email || "", userRole: derived.role || undefined });
        setUserRole(derived.role || null);

        // Connect WebSocket immediately after successful Google login
        connectWebSocket().catch((error: unknown) => {
          console.error('Failed to connect WebSocket after Google login:', error);
        });

        // Initialize push notifications after successful Google login
        pushNotificationService.initializePushNotifications().catch((error: unknown) => {
          console.error('Failed to initialize push notifications:', error);
        });

        return { success: true, message: message || "Đăng nhập Google thành công", role: derived.role || null };
      } else {
        return {
          success: false,
          message: message || "Đăng nhập Google thất bại. Vui lòng thử lại",
        };
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      let errorMessage = "Đăng nhập Google thất bại. Vui lòng thử lại.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    userRole,
    setToken,
    login,
    loginWithGoogle,
    handleGoogleCallback,
    register,
    sendOtpForRegister,
    sendOtpForgotPassword,
    verifyOtp,
    resetPassword,
    logout,
    refreshToken,
    changePassword,
    sendOtpChangePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
