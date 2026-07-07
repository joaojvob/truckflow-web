import type { FreightStatus } from '@/shared/types/api.types'

export interface Freight {
  id: number
  cargo_name: string
  cargo_description?: string | null
  weight?: number | null
  status: FreightStatus
  status_label?: string
  origin_address?: string | null
  destination_address?: string | null
  distance_km?: number | null
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
  created_at?: string
  started_at?: string | null
  completed_at?: string | null
  checklist_completed?: boolean
  doping_approved?: boolean
  manager_approved?: boolean
}
