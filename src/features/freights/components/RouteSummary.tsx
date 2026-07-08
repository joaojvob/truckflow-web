import type { FreightCalculationResult } from '@/features/geo/services/geo-api'
import { Card } from '@/shared/components/ui/Card'
import { formatCurrency } from '@/shared/lib/format'

interface RouteSummaryProps {
  originCity: string
  originState: string
  destinationCity: string
  destinationState: string
  calculation: FreightCalculationResult | null
}

export function RouteSummary({
  originCity,
  originState,
  destinationCity,
  destinationState,
  calculation,
}: RouteSummaryProps) {
  if (!calculation) return null

  const hours = Math.floor(calculation.estimated_hours)
  const minutes = Math.round((calculation.estimated_hours - hours) * 60)

  return (
    <Card className="space-y-3 bg-pastel-purple p-4">
      <h3 className="text-sm font-semibold text-text">Rota estimada</h3>
      <div className="flex items-center gap-2 text-sm">
        <span className="rounded-lg bg-white px-2 py-1 font-medium">
          {originCity}/{originState}
        </span>
        <span className="text-muted">→</span>
        <span className="rounded-lg bg-white px-2 py-1 font-medium">
          {destinationCity}/{destinationState}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted">Distância</p>
          <p className="font-semibold">{calculation.distance_km.toFixed(1)} km</p>
        </div>
        <div>
          <p className="text-xs text-muted">Tempo</p>
          <p className="font-semibold">
            {hours}h{minutes > 0 ? ` ${minutes}min` : ''}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted">Preço estimado</p>
          <p className="font-semibold text-primary">{formatCurrency(calculation.pricing.total_price)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Provedor</p>
          <p className="font-semibold capitalize">{calculation.provider}</p>
        </div>
      </div>
      <p className="text-xs text-muted">
        Rota calculada em linha reta com fator rodoviário (sem mapa). Ao integrar Google Maps, a rota será
        refinada automaticamente.
      </p>
    </Card>
  )
}
