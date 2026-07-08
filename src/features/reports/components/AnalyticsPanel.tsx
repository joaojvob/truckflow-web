import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { reportsApi } from '@/features/reports/services/reports-api'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { getApiErrorMessage } from '@/shared/lib/api-client'
import { formatCurrency } from '@/shared/lib/format'

/**
 * Painel analítico reutilizável (usado na aba "Análise" do dashboard).
 */
export function AnalyticsPanel() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['reports', 'analytics', from, to],
    queryFn: () => reportsApi.analytics({ from: from || undefined, to: to || undefined }),
  })

  if (isLoading) return <LoadingState message="Gerando análise..." />
  if (isError || !data) {
    return <ErrorMessage message={getApiErrorMessage(error, 'Não foi possível carregar a análise.')} />
  }

  return (
    <div>
      <Card className="mb-6 grid gap-4 p-4 sm:grid-cols-4">
        <div>
          <Label htmlFor="from">De</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="to">Até</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="flex items-end sm:col-span-2">
          <Button onClick={() => void refetch()}>Filtrar</Button>
        </div>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-pastel-blue p-4">
          <p className="text-xs text-muted">Fretes concluídos</p>
          <p className="text-2xl font-bold">{data.summary.freight_count}</p>
        </Card>
        <Card className="bg-pastel-green p-4">
          <p className="text-xs text-muted">Receita</p>
          <p className="text-2xl font-bold">{formatCurrency(data.summary.revenue)}</p>
        </Card>
        <Card className="bg-pastel-orange p-4">
          <p className="text-xs text-muted">Custos</p>
          <p className="text-2xl font-bold">{formatCurrency(data.summary.costs)}</p>
        </Card>
        <Card className="bg-pastel-cyan p-4">
          <p className="text-xs text-muted">Resultado líquido</p>
          <p className="text-2xl font-bold">{formatCurrency(data.summary.net)}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-4 font-semibold">Receita por mês</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.revenue_by_month}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
              <Bar dataKey="revenue" fill="#5b5bf5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="mb-4 font-semibold">Top tipos de carga</h3>
          <div className="space-y-2">
            {data.by_cargo_type.length === 0 ? (
              <p className="text-sm text-muted">Sem dados no período.</p>
            ) : (
              data.by_cargo_type.map((item) => (
                <div key={item.cargo_type} className="flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-medium">
                    {item.total} fretes · {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <h3 className="mb-4 font-semibold">Desempenho por motorista</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted">
                  <th className="pb-2">Motorista</th>
                  <th className="pb-2">Fretes</th>
                  <th className="pb-2">Receita</th>
                  <th className="pb-2">Km</th>
                  <th className="pb-2">Nota</th>
                </tr>
              </thead>
              <tbody>
                {data.by_driver.map((d) => (
                  <tr key={d.driver_id} className="border-b border-border/50">
                    <td className="py-2">{d.driver_name ?? '—'}</td>
                    <td className="py-2">{d.freights}</td>
                    <td className="py-2">{formatCurrency(d.revenue)}</td>
                    <td className="py-2">{d.distance_km.toFixed(0)}</td>
                    <td className="py-2">{d.avg_rating || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
