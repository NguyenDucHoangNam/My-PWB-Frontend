import axios, { type AxiosInstance } from "axios";
import { globalLogout } from "../utils/authUtils";
import { getToken as getTokenFromStore } from "../utils/tokenStore";

const envBase = import.meta.env.VITE_API_URL as string | undefined;

const apiInstance: AxiosInstance = axios.create({
  baseURL: envBase,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization header from in-memory token store
apiInstance.interceptors.request.use((config) => {
  try {
    const token = getTokenFromStore() || localStorage.getItem("accessToken");
    const isAuthApi =
      config.url?.includes("api/v1/auth/login") ||
      config.url?.includes("api/v1/auth/register") ||
      config.url?.includes("api/v1/auth/refresh-token") ||
      config.url?.includes("api/v1/auth/outbound/authentication");

    if (token && !isAuthApi) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return config;
});

apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthApi =
      originalRequest.url?.includes("api/v1/auth/login") ||
      originalRequest.url?.includes("api/v1/auth/register") ||
      originalRequest.url?.includes("api/v1/auth/refresh-token") ||
      originalRequest.url?.includes("api/v1/auth/outbound/authentication");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthApi
    ) {
      originalRequest._retry = true;

      try {
        const currentToken = localStorage.getItem("accessToken");
        if (!currentToken) {
          globalLogout();
          return Promise.reject(
            new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
          );
        }

        // Gọi API refresh-token với field "token"
        const response = await axios.post(
          `${envBase}/api/v1/auth/refresh-token`,
          {
            token: currentToken,
          }
        );

        const { result } = response.data;
        if (!result?.authenticated) {
          globalLogout();
          return Promise.reject(
            new Error("Xác thực thất bại, cần đăng nhập lại.")
          );
        }

        // Lưu lại token mới
        localStorage.setItem("accessToken", result.token);

        // Gắn token mới vào header cho request gốc
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${result.token}`;

        return apiInstance(originalRequest);
      } catch (err) {
        globalLogout();
        return Promise.reject(
          new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
            cause: err,
          })
        );
      }
    }

    return Promise.reject(error);
  }
);

export default apiInstance;
