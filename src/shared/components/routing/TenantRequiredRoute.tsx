import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { ROUTES } from '@/shared/constants/routes'
import { getTenantContext } from '@/shared/lib/tenant-context'

/**
 * Garante que o usuário tem um tenant ativo antes de acessar o app.
 *
 * - Usuário comum sem tenant → criar empresa
 * - Super admin sem contexto → lista de empresas
 */
export function TenantRequiredRoute() {
  const user = useAuthStore((state) => state.user)

  if (user?.role === 'super_admin') {
    if (!getTenantContext()) {
      return <Navigate to={ROUTES.adminTenants} replace />
    }
    return <Outlet />
  }

  if (user && !user.tenant) {
    return <Navigate to={ROUTES.createTenant} replace />
  }

  return <Outlet />
}
