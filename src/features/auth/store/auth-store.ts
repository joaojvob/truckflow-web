import { create } from 'zustand'
import type { User } from '@/shared/types/api.types'
import { authApi } from '@/features/auth/services/auth-api'
import { clearStoredToken, getStoredToken, setStoredToken } from '@/shared/lib/api-client'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  bootstrap: () => Promise<void>
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<User>
  setSession: (user: User, token: string) => void
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
    const { user, token } = await authApi.login(email, password)
    get().setSession(user, token)
    return user
  },

  register: async (name, email, password, passwordConfirmation) => {
    const { user, token } = await authApi.register(name, email, password, passwordConfirmation)
    get().setSession(user, token)
    return user
  },

  setSession: (user, token) => {
    setStoredToken(token)
    set({ user, token, isAuthenticated: true, isBootstrapping: false })
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
      set({ user: null, token: null, isAuthenticated: false })
    }
  },
}))
