import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { DashboardStats } from '@/features/dashboard/components/DashboardStats'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { getApiErrorMessage } from '@/shared/lib/api-client'

export function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboard()

  if (isLoading) {
    return <LoadingState message="Carregando dashboard..." />
  }

  if (isError || !data) {
    return <ErrorMessage message={getApiErrorMessage(error, 'Não foi possível carregar o dashboard.')} />
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral da operação da transportadora."
      />

      <DashboardStats
        totalFreights={data.freights.total}
        activeFreights={data.freights.active}
        inTransit={data.freights.in_transit}
        completed={data.freights.completed}
        revenueThisMonth={data.financial.revenue_this_month}
        revenueTotal={data.financial.revenue_total}
      />
    </div>
  )
}
