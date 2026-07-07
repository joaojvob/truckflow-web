import { Card, CardDescription, CardTitle } from '@/shared/components/ui/Card'
import { formatCurrency } from '@/shared/lib/format'

interface StatCardProps {
  title: string
  value: string
  description?: string
}

export function StatCard({ title, value, description }: StatCardProps) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <p className="mt-2 text-2xl font-bold text-text">{value}</p>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </Card>
  )
}

interface DashboardStatsProps {
  totalFreights: number
  activeFreights: number
  inTransit: number
  completed: number
  revenueThisMonth: number
  revenueTotal: number
}

export function DashboardStats({
  totalFreights,
  activeFreights,
  inTransit,
  completed,
  revenueThisMonth,
  revenueTotal,
}: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard title="Fretes totais" value={String(totalFreights)} description="No escopo do seu perfil" />
      <StatCard title="Fretes ativos" value={String(activeFreights)} description="Em andamento operacional" />
      <StatCard title="Em trânsito" value={String(inTransit)} />
      <StatCard title="Concluídos" value={String(completed)} />
      <StatCard title="Receita do mês" value={formatCurrency(revenueThisMonth)} />
      <StatCard title="Receita total" value={formatCurrency(revenueTotal)} />
    </div>
  )
}
