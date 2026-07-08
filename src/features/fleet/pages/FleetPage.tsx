import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTrucks, useTrailers } from '@/features/fleet/hooks/useFleet'
import { CrlvSection } from '@/features/fleet/components/CrlvSection'
import { VehicleStatusBadge } from '@/features/fleet/components/VehicleStatusBadge'
import { trailersApi, trucksApi } from '@/features/fleet/services/fleet-api'
import type {
  CreateTrailerPayload,
  CreateTruckPayload,
  HitchType,
  Trailer,
  TrailerType,
  Truck,
  VehicleStatus,
} from '@/features/fleet/types/fleet.types'
import { useLinkedDrivers } from '@/features/drivers/hooks/useDrivers'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { Modal } from '@/shared/components/ui/Modal'
import { Select } from '@/shared/components/ui/Select'
import { getApiErrorMessage } from '@/shared/lib/api-client'
import { isManagerOrAdmin } from '@/shared/lib/role-routing'

type Tab = 'trucks' | 'trailers'

const STATUS_OPTIONS: Array<{ value: VehicleStatus; label: string }> = [
  { value: 'available', label: 'Disponível' },
  { value: 'in_use', label: 'Em uso' },
  { value: 'maintenance', label: 'Em manutenção' },
  { value: 'inactive', label: 'Inativo' },
]

const HITCH_OPTIONS: Array<{ value: HitchType; label: string }> = [
  { value: 'fifth_wheel', label: 'Quinta roda' },
  { value: 'pintle', label: 'Pino rei' },
  { value: 'drawbar', label: 'Barra de tração' },
]

const TRAILER_TYPE_OPTIONS: Array<{ value: TrailerType; label: string }> = [
  { value: 'flatbed', label: 'Prancha' },
  { value: 'refrigerated', label: 'Baú frigorífico' },
  { value: 'dry_van', label: 'Baú seco' },
  { value: 'tanker', label: 'Tanque' },
  { value: 'sider', label: 'Sider' },
  { value: 'hopper', label: 'Graneleiro' },
  { value: 'container', label: 'Porta-contêiner' },
  { value: 'logging', label: 'Florestal' },
  { value: 'lowboy', label: 'Prancha rebaixada' },
  { value: 'livestock', label: 'Boiadeiro' },
]

