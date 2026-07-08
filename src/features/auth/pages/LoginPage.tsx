import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LoginForm } from '@/features/auth/components/LoginForm'
import type { LoginFormData } from '@/features/auth/schemas/auth.schema'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { AuthSplitLayout } from '@/shared/components/layout/AuthLayout'
import { ROUTES } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/lib/api-client'
import { getDefaultRouteForRole } from '@/shared/lib/role-routing'

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

      // Super admin não tem tenant próprio: vai direto para a lista de empresas.
      if (user.role !== 'super_admin' && !user.tenant) {
        navigate(ROUTES.createTenant)
        return
      }

      navigate(getDefaultRouteForRole(user.role))
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível entrar.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthSplitLayout
      title="Bem-vindo de volta"
      subtitle="Informe seu e-mail e senha para acessar o painel."
      footer={
        <span>
          © {new Date().getFullYear()} TruckFlow ·{' '}
          <Link className="text-primary hover:underline" to={ROUTES.register}>
            Criar conta
          </Link>
        </span>
      }
    >
      <LoginForm onSubmit={handleSubmit} errorMessage={errorMessage} isLoading={isLoading} />
    </AuthSplitLayout>
  )
}
