import apiClient from './client';
import type { ApiResponse } from './auth';

export interface MemoryInfo {
  rss_bytes: number;
  vms_bytes: number;
}

export interface SystemMemory {
  total: number;
  available: number;
  percent: number;
}

export interface SystemInfo {
  python_version: string;
  uptime_seconds: number | null;
  memory: MemoryInfo | null;
  cpu_percent: number | null;
  system_memory: SystemMemory | null;
  plugins_loaded: number;
  providers_loaded: number;
}

export interface LogFile {
  name: string;
  size_bytes: number;
  modified_at: number;
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const res = await apiClient.get<ApiResponse<SystemInfo>>('/api/v1/system/info');
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || '获取系统信息失败');
  return res.data.data;
}

export async function reloadConfig(): Promise<void> {
  const res = await apiClient.post<ApiResponse<void>>('/api/v1/system/reload-config');
  if (!res.data.success) throw new Error(res.data.message || '重载配置失败');
}

export async function listLogs(): Promise<LogFile[]> {
  const res = await apiClient.get<ApiResponse<LogFile[]>>('/api/v1/logs');
  if (!res.data.success) throw new Error(res.data.message || '获取日志列表失败');
  return res.data.data ?? [];
}

export async function tailLog(filename: string, lines = 200): Promise<string[]> {
  const res = await apiClient.get<ApiResponse<{ filename: string; lines: string[] }>>(
    `/api/v1/logs/${encodeURIComponent(filename)}`,
    { params: { lines } }
  );
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || '读取日志失败');
  return res.data.data.lines;
}
