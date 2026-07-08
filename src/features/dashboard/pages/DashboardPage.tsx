import { useState } from 'react'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { DashboardCharts } from '@/features/dashboard/components/DashboardCharts'
import { DashboardStats } from '@/features/dashboard/components/DashboardStats'
import { AnalyticsPanel } from '@/features/reports/components/AnalyticsPanel'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { getApiErrorMessage } from '@/shared/lib/api-client'

type Tab = 'overview' | 'analytics'

export function DashboardPage() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral e análise da operação da transportadora." />

      <div className="mb-6 flex gap-2 border-b border-border">
        <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>
          Visão geral
        </TabButton>
        <TabButton active={tab === 'analytics'} onClick={() => setTab('analytics')}>
          Análise
        </TabButton>
      </div>

      {tab === 'overview' ? <OverviewTab /> : <AnalyticsPanel />}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text'
      }`}
    >
      {children}
    </button>
  )
}

function OverviewTab() {
  const { data, isLoading, isError, error } = useDashboard()

  if (isLoading) {
    return <LoadingState message="Carregando dashboard..." />
  }

  if (isError || !data) {
    return <ErrorMessage message={getApiErrorMessage(error, 'Não foi possível carregar o dashboard.')} />
  }

  return (
    <div>
      <DashboardStats
        totalFreights={data.freights.total}
        activeFreights={data.freights.active}
        inTransit={data.freights.in_transit}
        completed={data.freights.completed}
        revenueThisMonth={data.financial.revenue_this_month}
        revenueTotal={data.financial.revenue_total}
      />

      <DashboardCharts
        byStatus={data.freights.by_status}
        revenueThisMonth={data.financial.revenue_this_month}
        revenueTotal={data.financial.revenue_total}
        avgFreightValue={data.financial.avg_freight_value}
      />
    </div>
  )
}
