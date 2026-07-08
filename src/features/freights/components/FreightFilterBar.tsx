import { useQuery } from '@tanstack/react-query'
import type { FreightFilters } from '@/features/freights/services/freights-api'
import { geoApi } from '@/features/geo/services/geo-api'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'pending', label: 'Pendente' },
  { value: 'assigned', label: 'Atribuído' },
  { value: 'accepted', label: 'Aceito' },
  { value: 'ready', label: 'Pronto' },
  { value: 'in_transit', label: 'Em trânsito' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'rejected', label: 'Recusado' },
]

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'latest', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigos' },
  { value: 'deadline', label: 'Prazo' },
  { value: 'price', label: 'Maior valor' },
]

interface Props {
  filters: FreightFilters
  onChange: (filters: FreightFilters) => void
}

export function FreightFilterBar({ filters, onChange }: Props) {
  const { data: cargoTypes } = useQuery({
    queryKey: ['cargo-types'],
    queryFn: () => geoApi.cargoTypes(),
    staleTime: 1000 * 60 * 60,
  })

  function update(patch: Partial<FreightFilters>) {
    onChange({ ...filters, ...patch })
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '')

  return (
    <Card className="mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
      <Input
        placeholder="Buscar carga, cidade..."
        value={filters.search ?? ''}
        onChange={(e) => update({ search: e.target.value || undefined })}
      />
      <Select value={filters.status ?? ''} onChange={(e) => update({ status: e.target.value || undefined })}>
        <option value="">Todos os status</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>
      <Select
        value={filters.cargo_type ?? ''}
        onChange={(e) => update({ cargo_type: e.target.value || undefined })}
      >
        <option value="">Todos os tipos</option>
        {(cargoTypes ?? []).map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </Select>
      <Select value={filters.sort ?? 'latest'} onChange={(e) => update({ sort: e.target.value })}>
        {SORT_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>
      <Button
        variant="ghost"
        disabled={!hasActiveFilters}
        onClick={() => onChange({})}
      >
        Limpar filtros
      </Button>
    </Card>
  )
}
