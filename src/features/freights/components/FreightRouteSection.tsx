import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Freight } from '@/features/freights/types/freight.types'
import { routeApi } from '@/features/freights/services/route-api'
import {
  waypointsApi,
  type CreateWaypointPayload,
  type Waypoint,
  type WaypointType,
} from '@/features/waypoints/services/waypoints-api'
import { FreightLiveTrackingPanel } from '@/features/tracking/components/FreightLiveTrackingPanel'
import { useDriverLocationReporter } from '@/features/tracking/hooks/useDriverLocationReporter'
import { useFreightLiveTracking } from '@/features/tracking/hooks/useFreightLiveTracking'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card, CardDescription, CardTitle } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { Select } from '@/shared/components/ui/Select'
import { getApiErrorMessage } from '@/shared/lib/api-client'
import { getEffectiveTenantId } from '@/shared/lib/tenant-context'
import { FreightRouteMap } from '@/features/freights/components/FreightRouteMap'

const WAYPOINT_TYPES: Array<{ value: WaypointType; label: string }> = [
  { value: 'fuel_stop', label: 'Posto de combustível' },
  { value: 'rest_stop', label: 'Ponto de descanso' },
  { value: 'toll', label: 'Pedágio' },
  { value: 'delivery_point', label: 'Ponto de entrega' },
  { value: 'weigh_station', label: 'Balança' },
  { value: 'custom', label: 'Personalizado' },
]

interface Props {
  freight: Freight
  isManager: boolean
  isDriver: boolean
}

export function FreightRouteSection({ freight, isManager, isDriver }: Props) {
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const user = useAuthStore((state) => state.user)
  const isLive = freight.status === 'in_transit'
  const tenantId = getEffectiveTenantId(user?.tenant?.id)

  const tracking = useFreightLiveTracking(freight.id, tenantId, isLive)
  useDriverLocationReporter(freight.id, isDriver && isLive)

  const { data: waypoints = [], isLoading } = useQuery({
    queryKey: ['waypoints', freight.id],
    queryFn: () => waypointsApi.list(freight.id),
  })

  const { data: route } = useQuery({
    queryKey: ['freight-route', freight.id],
    queryFn: () => routeApi.get(freight.id),
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['waypoints', freight.id] })
    await queryClient.invalidateQueries({ queryKey: ['freight-route', freight.id] })
    await queryClient.invalidateQueries({ queryKey: ['freights', freight.id] })
  }

  const calculateRouteMutation = useMutation({
    mutationFn: () => routeApi.calculate(freight.id),
    onSuccess: async () => {
      setErrorMessage(null)
      await invalidate()
    },
    onError: (err) => setErrorMessage(getApiErrorMessage(err, 'Não foi possível calcular a rota.')),
  })

  const polyline = route?.polyline ?? freight.route?.polyline ?? null

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              Mapa da rota
              {isLive ? <Badge tone="success">Em trânsito</Badge> : null}
            </CardTitle>
            <CardDescription>Origem, paradas, destino e posição do motorista.</CardDescription>
          </div>
          {isManager ? (
            <Button
              size="sm"
              variant="secondary"
              isLoading={calculateRouteMutation.isPending}
              onClick={() => calculateRouteMutation.mutate()}
            >
              Recalcular rota (Google)
            </Button>
          ) : null}
        </div>

        <div className="mt-4">
          {isLive ? (
            <FreightLiveTrackingPanel
              location={tracking.location}
              isConnected={tracking.isConnected}
              isReverbConfigured={tracking.isReverbConfigured}
              isDriver={isDriver}
              sosAlert={tracking.sosAlert}
              onDismissSos={tracking.clearSos}
            />
          ) : null}

          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted">Carregando mapa...</div>
          ) : (
            <FreightRouteMap
              freight={freight}
              waypoints={waypoints}
              polyline={polyline}
              driverLocation={isLive ? tracking.location : null}
              trail={isLive ? tracking.trail : []}
            />
          )}
        </div>
        {errorMessage ? <div className="mt-3"><ErrorMessage message={errorMessage} /></div> : null}
      </Card>

      <WaypointsPanel
        freight={freight}
        waypoints={waypoints}
        isManager={isManager}
        isDriver={isDriver}
        onChanged={invalidate}
      />
    </div>
  )
}

