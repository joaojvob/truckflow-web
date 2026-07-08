import axios, { type AxiosError } from 'axios'
import type { ApiValidationError } from '@/shared/types/api.types'
import { getTenantContext } from '@/shared/lib/tenant-context'

const TOKEN_KEY = 'truckflow_token'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const tenantContext = getTenantContext()
  if (tenantContext?.tenantId) {
    config.headers['X-Tenant-Id'] = String(tenantContext.tenantId)
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiValidationError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new Event('truckflow:unauthorized'))
    }

    return Promise.reject(error)
  },
)

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getApiErrorMessage(error: unknown, fallback = 'Ocorreu um erro.'): string {
  if (axios.isAxiosError<ApiValidationError>(error)) {
    const data = error.response?.data

    if (data?.errors) {
      const messages = Object.values(data.errors).flat().filter(Boolean)
      if (messages.length > 0) return messages.join(' ')
    }

    if (data?.message) return data.message
  }

  return fallback
}
