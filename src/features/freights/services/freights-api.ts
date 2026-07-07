import { apiClient } from '@/shared/lib/api-client'
import type { PaginatedResponse } from '@/shared/types/api.types'
import type { Freight } from '@/features/freights/types/freight.types'

interface FreightResponse {
  data: Freight
}

export const freightsApi = {
  async list(page = 1): Promise<PaginatedResponse<Freight>> {
    const { data } = await apiClient.get<PaginatedResponse<Freight>>('/freights', {
      params: { page },
    })
    return data
  },

  async getById(id: number): Promise<Freight> {
    const { data } = await apiClient.get<FreightResponse>(`/freights/${id}`)
    return data.data
  },
}
