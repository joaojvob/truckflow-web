import { apiClient } from '@/shared/lib/api-client'

export type WaypointType =
  | 'fuel_stop'
  | 'rest_stop'
  | 'toll'
  | 'delivery_point'
  | 'weigh_station'
  | 'custom'

export interface Waypoint {
  id: number
  freight_id: number
  name: string
  description?: string | null
  type: WaypointType
  type_label?: string
  type_icon?: string
  address?: string | null
  lat?: number | null
  lng?: number | null
  order: number
  mandatory: boolean
  estimated_stop_minutes?: number | null
  arrived_at?: string | null
  departed_at?: string | null
  is_visited?: boolean
  is_completed?: boolean
}

export interface CreateWaypointPayload {
  name: string
  type: WaypointType
  lat: number
  lng: number
  description?: string
  address?: string
  mandatory?: boolean
  estimated_stop_minutes?: number
}

interface WaypointResponse {
  data: Waypoint
  message?: string
}

interface WaypointListResponse {
  data: Waypoint[]
}

export const waypointsApi = {
  async list(freightId: number): Promise<Waypoint[]> {
    const { data } = await apiClient.get<WaypointListResponse>(`/freights/${freightId}/waypoints`)
    return data.data
  },

  async create(freightId: number, payload: CreateWaypointPayload): Promise<Waypoint> {
    const { data } = await apiClient.post<WaypointResponse>(`/freights/${freightId}/waypoints`, payload)
    return data.data
  },

  async remove(freightId: number, waypointId: number): Promise<void> {
    await apiClient.delete(`/freights/${freightId}/waypoints/${waypointId}`)
  },

  async reorder(freightId: number, waypointIds: number[]): Promise<Waypoint[]> {
    const { data } = await apiClient.post<WaypointListResponse>(
      `/freights/${freightId}/waypoints/reorder`,
      { waypoint_ids: waypointIds },
    )
    return data.data
  },

  async checkin(freightId: number, waypointId: number): Promise<Waypoint> {
    const { data } = await apiClient.post<WaypointResponse>(
      `/freights/${freightId}/waypoints/${waypointId}/checkin`,
    )
    return data.data
  },

  async checkout(freightId: number, waypointId: number): Promise<Waypoint> {
    const { data } = await apiClient.post<WaypointResponse>(
      `/freights/${freightId}/waypoints/${waypointId}/checkout`,
    )
    return data.data
  },
}
