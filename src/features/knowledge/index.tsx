import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { BookOpen, FileText, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { EmptyState } from '@/components/common/empty-state';
import { MainCard } from '@/components/common/main-card';
import { PageLoading } from '@/components/common/page-loading';
import {
  createKB,
  deleteDocument,
  deleteKB,
  getStatus,
  listDocuments,
  listKBs,
  uploadDocument,
  type KnowledgeBase,
  type KnowledgeDocument,
} from '@/api/knowledge';

export default function KnowledgePage() {
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [docsKB, setDocsKB] = useState<KnowledgeBase | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeBase | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const status = await getStatus();
      setAvailable(status.available);
      setKbs(status.available ? await listKBs() : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteKB(deleteTarget.id);
      toast.success('知识库已删除');
      setDeleteTarget(null);
      void fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败');
    }
  };

  return (
    <MainCard
      title="知识库管理"
      actions={
        available ? (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 size-4" />
            新建
          </Button>
        ) : undefined
      }
    >
      {loading ? (
        <PageLoading />
      ) : !available ? (
        <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-700 dark:text-yellow-300">
          知识库后端未启用。
        </div>
      ) : kbs.length === 0 ? (
        <EmptyState description="还没有知识库" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>嵌入模型</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kbs.map((kb) => (
              <TableRow key={kb.id}>
                <TableCell>
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    {kb.id}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{kb.name}</TableCell>
                <TableCell className="max-w-[220px] truncate text-muted-foreground">
                  {kb.description}
                </TableCell>
                <TableCell className="text-muted-foreground">{kb.embedding_model}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setDocsKB(kb)}>
                      <FileText className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(kb)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CreateKBDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => {
          void fetchData();
        }}
      />
      {docsKB && <DocumentsDialog kb={docsKB} onClose={() => setDocsKB(null)} />}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`删除知识库「${deleteTarget?.name}」？`}
        description="将删除所有文档，不可撤销。"
        destructive
        onConfirm={onDelete}
      />
    </MainCard>
  );
}

function CreateKBDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ id: '', name: '', description: '', embedding_model: '' });
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.id.trim() || !form.name.trim()) {
      toast.error('请输入 ID 和名称');
      return;
    }
    setSaving(true);
    try {
      await createKB(form.id, form.name, form.description, form.embedding_model);
      toast.success('知识库已创建');
      setForm({ id: '', name: '', description: '', embedding_model: '' });
      onOpenChange(false);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建知识库</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>ID</Label>
            <Input value={form.id} onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>名称</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>描述</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>嵌入模型</Label>
            <Input
              value={form.embedding_model}
              onChange={(e) => setForm((f) => ({ ...f, embedding_model: e.target.value }))}
              placeholder="text-embedding-3-small"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              取消
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? '创建中…' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DocumentsDialog({
  kb,
  onClose,
}: {
  kb: KnowledgeBase;
  onClose: () => void;
}) {
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState<KnowledgeDocument | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDocs(await listDocuments(kb.id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [kb.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocument(kb.id, file);
      toast.success('文档已上传');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onDeleteDoc = async () => {
    if (!deleteDoc) return;
    try {
      await deleteDocument(kb.id, deleteDoc.id);
      toast.success('文档已删除');
      setDeleteDoc(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败');
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>文档：{kb.name}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{docs.length} 个文档</p>
          <div>
            <input ref={fileRef} type="file" className="hidden" onChange={onUpload} />
            <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload className="mr-1 size-4" />
              {uploading ? '上传中…' : '上传文档'}
            </Button>
          </div>
        </div>
        {loading ? (
          <PageLoading />
        ) : docs.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="size-8 text-muted-foreground/50" />}
            description="还没有文档"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>文件名</TableHead>
                <TableHead>分块数</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.filename}</TableCell>
                  <TableCell className="text-muted-foreground">{d.chunk_count}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setDeleteDoc(d)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <ConfirmDialog
          open={!!deleteDoc}
          onOpenChange={(o) => !o && setDeleteDoc(null)}
          title={`删除文档「${deleteDoc?.filename}」？`}
          destructive
          onConfirm={onDeleteDoc}
        />
      </DialogContent>
    </Dialog>
  );
}
