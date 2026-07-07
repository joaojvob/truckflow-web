import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { ROUTES } from '@/shared/constants/routes'

export function TenantRequiredRoute() {
  const user = useAuthStore((state) => state.user)

  if (user && !user.tenant) {
    return <Navigate to={ROUTES.createTenant} replace />
  }

  return <Outlet />
}
