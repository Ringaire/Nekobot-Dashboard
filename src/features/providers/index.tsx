import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
import { SchemaForm } from '@/components/config/schema-form';
import {
  createProvider,
  deleteProvider,
  listProviders,
  setProviderEnabled,
  updateProvider,
} from '@/api/providers';
import { listProviderSchemas } from '@/api/schema';
import type { ConfigSchema, ConfigValue } from '@/types/config';

type ProviderConfig = Record<string, unknown>;
interface ProviderRow {
  name: string;
  config: ProviderConfig;
  enabled: boolean;
}

export default function ProvidersPage() {
  const [rows, setRows] = useState<ProviderRow[]>([]);
  const [schemas, setSchemas] = useState<Record<string, ConfigSchema>>({});
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editName, setEditName] = useState<string | null>(null);
  const [formType, setFormType] = useState('');
  const [formCfg, setFormCfg] = useState<ConfigValue>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [map, sch] = await Promise.all([listProviders(), listProviderSchemas()]);
      setRows(
        Object.entries(map).map(([name, config]) => ({
          name,
          config,
          enabled: Boolean((config as { enabled?: boolean }).enabled),
        })),
      );
      setSchemas(sch);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const types = useMemo(() => Object.keys(schemas), [schemas]);

  const openCreate = () => {
    setEditName(null);
    setFormType(types[0] ?? '');
    setFormCfg({});
    setFormOpen(true);
  };

  const openEdit = (row: ProviderRow) => {
    setEditName(row.name);
    setFormType(row.name);
    setFormCfg({ ...row.config });
    setFormOpen(true);
  };

  const currentSchema = formType ? schemas[formType] : undefined;

  const onSave = async () => {
    if (!formType) {
      toast.error('请选择类型');
      return;
    }
    setSaving(true);
    try {
      if (editName) {
        await updateProvider(editName, formCfg);
        toast.success('提供商已更新');
      } else {
        await createProvider(formType, formCfg);
        toast.success('提供商已创建');
      }
      setFormOpen(false);
      void fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (row: ProviderRow) => {
    setToggling(row.name);
    try {
      await setProviderEnabled(row.name, !row.enabled);
      await fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '操作失败');
    } finally {
      setToggling(null);
    }
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProvider(deleteTarget);
      toast.success('已删除');
      setDeleteTarget(null);
      void fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败');
    }
  };

  return (
    <MainCard
      title="LLM 提供商"
      actions={
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-4" />
          添加
        </Button>
      }
    >
      {loading ? (
        <PageLoading />
      ) : rows.length === 0 ? (
        <EmptyState description="还没有配置提供商" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>默认模型</TableHead>
              <TableHead className="text-center">启用</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.name}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{r.name}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {String((r.config as { model?: unknown }).model ?? '-')}
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={r.enabled}
                    disabled={toggling === r.name}
                    onCheckedChange={() => onToggle(r)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(r.name)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editName ? '编辑提供商' : '添加提供商'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>类型</Label>
            <Select
              value={formType}
              onValueChange={(v) => {
                setFormType(v);
                setFormCfg({});
              }}
              disabled={!!editName}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
            {currentSchema && Object.keys(currentSchema.fields).length > 0 && (
              <SchemaForm fields={currentSchema.fields} value={formCfg} onChange={setFormCfg} />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
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
        title={`删除提供商「${deleteTarget}」？`}
        destructive
        onConfirm={onDelete}
      />
    </MainCard>
  );
}
