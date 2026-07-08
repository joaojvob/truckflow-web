import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { getDefaultRouteForRole } from '@/shared/lib/role-routing'

export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuthStore()

  if (isBootstrapping) {
    return <LoadingState message="Verificando sessão..." />
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />
  }

  return <Outlet />
}

export function GuestRoute() {
  const { isAuthenticated, isBootstrapping, user } = useAuthStore()

  if (isBootstrapping) {
    return <LoadingState message="Carregando..." />
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />
  }

  return <Outlet />
}
