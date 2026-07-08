import { Navigate, Outlet } from 'react-router-dom'
import type { UserRole } from '@/shared/types/api.types'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { getDefaultRouteForRole } from '@/shared/lib/role-routing'

interface RoleRouteProps {
  allowedRoles: UserRole[]
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />
  }

  return <Outlet />
}
