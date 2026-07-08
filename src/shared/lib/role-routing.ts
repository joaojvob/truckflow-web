import type { UserRole } from '@/shared/types/api.types'
import { ROUTES } from '@/shared/constants/routes'

export function getDefaultRouteForRole(role: UserRole): string {
  if (role === 'super_admin') return ROUTES.adminTenants
  if (role === 'driver') return ROUTES.freights
  return ROUTES.dashboard
}

export function isManagerOrAdmin(role: UserRole): boolean {
  return role === 'admin' || role === 'manager' || role === 'super_admin'
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === 'super_admin'
}
