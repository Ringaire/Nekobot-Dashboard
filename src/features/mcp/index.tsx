import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Plus, RefreshCw, Server, Trash2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  addServer,
  listServers,
  refreshAllServers,
  refreshServer,
  removeServer,
  type MCPServer,
  type MCPServerConfig,
} from '@/api/mcp';

export default function McpPage() {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [rowAction, setRowAction] = useState<{ name: string; type: 'refresh' | 'remove' } | null>(
    null,
  );
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setServers(await listServers());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const onRefreshAll = async () => {
    setRefreshingAll(true);
    try {
      await refreshAllServers();
      await fetchData();
      toast.success('已刷新全部');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '刷新失败');
    } finally {
      setRefreshingAll(false);
    }
  };

  const onRefresh = async (name: string) => {
    setRowAction({ name, type: 'refresh' });
    try {
      await refreshServer(name);
      await fetchData();
      toast.success(`已刷新 ${name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '刷新失败');
    } finally {
      setRowAction(null);
    }
  };

  const onRemove = async () => {
    if (!removeTarget) return;
    setRowAction({ name: removeTarget, type: 'remove' });
    try {
      await removeServer(removeTarget);
      await fetchData();
      toast.success(`已移除 ${removeTarget}`);
      setRemoveTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '移除失败');
    } finally {
      setRowAction(null);
    }
  };

  const isBusy = (name: string, type: 'refresh' | 'remove') =>
    rowAction?.name === name && rowAction.type === type;

  return (
    <MainCard
      title="MCP 服务器"
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onRefreshAll} disabled={refreshingAll}>
            <RefreshCw className={`mr-1 size-4 ${refreshingAll ? 'animate-spin' : ''}`} />
            全部刷新
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 size-4" />
            添加
          </Button>
        </div>
      }
    >
      {loading ? (
        <PageLoading />
      ) : servers.length === 0 ? (
        <EmptyState description="还没有 MCP 服务器" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>工具数</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servers.map((s) => (
              <TableRow key={s.name}>
                <TableCell>
                  <div className="flex items-center gap-2 font-medium">
                    <Server className="size-4 text-muted-foreground" />
                    {s.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{s.tool_count}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRefresh(s.name)}
                      disabled={isBusy(s.name, 'refresh')}
                    >
                      <RefreshCw
                        className={`size-4 ${isBusy(s.name, 'refresh') ? 'animate-spin' : ''}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRemoveTarget(s.name)}
                      disabled={isBusy(s.name, 'remove')}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AddServerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={() => {
          void fetchData();
        }}
      />

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title={`移除 MCP 服务器「${removeTarget}」？`}
        destructive
        onConfirm={onRemove}
      />
    </MainCard>
  );
}

function AddServerDialog({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdded: () => void;
}) {
  const [name, setName] = useState('');
  const [transport, setTransport] = useState<'stdio' | 'sse' | 'http'>('stdio');
  const [command, setCommand] = useState('');
  const [cwd, setCwd] = useState('');
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName('');
    setTransport('stdio');
    setCommand('');
    setCwd('');
    setUrl('');
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('请输入名称');
      return;
    }
    setSaving(true);
    try {
      const cfg: MCPServerConfig = { name, transport };
      if (transport === 'stdio') {
        const trimmed = command.trim();
        let cmd: string[] = [];
        try {
          const parsed = JSON.parse(trimmed);
          cmd = Array.isArray(parsed) ? parsed.map(String) : [trimmed];
        } catch {
          cmd = trimmed.split(/\s+/).filter(Boolean);
        }
        cfg.command = cmd;
        if (cwd) cfg.cwd = cwd;
      } else {
        if (!url) {
          toast.error('请输入 URL');
          setSaving(false);
          return;
        }
        cfg.url = url;
      }
      await addServer(cfg);
      toast.success('MCP 服务器已添加');
      reset();
      onOpenChange(false);
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '添加失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加 MCP 服务器</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>名称</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>传输方式</Label>
            <Select
              value={transport}
              onValueChange={(v) => setTransport(v as 'stdio' | 'sse' | 'http')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stdio">stdio</SelectItem>
                <SelectItem value="sse">sse</SelectItem>
                <SelectItem value="http">http</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {transport === 'stdio' ? (
            <>
              <div className="space-y-1.5">
                <Label>命令（JSON 数组或空格分隔）</Label>
                <Textarea
                  rows={2}
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder='["uvx", "mcp-server"]'
                />
              </div>
              <div className="space-y-1.5">
                <Label>工作目录（可选）</Label>
                <Input value={cwd} onChange={(e) => setCwd(e.target.value)} />
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <Label>URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </div>
          )}
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
              {saving ? '添加中…' : '添加'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
