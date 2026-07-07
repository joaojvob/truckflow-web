import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '@/features/auth/components/LoginForm'
import type { LoginFormData } from '@/features/auth/schemas/auth.schema'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { AuthLayout } from '@/shared/components/layout/AuthLayout'
import { ROUTES } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/lib/api-client'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(data: LoginFormData) {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const user = await login(data.email, data.password)

      if (!user.tenant) {
        navigate(ROUTES.createTenant)
        return
      }

      navigate(ROUTES.dashboard)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível entrar.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <LoginForm onSubmit={handleSubmit} errorMessage={errorMessage} isLoading={isLoading} />
    </AuthLayout>
  )
}
