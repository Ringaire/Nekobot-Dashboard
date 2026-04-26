import { useCallback, useEffect, useRef, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
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
import {
  createKB, deleteDocument, deleteKB, getStatus, listDocuments, listKBs, uploadDocument,
  type KnowledgeBase, type KnowledgeDocument
} from 'api/knowledge';

function CreateKBDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: () => void }) {
  const [form, setForm] = useState({ id: '', name: '', description: '', embedding_model: 'text-embedding-3-small' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (open) { setForm({ id: '', name: '', description: '', embedding_model: 'text-embedding-3-small' }); setError(''); } }, [open]);
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const handleSave = async () => {
    if (!form.id.trim() || !form.name.trim()) { setError('ID 和名称不能为空'); return; }
    setSaving(true); setError('');
    try { await createKB(form.id.trim(), form.name.trim(), form.description, form.embedding_model); onCreate(); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : '创建失败'); }
    finally { setSaving(false); }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>新建知识库</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="ID（唯一标识）" value={form.id} onChange={(e) => set('id', e.target.value)} fullWidth size="small" />
          <TextField label="名称" value={form.name} onChange={(e) => set('name', e.target.value)} fullWidth size="small" />
          <TextField label="描述（可选）" value={form.description} onChange={(e) => set('description', e.target.value)} fullWidth size="small" />
          <TextField label="嵌入模型" value={form.embedding_model} onChange={(e) => set('embedding_model', e.target.value)} fullWidth size="small" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>取消</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={18} /> : '创建'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DocumentsDialog({ kb, open, onClose }: { kb: KnowledgeBase | null; open: boolean; onClose: () => void }) {
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    if (!kb) return;
    setLoading(true);
    try { setDocs(await listDocuments(kb.id)); } catch (e) { setError(e instanceof Error ? e.message : '加载失败'); }
    finally { setLoading(false); }
  }, [kb]);

  useEffect(() => { if (open && kb) fetchDocs(); }, [open, kb, fetchDocs]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !kb) return;
    setUploading(true);
    try { await uploadDocument(kb.id, file); await fetchDocs(); setToast({ msg: `"${file.name}" 上传成功`, type: 'success' }); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : '上传失败', type: 'error' }); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const handleDelete = async (docId: string, filename: string) => {
    if (!kb) return;
    try { await deleteDocument(kb.id, docId); await fetchDocs(); setToast({ msg: `"${filename}" 已删除`, type: 'success' }); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : '删除失败', type: 'error' }); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <span>{kb?.name} — 文档管理</span>
          <Stack direction="row" spacing={1}>
            <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleUpload} />
            <Button size="small" variant="contained" startIcon={uploading ? <CircularProgress size={14} /> : <Box component="span" className="ri-upload-line" />}
              disabled={uploading} onClick={() => fileRef.current?.click()}>
              上传文档
            </Button>
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box> : docs.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 3 }}>暂无文档，点击右上角上传</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow><TableCell>文件名</TableCell><TableCell align="right">分块数</TableCell><TableCell align="right">操作</TableCell></TableRow></TableHead>
              <TableBody>
                {docs.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell><Typography variant="body2">{doc.filename}</Typography></TableCell>
                    <TableCell align="right"><Typography variant="body2">{doc.chunk_count}</Typography></TableCell>
                    <TableCell align="right">
                      <Tooltip title="删除">
                        <IconButton size="small" color="error" onClick={() => handleDelete(doc.id, doc.filename)}>
                          <Box component="span" className="ri-delete-bin-line" sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions><Button onClick={onClose}>关闭</Button></DialogActions>
      <Snackbar open={toast !== null} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {toast ? <Alert severity={toast.type} onClose={() => setToast(null)} sx={{ width: '100%' }}>{toast.msg}</Alert> : undefined}
      </Snackbar>
    </Dialog>
  );
}

export default function KnowledgePage() {
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [docsKB, setDocsKB] = useState<KnowledgeBase | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const status = await getStatus();
      setAvailable(status.available);
      if (status.available) setKbs(await listKBs());
    } catch { setAvailable(false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (kb: KnowledgeBase) => {
    try { await deleteKB(kb.id); await fetchData(); setToast({ msg: `知识库 "${kb.name}" 已删除`, type: 'success' }); }
    catch (e) { setToast({ msg: e instanceof Error ? e.message : '删除失败', type: 'error' }); }
  };

  if (!available) return (
    <Alert severity="warning">知识库后端未加载。请安装并配置知识库插件后重试。</Alert>
  );

  return (
    <Box>
      <MainCard
        title="知识库管理"
        secondary={
          <Button size="small" variant="contained" startIcon={<Box component="span" className="ri-add-line" />} onClick={() => setCreateOpen(true)}>
            新建知识库
          </Button>
        }
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : kbs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}><Typography color="text.secondary">暂无知识库</Typography></Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>名称</TableCell>
                  <TableCell>描述</TableCell>
                  <TableCell>嵌入模型</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {kbs.map((kb) => (
                  <TableRow key={kb.id} hover>
                    <TableCell><Chip label={kb.id} size="small" variant="outlined" /></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={500}>{kb.name}</Typography></TableCell>
                    <TableCell sx={{ maxWidth: 200 }}><Typography variant="body2" color="text.secondary" noWrap>{kb.description || '-'}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{kb.embedding_model}</Typography></TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="管理文档">
                          <IconButton size="small" onClick={() => setDocsKB(kb)}>
                            <Box component="span" className="ri-file-list-3-line" sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="删除知识库">
                          <IconButton size="small" color="error" onClick={() => handleDelete(kb)}>
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

      <CreateKBDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={fetchData} />
      <DocumentsDialog kb={docsKB} open={docsKB !== null} onClose={() => setDocsKB(null)} />
      <Snackbar open={toast !== null} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {toast ? <Alert severity={toast.type} onClose={() => setToast(null)} sx={{ width: '100%' }}>{toast.msg}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}
