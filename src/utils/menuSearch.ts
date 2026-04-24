import menuItems from 'menu-items';
import type { MenuItem } from 'menu-items/types';

export interface SearchableItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  action?: string;
  icon?: MenuItem['icon'];
  path: string[];
}

function flattenMenu(items: MenuItem[], parents: string[] = []): SearchableItem[] {
  const result: SearchableItem[] = [];

  for (const item of items) {
    if ((item.type === 'group' || item.type === 'collapse') && item.children) {
      const nextParents = item.type === 'group' ? [] : [...parents, item.title];
      result.push(...flattenMenu(item.children, nextParents));
    }
    if (item.type === 'item' && item.url) {
      result.push({
        id: item.id,
        title: item.title,
        url: item.url,
        icon: item.icon,
        path: parents.length > 0 ? [...parents] : [item.title]
      });
    }
  }

  return result;
}

const staticActions: SearchableItem[] = [
  {
    id: 'action-change-password',
    title: '修改密码',
    description: '修改当前账户密码',
    action: 'change-password',
    path: ['设置']
  },
  {
    id: 'action-logout',
    title: '退出登录',
    description: '退出当前账户',
    action: 'logout',
    path: ['账户']
  },
  {
    id: 'action-toggle-dark-mode',
    title: '切换深色模式',
    description: '在浅色和深色主题之间切换',
    action: 'toggle-dark-mode',
    path: ['外观']
  },
  {
    id: 'action-theme-customize',
    title: '主题定制',
    description: '自定义字体、圆角等主题设置',
    action: 'theme-customize',
    path: ['外观']
  },
  {
    id: 'action-font-family',
    title: '字体设置',
    description: '切换界面字体',
    action: 'theme-customize',
    path: ['外观', '主题定制']
  },
  {
    id: 'action-border-radius',
    title: '圆角设置',
    description: '调整组件圆角大小',
    action: 'theme-customize',
    path: ['外观', '主题定制']
  },
  {
    id: 'link-github',
    title: 'GitHub',
    description: '查看源代码仓库',
    url: 'https://github.com/OfficialNekoTeam/NekoBot',
    path: ['链接']
  },
  {
    id: 'link-docs',
    title: '文档',
    description: '查看使用文档',
    url: 'https://docs.nekobot.dev',
    path: ['链接']
  },
  {
    id: 'link-issues',
    title: '问题反馈',
    description: '提交 Bug 或功能建议',
    url: 'https://github.com/OfficialNekoTeam/NekoBot/issues',
    path: ['链接']
  }
];

const searchIndex: SearchableItem[] = [...flattenMenu(menuItems.items), ...staticActions];

export function searchMenu(query: string): SearchableItem[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return searchIndex.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      item.path.some((p) => p.toLowerCase().includes(q))
  );
}


