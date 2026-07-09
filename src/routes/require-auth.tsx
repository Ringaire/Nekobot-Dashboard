import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { PageLoading } from '@/components/common/page-loading';
import { useAuth } from '@/contexts/auth';

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoading />;
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
