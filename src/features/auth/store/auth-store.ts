import { create } from 'zustand'
import type { User } from '@/shared/types/api.types'
import { authApi } from '@/features/auth/services/auth-api'
import { clearStoredToken, getStoredToken, setStoredToken } from '@/shared/lib/api-client'
import { clearTenantContext } from '@/shared/lib/tenant-context'
import { disconnectEcho } from '@/shared/lib/echo'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  bootstrap: () => Promise<void>
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<User>
  setSession: (token: string) => Promise<User>
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: getStoredToken(),
  isAuthenticated: false,
  isBootstrapping: true,

  bootstrap: async () => {
    const token = getStoredToken()

    if (!token) {
      set({ isBootstrapping: false, isAuthenticated: false, user: null, token: null })
      return
    }

    try {
      const user = await authApi.me()
      set({ user, token, isAuthenticated: true, isBootstrapping: false })
    } catch {
      clearStoredToken()
      set({ user: null, token: null, isAuthenticated: false, isBootstrapping: false })
    }
  },

  login: async (email, password) => {
    const { token } = await authApi.login(email, password)
    return get().setSession(token)
  },

  register: async (name, email, password, passwordConfirmation) => {
    const { token } = await authApi.register(name, email, password, passwordConfirmation)
    return get().setSession(token)
  },

  setSession: async (token) => {
    setStoredToken(token)
    set({ token, isAuthenticated: true, isBootstrapping: false })

    const user = await authApi.me()
    set({ user })

    return user
  },

  refreshUser: async () => {
    const user = await authApi.me()
    set({ user })
  },

  logout: async () => {
    try {
      await authApi.logout()
    } finally {
      clearStoredToken()
      clearTenantContext()
      disconnectEcho()
      set({ user: null, token: null, isAuthenticated: false })
    }
  },
}))
