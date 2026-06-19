import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from "axios";
import { API_URL } from "@/lib/constants";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/auth";
import type { ApiError, AuthTokens } from "@/types";

// ─── Axios instance ───────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor (auto-refresh) ─────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => {
    // Unwrap the { success, data, timestamp } envelope all endpoints return.
    if (response.data && response.data.success === true && "data" in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      }

      try {
        const { data: envelope } = await axios.post<{ success: boolean; data: AuthTokens }>(
          `${API_URL}/auth/refresh`,
          { refreshToken }
        );
        const tokens = envelope.data ?? (envelope as unknown as AuthTokens);
        setTokens(tokens);
        const accessToken = tokens.accessToken;
        processQueue(null, accessToken);
        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

// ─── Error normalization ──────────────────────────────────────────────────────

function normalizeError(error: AxiosError): ApiError {
  if (error.response) {
    const data = error.response.data as Partial<ApiError>;
    return {
      message: data.message ?? "An error occurred",
      code: data.code,
      statusCode: error.response.status,
      details: data.details,
    };
  }
  if (error.request) {
    return {
      message: "Network error — please check your connection",
      statusCode: 0,
    };
  }
  return {
    message: error.message ?? "Unexpected error",
    statusCode: 0,
  };
}

export default apiClient;
