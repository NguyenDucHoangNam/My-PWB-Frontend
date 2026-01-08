import axios from "axios";
import type { AxiosInstance } from "axios";
import { globalLogout } from "../utils/authUtils";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const apiInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Gắn accessToken vào tất cả request
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    console.log('Token ',token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Tự động refresh accessToken nếu bị lỗi 401
apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          globalLogout();
          return Promise.reject(new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."));
        }

        const response = await apiInstance.post(`/api/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Lưu cả accessToken và refreshToken mới
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Cập nhật header cho request gốc
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiInstance(originalRequest);
      } catch (err) {
        // Nếu refreshToken hết hạn hoặc không hợp lệ
        globalLogout();
        // Có thể thêm thông báo cho người dùng
        return Promise.reject(new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", { cause: err }));
      }
    }

    return Promise.reject(error);
  }
);


export default apiInstance;
