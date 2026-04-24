import { createElement } from 'react';

import RemixIconAdapter from 'ui-component/extended/RemixIconAdapter';

const IconDashboard = (props) => createElement(RemixIconAdapter, { className: 'ri-dashboard-line', ...props });

// constant
const icons = { IconDashboard };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
  id: 'dashboard',
  title: '仪表盘',
  type: 'group',
  children: [
    {
      id: 'default',
      title: '仪表盘',
      type: 'item',
      url: '/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
