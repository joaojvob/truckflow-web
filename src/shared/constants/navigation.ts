import type { UserRole } from '@/shared/types/api.types'
import { ROUTES } from '@/shared/constants/routes'

export interface NavItem {
  to: string
  label: string
  roles: UserRole[]
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.adminTenants, label: 'Empresas', roles: ['super_admin'], end: true },
  { to: ROUTES.dashboard, label: 'Dashboard', roles: ['super_admin', 'admin', 'manager'], end: true },
  { to: ROUTES.freights, label: 'Fretes', roles: ['super_admin', 'admin', 'manager', 'driver'] },
  { to: ROUTES.calendar, label: 'Calendário', roles: ['super_admin', 'admin', 'manager'] },
  { to: ROUTES.drivers, label: 'Motoristas', roles: ['super_admin', 'admin', 'manager'] },
  { to: ROUTES.users, label: 'Usuários', roles: ['super_admin', 'admin', 'manager'] },
  { to: ROUTES.fleet, label: 'Frota', roles: ['super_admin', 'admin', 'manager', 'driver'] },
  { to: ROUTES.adminLogs, label: 'Logs', roles: ['super_admin', 'admin'] },
  { to: ROUTES.tenant, label: 'Empresa', roles: ['super_admin', 'admin', 'manager'] },
  { to: ROUTES.support, label: 'Suporte', roles: ['super_admin', 'admin', 'manager', 'driver'] },
  { to: ROUTES.driverProfile, label: 'Meu Perfil', roles: ['driver'] },
]

export function getNavItemsForRole(role: UserRole, hasTenantContext = false): NavItem[] {
  return NAV_ITEMS.filter((item) => {
    if (!item.roles.includes(role)) return false
    // Super admin sem empresa selecionada: só vê "Empresas"
    if (role === 'super_admin' && !hasTenantContext) {
      return item.to === ROUTES.adminTenants
    }
    // Super admin com contexto: não repete "Empresas" como home (dashboard é home)
    if (role === 'super_admin' && hasTenantContext && item.to === ROUTES.adminTenants) {
      return false
    }
    return true
  })
}
