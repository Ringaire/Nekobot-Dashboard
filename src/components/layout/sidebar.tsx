import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  Brain,
  Cable,
  Info,
  LayoutDashboard,
  Plug,
  Server,
  Smile,
  Terminal,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

export interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: '仪表盘',
    items: [{ title: '仪表盘', to: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: '功能配置',
    items: [
      { title: '平台适配器', to: '/platforms', icon: Cable },
      { title: 'LLM 提供商', to: '/providers', icon: Brain },
      { title: '插件管理', to: '/plugins', icon: Plug },
      { title: 'MCP 服务器', to: '/mcp', icon: Terminal },
      { title: '知识库', to: '/knowledge', icon: BookOpen },
      { title: '人格管理', to: '/personas', icon: Smile },
    ],
  },
  {
    label: '系统',
    items: [
      { title: '系统信息', to: '/system', icon: Server },
      { title: '关于', to: '/about', icon: Info },
    ],
  },
];

export function Sidebar() {
  return (
    <nav className="flex flex-col gap-5 p-3">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="space-y-1">
          <p className="px-3 pb-1 text-xs font-medium tracking-wide text-muted-foreground">
            {group.label}
          </p>
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                )
              }
            >
              <item.icon className="size-4 shrink-0" />
              <span className="truncate">{item.title}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
