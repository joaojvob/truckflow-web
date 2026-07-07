import { apiClient } from '@/shared/lib/api-client'
import type { DashboardData } from '@/features/dashboard/types/dashboard.types'

interface DashboardResponse {
  data: DashboardData
}

export const dashboardApi = {
  async getDashboard(): Promise<DashboardData> {
    const { data } = await apiClient.get<DashboardResponse>('/reports/dashboard')
    return data.data
  },
}
