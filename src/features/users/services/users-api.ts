import { apiClient } from '@/shared/lib/api-client'
import type { PaginatedResponse, User, UserRole } from '@/shared/types/api.types'

interface UserResponse {
  data: User
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

export const usersApi = {
  async list(page = 1): Promise<PaginatedResponse<User>> {
    const { data } = await apiClient.get<PaginatedResponse<User>>('/users', { params: { page } })
    return data
  },

  async getById(id: number): Promise<User> {
    const { data } = await apiClient.get<UserResponse>(`/users/${id}`)
    return data.data
  },

  async updateRole(id: number, role: Exclude<UserRole, 'super_admin'>): Promise<User> {
    const { data } = await apiClient.patch<UserResponse>(`/users/${id}/role`, { role })
    return data.data
  },

  async downloadCnh(userId: number): Promise<void> {
    await downloadBlob(`/users/${userId}/cnh`, `cnh-motorista-${userId}.pdf`)
  },
}
