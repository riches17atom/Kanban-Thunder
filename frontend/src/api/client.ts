import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from './types';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// URLs that must NEVER trigger the 401 retry/refresh logic — doing so causes an infinite loop
const AUTH_URLS = ['/auth/refresh/', '/auth/logout/', '/auth/login/', '/auth/register/'];

const isAuthUrl = (url?: string) => AUTH_URLS.some((authUrl) => url?.includes(authUrl));

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;

    // --- 429 Too Many Requests: rate limited ---
    if (status === 429) {
      toast.error('Too many attempts. Please wait a moment and try again.', { id: 'rate-limit' });
      return Promise.reject(error);
    }

    // --- 401 Unauthorized: attempt token refresh, but NEVER for auth endpoints ---
    if (status === 401 && !originalRequest._retry && !isAuthUrl(originalRequest.url)) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<ApiResponse<{ tokens: { access: string } }>>(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh/`,
          {},
          { withCredentials: true }
        );

        const { access } = response.data.data.tokens;

        useAuthStore.getState().setAccessToken(access);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        processQueue(null, access);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);

        // Clear auth state without calling backend logout (prevents new 401 → loop)
        useAuthStore.getState().setAccessToken(null);
        useAuthStore.getState().setUser(null);
        useAuthStore.getState().setAuthenticated(false);

        const event = new CustomEvent('session-expired');
        window.dispatchEvent(event);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // --- Generic error toasting (only for non-auth-URL errors to avoid duplication) ---
    if (!isAuthUrl(originalRequest.url)) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errors.forEach((err) => {
          toast.error(err.detail);
        });
      } else if (error.message === 'Network Error') {
        toast.error('Network error. Please check your connection.');
      }
    }

    return Promise.reject(error);
  }
);

export default api;