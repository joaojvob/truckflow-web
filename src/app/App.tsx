import { useEffect } from 'react'
import { AppProviders } from '@/app/providers'
import { AppRouter } from '@/app/router'
import { useAuthStore } from '@/features/auth/store/auth-store'

function Bootstrapper({ children }: { children: React.ReactNode }) {
  const bootstrap = useAuthStore((state) => state.bootstrap)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    const handleUnauthorized = () => {
      useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    }

    window.addEventListener('truckflow:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('truckflow:unauthorized', handleUnauthorized)
  }, [])

  return children
}

export function App() {
  return (
    <AppProviders>
      <Bootstrapper>
        <AppRouter />
      </Bootstrapper>
    </AppProviders>
  )
}
