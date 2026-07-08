import { Card, CardDescription, CardTitle } from '@/shared/components/ui/Card'
import { formatCurrency } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'

interface StatCardProps {
  title: string
  value: string
  description?: string
  color: string
}

function StatCard({ title, value, description, color }: StatCardProps) {
  return (
    <Card className={cn('border-0', color)}>
      <CardTitle className="text-sm font-medium text-muted">{title}</CardTitle>
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
      <StatCard title="Fretes totais" value={String(totalFreights)} color="bg-pastel-blue" />
      <StatCard title="Fretes ativos" value={String(activeFreights)} color="bg-pastel-green" />
      <StatCard title="Em trânsito" value={String(inTransit)} color="bg-pastel-purple" />
      <StatCard title="Concluídos" value={String(completed)} color="bg-pastel-orange" />
      <StatCard title="Receita do mês" value={formatCurrency(revenueThisMonth)} color="bg-pastel-cyan" />
      <StatCard title="Receita total" value={formatCurrency(revenueTotal)} color="bg-pastel-pink" />
    </div>
  )
}
