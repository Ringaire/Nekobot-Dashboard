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
  token_type: string;
  username: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export async function login(data: LoginRequest) {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/v1/auth/token', data);
  return response.data;
}

export async function getMe() {
  const response = await apiClient.get<ApiResponse<{ username: string; role: string }>>('/api/v1/auth/me');
  return response.data;
}

export async function changePassword(data: ChangePasswordRequest) {
  const response = await apiClient.put<ApiResponse<void>>('/api/v1/auth/password', data);
  return response.data;
}
