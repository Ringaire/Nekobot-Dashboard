import { lazy } from 'react';

import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));
const AboutPage = Loadable(lazy(() => import('views/about')));
const ProvidersPage = Loadable(lazy(() => import('views/providers')));
const PluginsPage = Loadable(lazy(() => import('views/plugins')));
const MCPPage = Loadable(lazy(() => import('views/mcp')));
const SystemPage = Loadable(lazy(() => import('views/system')));
const KnowledgePage = Loadable(lazy(() => import('views/knowledge')));
const PersonasPage = Loadable(lazy(() => import('views/personas')));

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    { path: '/', element: <DashboardDefault /> },
    { path: 'dashboard', element: <DashboardDefault /> },
    { path: 'providers', element: <ProvidersPage /> },
    { path: 'plugins', element: <PluginsPage /> },
    { path: 'mcp', element: <MCPPage /> },
    { path: 'system', element: <SystemPage /> },
    { path: 'knowledge', element: <KnowledgePage /> },
    { path: 'personas', element: <PersonasPage /> },
    { path: 'about', element: <AboutPage /> }
  ]
};

export default MainRoutes;
