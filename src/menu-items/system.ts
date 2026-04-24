import { createElement } from 'react';

import RemixIconAdapter from 'ui-component/extended/RemixIconAdapter';

const IconInfo = (props) => createElement(RemixIconAdapter, { className: 'ri-information-line', ...props });

const icons = {
  IconInfo
};

const system = {
  id: 'system',
  title: '系统',
  type: 'group',
  children: [
    {
      id: 'about',
      title: '关于',
      type: 'item',
      url: '/about',
      icon: icons.IconInfo,
      breadcrumbs: false
    }
  ]
};

export default system;
