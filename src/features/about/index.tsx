import { useEffect, useState } from 'react';
import {
  BookOpen,
  Brain,
  Plug,
  Server,
  Smile,
  Terminal,
} from 'lucide-react';

import { MainCard } from '@/components/common/main-card';
import apiClient from '@/api/client';

const FEATURES = [
  { icon: Brain, title: '多模型接入', desc: 'OpenAI / Anthropic / Gemini' },
  { icon: Plug, title: '插件系统', desc: 'Schema 驱动配置' },
  { icon: Terminal, title: 'MCP 协议', desc: '标准工具调用' },
  { icon: BookOpen, title: '知识库', desc: '向量检索' },
  { icon: Smile, title: '人格管理', desc: 'System Prompt' },
  { icon: Server, title: '系统监控', desc: '运行状态与日志' },
];

export default function AboutPage() {
  const [backendVersion, setBackendVersion] = useState<string | null>(null);
  const frontendVersion = import.meta.env.VITE_APP_VERSION as string | undefined;

  useEffect(() => {
    apiClient
      .get('/api/v1/ping')
      .then((res) => {
        const data = res.data as Record<string, unknown> | undefined;
        if (data && typeof data.version === 'string') setBackendVersion(data.version);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <MainCard>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <img src="/logo.svg" className="size-16" alt="NekoBot" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">NekoBot</h1>
            <p className="text-sm text-muted-foreground">模块化聊天机器人框架</p>
          </div>
        </div>
      </MainCard>

      <MainCard title="版本信息">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">前端</p>
            <p className="font-mono text-sm">{frontendVersion ?? '0.2.0'}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">后端</p>
            <p className="font-mono text-sm">{backendVersion ?? '-'}</p>
          </div>
        </div>
      </MainCard>

      <MainCard title="主要功能">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3 rounded-md border p-3">
              <f.icon className="mt-0.5 size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </MainCard>
    </div>
  );
}
