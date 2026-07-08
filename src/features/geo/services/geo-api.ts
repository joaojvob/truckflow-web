import { apiClient } from '@/shared/lib/api-client'

export interface CepLookupResult {
  cep: string
  street: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  lat: number | null
  lng: number | null
  source: string
}

export interface CargoTypeOption {
  value: string
  label: string
}

export interface FreightCalculationResult {
  distance_km: number
  estimated_hours: number
  route: {
    polyline: string
    distance_meters: number
    duration_seconds: number
  }
  pricing: {
    distance_price: number
    weight_price: number
    toll_cost: number
    fuel_cost: number
    total_price: number
  }
  provider: string
}

export const geoApi = {
  async lookupCep(cep: string): Promise<CepLookupResult> {
    const clean = cep.replace(/\D/g, '')
    const { data } = await apiClient.get<{ data: CepLookupResult }>(`/geo/cep/${clean}`)
    return data.data
  },

  async calculate(params: {
    origin_lat: number
    origin_lng: number
    destination_lat: number
    destination_lng: number
    weight?: number
    price_per_km?: number
    price_per_ton?: number
    toll_cost?: number
    fuel_cost?: number
  }): Promise<FreightCalculationResult> {
    const { data } = await apiClient.post<{ data: FreightCalculationResult }>('/geo/calculate', params)
    return data.data
  },

  async cargoTypes(): Promise<CargoTypeOption[]> {
    const { data } = await apiClient.get<{ data: CargoTypeOption[] }>('/geo/cargo-types')
    return data.data
  },
}
