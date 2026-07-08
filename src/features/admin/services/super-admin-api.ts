import { apiClient } from '@/shared/lib/api-client'

export interface AdminTenantOverview {
  id: number
  name: string
  slug: string
  users_count: number
  freights_count: number
  revenue_total: number
  has_fiscal: boolean
}

export interface AdminTenantsResponse {
  data: AdminTenantOverview[]
  summary: {
    tenants: number
    users: number
    freights: number
    revenue: number
  }
}

export const superAdminApi = {
  async listTenants(): Promise<AdminTenantsResponse> {
    const { data } = await apiClient.get<AdminTenantsResponse>('/admin/tenants')
    return data
  },
}
