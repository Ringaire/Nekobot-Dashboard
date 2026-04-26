import apiClient from './client';
import type { ApiResponse } from './auth';

export interface PluginInfo {
  name: string;
  enabled: boolean;
  version?: string;
  description?: string;
  author?: string;
  display_name?: string;
  repository?: string;
  tags?: string[];
  root_dir?: string;
}

export async function listPlugins(): Promise<PluginInfo[]> {
  const res = await apiClient.get<ApiResponse<PluginInfo[]>>('/api/v1/plugins');
  if (!res.data.success) throw new Error(res.data.message || '获取插件列表失败');
  return res.data.data ?? [];
}

export async function getPlugin(name: string): Promise<PluginInfo> {
  const res = await apiClient.get<ApiResponse<PluginInfo>>(`/api/v1/plugins/${encodeURIComponent(name)}`);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || '获取插件失败');
  return res.data.data;
}

export async function setPluginEnabled(name: string, enabled: boolean, configId = 'default'): Promise<void> {
  const res = await apiClient.patch<ApiResponse<void>>(`/api/v1/plugins/${encodeURIComponent(name)}/enabled`, { enabled, config_id: configId });
  if (!res.data.success) throw new Error(res.data.message || '更新插件状态失败');
}

export async function reloadPlugin(name: string): Promise<void> {
  const res = await apiClient.post<ApiResponse<void>>(`/api/v1/plugins/${encodeURIComponent(name)}/reload`);
  if (!res.data.success) throw new Error(res.data.message || '重载插件失败');
}

export async function getPluginConfig(name: string, configId = 'default'): Promise<Record<string, unknown>> {
  const res = await apiClient.get<ApiResponse<Record<string, unknown>>>(`/api/v1/plugins/${encodeURIComponent(name)}/config`, {
    params: { config_id: configId },
  });
  if (!res.data.success) throw new Error(res.data.message || '获取插件配置失败');
  return res.data.data ?? {};
}

export async function updatePluginConfig(name: string, config: Record<string, unknown>, configId = 'default'): Promise<void> {
  const res = await apiClient.put<ApiResponse<void>>(`/api/v1/plugins/${encodeURIComponent(name)}/config`, {
    ...config,
    config_id: configId,
  });
  if (!res.data.success) throw new Error(res.data.message || '保存插件配置失败');
}
