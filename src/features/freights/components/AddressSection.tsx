import { useState } from 'react'
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { geoApi } from '@/features/geo/services/geo-api'
import type { FreightFormData } from '@/features/freights/schemas/freight.schema'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { getApiErrorMessage } from '@/shared/lib/api-client'

interface AddressSectionProps {
  title: string
  prefix: 'origin' | 'destination'
  register: ReturnType<typeof import('react-hook-form').useForm<FreightFormData>>['register']
  errors: Record<string, { message?: string } | undefined>
  setValue: UseFormSetValue<FreightFormData>
  watch: UseFormWatch<FreightFormData>
}

export function AddressSection({ title, prefix, register, errors, setValue, watch }: AddressSectionProps) {
  const [loadingCep, setLoadingCep] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)

  const handleCepLookup = async () => {
    const cep = watch(`${prefix}_cep`)
    if (!cep || cep.replace(/\D/g, '').length < 8) {
      setCepError('Informe um CEP válido.')
      return
    }

    setLoadingCep(true)
    setCepError(null)

    try {
      const result = await geoApi.lookupCep(cep)
      setValue(`${prefix}_cep`, result.cep)
      setValue(`${prefix}_street`, result.street ?? '')
      setValue(`${prefix}_neighborhood`, result.neighborhood ?? '')
      setValue(`${prefix}_city`, result.city ?? '')
      setValue(`${prefix}_state`, result.state ?? '')
      if (result.lat != null) setValue(`${prefix}_lat`, result.lat)
      if (result.lng != null) setValue(`${prefix}_lng`, result.lng)
      if (result.lat == null) {
        setCepError('CEP encontrado, mas sem coordenadas. Informe lat/lng manualmente.')
      }
    } catch (error) {
      setCepError(getApiErrorMessage(error, 'Não foi possível buscar o CEP.'))
    } finally {
      setLoadingCep(false)
    }
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <h3 className="sm:col-span-2 text-sm font-semibold text-text">{title}</h3>

      <div className="flex gap-2 sm:col-span-2">
        <div className="flex-1">
          <Label htmlFor={`${prefix}_cep`}>CEP</Label>
          <Input
            id={`${prefix}_cep`}
            placeholder="00000-000"
            hasError={!!errors[`${prefix}_cep`]}
            {...register(`${prefix}_cep`)}
          />
        </div>
        <div className="flex items-end">
          <Button type="button" variant="secondary" isLoading={loadingCep} onClick={() => void handleCepLookup()}>
            Buscar
          </Button>
        </div>
      </div>
      {cepError ? <p className="sm:col-span-2 text-xs text-amber-700">{cepError}</p> : null}

      <div className="sm:col-span-2">
        <Label htmlFor={`${prefix}_street`}>Rua</Label>
        <Input id={`${prefix}_street`} hasError={!!errors[`${prefix}_street`]} {...register(`${prefix}_street`)} />
      </div>

      <div>
        <Label htmlFor={`${prefix}_number`}>Número</Label>
        <Input id={`${prefix}_number`} {...register(`${prefix}_number`)} />
      </div>
      <div>
        <Label htmlFor={`${prefix}_complement`}>Complemento</Label>
        <Input id={`${prefix}_complement`} {...register(`${prefix}_complement`)} />
      </div>

      <div>
        <Label htmlFor={`${prefix}_neighborhood`}>Bairro</Label>
        <Input
          id={`${prefix}_neighborhood`}
          hasError={!!errors[`${prefix}_neighborhood`]}
          {...register(`${prefix}_neighborhood`)}
        />
      </div>
      <div>
        <Label htmlFor={`${prefix}_city`}>Cidade</Label>
        <Input id={`${prefix}_city`} hasError={!!errors[`${prefix}_city`]} {...register(`${prefix}_city`)} />
      </div>

      <div>
        <Label htmlFor={`${prefix}_state`}>UF</Label>
        <Input id={`${prefix}_state`} maxLength={2} hasError={!!errors[`${prefix}_state`]} {...register(`${prefix}_state`)} />
      </div>

      <div>
        <Label htmlFor={`${prefix}_lat`}>Latitude</Label>
        <Input
          id={`${prefix}_lat`}
          type="number"
          step="any"
          hasError={!!errors[`${prefix}_lat`]}
          {...register(`${prefix}_lat`)}
        />
      </div>
      <div>
        <Label htmlFor={`${prefix}_lng`}>Longitude</Label>
        <Input
          id={`${prefix}_lng`}
          type="number"
          step="any"
          hasError={!!errors[`${prefix}_lng`]}
          {...register(`${prefix}_lng`)}
        />
      </div>
    </section>
  )
}
