export type VehicleStatus = 'available' | 'in_use' | 'maintenance' | 'inactive'

export type TrailerType =
  | 'flatbed'
  | 'refrigerated'
  | 'dry_van'
  | 'tanker'
  | 'sider'
  | 'hopper'
  | 'container'
  | 'logging'
  | 'lowboy'
  | 'livestock'

export type HitchType = 'fifth_wheel' | 'pintle' | 'drawbar'

export interface FleetDriver {
  id: number
  name: string
  email: string
}

export interface Truck {
  id: number
  plate: string
  renavam?: string | null
  brand: string
  model: string
  year: number
  color?: string | null
  axle_count: number
  max_weight: number
  has_trailer_hitch: boolean
  hitch_type?: HitchType | null
  status: VehicleStatus
  status_label?: string
  odometer: number
  crlv_has_document?: boolean
  crlv_expiry?: string | null
  crlv_expired?: boolean
  crlv_uploaded_at?: string | null
  driver?: FleetDriver | null
  created_at?: string
}

export interface Trailer {
  id: number
  plate: string
  renavam?: string | null
  type: TrailerType
  type_label?: string
  brand?: string | null
  model?: string | null
  year?: number | null
  axle_count: number
  max_weight: number
  length?: number | null
  hitch_type: HitchType
  status: VehicleStatus
  status_label?: string
  is_loaded: boolean
  crlv_has_document?: boolean
  crlv_expiry?: string | null
  crlv_expired?: boolean
  crlv_uploaded_at?: string | null
  driver?: FleetDriver | null
  created_at?: string
}

export interface CreateTruckPayload {
  plate: string
  brand: string
  model: string
  year: number
  max_weight: number
  renavam?: string
  color?: string
  axle_count?: number
  has_trailer_hitch?: boolean
  hitch_type?: HitchType
  odometer?: number
  driver_id?: number
}

export interface CreateTrailerPayload {
  plate: string
  type: TrailerType
  max_weight: number
  hitch_type: HitchType
  renavam?: string
  brand?: string
  model?: string
  year?: number
  axle_count?: number
  length?: number
  driver_id?: number
}
