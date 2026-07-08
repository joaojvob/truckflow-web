import { Link, useParams } from 'react-router-dom'
import { useFreight } from '@/features/freights/hooks/useFreights'
import { FreightSummaryCard } from '@/features/freights/components/FreightTable'
import { FreightWorkflowPanel } from '@/features/freights/components/FreightWorkflowPanel'
import { DriverFreightWorkflowPanel } from '@/features/freights/components/DriverFreightWorkflowPanel'
import { FreightFiscalPanel } from '@/features/fiscal/components/FreightFiscalPanel'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { Card, CardTitle } from '@/shared/components/ui/Card'
import { ROUTES } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/lib/api-client'
import { formatDate } from '@/shared/lib/format'
import { isManagerOrAdmin } from '@/shared/lib/role-routing'

export function FreightDetailPage() {
  const { id } = useParams()
  const freightId = Number(id)
  const user = useAuthStore((state) => state.user)
  const { data: freight, isLoading, isError, error } = useFreight(freightId)

  if (isLoading) {
    return <LoadingState message="Carregando frete..." />
  }

  if (isError || !freight) {
    return <ErrorMessage message={getApiErrorMessage(error, 'Não foi possível carregar o frete.')} />
  }

  const isDriver = user?.role === 'driver'
  const isManager = user ? isManagerOrAdmin(user.role) : false
  const canEdit = isManager && freight.status !== 'completed' && freight.status !== 'cancelled'

  return (
    <div className="space-y-4">
      <PageHeader
        title={isDriver ? 'Meu frete' : 'Detalhe do frete'}
        description="Informações operacionais e status do workflow."
        action={
          <div className="flex gap-2">
            {canEdit ? (
              <Link
                className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text shadow-sm hover:bg-slate-50"
                to={ROUTES.freightEdit(freight.id)}
              >
                Editar
              </Link>
            ) : null}
            <Link
              className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text shadow-sm hover:bg-slate-50"
              to={ROUTES.freights}
            >
              Voltar
            </Link>
          </div>
        }
      />

      <FreightSummaryCard freight={freight} />

      {isDriver ? <DriverFreightWorkflowPanel freight={freight} /> : null}
      {isManager ? <FreightWorkflowPanel freight={freight} /> : null}

      {isManager && freight.status === 'completed' ? (
        <FreightFiscalPanel freightId={freight.id} />
      ) : null}

      <Card>
        <CardTitle>Informações</CardTitle>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Checklist</dt>
            <dd className="font-medium text-text">{freight.checklist_completed ? 'Concluído' : 'Pendente'}</dd>
          </div>
          <div>
            <dt className="text-muted">Doping aprovado</dt>
            <dd className="font-medium text-text">{freight.doping_approved ? 'Sim' : 'Não'}</dd>
          </div>
          <div>
            <dt className="text-muted">Liberação do gestor</dt>
            <dd className="font-medium text-text">{freight.manager_approved ? 'Sim' : 'Não'}</dd>
          </div>
          <div>
            <dt className="text-muted">Prazo de entrega</dt>
            <dd className="font-medium text-text">
              {freight.deadline_at ? formatDate(freight.deadline_at) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Criado em</dt>
            <dd className="font-medium text-text">{formatDate(freight.created_at)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
