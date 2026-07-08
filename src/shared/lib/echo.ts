import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { getStoredToken } from '@/shared/lib/api-client'
import { getTenantContext } from '@/shared/lib/tenant-context'

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

let echoInstance: Echo<'reverb'> | null = null

export function isReverbConfigured(): boolean {
  return Boolean(import.meta.env.VITE_REVERB_APP_KEY)
}

function buildAuthHeaders(): Record<string, string> {
  const token = getStoredToken()
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const tenantContext = getTenantContext()
  if (tenantContext?.tenantId) {
    headers['X-Tenant-Id'] = String(tenantContext.tenantId)
  }

  return headers
}

export function getEcho(): Echo<'reverb'> | null {
  if (!isReverbConfigured()) return null

  const token = getStoredToken()
  if (!token) return null

  if (echoInstance) {
    return echoInstance
  }

  window.Pusher = Pusher

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/broadcasting/auth',
    auth: {
      headers: buildAuthHeaders(),
    },
  })

  return echoInstance
}

export function disconnectEcho(): void {
  echoInstance?.disconnect()
  echoInstance = null
}
