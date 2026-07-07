import { Link } from 'react-router-dom'
import type { Freight } from '@/features/freights/types/freight.types'
import { FreightStatusBadge } from '@/features/freights/components/FreightStatusBadge'
import { Card } from '@/shared/components/ui/Card'
import { ROUTES } from '@/shared/constants/routes'
import { formatCurrency, formatKm } from '@/shared/lib/format'

interface FreightTableProps {
  freights: Freight[]
}

export function FreightTable({ freights }: FreightTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted">Carga</th>
            <th className="px-4 py-3 text-left font-medium text-muted">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted">Motorista</th>
            <th className="px-4 py-3 text-left font-medium text-muted">Distância</th>
            <th className="px-4 py-3 text-left font-medium text-muted">Valor</th>
            <th className="px-4 py-3 text-right font-medium text-muted">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {freights.map((freight) => (
            <tr key={freight.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="font-medium text-text">{freight.cargo_name}</div>
                <div className="text-xs text-muted">
                  {freight.origin_address} → {freight.destination_address}
                </div>
              </td>
              <td className="px-4 py-3">
                <FreightStatusBadge status={freight.status} label={freight.status_label} />
              </td>
              <td className="px-4 py-3 text-text">{freight.driver?.name ?? '—'}</td>
              <td className="px-4 py-3 text-text">{formatKm(freight.distance_km)}</td>
              <td className="px-4 py-3 text-text">
                {freight.total_price != null ? formatCurrency(freight.total_price) : '—'}
              </td>
              <td className="px-4 py-3 text-right">
                <Link className="font-medium text-primary hover:underline" to={ROUTES.freightDetail(freight.id)}>
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function FreightSummaryCard({ freight }: { freight: Freight }) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-text">{freight.cargo_name}</h2>
          <p className="mt-1 text-sm text-muted">Frete #{freight.id}</p>
        </div>
        <FreightStatusBadge status={freight.status} label={freight.status_label} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Origem</dt>
          <dd className="font-medium text-text">{freight.origin_address ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-muted">Destino</dt>
          <dd className="font-medium text-text">{freight.destination_address ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-muted">Motorista</dt>
          <dd className="font-medium text-text">{freight.driver?.name ?? 'Não atribuído'}</dd>
        </div>
        <div>
          <dt className="text-muted">Valor total</dt>
          <dd className="font-medium text-text">
            {freight.total_price != null ? formatCurrency(freight.total_price) : '—'}
          </dd>
        </div>
      </dl>
    </Card>
  )
}
