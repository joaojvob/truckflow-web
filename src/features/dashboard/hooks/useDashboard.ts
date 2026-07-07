import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/features/dashboard/services/dashboard-api'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboard,
  })
}
