import { useQuery } from '@tanstack/react-query'
import { superAdminApi } from '@/features/admin/services/super-admin-api'

export function useAdminTenants() {
  return useQuery({
    queryKey: ['admin', 'tenants'],
    queryFn: () => superAdminApi.listTenants(),
  })
}
