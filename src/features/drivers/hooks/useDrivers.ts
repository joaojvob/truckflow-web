import { useQuery } from '@tanstack/react-query'
import { driversApi, type DriverFilters } from '@/features/drivers/services/drivers-api'

export function useLinkedDrivers(filters: DriverFilters = {}) {
  return useQuery({
    queryKey: ['drivers', 'linked', filters],
    queryFn: () => driversApi.listLinked(1, filters),
  })
}

export function useTenantDrivers() {
  return useQuery({
    queryKey: ['drivers', 'tenant-users'],
    queryFn: async () => {
      const response = await driversApi.listTenantUsers(1)
      return response.data.filter((user) => user.role === 'driver')
    },
  })
}
