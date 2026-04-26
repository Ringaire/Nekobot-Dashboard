import { createElement } from 'react';
import RemixIconAdapter from 'ui-component/extended/RemixIconAdapter';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Icon = (cls: string) => (props: any) => createElement(RemixIconAdapter, { className: cls, ...props });

const management = {
  id: 'management',
  title: '功能配置',
  type: 'group',
  children: [
    {
      id: 'providers',
      title: 'LLM 提供商',
      type: 'item',
      url: '/providers',
      icon: Icon('ri-brain-line'),
      breadcrumbs: false
    },
    {
      id: 'plugins',
      title: '插件管理',
      type: 'item',
      url: '/plugins',
      icon: Icon('ri-plug-line'),
      breadcrumbs: false
    },
    {
      id: 'mcp',
      title: 'MCP 服务器',
      type: 'item',
      url: '/mcp',
      icon: Icon('ri-terminal-box-line'),
      breadcrumbs: false
    },
    {
      id: 'knowledge',
      title: '知识库',
      type: 'item',
      url: '/knowledge',
      icon: Icon('ri-book-2-line'),
      breadcrumbs: false
    },
    {
      id: 'personas',
      title: '人格管理',
      type: 'item',
      url: '/personas',
      icon: Icon('ri-emotion-line'),
      breadcrumbs: false
    }
  ]
};

export default management;
