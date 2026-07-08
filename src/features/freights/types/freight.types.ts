import type { FreightStatus } from '@/shared/types/api.types'

export interface DopingTest {
  id: number
  status: string
  file_path?: string | null
  reviewed_at?: string | null
}

export interface Freight {
  id: number
  cargo_name?: string | null
  cargo_type?: string | null
  cargo_type_label?: string | null
  cargo_description?: string | null
  weight?: number | null
  status: FreightStatus
  status_label?: string
  origin_address?: string | null
  destination_address?: string | null
  origin?: {
    cep?: string | null
    street?: string | null
    city?: string | null
    state?: string | null
    lat?: number | null
    lng?: number | null
  }
  destination?: {
    cep?: string | null
    street?: string | null
    city?: string | null
    state?: string | null
    lat?: number | null
    lng?: number | null
  }
  origin_lat?: number | null
  origin_lng?: number | null
  destination_lat?: number | null
  destination_lng?: number | null
  enforce_route?: boolean
  route?: {
    polyline?: string | null
    distance_meters?: number | null
    duration_seconds?: number | null
    calculated_at?: string | null
  } | null
  distance_km?: number | null
  estimated_hours?: number | null
  price_per_km?: number | null
  price_per_ton?: number | null
  toll_cost?: number | null
  fuel_cost?: number | null
  total_price?: number | null
  driver?: {
    id: number
    name: string
    email: string
  } | null
  creator?: {
    id: number
    name: string
  } | null
  doping_tests?: DopingTest[]
  created_at?: string
  started_at?: string | null
  completed_at?: string | null
  deadline_at?: string | null
  checklist_completed?: boolean
  doping_approved?: boolean
  manager_approved?: boolean
}

export interface CreateFreightPayload {
  driver_id: number
  cargo_type: string
  cargo_name?: string
  cargo_description?: string
  weight: number
  origin_address: string
  destination_address: string
  origin_cep?: string
  origin_street?: string
  origin_number?: string
  origin_complement?: string
  origin_neighborhood?: string
  origin_city?: string
  origin_state?: string
  origin_lat: number
  origin_lng: number
  destination_cep?: string
  destination_street?: string
  destination_number?: string
  destination_complement?: string
  destination_neighborhood?: string
  destination_city?: string
  destination_state?: string
  destination_lat: number
  destination_lng: number
  distance_km?: number
  estimated_hours?: number
  price_per_km?: number
  price_per_ton?: number
  toll_cost?: number
  fuel_cost?: number
  deadline_at?: string
}
