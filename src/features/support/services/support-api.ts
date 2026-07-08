import { apiClient } from '@/shared/lib/api-client'

export interface SupportTicket {
  id: number
  subject: string
  category: string
  priority: string
  status: string
  tenant_id: number | null
  last_reply_at: string | null
  closed_at: string | null
  created_at: string
  messages_count?: number
  messages?: Array<{
    id: number
    body: string
    is_staff: boolean
    created_at: string
    user: { id: number; name: string }
  }>
}

export const supportApi = {
  async list(): Promise<SupportTicket[]> {
    const { data } = await apiClient.get<{ data: SupportTicket[] }>('/support/tickets')
    return data.data
  },

  async get(id: number): Promise<SupportTicket> {
    const { data } = await apiClient.get<{ data: SupportTicket }>(`/support/tickets/${id}`)
    return data.data
  },

  async create(payload: {
    subject: string
    category?: string
    priority?: string
    message: string
  }): Promise<SupportTicket> {
    const { data } = await apiClient.post<{ data: SupportTicket }>('/support/tickets', payload)
    return data.data
  },

  async reply(id: number, message: string): Promise<SupportTicket> {
    const { data } = await apiClient.post<{ data: SupportTicket }>(`/support/tickets/${id}/reply`, { message })
    return data.data
  },

  async close(id: number): Promise<SupportTicket> {
    const { data } = await apiClient.post<{ data: SupportTicket }>(`/support/tickets/${id}/close`)
    return data.data
  },
}
