import { createElement } from 'react';
import RemixIconAdapter from 'ui-component/extended/RemixIconAdapter';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Icon = (cls: string) => (props: any) => createElement(RemixIconAdapter, { className: cls, ...props });

const system = {
  id: 'system',
  title: '系统',
  type: 'group',
  children: [
    {
      id: 'system-info',
      title: '系统信息',
      type: 'item',
      url: '/system',
      icon: Icon('ri-dashboard-2-line'),
      breadcrumbs: false
    },
    {
      id: 'about',
      title: '关于',
      type: 'item',
      url: '/about',
      icon: Icon('ri-information-line'),
      breadcrumbs: false
    }
  ]
};

export default system;
