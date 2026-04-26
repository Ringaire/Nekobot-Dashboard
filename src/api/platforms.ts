import apiClient from './client';
import type { ApiResponse } from './auth';

export type PlatformConfig = Record<string, unknown> & {
  instance_uuid: string;
  type?: string;
  enabled?: boolean;
};

export async function listPlatforms(configId = 'default'): Promise<PlatformConfig[]> {
  const res = await apiClient.get<ApiResponse<PlatformConfig[]>>('/api/v1/platforms', { params: { config_id: configId } });
  if (!res.data.success) throw new Error(res.data.message || '获取平台列表失败');
  return res.data.data ?? [];
}

export async function createPlatform(config: PlatformConfig, configId = 'default'): Promise<void> {
  const res = await apiClient.post<ApiResponse<void>>('/api/v1/platforms', { ...config, config_id: configId });
  if (!res.data.success) throw new Error(res.data.message || '创建平台失败');
}

export async function updatePlatform(instanceUuid: string, config: PlatformConfig, configId = 'default'): Promise<void> {
  const res = await apiClient.put<ApiResponse<void>>(`/api/v1/platforms/${encodeURIComponent(instanceUuid)}`, { ...config, config_id: configId });
  if (!res.data.success) throw new Error(res.data.message || '更新平台失败');
}

export async function deletePlatform(instanceUuid: string, configId = 'default'): Promise<void> {
  const res = await apiClient.delete<ApiResponse<void>>(`/api/v1/platforms/${encodeURIComponent(instanceUuid)}`, {
    params: { config_id: configId }
  });
  if (!res.data.success) throw new Error(res.data.message || '删除平台失败');
}

export async function setPlatformEnabled(instanceUuid: string, enabled: boolean, configId = 'default'): Promise<void> {
  const res = await apiClient.patch<ApiResponse<void>>(`/api/v1/platforms/${encodeURIComponent(instanceUuid)}/enabled`, {
    enabled,
    config_id: configId
  });
  if (!res.data.success) throw new Error(res.data.message || '更新平台状态失败');
}
