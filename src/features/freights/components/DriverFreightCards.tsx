import { Link } from 'react-router-dom'
import type { Freight } from '@/features/freights/types/freight.types'
import { FreightStatusBadge } from '@/features/freights/components/FreightStatusBadge'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import { ROUTES } from '@/shared/constants/routes'
import { formatCurrency } from '@/shared/lib/format'

interface DriverFreightCardsProps {
  freights: Freight[]
}

function getPendingLabel(freight: Freight): string | null {
  if (freight.status === 'assigned') return 'Aceitar frete'
  if (freight.status === 'accepted') {
    if (!freight.doping_approved && !freight.doping_tests?.some((t) => t.status === 'pending')) {
      return 'Enviar doping'
    }
    if (!freight.checklist_completed) return 'Enviar checklist'
    if (!freight.manager_approved) return 'Aguardando gestor'
  }
  if (freight.status === 'ready' && freight.manager_approved) return 'Iniciar viagem'
  if (freight.status === 'in_transit') return 'Finalizar viagem'
  return null
}

export function DriverFreightCards({ freights }: DriverFreightCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {freights.map((freight) => {
        const pendingLabel = getPendingLabel(freight)

        return (
        <Link key={freight.id} to={ROUTES.freightDetail(freight.id)}>
          <Card className="space-y-3 p-4 transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-text">
                  {freight.cargo_type_label ?? freight.cargo_name ?? 'Frete'}
                </p>
                <p className="text-xs text-muted">#{freight.id}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <FreightStatusBadge status={freight.status} label={freight.status_label} />
                {pendingLabel ? <Badge tone="warning">{pendingLabel}</Badge> : null}
              </div>
            </div>

            <div className="text-sm text-muted">
              <p className="truncate">
                <span className="font-medium text-text">De:</span> {freight.origin_address ?? '—'}
              </p>
              <p className="truncate">
                <span className="font-medium text-text">Para:</span> {freight.destination_address ?? '—'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-xs">
              {freight.distance_km ? <span>{freight.distance_km} km</span> : null}
              {freight.deadline_at ? (
                <span>Prazo: {new Date(freight.deadline_at).toLocaleDateString('pt-BR')}</span>
              ) : null}
              {freight.total_price ? (
                <span className="font-medium text-primary">{formatCurrency(freight.total_price)}</span>
              ) : null}
            </div>
          </Card>
        </Link>
        )
      })}
    </div>
  )
}
