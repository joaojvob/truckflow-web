import { z } from 'zod'
import type { DefaultValues } from 'react-hook-form'

const emptyToUndefined = (value: unknown) => {
  if (value === '' || value === undefined || value === null) return undefined
  return Number(value)
}

const optionalNumber = z.preprocess(emptyToUndefined, z.number().min(0).optional())

const requiredNumber = (message: string, refine?: (schema: z.ZodNumber) => z.ZodNumber) => {
  const base = z.number({ error: message })
  return z.preprocess(emptyToUndefined, refine ? refine(base) : base)
}

const addressFields = {
  cep: z.string().min(8, 'Informe o CEP.'),
  street: z.string().min(1, 'Informe a rua.'),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Informe o bairro.'),
  city: z.string().min(1, 'Informe a cidade.'),
  state: z.string().length(2, 'Informe a UF.'),
  lat: requiredNumber('Coordenada não encontrada. Busque o CEP ou informe manualmente.', (s) =>
    s.min(-90).max(90),
  ),
  lng: requiredNumber('Coordenada não encontrada. Busque o CEP ou informe manualmente.', (s) =>
    s.min(-180).max(180),
  ),
}

export const freightFormSchema = z.object({
  driver_id: requiredNumber('Selecione um motorista.', (s) => s.int().positive('Selecione um motorista.')),
  cargo_type: z.string().min(1, 'Selecione o tipo de carga.'),
  cargo_name: z.string().optional(),
  cargo_description: z.string().optional(),
  weight: requiredNumber('Informe o peso.', (s) => s.positive('Peso deve ser maior que zero.')),
  origin_cep: addressFields.cep,
  origin_street: addressFields.street,
  origin_number: addressFields.number,
  origin_complement: addressFields.complement,
  origin_neighborhood: addressFields.neighborhood,
  origin_city: addressFields.city,
  origin_state: addressFields.state,
  origin_lat: addressFields.lat,
  origin_lng: addressFields.lng,
  destination_cep: addressFields.cep,
  destination_street: addressFields.street,
  destination_number: addressFields.number,
  destination_complement: addressFields.complement,
  destination_neighborhood: addressFields.neighborhood,
  destination_city: addressFields.city,
  destination_state: addressFields.state,
  destination_lat: addressFields.lat,
  destination_lng: addressFields.lng,
  distance_km: optionalNumber,
  estimated_hours: z.preprocess(emptyToUndefined, z.number().min(0.1).optional()),
  price_per_km: optionalNumber,
  price_per_ton: optionalNumber,
  toll_cost: optionalNumber,
  fuel_cost: optionalNumber,
  deadline_at: z.string().optional(),
})

export type FreightFormData = {
  driver_id: number
  cargo_type: string
  cargo_name?: string
  cargo_description?: string
  weight: number
  origin_cep: string
  origin_street: string
  origin_number?: string
  origin_complement?: string
  origin_neighborhood: string
  origin_city: string
  origin_state: string
  origin_lat: number
  origin_lng: number
  destination_cep: string
  destination_street: string
  destination_number?: string
  destination_complement?: string
  destination_neighborhood: string
  destination_city: string
  destination_state: string
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

export const defaultFreightFormValues = {
  driver_id: '',
  cargo_type: '',
  cargo_name: '',
  cargo_description: '',
  weight: '',
  origin_cep: '',
  origin_street: '',
  origin_number: '',
  origin_complement: '',
  origin_neighborhood: '',
  origin_city: '',
  origin_state: '',
  origin_lat: '',
  origin_lng: '',
  destination_cep: '',
  destination_street: '',
  destination_number: '',
  destination_complement: '',
  destination_neighborhood: '',
  destination_city: '',
  destination_state: '',
  destination_lat: '',
  destination_lng: '',
  distance_km: '',
  estimated_hours: '',
  price_per_km: '',
  price_per_ton: '',
  toll_cost: '',
  fuel_cost: '',
  deadline_at: '',
} as unknown as DefaultValues<FreightFormData>

function composeAddress(prefix: 'origin' | 'destination', data: FreightFormData): string {
  const parts = [
    data[`${prefix}_street`],
    data[`${prefix}_number`],
    data[`${prefix}_neighborhood`],
    data[`${prefix}_city`],
    data[`${prefix}_state`],
    data[`${prefix}_cep`],
  ].filter(Boolean)
  return parts.join(', ')
}

export function toFreightPayload(data: FreightFormData) {
  return {
    driver_id: data.driver_id,
    cargo_type: data.cargo_type,
    cargo_name: data.cargo_name || undefined,
    cargo_description: data.cargo_description || undefined,
    weight: data.weight,
    origin_address: composeAddress('origin', data),
    destination_address: composeAddress('destination', data),
    origin_cep: data.origin_cep,
    origin_street: data.origin_street,
    origin_number: data.origin_number || undefined,
    origin_complement: data.origin_complement || undefined,
    origin_neighborhood: data.origin_neighborhood,
    origin_city: data.origin_city,
    origin_state: data.origin_state,
    origin_lat: data.origin_lat,
    origin_lng: data.origin_lng,
    destination_cep: data.destination_cep,
    destination_street: data.destination_street,
    destination_number: data.destination_number || undefined,
    destination_complement: data.destination_complement || undefined,
    destination_neighborhood: data.destination_neighborhood,
    destination_city: data.destination_city,
    destination_state: data.destination_state,
    destination_lat: data.destination_lat,
    destination_lng: data.destination_lng,
    distance_km: data.distance_km,
    estimated_hours: data.estimated_hours,
    price_per_km: data.price_per_km,
    price_per_ton: data.price_per_ton,
    toll_cost: data.toll_cost,
    fuel_cost: data.fuel_cost,
    deadline_at: data.deadline_at ? new Date(data.deadline_at).toISOString() : undefined,
  }
}