function WaypointsPanel({
  freight,
  waypoints,
  isManager,
  isDriver,
  onChanged,
}: {
  freight: Freight
  waypoints: Waypoint[]
  isManager: boolean
  isDriver: boolean
  onChanged: () => Promise<void>
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateWaypointPayload>({
    name: '',
    type: 'fuel_stop',
    lat: freight.origin?.lat ?? 0,
    lng: freight.origin?.lng ?? 0,
    mandatory: false,
  })

  const mutation = useMutation({
    mutationFn: async (action: () => Promise<unknown>) => action(),
    onSuccess: async () => {
      setErrorMessage(null)
      await onChanged()
    },
    onError: (err) => setErrorMessage(getApiErrorMessage(err)),
  })

  const sorted = [...waypoints].sort((a, b) => a.order - b.order)

  function moveUp(index: number) {
    if (index <= 0) return
    const ids = sorted.map((w) => w.id)
    ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
    mutation.mutate(() => waypointsApi.reorder(freight.id, ids))
  }

  function moveDown(index: number) {
    if (index >= sorted.length - 1) return
    const ids = sorted.map((w) => w.id)
    ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
    mutation.mutate(() => waypointsApi.reorder(freight.id, ids))
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle>Paradas (waypoints)</CardTitle>
          <CardDescription>Pontos intermediários da viagem.</CardDescription>
        </div>
        {isManager ? (
          <Button size="sm" variant="secondary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancelar' : 'Adicionar parada'}
          </Button>
        ) : null}
      </div>

      {showForm && isManager ? (
        <form
          className="mt-4 grid gap-3 rounded-xl border border-border bg-slate-50 p-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate(async () => {
              await waypointsApi.create(freight.id, form)
              setShowForm(false)
              setForm({ name: '', type: 'fuel_stop', lat: freight.origin?.lat ?? 0, lng: freight.origin?.lng ?? 0 })
            })
          }}
        >
          <div>
            <Label htmlFor="wp_name">Nome</Label>
            <Input id="wp_name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="wp_type">Tipo</Label>
            <Select id="wp_type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as WaypointType }))}>
              {WAYPOINT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="wp_lat">Latitude</Label>
            <Input id="wp_lat" type="number" step="any" required value={form.lat} onChange={(e) => setForm((f) => ({ ...f, lat: Number(e.target.value) }))} />
          </div>
          <div>
            <Label htmlFor="wp_lng">Longitude</Label>
            <Input id="wp_lng" type="number" step="any" required value={form.lng} onChange={(e) => setForm((f) => ({ ...f, lng: Number(e.target.value) }))} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="wp_address">Endereço (opcional)</Label>
            <Input id="wp_address" value={form.address ?? ''} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" isLoading={mutation.isPending}>Salvar parada</Button>
          </div>
        </form>
      ) : null}

      {sorted.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Nenhuma parada cadastrada.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {sorted.map((wp, index) => (
            <li key={wp.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-lg">{wp.type_icon}</span>
                <div>
                  <p className="font-medium text-text">
                    {index + 1}. {wp.name}
                  </p>
                  <p className="text-xs text-muted">
                    {wp.type_label}
                    {wp.lat != null && wp.lng != null ? ` · ${wp.lat.toFixed(4)}, ${wp.lng.toFixed(4)}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {wp.is_completed ? <Badge tone="success">Concluído</Badge> : null}
                {wp.is_visited && !wp.is_completed ? <Badge tone="warning">No local</Badge> : null}
                {wp.mandatory ? <Badge tone="info">Obrigatório</Badge> : null}

                {isManager ? (
                  <>
                    <Button size="sm" variant="ghost" disabled={index === 0 || mutation.isPending} onClick={() => moveUp(index)}>↑</Button>
                    <Button size="sm" variant="ghost" disabled={index === sorted.length - 1 || mutation.isPending} onClick={() => moveDown(index)}>↓</Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={mutation.isPending}
                      onClick={() => mutation.mutate(() => waypointsApi.remove(freight.id, wp.id))}
                    >
                      Remover
                    </Button>
                  </>
                ) : null}

                {isDriver && freight.status === 'in_transit' ? (
                  <>
                    {!wp.is_visited ? (
                      <Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate(() => waypointsApi.checkin(freight.id, wp.id))}>
                        Check-in
                      </Button>
                    ) : !wp.is_completed ? (
                      <Button size="sm" variant="secondary" disabled={mutation.isPending} onClick={() => mutation.mutate(() => waypointsApi.checkout(freight.id, wp.id))}>
                        Check-out
                      </Button>
                    ) : null}
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {errorMessage ? <div className="mt-3"><ErrorMessage message={errorMessage} /></div> : null}
    </Card>
  )
}
