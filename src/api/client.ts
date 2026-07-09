import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { clearToken, getToken } from '@/lib/token';

interface ApiEnvelope {
  success?: boolean;
  status?: string;
  message?: string;
  [key: string]: unknown;
}

// 相对路径：dev 经 Vite proxy(/api → :6285)，prod 与后端同源。可用 VITE_APP_API_URL 覆盖为绝对地址。
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data as ApiEnvelope | undefined;
    if (data && typeof data === 'object' && 'status' in data && !('success' in data)) {
      response.data = {
        ...data,
        success: data.status === 'success',
      };
    }
    return response;
  },
  (error: AxiosError<ApiEnvelope>) => {
    if (error.response?.status === 401) {
      clearToken();
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }
    const errorMessage = error.response?.data?.message || error.message || '请求失败';
    return Promise.reject(new Error(errorMessage));
  },
);

export default apiClient;
