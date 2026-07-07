import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import type { RegisterFormData } from '@/features/auth/schemas/auth.schema'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { AuthLayout } from '@/shared/components/layout/AuthLayout'
import { ROUTES } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/lib/api-client'

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(data: RegisterFormData) {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      await register(data.name, data.email, data.password, data.password_confirmation)
      navigate(ROUTES.createTenant)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível criar a conta.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <RegisterForm onSubmit={handleSubmit} errorMessage={errorMessage} isLoading={isLoading} />
    </AuthLayout>
  )
}
