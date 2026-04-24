import apiClient from './client';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  username: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export async function login(data: LoginRequest) {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/auth/login', data);
  return response.data;
}

export async function changePassword(data: ChangePasswordRequest) {
  const response = await apiClient.post<ApiResponse<void>>('/api/auth/change-password', data);
  return response.data;
}
