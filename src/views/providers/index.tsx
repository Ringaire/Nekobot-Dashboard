import { useCallback, useEffect, useState } from 'react';

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
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
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
import SchemaForm from 'ui-component/config/SchemaForm';
import type { ConfigValue, ConfigSchema } from 'ui-component/config/types';
import { listProviderSchemas, type ProviderSchemasMap } from 'api/schema';
import { createProvider, deleteProvider, listProviders, setProviderEnabled, updateProvider, type ProviderConfig } from 'api/providers';

// ── Type selector step ────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, string> = {
  openai_compatible: 'ri-code-box-line',
  openai: 'ri-openai-line',
  anthropic: 'ri-robot-2-line',
  gemini: 'ri-google-line',
};

function TypeSelectorStep({
  schemas,
  onSelect,
  onClose,
}: {
  schemas: ProviderSchemasMap;
  onSelect: (type: string) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>选择提供商类型</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 0.5 }}>
          {Object.entries(schemas).map(([type, schema]) => (
            <Button
              key={type}
              variant="outlined"
              fullWidth
              onClick={() => onSelect(type)}
              sx={{ justifyContent: 'flex-start', py: 1.5, px: 2, textAlign: 'left' }}
              startIcon={<Box component="span" className={TYPE_ICONS[type] ?? 'ri-cloud-line'} sx={{ fontSize: '1.2rem' }} />}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>{schema.label ?? type}</Typography>
                {schema.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {schema.description}
                  </Typography>
                )}
              </Box>
            </Button>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Provider form dialog ───────────────────────────────────────────────────────

function ProviderFormDialog({
  open,
  providerName,
  providerType,
  schema,
  initialConfig,
  isEdit,
  onClose,
  onSave,
}: {
  open: boolean;
  providerName: string;
  providerType: string;
  schema: ConfigSchema;
  initialConfig: ConfigValue;
  isEdit: boolean;
  onClose: () => void;
  onSave: (name: string, cfg: ProviderConfig) => Promise<void>;
}) {
  const [name, setName] = useState(providerName);
  const [cfg, setCfg] = useState<ConfigValue>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(providerName);
      // Merge initial config with schema defaults so all fields are present
      const defaults: ConfigValue = {};
      for (const [k, meta] of Object.entries(schema.fields)) {
        defaults[k] = meta.default ?? '';
      }
      setCfg({ ...defaults, ...initialConfig });
      setError('');
    }
  }, [open, providerName, initialConfig, schema]);

  const handleSave = async () => {
    if (!name.trim()) { setError('名称不能为空'); return; }
    setSaving(true); setError('');
    try {
      await onSave(name.trim(), cfg as ProviderConfig);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? `编辑提供商：${providerName}` : `添加 ${schema.label ?? providerType} 提供商`}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="提供商名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isEdit}
            fullWidth
            size="small"
            helperText="唯一标识符，创建后不可修改"
          />
          <Divider />
          <SchemaForm fields={schema.fields} value={cfg} onChange={setCfg} />
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

// ── Delete confirm ─────────────────────────────────────────────────────────────

function DeleteConfirmDialog({ open, name, onClose, onConfirm }: {
  open: boolean; name: string; onClose: () => void; onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handle = async () => {
    setLoading(true); setError('');
    try { await onConfirm(); onClose(); } catch (e) { setError(e instanceof Error ? e.message : '删除失败'); }
    finally { setLoading(false); }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>确认删除</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
        <Typography>确定要删除提供商 <strong>{name}</strong> 吗？此操作不可撤销。</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>取消</Button>
        <Button onClick={handle} color="error" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={18} /> : '删除'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

interface ProviderRow { name: string; config: ProviderConfig; }

function detectType(name: string, config: ProviderConfig): string {
  if (typeof config.provider_type === 'string') return config.provider_type;
  if (name in { openai_compatible: 1, openai: 1, anthropic: 1, gemini: 1 }) return name;
  if (config.base_url) return 'openai_compatible';
  if (typeof config.api_key === 'string' && String(config.api_key).startsWith('sk-ant')) return 'anthropic';
  return 'openai_compatible';
}

export default function ProvidersPage() {
  const [rows, setRows] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [schemas, setSchemas] = useState<ProviderSchemasMap>({});
  const [schemasLoading, setSchemasLoading] = useState(true);

  // Dialog state — step 1: type selector, step 2: form
  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);
  const [formState, setFormState] = useState<{
    open: boolean;
    isEdit: boolean;
    providerName: string;
    providerType: string;
    initialConfig: ConfigValue;
  }>({ open: false, isEdit: false, providerName: '', providerType: '', initialConfig: {} });

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await listProviders();
      setRows(Object.entries(data).map(([name, config]) => ({ name, config })));
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    listProviderSchemas()
      .then(setSchemas)
      .catch(() => {})
      .finally(() => setSchemasLoading(false));
  }, []);

  const openAdd = () => setTypeSelectorOpen(true);

  const onTypeSelected = (type: string) => {
    setTypeSelectorOpen(false);
    setFormState({ open: true, isEdit: false, providerName: type, providerType: type, initialConfig: {} });
  };

  const openEdit = (row: ProviderRow) => {
    const type = detectType(row.name, row.config);
    setFormState({ open: true, isEdit: true, providerName: row.name, providerType: type, initialConfig: row.config as ConfigValue });
  };

  const handleSave = async (name: string, cfg: ProviderConfig) => {
    if (formState.isEdit) {
      await updateProvider(name, cfg);
    } else {
      await createProvider(name, cfg);
    }
    await fetchData();
  };

  const handleToggle = async (name: string, config: ProviderConfig) => {
    await setProviderEnabled(name, config.enabled === false);
    await fetchData();
  };

  const handleDelete = async (name: string) => {
    await deleteProvider(name);
    await fetchData();
  };

  const activeSchema = formState.providerType ? schemas[formState.providerType] : null;

  return (
    <Box>
      <MainCard
        title="LLM 提供商"
        secondary={
          <Button
            variant="contained"
            size="small"
            startIcon={<Box component="span" className="ri-add-line" />}
            onClick={openAdd}
            disabled={schemasLoading}
          >
            添加提供商
          </Button>
        }
      >
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">暂无提供商，点击右上角添加</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>名称</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>默认模型</TableCell>
                  <TableCell align="center">启用</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(({ name, config }) => (
                  <TableRow key={name} hover>
                    <TableCell><Typography variant="body2" fontWeight={500}>{name}</Typography></TableCell>
                    <TableCell>
                      <Chip label={detectType(name, config)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {typeof config.default_model === 'string' ? config.default_model : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        size="small"
                        checked={config.enabled !== false}
                        onChange={() => handleToggle(name, config)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="编辑">
                          <IconButton size="small" onClick={() => openEdit({ name, config })}>
                            <Box component="span" className="ri-edit-line" sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="删除">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(name)}>
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

      {typeSelectorOpen && (
        <TypeSelectorStep
          schemas={schemas}
          onSelect={onTypeSelected}
          onClose={() => setTypeSelectorOpen(false)}
        />
      )}

      {formState.open && activeSchema && (
        <ProviderFormDialog
          open={formState.open}
          providerName={formState.providerName}
          providerType={formState.providerType}
          schema={activeSchema}
          initialConfig={formState.initialConfig}
          isEdit={formState.isEdit}
          onClose={() => setFormState((s) => ({ ...s, open: false }))}
          onSave={handleSave}
        />
      )}

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        name={deleteTarget ?? ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget!)}
      />
    </Box>
  );
}
