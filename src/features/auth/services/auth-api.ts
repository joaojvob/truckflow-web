import { apiClient } from '@/shared/lib/api-client'
import type { User } from '@/shared/types/api.types'

interface AuthResponse {
  user: User
  token: string
}

interface MeResponse {
  data: User
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/login', { email, password })
    return data
  },

  async register(
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
  ): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/register', {
      name,
      email,
      password,
      password_confirmation,
    })
    return data
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<MeResponse>('/me')
    return data.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/logout')
  },
}
