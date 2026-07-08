import { useNavigate } from 'react-router-dom'
import { useAdminTenants } from '@/features/admin/hooks/useAdminTenants'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { ROUTES } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/lib/api-client'
import { formatCurrency } from '@/shared/lib/format'
import { setTenantContext } from '@/shared/lib/tenant-context'

export function SuperAdminTenantsPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useAdminTenants()

  if (isLoading) {
    return <LoadingState message="Carregando empresas..." />
  }

  if (isError || !data) {
    return <ErrorMessage message={getApiErrorMessage(error, 'Não foi possível carregar as empresas.')} />
  }

  const handleEnter = (tenantId: number, tenantName: string) => {
    setTenantContext({ tenantId, tenantName })
    navigate(ROUTES.dashboard)
  }

  return (
    <div>
      <PageHeader
        title="Empresas"
        description="Visão global de todas as transportadoras cadastradas na plataforma."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-pastel-blue p-4">
          <p className="text-xs text-muted">Empresas</p>
          <p className="text-2xl font-bold text-text">{data.summary.tenants}</p>
        </Card>
        <Card className="bg-pastel-green p-4">
          <p className="text-xs text-muted">Usuários</p>
          <p className="text-2xl font-bold text-text">{data.summary.users}</p>
        </Card>
        <Card className="bg-pastel-purple p-4">
          <p className="text-xs text-muted">Fretes</p>
          <p className="text-2xl font-bold text-text">{data.summary.freights}</p>
        </Card>
        <Card className="bg-pastel-cyan p-4">
          <p className="text-xs text-muted">Receita total</p>
          <p className="text-2xl font-bold text-text">{formatCurrency(data.summary.revenue)}</p>
        </Card>
      </div>

      {data.data.length === 0 ? (
        <EmptyState title="Nenhuma empresa" description="Ainda não há transportadoras cadastradas." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.data.map((tenant) => (
            <Card key={tenant.id} className="flex flex-col gap-3 p-5">
              <div>
                <h3 className="font-semibold text-text">{tenant.name}</h3>
                <p className="text-xs text-muted">{tenant.slug}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <p className="font-semibold text-text">{tenant.users_count}</p>
                  <p className="text-xs text-muted">Usuários</p>
                </div>
                <div>
                  <p className="font-semibold text-text">{tenant.freights_count}</p>
                  <p className="text-xs text-muted">Fretes</p>
                </div>
                <div>
                  <p className="font-semibold text-text">{formatCurrency(tenant.revenue_total)}</p>
                  <p className="text-xs text-muted">Receita</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    tenant.has_fiscal ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {tenant.has_fiscal ? 'Fiscal OK' : 'Sem fiscal'}
                </span>
                <Button size="sm" onClick={() => handleEnter(tenant.id, tenant.name)}>
                  Entrar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
