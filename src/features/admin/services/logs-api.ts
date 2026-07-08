import { apiClient } from '@/shared/lib/api-client'
import type { PaginatedResponse } from '@/shared/types/api.types'

export interface SystemLog {
  id: number
  level: string
  channel: string | null
  message: string
  exception_class: string | null
  exception_message: string | null
  method: string | null
  url: string | null
  ip: string | null
  resolved_at: string | null
  user?: { id: number; name: string; email: string } | null
  created_at: string
}

export interface ActivityLog {
  id: number
  action: string
  description: string
  auditable_type: string | null
  auditable_id: number | null
  user?: { id: number; name: string; email: string } | null
  created_at: string
}

export interface LogFilters {
  from?: string
  to?: string
  level?: string
  search?: string
  action?: string
  per_page?: number
}

export const logsApi = {
  async systemLogs(filters: LogFilters = {}): Promise<PaginatedResponse<SystemLog>> {
    const { data } = await apiClient.get<PaginatedResponse<SystemLog>>('/admin/system-logs', {
      params: filters,
    })
    return data
  },

  async activityLogs(filters: LogFilters = {}): Promise<PaginatedResponse<ActivityLog>> {
    const { data } = await apiClient.get<PaginatedResponse<ActivityLog>>('/admin/activity-logs', {
      params: filters,
    })
    return data
  },

  async resolveSystemLog(id: number): Promise<void> {
    await apiClient.post(`/admin/system-logs/${id}/resolve`)
  },
}
