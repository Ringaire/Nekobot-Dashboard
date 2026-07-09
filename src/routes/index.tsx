import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppShell } from '@/components/layout/app-shell';
import { RequireAuth } from './require-auth';

export const router = createBrowserRouter([
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        Component: AppShell,
        children: [
          {
            index: true,
            lazy: () => import('@/features/dashboard').then((m) => ({ Component: m.default })),
          },
          {
            path: 'dashboard',
            lazy: () => import('@/features/dashboard').then((m) => ({ Component: m.default })),
          },
          {
            path: 'platforms',
            lazy: () => import('@/features/platforms').then((m) => ({ Component: m.default })),
          },
          {
            path: 'providers',
            lazy: () => import('@/features/providers').then((m) => ({ Component: m.default })),
          },
          {
            path: 'plugins',
            lazy: () => import('@/features/plugins').then((m) => ({ Component: m.default })),
          },
          {
            path: 'mcp',
            lazy: () => import('@/features/mcp').then((m) => ({ Component: m.default })),
          },
          {
            path: 'knowledge',
            lazy: () => import('@/features/knowledge').then((m) => ({ Component: m.default })),
          },
          {
            path: 'personas',
            lazy: () => import('@/features/personas').then((m) => ({ Component: m.default })),
          },
          {
            path: 'system',
            lazy: () => import('@/features/system').then((m) => ({ Component: m.default })),
          },
          {
            path: 'about',
            lazy: () => import('@/features/about').then((m) => ({ Component: m.default })),
          },
        ],
      },
    ],
  },
  {
    path: '/auth/login',
    lazy: () => import('@/features/auth/login').then((m) => ({ Component: m.default })),
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
