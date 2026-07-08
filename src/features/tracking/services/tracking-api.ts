import axios from 'axios'
import type { DriverLocation, SendLocationPayload } from '@/features/tracking/types/tracking.types'
import { apiClient } from '@/shared/lib/api-client'

export const trackingApi = {
  async latest(freightId: number): Promise<DriverLocation | null> {
    try {
      const { data } = await apiClient.get<{ data: DriverLocation }>(`/freights/${freightId}/tracking`)
      return data.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  async history(freightId: number): Promise<DriverLocation[]> {
    const { data } = await apiClient.get<{ data: DriverLocation[] }>(
      `/freights/${freightId}/tracking/history`,
    )
    return data.data ?? []
  },

  async send(freightId: number, payload: SendLocationPayload): Promise<DriverLocation> {
    const { data } = await apiClient.post<{ data: DriverLocation }>(
      `/freights/${freightId}/tracking`,
      payload,
    )
    return data.data
  },
}
