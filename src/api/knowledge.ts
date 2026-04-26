import apiClient from './client';
import type { ApiResponse } from './auth';

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  embedding_model: string;
  chunk_size: number;
  chunk_overlap: number;
  metadata: Record<string, unknown>;
}

export interface KnowledgeDocument {
  id: string;
  kb_id: string;
  filename: string;
  content_hash: string;
  chunk_count: number;
  metadata: Record<string, unknown>;
}

export interface SearchResult {
  document_id: string;
  chunk_index: number;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface KnowledgeStatus {
  available: boolean;
  backend: string | null;
}

export async function getStatus(): Promise<KnowledgeStatus> {
  const res = await apiClient.get<ApiResponse<KnowledgeStatus>>('/api/v1/knowledge/status');
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || '获取知识库状态失败');
  return res.data.data;
}

export async function listKBs(): Promise<KnowledgeBase[]> {
  const res = await apiClient.get<ApiResponse<KnowledgeBase[]>>('/api/v1/knowledge');
  if (!res.data.success) throw new Error(res.data.message || '获取知识库列表失败');
  return res.data.data ?? [];
}

export async function createKB(id: string, name: string, description = '', embeddingModel = 'text-embedding-3-small'): Promise<KnowledgeBase> {
  const res = await apiClient.post<ApiResponse<KnowledgeBase>>('/api/v1/knowledge', { id, name, description, embedding_model: embeddingModel });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || '创建知识库失败');
  return res.data.data;
}

export async function getKB(kbId: string): Promise<KnowledgeBase> {
  const res = await apiClient.get<ApiResponse<KnowledgeBase>>(`/api/v1/knowledge/${encodeURIComponent(kbId)}`);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || '获取知识库失败');
  return res.data.data;
}

export async function updateKB(kbId: string, name?: string, description?: string): Promise<KnowledgeBase> {
  const res = await apiClient.put<ApiResponse<KnowledgeBase>>(`/api/v1/knowledge/${encodeURIComponent(kbId)}`, { name, description });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || '更新知识库失败');
  return res.data.data;
}

export async function deleteKB(kbId: string): Promise<void> {
  const res = await apiClient.delete<ApiResponse<void>>(`/api/v1/knowledge/${encodeURIComponent(kbId)}`);
  if (!res.data.success) throw new Error(res.data.message || '删除知识库失败');
}

export async function listDocuments(kbId: string): Promise<KnowledgeDocument[]> {
  const res = await apiClient.get<ApiResponse<KnowledgeDocument[]>>(`/api/v1/knowledge/${encodeURIComponent(kbId)}/documents`);
  if (!res.data.success) throw new Error(res.data.message || '获取文档列表失败');
  return res.data.data ?? [];
}

export async function uploadDocument(kbId: string, file: File): Promise<KnowledgeDocument> {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post<ApiResponse<KnowledgeDocument>>(
    `/api/v1/knowledge/${encodeURIComponent(kbId)}/documents`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || '上传文档失败');
  return res.data.data;
}

export async function deleteDocument(kbId: string, docId: string): Promise<void> {
  const res = await apiClient.delete<ApiResponse<void>>(
    `/api/v1/knowledge/${encodeURIComponent(kbId)}/documents/${encodeURIComponent(docId)}`
  );
  if (!res.data.success) throw new Error(res.data.message || '删除文档失败');
}
