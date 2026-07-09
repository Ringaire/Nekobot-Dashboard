import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
import { Textarea } from '@/components/ui/textarea';
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
import { createPersona, deletePersona, listPersonas, updatePersona } from '@/api/personas';

interface PersonaRow {
  name: string;
  prompt: string;
}

export default function PersonasPage() {
  const [rows, setRows] = useState<PersonaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PersonaRow | null>(null);
  const [form, setForm] = useState({ name: '', prompt: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PersonaRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const map = await listPersonas();
      setRows(Object.entries(map).map(([name, prompt]) => ({ name, prompt })));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: '', prompt: '' });
    setDialogOpen(true);
  };

  const openEdit = (row: PersonaRow) => {
    setEditTarget(row);
    setForm({ name: row.name, prompt: row.prompt });
    setDialogOpen(true);
  };

  const onSave = async () => {
    if (!form.name.trim()) {
      toast.error('请输入名称');
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await updatePersona(editTarget.name, form.prompt);
        toast.success('人格已更新');
      } else {
        await createPersona(form.name, form.prompt);
        toast.success('人格已创建');
      }
      setDialogOpen(false);
      void fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePersona(deleteTarget.name);
      toast.success('人格已删除');
      setDeleteTarget(null);
      void fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败');
    }
  };

  return (
    <MainCard
      title="人格管理"
      actions={
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-4" />
          新建
        </Button>
      }
    >
      {loading ? (
        <PageLoading />
      ) : rows.length === 0 ? (
        <EmptyState description="还没有人格配置" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>提示词</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.name}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="max-w-[420px] truncate text-muted-foreground">
                  {r.prompt}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(r)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? '编辑人格' : '新建人格'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>名称</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                disabled={!!editTarget}
              />
            </div>
            <div className="space-y-1.5">
              <Label>提示词</Label>
              <Textarea
                rows={6}
                value={form.prompt}
                onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              取消
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving ? '保存中…' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`删除人格「${deleteTarget?.name}」？`}
        description="此操作不可撤销。"
        destructive
        onConfirm={onDelete}
      />
    </MainCard>
  );
}
