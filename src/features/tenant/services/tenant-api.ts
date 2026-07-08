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

export const updateTenantSchema = z.object({
  name: z.string().min(2, 'Informe o nome da empresa.'),
  slug: z
    .string()
    .min(2, 'Informe um slug.')
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífen.'),
})

export type UpdateTenantFormData = z.infer<typeof updateTenantSchema>

export const tenantFiscalSchema = z.object({
  cnpj: z
    .string()
    .regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos (somente números).'),
  ie: z.string().min(1, 'Informe a inscrição estadual.').max(20),
  razao_social: z.string().min(1, 'Informe a razão social.').max(255),
  uf: z
    .string()
    .length(2, 'UF deve ter 2 letras.')
    .regex(/^[A-Za-z]{2}$/, 'UF deve conter apenas letras.'),
  municipio: z.string().min(1, 'Informe o município.').max(120),
})

export type TenantFiscalFormData = z.infer<typeof tenantFiscalSchema>

interface TenantResponse {
  data: Tenant
}

export const tenantApi = {
  async create(payload: CreateTenantFormData): Promise<Tenant> {
    const { data } = await apiClient.post<TenantResponse>('/tenant', payload)
    return data.data
  },

  async get(): Promise<Tenant> {
    const { data } = await apiClient.get<TenantResponse>('/tenant')
    return data.data
  },

  async update(payload: UpdateTenantFormData): Promise<Tenant> {
    const { data } = await apiClient.put<TenantResponse>('/tenant', payload)
    return data.data
  },

  async updateFiscal(payload: TenantFiscalFormData): Promise<Tenant> {
    const { data } = await apiClient.put<TenantResponse>('/tenant/fiscal', {
      ...payload,
      uf: payload.uf.toUpperCase(),
    })
    return data.data
  },

  async uploadLogo(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await apiClient.post<{ data: { logo_url: string } }>('/tenant/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data.logo_url
  },
}
