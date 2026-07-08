import { apiClient } from '@/shared/lib/api-client'

export interface DriverProfile {
  id: number
  phone?: string | null
  cpf?: string | null
  birth_date?: string | null
  cnh_number?: string | null
  cnh_category?: string | null
  cnh_expiry?: string | null
  cnh_expired?: boolean
  cnh_expiring_soon?: boolean
  cnh_has_document?: boolean
  cnh_uploaded_at?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  is_available?: boolean
  photo_url?: string | null
}

export interface UpdateDriverProfilePayload {
  phone?: string
  cpf?: string
  birth_date?: string
  cnh_number?: string
  cnh_category?: string
  cnh_expiry?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  is_available?: boolean
}

interface DriverProfileResponse {
  data: DriverProfile | null
  message?: string
}

export const driverProfileApi = {
  async get(): Promise<DriverProfile | null> {
    const { data } = await apiClient.get<DriverProfileResponse>('/driver-profile')
    return data.data
  },

  async update(payload: UpdateDriverProfilePayload): Promise<DriverProfile> {
    const { data } = await apiClient.put<DriverProfileResponse>('/driver-profile', payload)
    return data.data!
  },

  async uploadCnh(file: File): Promise<DriverProfile> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await apiClient.post<DriverProfileResponse>('/driver-profile/cnh', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data!
  },

  async uploadPhoto(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await apiClient.post<{ data: { photo_url: string } }>(
      '/driver-profile/photo',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data.data.photo_url
  },
}
