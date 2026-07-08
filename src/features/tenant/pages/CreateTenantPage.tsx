import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { CreateTenantForm } from '@/features/tenant/components/CreateTenantForm'
import type { CreateTenantFormData } from '@/features/tenant/services/tenant-api'
import { tenantApi } from '@/features/tenant/services/tenant-api'
import { AuthSplitLayout } from '@/shared/components/layout/AuthLayout'
import { ROUTES } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/lib/api-client'

export function CreateTenantPage() {
  const navigate = useNavigate()
  const refreshUser = useAuthStore((state) => state.refreshUser)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(data: CreateTenantFormData) {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      await tenantApi.create(data)
      await refreshUser()
      navigate(ROUTES.dashboard)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível criar a empresa.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthSplitLayout
      title="Criar empresa"
      subtitle="Configure a transportadora para começar a operar."
      footer={
        <Link className="text-primary hover:underline" to={ROUTES.login}>
          Voltar ao login
        </Link>
      }
    >
      <CreateTenantForm onSubmit={handleSubmit} errorMessage={errorMessage} isLoading={isLoading} />
    </AuthSplitLayout>
  )
}
