import { z } from 'zod'
import type { User } from '@/shared/types/api.types'
import { apiClient } from '@/shared/lib/api-client'
import type { PaginatedResponse } from '@/shared/types/api.types'

export const createDriverSchema = z.object({
  name: z.string().min(2, 'Informe o nome do motorista.'),
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres.'),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  cnh_number: z.string().optional(),
  cnh_category: z.string().optional(),
})

export type CreateDriverFormData = z.infer<typeof createDriverSchema>

export interface DriverFilters {
  search?: string
  available?: boolean
}

export const driversApi = {
  async listLinked(page = 1, filters: DriverFilters = {}): Promise<PaginatedResponse<User>> {
    const params: Record<string, unknown> = { page }
    if (filters.search) params.search = filters.search
    if (filters.available !== undefined) params.available = filters.available
    const { data } = await apiClient.get<PaginatedResponse<User>>('/manager/drivers', { params })
    return data
  },

  async listTenantUsers(page = 1): Promise<PaginatedResponse<User>> {
    const { data } = await apiClient.get<PaginatedResponse<User>>('/users', {
      params: { page },
    })
    return data
  },

  async create(payload: CreateDriverFormData): Promise<void> {
    await apiClient.post('/manager/drivers/register', payload)
  },

  async link(driverId: number): Promise<void> {
    await apiClient.post('/manager/drivers', { driver_id: driverId })
  },

  async unlink(driverId: number): Promise<void> {
    await apiClient.delete(`/manager/drivers/${driverId}`)
  },
}
