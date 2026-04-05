import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, clearTokens } from './tokenStorage';

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.debug('[apiClient] outgoing request', {
    method: config.method?.toUpperCase(),
    url: config.baseURL + (config.url ?? ''),
    authorization: config.headers.Authorization ?? '(none)',
    withCredentials: config.withCredentials,
  });
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED') {
        throw new Error('Request timeout - server did not respond in time');
      }

      const originalRequest = error.config as RetryableRequest | undefined;
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/refresh')
      ) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            pendingRequests.push((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) throw new Error('No refresh token');
          const { data } = await apiClient.post<{ accessToken: string }>(
            '/auth/refresh',
            { refreshToken }
          );
          localStorage.setItem('accessToken', data.accessToken);
          pendingRequests.forEach((cb) => cb(data.accessToken));
          pendingRequests = [];
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        } catch {
          pendingRequests = [];
          // clearTokens();
          throw new Error('Session expired. Please log in again.');
        } finally {
          isRefreshing = false;
        }
      }

      if (error.response) {
        const detail = error.response.data?.detail;
        if (detail) {
          console.error('API error detail:', detail);
        }
        throw new Error(
          error.response.data?.message ||
            `HTTP Error ${error.response.status}: ${error.response.statusText}`
        );
      }
    }
    throw error;
  }
);

export default apiClient;
