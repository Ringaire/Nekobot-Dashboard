import { useCallback, useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
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
import {
  createPlatform,
  deletePlatform,
  listPlatforms,
  setPlatformEnabled,
  updatePlatform,
} from '@/api/platforms';
import type { PlatformConfig } from '@/api/platforms';

// 当前框架内置的平台类型。后端暂无 schema/枚举端点，按实际注册情况维护。
const PLATFORM_TYPES = ['onebot_v11'];

interface FormState {
  instance_uuid: string;
  type: string;
  host: string;
  port: string;
  path: string;
  access_token: string;
}

const EMPTY_FORM: FormState = {
  instance_uuid: '',
  type: PLATFORM_TYPES[0],
  host: '0.0.0.0',
  port: '',
  path: '/ws',
  access_token: '',
};

function toForm(p: PlatformConfig): FormState {
  const cfg = p as Record<string, unknown>;
  return {
    instance_uuid: String(cfg.instance_uuid ?? ''),
    type: String(cfg.type ?? PLATFORM_TYPES[0]),
    host: String(cfg.host ?? ''),
    port: cfg.port != null ? String(cfg.port) : '',
    path: String(cfg.path ?? ''),
    access_token: String(cfg.access_token ?? ''),
  };
}

export default function PlatformsPage() {
  const [rows, setRows] = useState<PlatformConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editUuid, setEditUuid] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listPlatforms());
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
    setEditUuid(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (p: PlatformConfig) => {
    setEditUuid(p.instance_uuid);
    setForm(toForm(p));
    setFormOpen(true);
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSave = async () => {
    if (!form.instance_uuid.trim()) {
      toast.error('请填写实例 ID');
      return;
    }
    if (!form.type) {
      toast.error('请选择类型');
      return;
    }
    const payload: PlatformConfig = {
      instance_uuid: form.instance_uuid.trim(),
      type: form.type,
      host: form.host,
      port: form.port === '' ? undefined : Number(form.port),
      path: form.path,
      access_token: form.access_token,
    };
    setSaving(true);
    try {
      if (editUuid) {
        await updatePlatform(editUuid, payload);
        toast.success('平台实例已更新');
      } else {
        await createPlatform(payload);
        toast.success('平台实例已创建');
      }
      setFormOpen(false);
      void fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (p: PlatformConfig) => {
    const enabled = Boolean((p as Record<string, unknown>).enabled);
    setToggling(p.instance_uuid);
    try {
      await setPlatformEnabled(p.instance_uuid, !enabled);
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
      await deletePlatform(deleteTarget);
      toast.success('已删除');
      setDeleteTarget(null);
      void fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败');
    }
  };

  return (
    <MainCard
      title="平台适配器"
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
        <EmptyState description="还没有配置平台适配器" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>实例 ID</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>接入点</TableHead>
              <TableHead className="text-center">启用</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => {
              const cfg = p as Record<string, unknown>;
              const endpoint =
                [cfg.host, cfg.port].filter(Boolean).join(':') + (cfg.path ? String(cfg.path) : '');
              return (
                <TableRow key={p.instance_uuid}>
                  <TableCell className="font-medium">{p.instance_uuid}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{String(cfg.type ?? '-')}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{endpoint || '-'}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={Boolean(cfg.enabled)}
                      disabled={toggling === p.instance_uuid}
                      onCheckedChange={() => onToggle(p)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(p.instance_uuid)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editUuid ? '编辑平台实例' : '添加平台实例'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>实例 ID</Label>
              <Input
                value={form.instance_uuid}
                onChange={(e) => setField('instance_uuid', e.target.value)}
                disabled={!!editUuid}
                placeholder="例如 nekobot-onebot-main"
              />
            </div>
            <div className="space-y-1.5">
              <Label>类型</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setField('type', v)}
                disabled={!!editUuid}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Host</Label>
                <Input
                  value={form.host}
                  onChange={(e) => setField('host', e.target.value)}
                  placeholder="0.0.0.0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Port</Label>
                <Input
                  type="number"
                  value={form.port}
                  onChange={(e) => setField('port', e.target.value)}
                  placeholder="6286"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>路径</Label>
              <Input
                value={form.path}
                onChange={(e) => setField('path', e.target.value)}
                placeholder="/ws"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Access Token</Label>
              <Input
                type="password"
                value={form.access_token}
                onChange={(e) => setField('access_token', e.target.value)}
                placeholder="连接鉴权令牌"
              />
            </div>
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
        title={`删除平台实例「${deleteTarget}」？`}
        destructive
        onConfirm={onDelete}
      />
    </MainCard>
  );
}
