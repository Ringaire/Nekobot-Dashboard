import apiClient from './client';
import type { ApiResponse } from './auth';

export interface Persona {
  name: string;
  prompt: string;
}

export async function listPersonas(): Promise<Record<string, string>> {
  const res = await apiClient.get<ApiResponse<Record<string, string>>>('/api/v1/personas');
  if (!res.data.success) throw new Error(res.data.message || '获取人格列表失败');
  return res.data.data ?? {};
}

export async function getPersona(name: string): Promise<Persona> {
  const res = await apiClient.get<ApiResponse<Persona>>(`/api/v1/personas/${encodeURIComponent(name)}`);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || '获取人格失败');
  return res.data.data;
}

export async function createPersona(name: string, prompt: string): Promise<void> {
  const res = await apiClient.post<ApiResponse<void>>('/api/v1/personas', { name, prompt });
  if (!res.data.success) throw new Error(res.data.message || '创建人格失败');
}

export async function updatePersona(name: string, prompt: string): Promise<void> {
  const res = await apiClient.put<ApiResponse<void>>(`/api/v1/personas/${encodeURIComponent(name)}`, { prompt });
  if (!res.data.success) throw new Error(res.data.message || '更新人格失败');
}

export async function deletePersona(name: string): Promise<void> {
  const res = await apiClient.delete<ApiResponse<void>>(`/api/v1/personas/${encodeURIComponent(name)}`);
  if (!res.data.success) throw new Error(res.data.message || '删除人格失败');
}
