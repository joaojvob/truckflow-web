import type { DriverLocation, SosPayload } from '@/features/tracking/types/tracking.types'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'

interface FreightLiveTrackingPanelProps {
  location: DriverLocation | null
  isConnected: boolean
  isReverbConfigured: boolean
  isDriver: boolean
  sosAlert: SosPayload | null
  onDismissSos: () => void
}

export function FreightLiveTrackingPanel({
  location,
  isConnected,
  isReverbConfigured,
  isDriver,
  sosAlert,
  onDismissSos,
}: FreightLiveTrackingPanelProps) {
  return (
    <div className="mb-4 space-y-3">
      {sosAlert ? (
        <Card className="border-red-200 bg-red-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-red-900">Alerta SOS</p>
              <p className="mt-1 text-sm text-red-800">
                {sosAlert.message ?? 'O motorista acionou o botão de emergência.'}
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={onDismissSos}>
              Dispensar
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {isReverbConfigured ? (
          isConnected ? (
            <Badge tone="success">Ao vivo</Badge>
          ) : (
            <Badge tone="warning">Conectando...</Badge>
          )
        ) : (
          <Badge tone="default">Atualização a cada 30s (Reverb não configurado)</Badge>
        )}

        {isDriver ? (
          <span className="text-muted">Enviando localização automaticamente durante a viagem.</span>
        ) : null}

        {location?.lat != null && location.lng != null ? (
          <span className="text-muted">
            Última posição: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            {location.speed_kmh != null ? ` · ${Number(location.speed_kmh).toFixed(0)} km/h` : ''}
            {location.recorded_at
              ? ` · ${new Date(location.recorded_at).toLocaleTimeString('pt-BR')}`
              : ''}
          </span>
        ) : (
          <span className="text-muted">Aguardando primeira posição GPS.</span>
        )}
      </div>
    </div>
  )
}
