import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
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
import { createPersona, deletePersona, listPersonas, updatePersona } from 'api/personas';

interface PersonaRow { name: string; prompt: string }

function PersonaDialog({
  open, target, onClose, onSave
}: { open: boolean; target: PersonaRow | null; onClose: () => void; onSave: (name: string, prompt: string) => Promise<void> }) {
  const isEdit = target !== null;
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setName(target?.name ?? ''); setPrompt(target?.prompt ?? ''); setError(''); }
  }, [open, target]);

  const handleSave = async () => {
    if (!name.trim()) { setError('名称不能为空'); return; }
    if (!prompt.trim()) { setError('人格提示词不能为空'); return; }
    setSaving(true); setError('');
    try { await onSave(name.trim(), prompt.trim()); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : '保存失败'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? `编辑人格：${target?.name}` : '新建人格'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="名称" value={name} onChange={(e) => setName(e.target.value)} disabled={isEdit} fullWidth size="small" />
          <TextField
            label="人格提示词（System Prompt）"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            multiline rows={8} fullWidth size="small"
            placeholder="你是一个有帮助的 AI 助手..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>取消</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={18} /> : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function PersonasPage() {
  const [rows, setRows] = useState<PersonaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PersonaRow | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await listPersonas();
      setRows(Object.entries(data).map(([name, prompt]) => ({ name, prompt })));
    } catch (e) { setError(e instanceof Error ? e.message : '加载失败'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (name: string, prompt: string) => {
    if (editTarget) await updatePersona(name, prompt);
    else await createPersona(name, prompt);
    await fetchData();
    setToast({ msg: `人格 "${name}" 已${editTarget ? '更新' : '创建'}`, type: 'success' });
  };

  const handleDelete = async (name: string) => {
    try {
      await deletePersona(name);
      await fetchData();
      setToast({ msg: `人格 "${name}" 已删除`, type: 'success' });
    } catch (e) { setToast({ msg: e instanceof Error ? e.message : '删除失败', type: 'error' }); }
  };

  return (
    <Box>
      <MainCard
        title="人格管理"
        secondary={
          <Button size="small" variant="contained" startIcon={<Box component="span" className="ri-add-line" />}
            onClick={() => { setEditTarget(null); setDialogOpen(true); }}>
            新建人格
          </Button>
        }
      >
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : rows.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">暂无人格，点击右上角创建</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>名称</TableCell>
                  <TableCell>提示词预览</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(({ name, prompt }) => (
                  <TableRow key={name} hover>
                    <TableCell><Typography variant="body2" fontWeight={500}>{name}</Typography></TableCell>
                    <TableCell sx={{ maxWidth: 400 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>{prompt}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="编辑">
                          <IconButton size="small" onClick={() => { setEditTarget({ name, prompt }); setDialogOpen(true); }}>
                            <Box component="span" className="ri-edit-line" sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="删除">
                          <IconButton size="small" color="error" onClick={() => handleDelete(name)}>
                            <Box component="span" className="ri-delete-bin-line" sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MainCard>

      <PersonaDialog open={dialogOpen} target={editTarget} onClose={() => setDialogOpen(false)} onSave={handleSave} />
      <Snackbar open={toast !== null} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {toast ? <Alert severity={toast.type} onClose={() => setToast(null)} sx={{ width: '100%' }}>{toast.msg}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}
