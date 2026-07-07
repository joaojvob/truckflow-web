import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { LoadingState } from '@/shared/components/feedback/LoadingState'

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
  const { isAuthenticated, isBootstrapping } = useAuthStore()

  if (isBootstrapping) {
    return <LoadingState message="Carregando..." />
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  return <Outlet />
}
