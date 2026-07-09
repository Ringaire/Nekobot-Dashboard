import { useCallback, useEffect, useState } from 'react';
import { Brain, HardDrive, Plug, RefreshCw, Timer } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { MainCard } from '@/components/common/main-card';
import { formatBytes, formatUptime } from '@/lib/format';
import apiClient from '@/api/client';
import { getSystemInfo, type SystemInfo } from '@/api/system';

interface TrendPoint {
  date: string;
  count: number;
}

const RANGES = [
  { label: '近 1 天', value: 86400 },
  { label: '近 7 天', value: 604800 },
  { label: '近 30 天', value: 2592000 },
];

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof Plug;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState(86400);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);

  const fetchInfo = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      setInfo(await getSystemInfo());
    } catch {
      // keep last
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const fetchTrend = useCallback(async (r: number) => {
    setTrendLoading(true);
    try {
      const res = await apiClient.get('/api/dashboard/message-trend', { params: { range: r } });
      const raw = res.data as
        | { dates?: unknown[]; counts?: unknown[] }
        | { data?: { dates?: unknown[]; counts?: unknown[] } }
        | undefined;
      const inner =
        raw && typeof raw === 'object' && 'data' in raw && raw.data
          ? (raw.data as { dates?: unknown[]; counts?: unknown[] })
          : (raw as { dates?: unknown[]; counts?: unknown[] } | undefined);
      const datesRaw = inner?.dates ?? [];
      const countsRaw = inner?.counts ?? [];
      const dates: string[] = datesRaw.map((d) => String(d));
      const counts: number[] = countsRaw.map((c) => Number(c ?? 0));
      setTrend(dates.map((date, i) => ({ date, count: counts[i] ?? 0 })));
    } catch {
      setTrend([]);
    } finally {
      setTrendLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInfo();
  }, [fetchInfo]);

  useEffect(() => {
    void fetchTrend(range);
  }, [range, fetchTrend]);

  const stats = info
    ? [
        { label: '已加载插件', value: String(info.plugins_loaded), icon: Plug },
        { label: 'LLM 提供商', value: String(info.providers_loaded), icon: Brain },
        { label: '运行时间', value: formatUptime(info.uptime_seconds), icon: Timer },
        {
          label: '内存占用',
          value: info.memory ? formatBytes(info.memory.rss_bytes) : '-',
          sub: info.cpu_percent != null ? `CPU ${info.cpu_percent.toFixed(1)}%` : undefined,
          icon: HardDrive,
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[96px]" />)
          : stats.map((s) => (
              <StatCard
                key={s.label}
                label={s.label}
                value={s.value}
                sub={s.sub}
                icon={s.icon}
              />
            ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <MainCard
          className="lg:col-span-2"
          title="消息趋势"
          actions={
            <Select value={String(range)} onValueChange={(v) => setRange(Number(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGES.map((r) => (
                  <SelectItem key={r.value} value={String(r.value)}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        >
          {trendLoading ? (
            <Skeleton className="h-[260px]" />
          ) : trend.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">暂无数据</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="var(--muted-foreground)"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    color: 'var(--popover-foreground)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </MainCard>

        <MainCard title="平台状态">
          <p className="py-8 text-center text-sm text-muted-foreground">-</p>
        </MainCard>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void fetchInfo(true);
            void fetchTrend(range);
          }}
          disabled={refreshing}
        >
          <RefreshCw className={`mr-1 size-4 ${refreshing ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>
    </div>
  );
}
