import { z } from 'zod'
import { apiClient } from '@/shared/lib/api-client'
import type { Tenant } from '@/shared/types/api.types'

export const createTenantSchema = z.object({
  name: z.string().min(2, 'Informe o nome da empresa.'),
  slug: z
    .string()
    .min(2, 'Informe um slug.')
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífen.'),
})

export type CreateTenantFormData = z.infer<typeof createTenantSchema>

interface TenantResponse {
  data: Tenant
}

export const tenantApi = {
  async create(payload: CreateTenantFormData): Promise<Tenant> {
    const { data } = await apiClient.post<TenantResponse>('/tenant', payload)
    return data.data
  },
}
