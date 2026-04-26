import apiClient from './client';
import type { ApiResponse } from './auth';

export type ProviderConfig = Record<string, unknown>;
export type ProvidersMap = Record<string, ProviderConfig>;

export async function listProviders(configId = 'default'): Promise<ProvidersMap> {
  const res = await apiClient.get<ApiResponse<ProvidersMap>>('/api/v1/providers', { params: { config_id: configId } });
  if (!res.data.success) throw new Error(res.data.message || '获取提供商列表失败');
  return res.data.data ?? {};
}

export async function getProvider(name: string, configId = 'default'): Promise<ProviderConfig> {
  const res = await apiClient.get<ApiResponse<Record<string, ProviderConfig>>>(`/api/v1/providers/${encodeURIComponent(name)}`, {
    params: { config_id: configId }
  });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || '获取提供商失败');
  return res.data.data[name] ?? {};
}

export async function createProvider(name: string, config: ProviderConfig, configId = 'default'): Promise<void> {
  const res = await apiClient.post<ApiResponse<void>>('/api/v1/providers', { name, ...config, config_id: configId });
  if (!res.data.success) throw new Error(res.data.message || '创建提供商失败');
}

export async function updateProvider(name: string, config: ProviderConfig, configId = 'default'): Promise<void> {
  const res = await apiClient.put<ApiResponse<void>>(`/api/v1/providers/${encodeURIComponent(name)}`, { ...config, config_id: configId });
  if (!res.data.success) throw new Error(res.data.message || '更新提供商失败');
}

export async function deleteProvider(name: string, configId = 'default'): Promise<void> {
  const res = await apiClient.delete<ApiResponse<void>>(`/api/v1/providers/${encodeURIComponent(name)}`, { params: { config_id: configId } });
  if (!res.data.success) throw new Error(res.data.message || '删除提供商失败');
}

export async function setProviderEnabled(name: string, enabled: boolean, configId = 'default'): Promise<void> {
  const res = await apiClient.patch<ApiResponse<void>>(`/api/v1/providers/${encodeURIComponent(name)}/enabled`, {
    enabled,
    config_id: configId
  });
  if (!res.data.success) throw new Error(res.data.message || '更新提供商状态失败');
}
