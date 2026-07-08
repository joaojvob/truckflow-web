export interface DriverLocation {
  id?: number
  freight_id: number
  driver_id: number
  lat: number | null
  lng: number | null
  speed_kmh?: string | number | null
  heading?: string | number | null
  recorded_at?: string | null
  created_at?: string | null
}

export interface DriverLocationPayload {
  freight_id: number
  driver_id: number
  lat: number | null
  lng: number | null
  speed_kmh?: string | number | null
  heading?: string | number | null
  recorded_at?: string | null
}

export interface SosPayload {
  incident_id: number
  freight_id: number
  type: string
  message?: string | null
  created_at?: string | null
}

export interface SendLocationPayload {
  lat: number
  lng: number
  speed_kmh?: number
  heading?: number
  recorded_at?: string
}
