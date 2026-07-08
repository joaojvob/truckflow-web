import { apiClient } from '@/shared/lib/api-client'

export interface NotificationPayload {
  type: string
  message: string
  freight_id?: number
  cargo_name?: string
  driver_name?: string
  status?: string
  action?: string
  [key: string]: unknown
}

export interface AppNotification {
  id: string
  type: string
  data: NotificationPayload
  read_at: string | null
  created_at: string
}

interface PaginatedNotifications {
  data: AppNotification[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface UnreadResponse {
  data: PaginatedNotifications
  count: number
}

interface ListResponse {
  data: PaginatedNotifications
}

export const notificationsApi = {
  async listUnread(): Promise<{ notifications: AppNotification[]; count: number }> {
    const { data } = await apiClient.get<UnreadResponse>('/notifications/unread')
    return {
      notifications: data.data.data,
      count: data.count,
    }
  },

  async list(page = 1): Promise<AppNotification[]> {
    const { data } = await apiClient.get<ListResponse>('/notifications', { params: { page } })
    return data.data.data
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.post(`/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all')
  },
}
