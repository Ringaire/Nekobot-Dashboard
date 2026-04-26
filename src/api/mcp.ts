import apiClient from './client';
import type { ApiResponse } from './auth';

export interface MCPServer {
  name: string;
  tool_count: number;
}

export interface MCPServerConfig {
  name: string;
  transport: 'stdio' | 'sse' | 'http';
  command?: string[];
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  url?: string;
  headers?: Record<string, string>;
  timeout?: number;
  enabled?: boolean;
}

export async function listServers(): Promise<MCPServer[]> {
  const res = await apiClient.get<ApiResponse<MCPServer[]>>('/api/v1/mcp');
  if (!res.data.success) throw new Error(res.data.message || '获取 MCP 服务器列表失败');
  return res.data.data ?? [];
}

export async function addServer(config: MCPServerConfig): Promise<void> {
  const res = await apiClient.post<ApiResponse<void>>('/api/v1/mcp', config);
  if (!res.data.success) throw new Error(res.data.message || '添加 MCP 服务器失败');
}

export async function removeServer(name: string): Promise<void> {
  const res = await apiClient.delete<ApiResponse<void>>(`/api/v1/mcp/${encodeURIComponent(name)}`);
  if (!res.data.success) throw new Error(res.data.message || '移除 MCP 服务器失败');
}

export async function refreshServer(name: string): Promise<MCPServer> {
  const res = await apiClient.post<ApiResponse<MCPServer>>(`/api/v1/mcp/${encodeURIComponent(name)}/refresh`);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || '刷新 MCP 服务器失败');
  return res.data.data;
}

export async function refreshAllServers(): Promise<MCPServer[]> {
  const res = await apiClient.post<ApiResponse<MCPServer[]>>('/api/v1/mcp/refresh');
  if (!res.data.success) throw new Error(res.data.message || '刷新所有 MCP 服务器失败');
  return res.data.data ?? [];
}
