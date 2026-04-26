import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import MainCard from 'ui-component/cards/MainCard';
import { addServer, listServers, refreshAllServers, refreshServer, removeServer, type MCPServer, type MCPServerConfig } from 'api/mcp';

function AddServerDialog({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: () => void }) {
  const [form, setForm] = useState<MCPServerConfig>({ name: '', transport: 'stdio' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setForm({ name: '', transport: 'stdio' }); setError(''); }
  }, [open]);

  const set = (key: keyof MCPServerConfig, val: unknown) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError('名称不能为空'); return; }
    if (form.transport !== 'stdio' && !form.url) { setError('SSE/HTTP 需要填写 URL'); return; }
    setSaving(true); setError('');
    try {
      await addServer(form);
      onAdd();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : '添加失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>添加 MCP 服务器</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="名称" value={form.name} onChange={(e) => set('name', e.target.value)} fullWidth size="small" />
          <FormControl fullWidth size="small">
            <InputLabel>传输方式</InputLabel>
            <Select label="传输方式" value={form.transport} onChange={(e) => set('transport', e.target.value)}>
              <MenuItem value="stdio">stdio（本地进程）</MenuItem>
              <MenuItem value="sse">SSE（远程）</MenuItem>
              <MenuItem value="http">HTTP（远程）</MenuItem>
            </Select>
          </FormControl>
          {form.transport === 'stdio' ? (
            <>
              <TextField
                label="命令（JSON 数组，如 [&quot;python&quot;, &quot;server.py&quot;]）"
                value={form.command ? JSON.stringify(form.command) : ''}
                onChange={(e) => {
                  try { set('command', JSON.parse(e.target.value)); } catch { set('command', e.target.value.split(' ')); }
                }}
                fullWidth size="small"
                helperText="可填写可执行文件路径及参数"
              />
              <TextField
                label="工作目录（可选）"
                value={form.cwd || ''}
                onChange={(e) => set('cwd', e.target.value || undefined)}
                fullWidth size="small"
              />
            </>
          ) : (
            <TextField
              label="URL"
              value={form.url || ''}
              onChange={(e) => set('url', e.target.value)}
              fullWidth size="small"
              placeholder="http://localhost:8080/sse"
            />
          )}
          <TextField
            label="超时（秒，可选）"
            type="number"
            value={form.timeout ?? 30}
            onChange={(e) => set('timeout', Number(e.target.value))}
            size="small"
            sx={{ width: 160 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>取消</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={18} /> : '添加'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function MCPPage() {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [rowAction, setRowAction] = useState<{ name: string; type: 'refresh' | 'remove' } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try { setServers(await listServers()); }
    catch (e) { setError(e instanceof Error ? e.message : '加载失败'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefreshAll = async () => {
    setRefreshingAll(true);
    try {
      const result = await refreshAllServers();
      setServers(result);
      setToast({ msg: '所有服务器已刷新', type: 'success' });
    } catch (e) {
      setToast({ msg: e instanceof Error ? e.message : '刷新失败', type: 'error' });
    } finally { setRefreshingAll(false); }
  };

  const handleRefresh = async (name: string) => {
    setRowAction({ name, type: 'refresh' });
    try {
      const updated = await refreshServer(name);
      setServers((prev) => prev.map((s) => s.name === name ? updated : s));
      setToast({ msg: `"${name}" 已刷新`, type: 'success' });
    } catch (e) {
      setToast({ msg: e instanceof Error ? e.message : '刷新失败', type: 'error' });
    } finally { setRowAction(null); }
  };

  const handleRemove = async (name: string) => {
    setRowAction({ name, type: 'remove' });
    try {
      await removeServer(name);
      setServers((prev) => prev.filter((s) => s.name !== name));
      setToast({ msg: `"${name}" 已移除`, type: 'success' });
    } catch (e) {
      setToast({ msg: e instanceof Error ? e.message : '移除失败', type: 'error' });
    } finally { setRowAction(null); }
  };

  return (
    <Box>
      <MainCard
        title="MCP 服务器"
        secondary={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Box component="span" className="ri-refresh-line" />}
              onClick={handleRefreshAll}
              disabled={refreshingAll || loading}
            >
              {refreshingAll ? '刷新中...' : '全部刷新'}
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Box component="span" className="ri-add-line" />}
              onClick={() => setAddOpen(true)}
            >
              添加服务器
            </Button>
          </Stack>
        }
      >
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : servers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">暂无已连接的 MCP 服务器</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>名称</TableCell>
                  <TableCell align="right">工具数量</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {servers.map((server) => {
                  const busy = rowAction?.name === server.name;
                  return (
                    <TableRow key={server.name} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box component="span" className="ri-server-line" sx={{ fontSize: '1rem', color: 'success.main' }} />
                          <Typography variant="body2" fontWeight={500}>{server.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{server.tool_count} 个工具</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="刷新连接">
                            <span>
                              <IconButton size="small" onClick={() => handleRefresh(server.name)} disabled={busy}>
                                {busy && rowAction?.type === 'refresh' ? <CircularProgress size={14} /> : (
                                  <Box component="span" className="ri-refresh-line" sx={{ fontSize: '1rem' }} />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="移除">
                            <span>
                              <IconButton size="small" color="error" onClick={() => handleRemove(server.name)} disabled={busy}>
                                {busy && rowAction?.type === 'remove' ? <CircularProgress size={14} /> : (
                                  <Box component="span" className="ri-delete-bin-line" sx={{ fontSize: '1rem' }} />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MainCard>

      <AddServerDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={fetchData} />

      <Snackbar open={toast !== null} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {toast ? <Alert severity={toast.type} onClose={() => setToast(null)} sx={{ width: '100%' }}>{toast.msg}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}
