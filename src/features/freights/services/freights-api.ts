import { apiClient } from '@/shared/lib/api-client'
import type { PaginatedResponse } from '@/shared/types/api.types'
import type { CreateFreightPayload, Freight } from '@/features/freights/types/freight.types'

interface FreightResponse {
  data: Freight
  message?: string
}

export interface FreightFilters {
  status?: string
  cargo_type?: string
  driver_id?: number | string
  origin_state?: string
  destination_state?: string
  search?: string
  sort?: string
}

export const freightsApi = {
  async list(page = 1, filters: FreightFilters = {}): Promise<PaginatedResponse<Freight>> {
    const params: Record<string, unknown> = { page }
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== '') params[key] = value
    }
    const { data } = await apiClient.get<PaginatedResponse<Freight>>('/freights', { params })
    return data
  },

  async getById(id: number): Promise<Freight> {
    const { data } = await apiClient.get<FreightResponse>(`/freights/${id}`)
    return data.data
  },

  async create(payload: CreateFreightPayload): Promise<Freight> {
    const { data } = await apiClient.post<FreightResponse>('/freights', payload)
    return data.data
  },

  async update(id: number, payload: Partial<CreateFreightPayload>): Promise<Freight> {
    const { data } = await apiClient.put<FreightResponse>(`/freights/${id}`, payload)
    return data.data
  },

  async cancel(id: number): Promise<Freight> {
    const { data } = await apiClient.post<FreightResponse>(`/freights/${id}/cancel`)
    return data.data
  },

  async assign(id: number, driverId: number): Promise<Freight> {
    const { data } = await apiClient.post<FreightResponse>(`/freights/${id}/assign`, {
      driver_id: driverId,
    })
    return data.data
  },

  async approve(id: number): Promise<Freight> {
    const { data } = await apiClient.post<FreightResponse>(`/freights/${id}/approve`)
    return data.data
  },

  async reviewDoping(id: number, dopingTestId: number, approved: boolean, notes?: string): Promise<Freight> {
    const { data } = await apiClient.post<FreightResponse>(
      `/freights/${id}/doping/${dopingTestId}/review`,
      { approved, notes },
    )
    return data.data
  },

  async accept(id: number): Promise<Freight> {
    const { data } = await apiClient.post<FreightResponse>(`/freights/${id}/accept`)
    return data.data
  },

  async reject(id: number, reason: string): Promise<Freight> {
    const { data } = await apiClient.post<FreightResponse>(`/freights/${id}/reject`, { reason })
    return data.data
  },

  async start(id: number): Promise<Freight> {
    const { data } = await apiClient.post<FreightResponse>(`/freights/${id}/start`)
    return data.data
  },

  async complete(id: number, rating?: number, notes?: string): Promise<Freight> {
    const { data } = await apiClient.post<FreightResponse>(`/freights/${id}/complete`, {
      rating,
      notes,
    })
    return data.data
  },

  async listByDeadline(params: {
    deadline_from: string
    deadline_to: string
    per_page?: number
    page?: number
  }): Promise<PaginatedResponse<Freight>> {
    const { data } = await apiClient.get<PaginatedResponse<Freight>>('/freights', { params })
    return data
  },
}
