import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { MainCard } from '@/components/common/main-card';
import { PageLoading } from '@/components/common/page-loading';
import { formatBytes, formatUptime } from '@/lib/format';
import {
  getSystemInfo,
  listLogs,
  reloadConfig,
  tailLog,
  type LogFile,
  type SystemInfo,
} from '@/api/system';

function colorize(line: string): string {
  if (/\[ERROR\]|\[CRITICAL\]/i.test(line)) return 'text-red-400';
  if (/\[WARNING\]/i.test(line)) return 'text-yellow-400';
  return 'text-zinc-100';
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm font-medium">{value}</p>
    </div>
  );
}

export default function SystemPage() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [selectedLog, setSelectedLog] = useState('');
  const [logLines, setLogLines] = useState<string[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logTick, setLogTick] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  const fetchInfo = useCallback(async () => {
    setInfoLoading(true);
    try {
      setInfo(await getSystemInfo());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setInfoLoading(false);
    }
  }, []);

  const fetchLogFiles = useCallback(async () => {
    try {
      const files = await listLogs();
      setLogFiles(files);
      if (files.length && !selectedLog) setSelectedLog(files[0].name);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '加载日志列表失败');
    }
  }, [selectedLog]);

  useEffect(() => {
    void fetchInfo();
    void fetchLogFiles();
  }, [fetchInfo, fetchLogFiles]);

  useEffect(() => {
    if (!selectedLog) return;
    let alive = true;
    setLogLoading(true);
    tailLog(selectedLog, 300)
      .then((lines) => {
        if (alive) setLogLines(lines);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : '加载日志失败'))
      .finally(() => {
        if (alive) setLogLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [selectedLog, logTick]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logLines]);

  const onReload = async () => {
    setReloading(true);
    try {
      await reloadConfig();
      await fetchInfo();
      toast.success('配置已重载');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '重载失败');
    } finally {
      setReloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <MainCard
        title="系统信息"
        actions={
          <Button size="sm" variant="outline" onClick={onReload} disabled={reloading}>
            <RefreshCw className={`mr-1 size-4 ${reloading ? 'animate-spin' : ''}`} />
            重载配置
          </Button>
        }
      >
        {infoLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px]" />
            ))}
          </div>
        ) : (
          info && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="运行时间" value={formatUptime(info.uptime_seconds)} />
              <StatTile
                label="进程内存"
                value={info.memory ? formatBytes(info.memory.rss_bytes) : '-'}
              />
              <StatTile
                label="系统内存"
                value={info.system_memory ? `${info.system_memory.percent.toFixed(1)}%` : '-'}
              />
              <StatTile
                label="插件 / 提供商"
                value={`${info.plugins_loaded} / ${info.providers_loaded}`}
              />
              <StatTile label="Python" value={info.python_version} />
              <StatTile
                label="CPU"
                value={info.cpu_percent != null ? `${info.cpu_percent.toFixed(1)}%` : '-'}
              />
            </div>
          )
        )}
      </MainCard>

      <MainCard
        title="日志"
        actions={
          <div className="flex items-center gap-2">
            <Select value={selectedLog} onValueChange={setSelectedLog}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择日志文件" />
              </SelectTrigger>
              <SelectContent>
                {logFiles.map((f) => (
                  <SelectItem key={f.name} value={f.name}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setLogTick((t) => t + 1)}
              disabled={logLoading || !selectedLog}
              aria-label="刷新日志"
            >
              <RefreshCw className={`size-4 ${logLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        }
      >
        {!selectedLog ? (
          <p className="py-8 text-center text-sm text-muted-foreground">请选择日志文件</p>
        ) : logLoading && logLines.length === 0 ? (
          <PageLoading />
        ) : (
          <ScrollArea className="h-[480px] rounded-md bg-zinc-950">
            <div ref={logRef} className="p-3 font-mono text-xs leading-relaxed">
              {logLines.map((line, i) => (
                <div key={i} className={`whitespace-pre-wrap ${colorize(line)}`}>
                  {line}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </MainCard>
    </div>
  );
}
