import { useCallback, useEffect, useRef, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MainCard from 'ui-component/cards/MainCard';
import { getSystemInfo, listLogs, reloadConfig, tailLog, type LogFile, type SystemInfo } from 'api/system';

function fmt(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function fmtUptime(seconds: number | null) {
  if (seconds === null) return '-';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}小时 ${m}分 ${s}秒`;
}

interface StatTileProps { icon: string; label: string; value: string; loading?: boolean }
function StatTile({ icon, label, value, loading }: StatTileProps) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box component="span" className={icon} sx={{ fontSize: '1.8rem', color: 'primary.main' }} />
          <Box>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            {loading ? <Skeleton width={80} height={22} /> : (
              <Typography variant="body1" fontWeight={600}>{value}</Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function SystemPage() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);

  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [selectedLog, setSelectedLog] = useState('');
  const [logLines, setLogLines] = useState<string[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState('');

  const [reloading, setReloading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const fetchInfo = useCallback(async () => {
    setInfoLoading(true);
    try { setInfo(await getSystemInfo()); } catch { /* silent */ }
    finally { setInfoLoading(false); }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const files = await listLogs();
      setLogFiles(files);
      if (files.length > 0 && !selectedLog) setSelectedLog(files[files.length - 1].name);
    } catch { /* silent */ }
  }, [selectedLog]);

  useEffect(() => { fetchInfo(); fetchLogs(); }, [fetchInfo, fetchLogs]);

  useEffect(() => {
    if (!selectedLog) return;
    let cancelled = false;
    setLogLoading(true); setLogError(''); setLogLines([]);
    tailLog(selectedLog, 300)
      .then((lines) => { if (!cancelled) setLogLines(lines); })
      .catch((e) => { if (!cancelled) setLogError(e instanceof Error ? e.message : '加载失败'); })
      .finally(() => { if (!cancelled) setLogLoading(false); });
    return () => { cancelled = true; };
  }, [selectedLog]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logLines]);

  const handleReloadConfig = async () => {
    setReloading(true);
    try {
      await reloadConfig();
      setToast({ msg: '配置已重载', type: 'success' });
      await fetchInfo();
    } catch (e) {
      setToast({ msg: e instanceof Error ? e.message : '重载失败', type: 'error' });
    } finally { setReloading(false); }
  };

  return (
    <Stack spacing={2}>
      {/* System stats */}
      <MainCard
        title="系统信息"
        secondary={
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<Box component="span" className="ri-refresh-line" />} onClick={fetchInfo} disabled={infoLoading}>
              刷新
            </Button>
            <Button size="small" variant="contained" startIcon={<Box component="span" className="ri-restart-line" />} onClick={handleReloadConfig} disabled={reloading}>
              {reloading ? <CircularProgress size={16} /> : '重载配置'}
            </Button>
          </Stack>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatTile icon="ri-time-line" label="运行时间" value={fmtUptime(info?.uptime_seconds ?? null)} loading={infoLoading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatTile
              icon="ri-cpu-line"
              label="进程内存"
              value={info?.memory ? fmt(info.memory.rss_bytes) : '-'}
              loading={infoLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatTile
              icon="ri-server-line"
              label="系统内存使用"
              value={info?.system_memory ? `${info.system_memory.percent.toFixed(1)}%` : '-'}
              loading={infoLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatTile
              icon="ri-plugin-line"
              label="插件 / 提供商"
              value={info ? `${info.plugins_loaded} / ${info.providers_loaded}` : '-'}
              loading={infoLoading}
            />
          </Grid>
        </Grid>
        {info && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="caption" color="text.secondary">
              Python {info.python_version.split(' ')[0]}
              {info.cpu_percent != null && `　CPU: ${info.cpu_percent.toFixed(1)}%`}
            </Typography>
          </Box>
        )}
      </MainCard>

      {/* Log viewer */}
      <MainCard
        title="日志查看"
        secondary={
          <Stack direction="row" spacing={1} alignItems="center">
            {logFiles.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>日志文件</InputLabel>
                <Select label="日志文件" value={selectedLog} onChange={(e) => setSelectedLog(e.target.value)}>
                  {logFiles.map((f) => (
                    <MenuItem key={f.name} value={f.name}>
                      {f.name} ({fmt(f.size_bytes)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Button
              size="small"
              variant="outlined"
              startIcon={<Box component="span" className="ri-refresh-line" />}
              onClick={() => setSelectedLog((s) => { const t = s; setSelectedLog(''); setTimeout(() => setSelectedLog(t), 0); return s; })}
              disabled={!selectedLog || logLoading}
            >
              刷新
            </Button>
          </Stack>
        }
      >
        {logError && <Alert severity="error" sx={{ mb: 1 }}>{logError}</Alert>}
        {logLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box>
        ) : (
          <Box
            ref={logRef}
            sx={{
              bgcolor: 'grey.900',
              color: 'grey.100',
              fontFamily: 'monospace',
              fontSize: 12,
              lineHeight: 1.6,
              p: 1.5,
              borderRadius: 1,
              maxHeight: 480,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            {logLines.length === 0 ? (
              <Typography variant="caption" color="grey.500">
                {selectedLog ? '日志为空' : '请选择日志文件'}
              </Typography>
            ) : (
              logLines.map((line, i) => {
                const isError = /\[ERROR\]|\[CRITICAL\]/i.test(line);
                const isWarn = /\[WARNING\]/i.test(line);
                return (
                  <Box key={i} component="span" sx={{ display: 'block', color: isError ? 'error.light' : isWarn ? 'warning.light' : 'inherit' }}>
                    {line}
                  </Box>
                );
              })
            )}
          </Box>
        )}
        {logLines.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            显示最新 {logLines.length} 行
          </Typography>
        )}
      </MainCard>

      <Snackbar open={toast !== null} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {toast ? <Alert severity={toast.type} onClose={() => setToast(null)} sx={{ width: '100%' }}>{toast.msg}</Alert> : undefined}
      </Snackbar>
    </Stack>
  );
}
