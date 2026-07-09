import { BookOpen, Brain, Plug, Terminal } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useAuth } from '@/contexts/auth';

const HERO_FEATURES = [
  { icon: Plug, label: '插件系统 · Schema 驱动配置' },
  { icon: Brain, label: '多模型接入 · OpenAI / Anthropic / Gemini' },
  { icon: Terminal, label: 'MCP 协议 · 标准工具调用' },
  { icon: BookOpen, label: '知识库 · 向量检索' },
];

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden border-r bg-linear-to-br from-primary/10 via-muted/30 to-background p-10 lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-chart-1/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 top-1/3 size-72 rounded-full bg-chart-4/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 size-80 rounded-full bg-primary/15 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <img src="/logo.svg" className="size-9" alt="NekoBot" />
          <span className="text-base font-semibold">NekoBot</span>
        </div>

        <div className="relative flex flex-1 flex-col justify-center gap-7 py-10">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-semibold tracking-tight">NekoBot Dashboard</h2>
            <p className="text-sm text-muted-foreground">模块化聊天机器人框架 · 可视化管理面板</p>
          </div>
          <ul className="flex flex-col gap-3">
            {HERO_FEATURES.map((feature) => (
              <li
                key={feature.label}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-border">
                  <feature.icon className="size-4 text-foreground" />
                </span>
                {feature.label}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="relative flex items-center justify-center px-4 py-10">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col items-center gap-1 text-center lg:hidden">
            <img src="/logo.svg" className="mb-2 size-10" alt="NekoBot" />
            <h1 className="text-lg font-semibold">NekoBot Dashboard</h1>
            <p className="text-sm text-muted-foreground">登录以继续</p>
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>登录</CardTitle>
              <CardDescription>输入凭证以继续</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
