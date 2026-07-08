import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardTitle } from '@/shared/components/ui/Card'
import { formatCurrency } from '@/shared/lib/format'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  assigned: 'Atribuído',
  accepted: 'Aceito',
  ready: 'Pronto',
  in_transit: 'Em trânsito',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  rejected: 'Recusado',
}

const STATUS_COLORS = ['#5b5bf5', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#6b7280', '#ef4444', '#ec4899']

interface DashboardChartsProps {
  byStatus: Record<string, number>
  revenueThisMonth: number
  revenueTotal: number
  avgFreightValue: number
}

export function DashboardCharts({
  byStatus,
  revenueThisMonth,
  revenueTotal,
  avgFreightValue,
}: DashboardChartsProps) {
  const statusData = Object.entries(byStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count], index) => ({
      name: STATUS_LABELS[status] ?? status,
      value: count,
      color: STATUS_COLORS[index % STATUS_COLORS.length],
    }))

  const revenueData = [
    { name: 'Este mês', value: revenueThisMonth },
    { name: 'Total', value: revenueTotal },
    { name: 'Média/frete', value: avgFreightValue },
  ]

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <Card>
        <CardTitle>Fretes por status</CardTitle>
        {statusData.length > 0 ? (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {statusData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
                  {entry.name}: {entry.value}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">Sem dados de status.</p>
        )}
      </Card>

      <Card>
        <CardTitle>Receita</CardTitle>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
              <Bar dataKey="value" fill="#5b5bf5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
