import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import StatCard from './StatCard';
import MessageTrendChart from './MessageTrendChart';
import PlatformStatusCard from './PlatformStatusCard';
import { getSystemInfo, type SystemInfo } from 'api/system';

function fmt(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function fmtUptime(seconds: number | null) {
  if (seconds === null) return undefined;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}小时 ${m}分 ${s}秒`;
}

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [info, setInfo] = useState<SystemInfo | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSystemInfo();
      setInfo(data);
      setLastUpdated(new Date().toLocaleString('zh-CN'));
    } catch {
      // 静默失败，保留上次数据
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData().finally(() => setIsRefreshing(false));
  };

  const memValue = info?.memory ? `${fmt(info.memory.rss_bytes)}` : undefined;
  const memSubtitle = info?.cpu_percent != null ? `CPU: ${info.cpu_percent.toFixed(1)}%` : 'CPU: -';

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="已加载插件"
            value={info ? String(info.plugins_loaded) : undefined}
            subtitle="当前已加载的插件数量"
            icon="ri-plug-line"
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="LLM 提供商"
            value={info ? String(info.providers_loaded) : undefined}
            subtitle="已注册的 LLM 提供商数量"
            icon="ri-brain-line"
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="运行时间"
            value={info ? fmtUptime(info.uptime_seconds) : undefined}
            subtitle="系统已运行时长"
            icon="ri-time-line"
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="内存占用"
            value={memValue}
            subtitle={memSubtitle}
            icon="ri-cpu-line"
            isLoading={isLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <MessageTrendChart isLoading={isLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <PlatformStatusCard isLoading={isLoading} />
        </Grid>
      </Grid>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="flex-end"
        sx={{ mt: 2 }}
      >
        <Chip
          size="small"
          color="primary"
          variant="filled"
          label={lastUpdated ? `最后更新: ${lastUpdated}` : '未更新'}
        />
        <Button
          size="small"
          color="primary"
          variant="text"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          startIcon={<span className="ri-refresh-line" />}
        >
          {isRefreshing ? '刷新中...' : '刷新'}
        </Button>
      </Stack>
    </Box>
  );
}
