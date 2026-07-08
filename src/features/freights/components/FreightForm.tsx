import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm, type DefaultValues, type Resolver } from 'react-hook-form'
import { useLinkedDrivers } from '@/features/drivers/hooks/useDrivers'
import { geoApi, type FreightCalculationResult } from '@/features/geo/services/geo-api'
import { AddressSection } from '@/features/freights/components/AddressSection'
import { RouteSummary } from '@/features/freights/components/RouteSummary'
import {
  defaultFreightFormValues,
  freightFormSchema,
  type FreightFormData,
} from '@/features/freights/schemas/freight.schema'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { Select } from '@/shared/components/ui/Select'
import { Textarea } from '@/shared/components/ui/Textarea'
import { getApiErrorMessage } from '@/shared/lib/api-client'

interface FreightFormProps {
  defaultValues?: Partial<FreightFormData>
  onSubmit: (data: FreightFormData) => Promise<void>
  submitLabel: string
  errorMessage?: string | null
  isLoading?: boolean
}

export function FreightForm({
  defaultValues,
  onSubmit,
  submitLabel,
  errorMessage,
  isLoading = false,
}: FreightFormProps) {
  const { data: driversData, isLoading: loadingDrivers } = useLinkedDrivers()
  const { data: cargoTypes = [] } = useQuery({
    queryKey: ['geo', 'cargo-types'],
    queryFn: () => geoApi.cargoTypes(),
  })

  const [calculation, setCalculation] = useState<FreightCalculationResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [calcError, setCalcError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FreightFormData>({
    resolver: zodResolver(freightFormSchema) as Resolver<FreightFormData>,
    defaultValues: {
      ...defaultFreightFormValues,
      ...(defaultValues as DefaultValues<FreightFormData>),
    },
  })

  const handleCalculate = async () => {
    const values = watch()
    const originLat = Number(values.origin_lat)
    const originLng = Number(values.origin_lng)
    const destLat = Number(values.destination_lat)
    const destLng = Number(values.destination_lng)

    if (!originLat || !originLng || !destLat || !destLng) {
      setCalcError('Preencha origem e destino com coordenadas antes de calcular.')
      return
    }

    setCalculating(true)
    setCalcError(null)

    try {
      const result = await geoApi.calculate({
        origin_lat: originLat,
        origin_lng: originLng,
        destination_lat: destLat,
        destination_lng: destLng,
        weight: values.weight ? Number(values.weight) : undefined,
        price_per_km: values.price_per_km ? Number(values.price_per_km) : undefined,
        price_per_ton: values.price_per_ton ? Number(values.price_per_ton) : undefined,
        toll_cost: values.toll_cost ? Number(values.toll_cost) : undefined,
        fuel_cost: values.fuel_cost ? Number(values.fuel_cost) : undefined,
      })

      setCalculation(result)
      setValue('distance_km', result.distance_km)
      setValue('estimated_hours', result.estimated_hours)
    } catch (error) {
      setCalcError(getApiErrorMessage(error, 'Não foi possível calcular a rota.'))
    } finally {
      setCalculating(false)
    }
  }

  if (loadingDrivers) {
    return <LoadingState message="Carregando motoristas..." />
  }

  const drivers = driversData?.data ?? []
  const fieldErrors = Object.values(errors)
    .map((e) => e?.message)
    .filter(Boolean) as string[]

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {(errorMessage || fieldErrors.length > 0) ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage ? <p className="font-medium">{errorMessage}</p> : null}
          {fieldErrors.length > 0 ? (
            <ul className="mt-1 list-inside list-disc">
              {fieldErrors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="driver_id">Motorista</Label>
          <Select id="driver_id" hasError={!!errors.driver_id} {...register('driver_id')}>
            <option value={0}>Selecione...</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </Select>
          {errors.driver_id ? <p className="mt-1 text-xs text-red-600">{errors.driver_id.message}</p> : null}
        </div>

        <div>
          <Label htmlFor="cargo_type">Tipo de carga</Label>
          <Select id="cargo_type" hasError={!!errors.cargo_type} {...register('cargo_type')}>
            <option value="">Selecione...</option>
            {cargoTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          {errors.cargo_type ? <p className="mt-1 text-xs text-red-600">{errors.cargo_type.message}</p> : null}
        </div>

        <div>
          <Label htmlFor="cargo_name">Descrição curta (opcional)</Label>
          <Input id="cargo_name" placeholder="Ex: Soja safra 2026" {...register('cargo_name')} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="cargo_description">Observações da carga</Label>
          <Textarea id="cargo_description" rows={2} {...register('cargo_description')} />
        </div>

        <div>
          <Label htmlFor="weight">Peso (t)</Label>
          <Input id="weight" type="number" step="0.01" hasError={!!errors.weight} {...register('weight')} />
        </div>

        <div>
          <Label htmlFor="deadline_at">Prazo de entrega</Label>
          <Input id="deadline_at" type="datetime-local" {...register('deadline_at')} />
        </div>
      </section>

      <AddressSection
        title="Origem"
        prefix="origin"
        register={register}
        errors={errors}
        setValue={setValue}
        watch={watch}
      />

      <AddressSection
        title="Destino"
        prefix="destination"
        register={register}
        errors={errors}
        setValue={setValue}
        watch={watch}
      />

      <section className="grid gap-4 sm:grid-cols-2">
        <h3 className="sm:col-span-2 text-sm font-semibold text-text">Preço e cálculo</h3>
        <div>
          <Label htmlFor="price_per_km">R$/km</Label>
          <Input id="price_per_km" type="number" step="0.01" {...register('price_per_km')} />
        </div>
        <div>
          <Label htmlFor="price_per_ton">R$/ton</Label>
          <Input id="price_per_ton" type="number" step="0.01" {...register('price_per_ton')} />
        </div>
        <div>
          <Label htmlFor="toll_cost">Pedágio (R$)</Label>
          <Input id="toll_cost" type="number" step="0.01" {...register('toll_cost')} />
        </div>
        <div>
          <Label htmlFor="fuel_cost">Combustível (R$)</Label>
          <Input id="fuel_cost" type="number" step="0.01" {...register('fuel_cost')} />
        </div>
        <div>
          <Label htmlFor="distance_km">Distância (km)</Label>
          <Input id="distance_km" type="number" step="0.1" {...register('distance_km')} />
        </div>
        <div>
          <Label htmlFor="estimated_hours">Tempo estimado (h)</Label>
          <Input id="estimated_hours" type="number" step="0.1" {...register('estimated_hours')} />
        </div>
        <div className="sm:col-span-2">
          <Button type="button" variant="secondary" isLoading={calculating} onClick={() => void handleCalculate()}>
            Calcular rota e frete
          </Button>
          {calcError ? <p className="mt-2 text-xs text-red-600">{calcError}</p> : null}
        </div>
      </section>

      <RouteSummary
        originCity={watch('origin_city') || '—'}
        originState={watch('origin_state') || '—'}
        destinationCity={watch('destination_city') || '—'}
        destinationState={watch('destination_state') || '—'}
        calculation={calculation}
      />

      <Button type="submit" isLoading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  )
}
