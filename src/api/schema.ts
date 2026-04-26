import apiClient from './client';
import type { ApiResponse } from './auth';
import type { ConfigSchema } from 'ui-component/config/types';

export interface ProviderSchemasMap {
  [providerType: string]: ConfigSchema;
}

export async function listProviderSchemas(): Promise<ProviderSchemasMap> {
  const res = await apiClient.get<ApiResponse<ProviderSchemasMap>>('/api/v1/schema/providers');
  if (!res.data.success) throw new Error(res.data.message || '获取 Schema 失败');
  return res.data.data ?? {};
}

export async function getPluginSchema(pluginName: string, configId = 'default'): Promise<ConfigSchema> {
  const res = await apiClient.get<ApiResponse<ConfigSchema>>(`/api/v1/schema/plugins/${encodeURIComponent(pluginName)}`, {
    params: { config_id: configId },
  });
  if (!res.data.success) throw new Error(res.data.message || '获取插件 Schema 失败');
  return res.data.data ?? { fields: {} };
}
