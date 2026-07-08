export type UserRole = 'super_admin' | 'admin' | 'manager' | 'driver'

export type FreightStatus =
  | 'pending'
  | 'assigned'
  | 'accepted'
  | 'ready'
  | 'in_transit'
  | 'completed'
  | 'cancelled'
  | 'rejected'

export interface TenantFiscalSettings {
  cnpj?: string
  ie?: string
  razao_social?: string
  uf?: string
  municipio?: string
}

export interface Tenant {
  id: number
  name: string
  slug: string
  logo_url?: string | null
  settings?: {
    fiscal?: TenantFiscalSettings
    [key: string]: unknown
  } | null
}

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  role_label?: string
  tenant?: Tenant | null
  driver_profile?: {
    id: number
    phone?: string | null
    photo_url?: string | null
    is_available?: boolean
    cnh_expiring_soon?: boolean
    cnh_expired?: boolean
  } | null
}

export interface ApiValidationError {
  message: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}
