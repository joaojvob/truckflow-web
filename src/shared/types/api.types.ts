export type UserRole = 'admin' | 'manager' | 'driver'

export type FreightStatus =
  | 'pending'
  | 'assigned'
  | 'accepted'
  | 'ready'
  | 'in_transit'
  | 'completed'
  | 'cancelled'
  | 'rejected'

export interface Tenant {
  id: number
  name: string
  slug: string
  settings?: Record<string, unknown>
}

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  role_label?: string
  tenant?: Tenant | null
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
