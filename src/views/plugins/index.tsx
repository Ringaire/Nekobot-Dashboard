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
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import MainCard from 'ui-component/cards/MainCard';
import SchemaForm from 'ui-component/config/SchemaForm';
import type { ConfigValue } from 'ui-component/config/types';
import { getPluginConfig, listPlugins, reloadPlugin, setPluginEnabled, updatePluginConfig, type PluginInfo } from 'api/plugins';
import { getPluginSchema } from 'api/schema';

// ── Plugin config dialog ──────────────────────────────────────────────────────

function PluginConfigDialog({
  plugin,
  onClose,
  onSaved,
}: {
  plugin: PluginInfo;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [schema, setSchema] = useState<{ fields: Record<string, import('ui-component/config/types').FieldMeta> } | null>(null);
  const [cfg, setCfg] = useState<ConfigValue>({});
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([getPluginSchema(plugin.name), getPluginConfig(plugin.name)])
      .then(([s, c]) => {
        if (!alive) return;
        setSchema(s as { fields: Record<string, import('ui-component/config/types').FieldMeta> });
        setCfg(c as ConfigValue);
      })
      .catch((e) => {
        if (alive) setLoadError(e instanceof Error ? e.message : '加载配置失败');
      });
    return () => { alive = false; };
  }, [plugin.name]);

  const handleSave = async () => {
    setSaving(true); setSaveError('');
    try {
      await updatePluginConfig(plugin.name, cfg);
      onSaved(`插件 "${plugin.name}" 配置已保存`);
      onClose();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const hasFields = schema && Object.keys(schema.fields).length > 0;

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        配置插件：{plugin.display_name || plugin.name}
      </DialogTitle>
      <DialogContent>
        {loadError && <Alert severity="error" sx={{ mt: 1 }}>{loadError}</Alert>}
        {saveError && <Alert severity="error" sx={{ mt: 1 }}>{saveError}</Alert>}
        {!schema && !loadError && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {schema && !hasFields && (
          <Typography color="text.secondary" sx={{ mt: 1 }}>该插件没有可配置的选项。</Typography>
        )}
        {schema && hasFields && (
          <Box sx={{ mt: 1 }}>
            <SchemaForm fields={schema.fields} value={cfg} onChange={setCfg} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>取消</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving || !hasFields}>
          {saving ? <CircularProgress size={18} /> : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [reloading, setReloading] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [configPlugin, setConfigPlugin] = useState<PluginInfo | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      setPlugins(await listPlugins());
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggle = async (plugin: PluginInfo) => {
    setToggling(plugin.name);
    try {
      await setPluginEnabled(plugin.name, !plugin.enabled);
      await fetchData();
      setToast({ msg: `插件 "${plugin.name}" 已${!plugin.enabled ? '启用' : '禁用'}`, type: 'success' });
    } catch (e) {
      setToast({ msg: e instanceof Error ? e.message : '操作失败', type: 'error' });
    } finally {
      setToggling(null);
    }
  };

  const handleReload = async (name: string) => {
    setReloading(name);
    try {
      await reloadPlugin(name);
      await fetchData();
      setToast({ msg: `插件 "${name}" 已重载`, type: 'success' });
    } catch (e) {
      setToast({ msg: e instanceof Error ? e.message : '重载失败', type: 'error' });
    } finally {
      setReloading(null);
    }
  };

  return (
    <Box>
      <MainCard
        title="插件管理"
        secondary={
          <Button
            size="small"
            variant="outlined"
            startIcon={<Box component="span" className="ri-refresh-line" />}
            onClick={fetchData}
            disabled={loading}
          >
            刷新
          </Button>
        }
      >
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : plugins.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">暂无已加载的插件</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>名称</TableCell>
                  <TableCell>版本</TableCell>
                  <TableCell>描述</TableCell>
                  <TableCell>作者</TableCell>
                  <TableCell>标签</TableCell>
                  <TableCell align="center">启用</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plugins.map((plugin) => (
                  <TableRow key={plugin.name} hover>
                    <TableCell>
                      <Stack>
                        <Typography variant="body2" fontWeight={500}>
                          {plugin.display_name || plugin.name}
                        </Typography>
                        {plugin.display_name && (
                          <Typography variant="caption" color="text.secondary">{plugin.name}</Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{plugin.version || '-'}</Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {plugin.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{plugin.author || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {plugin.tags?.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                        )) ?? '-'}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        size="small"
                        checked={plugin.enabled}
                        onChange={() => handleToggle(plugin)}
                        disabled={toggling === plugin.name}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="配置">
                          <IconButton size="small" onClick={() => setConfigPlugin(plugin)}>
                            <Box component="span" className="ri-settings-3-line" sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="热重载">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleReload(plugin.name)}
                              disabled={reloading === plugin.name}
                            >
                              {reloading === plugin.name ? (
                                <CircularProgress size={14} />
                              ) : (
                                <Box component="span" className="ri-refresh-line" sx={{ fontSize: '1rem' }} />
                              )}
                            </IconButton>
                          </span>
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

      {configPlugin && (
        <PluginConfigDialog
          plugin={configPlugin}
          onClose={() => setConfigPlugin(null)}
          onSaved={(msg) => { setToast({ msg, type: 'success' }); }}
        />
      )}

      <Snackbar
        open={toast !== null}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? (
          <Alert severity={toast.type} onClose={() => setToast(null)} sx={{ width: '100%' }}>
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
