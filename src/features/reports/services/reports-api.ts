import { apiClient } from '@/shared/lib/api-client'

export interface AnalyticsReport {
  period: { from: string; to: string }
  summary: {
    freight_count: number
    revenue: number
    costs: number
    net: number
    distance_km: number
    avg_value: number
  }
  by_status: Record<string, number>
  revenue_by_month: Array<{ month: string; freights: number; revenue: number }>
  by_cargo_type: Array<{ cargo_type: string; label: string; total: number; revenue: number }>
  by_driver: Array<{
    driver_id: number
    driver_name: string | null
    freights: number
    revenue: number
    distance_km: number
    avg_rating: number
  }>
}

export const reportsApi = {
  async analytics(params?: { from?: string; to?: string }): Promise<AnalyticsReport> {
    const { data } = await apiClient.get<{ data: AnalyticsReport }>('/reports/analytics', { params })
    return data.data
  },
}
