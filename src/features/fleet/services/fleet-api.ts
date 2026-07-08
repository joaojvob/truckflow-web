import { apiClient } from '@/shared/lib/api-client'
import type { PaginatedResponse } from '@/shared/types/api.types'
import type {
  CreateTrailerPayload,
  CreateTruckPayload,
  Trailer,
  Truck,
  VehicleStatus,
} from '@/features/fleet/types/fleet.types'

interface VehicleResponse<T> {
  data: T
  message?: string
}

async function downloadBlob(url: string, filename: string): Promise<void> {
  const { data } = await apiClient.get<Blob>(url, { responseType: 'blob' })
  const objectUrl = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  link.click()
  URL.revokeObjectURL(objectUrl)
}

export const trucksApi = {
  async list(page = 1): Promise<PaginatedResponse<Truck>> {
    const { data } = await apiClient.get<PaginatedResponse<Truck>>('/trucks', { params: { page } })
    return data
  },

  async create(payload: CreateTruckPayload): Promise<Truck> {
    const { data } = await apiClient.post<VehicleResponse<Truck>>('/trucks', payload)
    return data.data
  },

  async update(id: number, payload: Partial<CreateTruckPayload> & { status?: VehicleStatus; driver_id?: number | null }): Promise<Truck> {
    const { data } = await apiClient.put<VehicleResponse<Truck>>(`/trucks/${id}`, payload)
    return data.data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/trucks/${id}`)
  },

  async uploadCrlv(id: number, file: File, crlvExpiry?: string): Promise<Truck> {
    const formData = new FormData()
    formData.append('file', file)
    if (crlvExpiry) formData.append('crlv_expiry', crlvExpiry)
    const { data } = await apiClient.post<VehicleResponse<Truck>>(`/trucks/${id}/crlv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },

  async downloadCrlv(id: number, plate: string): Promise<void> {
    await downloadBlob(`/trucks/${id}/crlv`, `crlv-caminhao-${plate}.pdf`)
  },
}

export const trailersApi = {
  async list(page = 1): Promise<PaginatedResponse<Trailer>> {
    const { data } = await apiClient.get<PaginatedResponse<Trailer>>('/trailers', { params: { page } })
    return data
  },

  async create(payload: CreateTrailerPayload): Promise<Trailer> {
    const { data } = await apiClient.post<VehicleResponse<Trailer>>('/trailers', payload)
    return data.data
  },

  async update(
    id: number,
    payload: Partial<CreateTrailerPayload> & { status?: VehicleStatus; driver_id?: number | null; is_loaded?: boolean },
  ): Promise<Trailer> {
    const { data } = await apiClient.put<VehicleResponse<Trailer>>(`/trailers/${id}`, payload)
    return data.data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/trailers/${id}`)
  },

  async uploadCrlv(id: number, file: File, crlvExpiry?: string): Promise<Trailer> {
    const formData = new FormData()
    formData.append('file', file)
    if (crlvExpiry) formData.append('crlv_expiry', crlvExpiry)
    const { data } = await apiClient.post<VehicleResponse<Trailer>>(`/trailers/${id}/crlv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },

  async downloadCrlv(id: number, plate: string): Promise<void> {
    await downloadBlob(`/trailers/${id}/crlv`, `crlv-reboque-${plate}.pdf`)
  },
}
