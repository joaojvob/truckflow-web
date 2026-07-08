import { apiClient } from '@/shared/lib/api-client'
import type { Waypoint } from '@/features/waypoints/services/waypoints-api'

export interface FreightRoute {
  freight_id: number
  polyline?: string | null
  distance_meters?: number | null
  distance_km?: number | null
  duration_seconds?: number | null
  estimated_hours?: number | null
  calculated_at?: string | null
  origin?: { lat: number; lng: number } | null
  destination?: { lat: number; lng: number } | null
  waypoints?: Waypoint[]
}

interface RouteResponse {
  data: FreightRoute
  message?: string
}

export const routeApi = {
  async get(freightId: number): Promise<FreightRoute | null> {
    try {
      const { data } = await apiClient.get<RouteResponse>(`/freights/${freightId}/route`)
      return data.data
    } catch {
      return null
    }
  },

  async calculate(freightId: number): Promise<FreightRoute> {
    const { data } = await apiClient.post<RouteResponse>(`/freights/${freightId}/route`)
    return data.data
  },
}
