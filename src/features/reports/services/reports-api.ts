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

export interface FinancialReport {
  period: { from: string; to: string }
  summary: {
    freight_count: number
    revenue: number
    distance_km: number
    avg_value: number
  }
  by_driver: Array<{
    driver_id: number
    driver_name: string | null
    freights: number
    revenue: number
  }>
}

async function downloadBlob(
  url: string,
  filename: string,
  params?: Record<string, string | undefined>,
): Promise<void> {
  const { data } = await apiClient.get<Blob>(url, { responseType: 'blob', params })
  const objectUrl = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  link.click()
  URL.revokeObjectURL(objectUrl)
}

export const reportsApi = {
  async analytics(params?: { from?: string; to?: string }): Promise<AnalyticsReport> {
    const { data } = await apiClient.get<{ data: AnalyticsReport }>('/reports/analytics', { params })
    return data.data
  },

  async financial(params?: { from?: string; to?: string }): Promise<FinancialReport> {
    const { data } = await apiClient.get<{ data: FinancialReport }>('/reports/financial', { params })
    return data.data
  },

  async exportFinancial(format: 'pdf' | 'xlsx', params?: { from?: string; to?: string }): Promise<void> {
    const extension = format === 'pdf' ? 'pdf' : 'xlsx'
    const timestamp = new Date().toISOString().slice(0, 10)
    await downloadBlob('/reports/financial/export', `relatorio-financeiro-${timestamp}.${extension}`, {
      format,
      from: params?.from,
      to: params?.to,
    })
  },
}