export function FleetPage() {
  const [tab, setTab] = useState<Tab>('trucks')
  const user = useAuthStore((state) => state.user)
  const isManager = user ? isManagerOrAdmin(user.role) : false

  return (
    <div>
      <PageHeader
        title="Frota"
        description={isManager ? 'Caminhões e reboques da transportadora.' : 'Seus veículos cadastrados.'}
      />

      <div className="mb-4 flex gap-2 border-b border-border">
        <TabButton active={tab === 'trucks'} onClick={() => setTab('trucks')}>Caminhões</TabButton>
        <TabButton active={tab === 'trailers'} onClick={() => setTab('trailers')}>Reboques</TabButton>
      </div>

      {tab === 'trucks' ? <TrucksTab isManager={isManager} userId={user?.id} isAdmin={user?.role === 'admin' || user?.role === 'super_admin'} /> : null}
      {tab === 'trailers' ? <TrailersTab isManager={isManager} userId={user?.id} isAdmin={user?.role === 'admin' || user?.role === 'super_admin'} /> : null}
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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

function TrucksTab({ isManager, userId, isAdmin }: { isManager: boolean; userId?: number; isAdmin: boolean }) {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ mode: 'create' } | { mode: 'edit'; truck: Truck } | null>(null)

  const { data, isLoading, isError, error } = useTrucks()
  const { data: driversData } = useLinkedDrivers()

  const trucks = (data?.data ?? []).filter((truck) => {
    if (!isManager && userId) return truck.driver?.id === userId
    if (statusFilter && truck.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return truck.plate.toLowerCase().includes(q) || truck.brand.toLowerCase().includes(q) || truck.model.toLowerCase().includes(q)
    }
    return true
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => trucksApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trucks'] }),
  })

  if (isLoading) return <LoadingState message="Carregando caminhões..." />
  if (isError) return <ErrorMessage message={getApiErrorMessage(error)} />

  return (
    <>
      <Card className="mb-4 grid gap-3 p-4 sm:grid-cols-4">
        <Input placeholder="Buscar placa, marca..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
        <div className="sm:col-span-2 flex justify-end">
          <Button onClick={() => setModal({ mode: 'create' })}>Cadastrar caminhão</Button>
        </div>
      </Card>

      {trucks.length === 0 ? (
        <EmptyState title="Nenhum caminhão" description="Cadastre o primeiro veículo da frota." />
      ) : (
        <div className="space-y-3">
          {trucks.map((truck) => (
            <Card key={truck.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-text">{truck.plate}</p>
                  <p className="text-sm text-muted">{truck.brand} {truck.model} · {truck.year}</p>
                  <p className="mt-1 text-xs text-muted">
                    {truck.max_weight} t · {truck.odometer.toLocaleString('pt-BR')} km
                    {truck.driver ? ` · ${truck.driver.name}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <VehicleStatusBadge status={truck.status} label={truck.status_label} />
                  {truck.crlv_expired ? <VehicleStatusBadge status="maintenance" label="CRLV vencido" /> : null}
                  <Button size="sm" variant="secondary" onClick={() => setModal({ mode: 'edit', truck })}>Editar</Button>
                  {isAdmin ? (
                    <Button size="sm" variant="ghost" disabled={removeMutation.isPending} onClick={() => removeMutation.mutate(truck.id)}>
                      Excluir
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? `Editar ${modal.truck.plate}` : 'Cadastrar caminhão'}
        size="lg"
      >
        {modal ? (
          <TruckForm
            truck={modal.mode === 'edit' ? modal.truck : undefined}
            drivers={isManager ? (driversData?.data ?? []) : []}
            onSaved={() => {
              void queryClient.invalidateQueries({ queryKey: ['trucks'] })
              setModal(null)
            }}
          />
        ) : null}
      </Modal>
    </>
  )
}

function TrailersTab({ isManager, userId, isAdmin }: { isManager: boolean; userId?: number; isAdmin: boolean }) {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ mode: 'create' } | { mode: 'edit'; trailer: Trailer } | null>(null)

  const { data, isLoading, isError, error } = useTrailers()
  const { data: driversData } = useLinkedDrivers()

  const trailers = (data?.data ?? []).filter((trailer) => {
    if (!isManager && userId) return trailer.driver?.id === userId
    if (statusFilter && trailer.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return trailer.plate.toLowerCase().includes(q) || (trailer.type_label ?? trailer.type).toLowerCase().includes(q)
    }
    return true
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => trailersApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trailers'] }),
  })

  if (isLoading) return <LoadingState message="Carregando reboques..." />
  if (isError) return <ErrorMessage message={getApiErrorMessage(error)} />

  return (
    <>
      <Card className="mb-4 grid gap-3 p-4 sm:grid-cols-4">
        <Input placeholder="Buscar placa, tipo..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
        <div className="sm:col-span-2 flex justify-end">
          <Button onClick={() => setModal({ mode: 'create' })}>Cadastrar reboque</Button>
        </div>
      </Card>

      {trailers.length === 0 ? (
        <EmptyState title="Nenhum reboque" description="Cadastre o primeiro reboque da frota." />
      ) : (
        <div className="space-y-3">
          {trailers.map((trailer) => (
            <Card key={trailer.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-text">{trailer.plate}</p>
                  <p className="text-sm text-muted">{trailer.type_label ?? trailer.type}</p>
                  <p className="mt-1 text-xs text-muted">
                    {trailer.max_weight} t
                    {trailer.length ? ` · ${trailer.length} m` : ''}
                    {trailer.driver ? ` · ${trailer.driver.name}` : ''}
                    {trailer.is_loaded ? ' · Carregado' : ' · Vazio'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <VehicleStatusBadge status={trailer.status} label={trailer.status_label} />
                  {trailer.crlv_expired ? <VehicleStatusBadge status="maintenance" label="CRLV vencido" /> : null}
                  <Button size="sm" variant="secondary" onClick={() => setModal({ mode: 'edit', trailer })}>Editar</Button>
                  {isAdmin ? (
                    <Button size="sm" variant="ghost" disabled={removeMutation.isPending} onClick={() => removeMutation.mutate(trailer.id)}>
                      Excluir
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? `Editar ${modal.trailer.plate}` : 'Cadastrar reboque'}
        size="lg"
      >
        {modal ? (
          <TrailerForm
            trailer={modal.mode === 'edit' ? modal.trailer : undefined}
            drivers={isManager ? (driversData?.data ?? []) : []}
            onSaved={() => {
              void queryClient.invalidateQueries({ queryKey: ['trailers'] })
              setModal(null)
            }}
          />
        ) : null}
      </Modal>
    </>
  )
}

function TruckForm({
  truck,
  drivers,
  onSaved,
}: {
  truck?: Truck
  drivers: Array<{ id: number; name: string }>
  onSaved: () => void
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [form, setForm] = useState<CreateTruckPayload & { status?: VehicleStatus }>({
    plate: truck?.plate ?? '',
    brand: truck?.brand ?? '',
    model: truck?.model ?? '',
    year: truck?.year ?? new Date().getFullYear(),
    max_weight: truck?.max_weight ?? 0,
    renavam: truck?.renavam ?? '',
    color: truck?.color ?? '',
    axle_count: truck?.axle_count ?? 2,
    has_trailer_hitch: truck?.has_trailer_hitch ?? false,
    hitch_type: truck?.hitch_type ?? undefined,
    odometer: truck?.odometer ?? 0,
    driver_id: truck?.driver?.id,
    status: truck?.status,
  })

  const mutation = useMutation({
    mutationFn: () =>
      truck
        ? trucksApi.update(truck.id, form)
        : trucksApi.create(form),
    onSuccess: () => {
      setErrorMessage(null)
      onSaved()
    },
    onError: (err) => setErrorMessage(getApiErrorMessage(err)),
  })

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="plate">Placa</Label>
          <Input id="plate" required value={form.plate} onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="renavam">RENAVAM</Label>
          <Input id="renavam" value={form.renavam ?? ''} onChange={(e) => setForm((f) => ({ ...f, renavam: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="brand">Marca</Label>
          <Input id="brand" required value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="model">Modelo</Label>
          <Input id="model" required value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="year">Ano</Label>
          <Input id="year" type="number" required value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))} />
        </div>
        <div>
          <Label htmlFor="max_weight">PBT (toneladas)</Label>
          <Input id="max_weight" type="number" step="0.01" required value={form.max_weight} onChange={(e) => setForm((f) => ({ ...f, max_weight: Number(e.target.value) }))} />
        </div>
        <div>
          <Label htmlFor="odometer">Odômetro (km)</Label>
          <Input id="odometer" type="number" value={form.odometer ?? 0} onChange={(e) => setForm((f) => ({ ...f, odometer: Number(e.target.value) }))} />
        </div>
        {truck ? (
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" value={form.status ?? 'available'} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as VehicleStatus }))}>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </div>
        ) : null}
        {drivers.length > 0 ? (
          <div>
            <Label htmlFor="driver_id">Motorista</Label>
            <Select
              id="driver_id"
              value={form.driver_id ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, driver_id: e.target.value ? Number(e.target.value) : undefined }))}
            >
              <option value="">Sem motorista</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
        ) : null}
      </div>

      {truck ? (
        <CrlvSection
          hasDocument={truck.crlv_has_document ?? false}
          expiry={truck.crlv_expiry}
          expired={truck.crlv_expired}
          onUpload={(file, expiry) => trucksApi.uploadCrlv(truck.id, file, expiry).then(() => onSaved())}
          onDownload={truck.crlv_has_document ? () => trucksApi.downloadCrlv(truck.id, truck.plate) : undefined}
        />
      ) : null}

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
      <div className="flex justify-end">
        <Button type="submit" isLoading={mutation.isPending}>{truck ? 'Salvar' : 'Cadastrar'}</Button>
      </div>
    </form>
  )
}

function TrailerForm({
  trailer,
  drivers,
  onSaved,
}: {
  trailer?: Trailer
  drivers: Array<{ id: number; name: string }>
  onSaved: () => void
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [form, setForm] = useState<CreateTrailerPayload & { status?: VehicleStatus; is_loaded?: boolean }>({
    plate: trailer?.plate ?? '',
    type: trailer?.type ?? 'dry_van',
    max_weight: trailer?.max_weight ?? 0,
    hitch_type: trailer?.hitch_type ?? 'fifth_wheel',
    renavam: trailer?.renavam ?? '',
    brand: trailer?.brand ?? '',
    model: trailer?.model ?? '',
    year: trailer?.year ?? undefined,
    axle_count: trailer?.axle_count ?? 2,
    length: trailer?.length ?? undefined,
    driver_id: trailer?.driver?.id,
    status: trailer?.status,
    is_loaded: trailer?.is_loaded ?? false,
  })

  const mutation = useMutation({
    mutationFn: () =>
      trailer
        ? trailersApi.update(trailer.id, form)
        : trailersApi.create(form),
    onSuccess: () => {
      setErrorMessage(null)
      onSaved()
    },
    onError: (err) => setErrorMessage(getApiErrorMessage(err)),
  })

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="t_plate">Placa</Label>
          <Input id="t_plate" required value={form.plate} onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="t_type">Tipo</Label>
          <Select id="t_type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TrailerType }))}>
            {TRAILER_TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="t_max_weight">Capacidade (toneladas)</Label>
          <Input id="t_max_weight" type="number" step="0.01" required value={form.max_weight} onChange={(e) => setForm((f) => ({ ...f, max_weight: Number(e.target.value) }))} />
        </div>
        <div>
          <Label htmlFor="t_hitch">Tipo de engate</Label>
          <Select id="t_hitch" value={form.hitch_type} onChange={(e) => setForm((f) => ({ ...f, hitch_type: e.target.value as HitchType }))}>
            {HITCH_OPTIONS.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="t_length">Comprimento (m)</Label>
          <Input id="t_length" type="number" step="0.1" value={form.length ?? ''} onChange={(e) => setForm((f) => ({ ...f, length: e.target.value ? Number(e.target.value) : undefined }))} />
        </div>
        {trailer ? (
          <>
            <div>
              <Label htmlFor="t_status">Status</Label>
              <Select id="t_status" value={form.status ?? 'available'} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as VehicleStatus }))}>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_loaded ?? false} onChange={(e) => setForm((f) => ({ ...f, is_loaded: e.target.checked }))} />
                Carregado
              </label>
            </div>
          </>
        ) : null}
        {drivers.length > 0 ? (
          <div>
            <Label htmlFor="t_driver_id">Motorista</Label>
            <Select
              id="t_driver_id"
              value={form.driver_id ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, driver_id: e.target.value ? Number(e.target.value) : undefined }))}
            >
              <option value="">Sem motorista</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
        ) : null}
      </div>

      {trailer ? (
        <CrlvSection
          hasDocument={trailer.crlv_has_document ?? false}
          expiry={trailer.crlv_expiry}
          expired={trailer.crlv_expired}
          onUpload={(file, expiry) => trailersApi.uploadCrlv(trailer.id, file, expiry).then(() => onSaved())}
          onDownload={trailer.crlv_has_document ? () => trailersApi.downloadCrlv(trailer.id, trailer.plate) : undefined}
        />
      ) : null}

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
      <div className="flex justify-end">
        <Button type="submit" isLoading={mutation.isPending}>{trailer ? 'Salvar' : 'Cadastrar'}</Button>
      </div>
    </form>
  )
}
