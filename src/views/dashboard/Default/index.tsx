import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import StatCard from './StatCard';
import MessageTrendChart from './MessageTrendChart';
import PlatformStatusCard from './PlatformStatusCard';

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [stats, setStats] = useState({
    messageCount: 0,
    platformCount: 0,
    running: { hours: 0, minutes: 0, seconds: 0 },
    memory: { process: 0, system: 0 },
    cpuPercent: 0
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/dashboard/stats');
      
      if (!response.ok) {
        throw new Error();
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error();
      }
      
      const data = await response.json();
      setStats(data);
      updateLastUpdated();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const updateLastUpdated = () => {
    const now = new Date();
    setLastUpdated(now.toLocaleString('zh-CN'));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData().finally(() => {
      setIsRefreshing(false);
    });
  };

  const formatRunningTime = () => {
    const { hours, minutes, seconds } = stats.running;
    if (hours === 0 && minutes === 0 && seconds === 0) {
      return '-';
    }
    return `${hours}小时 ${minutes}分 ${seconds}秒`;
  };

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="消息总数"
            value={stats.messageCount > 0 ? stats.messageCount.toLocaleString() : undefined}
            subtitle="所有平台发送的消息总计"
            icon="ri-chat-3-line"
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="消息平台"
            value={stats.platformCount > 0 ? stats.platformCount : undefined}
            subtitle="已连接的消息平台数量"
            icon="ri-server-line"
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="运行时间"
            value={formatRunningTime()}
            subtitle="系统已运行时长"
            icon="ri-time-line"
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="内存占用"
            value={stats.memory.process > 0 ? `${stats.memory.process} / ${stats.memory.system}` : undefined}
            subtitle={stats.cpuPercent > 0 ? `CPU: ${stats.cpuPercent}%` : 'CPU: -'}
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
