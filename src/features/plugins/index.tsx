import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Settings } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/common/empty-state';
import { MainCard } from '@/components/common/main-card';
import { PageLoading } from '@/components/common/page-loading';
import { SchemaForm } from '@/components/config/schema-form';
import {
  getPluginConfig,
  listPlugins,
  reloadPlugin,
  setPluginEnabled,
  updatePluginConfig,
  type PluginInfo,
} from '@/api/plugins';
import { getPluginSchema } from '@/api/schema';
import type { ConfigSchema, ConfigValue } from '@/types/config';

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [reloading, setReloading] = useState<string | null>(null);
  const [configPlugin, setConfigPlugin] = useState<PluginInfo | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setPlugins(await listPlugins());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleToggle = async (p: PluginInfo) => {
    setToggling(p.name);
    try {
      await setPluginEnabled(p.name, !p.enabled);
      await fetchData();
      toast.success(`插件「${p.name}」已${p.enabled ? '禁用' : '启用'}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '操作失败');
    } finally {
      setToggling(null);
    }
  };

  const handleReload = async (name: string) => {
    setReloading(name);
    try {
      await reloadPlugin(name);
      await fetchData();
      toast.success(`插件「${name}」已重载`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '重载失败');
    } finally {
      setReloading(null);
    }
  };

  return (
    <>
      <MainCard
        title="插件管理"
        actions={
          <Button size="sm" variant="outline" onClick={() => fetchData()} disabled={loading}>
            <RefreshCw className="mr-1 size-4" />
            刷新
          </Button>
        }
      >
        {loading ? (
          <PageLoading />
        ) : plugins.length === 0 ? (
          <EmptyState description="暂无已加载的插件" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>版本</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>作者</TableHead>
                <TableHead>标签</TableHead>
                <TableHead className="text-center">启用</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plugins.map((p) => (
                <TableRow key={p.name}>
                  <TableCell>
                    <div className="font-medium">{p.display_name || p.name}</div>
                    {p.display_name && (
                      <div className="text-xs text-muted-foreground">{p.name}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.version || '-'}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground">
                    {p.description || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.author || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.tags?.map((t) => (
                        <Badge key={t} variant="secondary" className="text-[11px]">
                          {t}
                        </Badge>
                      )) ?? '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={p.enabled}
                      disabled={toggling === p.name}
                      onCheckedChange={() => handleToggle(p)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setConfigPlugin(p)}>
                        <Settings className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReload(p.name)}
                        disabled={reloading === p.name}
                      >
                        <RefreshCw
                          className={`size-4 ${reloading === p.name ? 'animate-spin' : ''}`}
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </MainCard>

      {configPlugin && (
        <PluginConfigDialog
          plugin={configPlugin}
          onClose={() => setConfigPlugin(null)}
          onSaved={() => {
            void fetchData();
          }}
        />
      )}
    </>
  );
}

function PluginConfigDialog({
  plugin,
  onClose,
  onSaved,
}: {
  plugin: PluginInfo;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [schema, setSchema] = useState<ConfigSchema | null>(null);
  const [cfg, setCfg] = useState<ConfigValue>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([getPluginSchema(plugin.name), getPluginConfig(plugin.name)])
      .then(([s, c]) => {
        if (!alive) return;
        setSchema(s);
        setCfg(c);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : '加载配置失败'))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [plugin.name]);

  const hasFields = !!schema && Object.keys(schema.fields).length > 0;

  const onSave = async () => {
    setSaving(true);
    try {
      await updatePluginConfig(plugin.name, cfg);
      toast.success('配置已保存');
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>配置：{plugin.display_name || plugin.name}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <PageLoading />
        ) : schema && hasFields ? (
          <SchemaForm fields={schema.fields} value={cfg} onChange={setCfg} />
        ) : (
          <p className="text-sm text-muted-foreground">该插件没有可配置的选项。</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            取消
          </Button>
          <Button onClick={onSave} disabled={saving || !hasFields}>
            {saving ? '保存中…' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
