import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FreightForm } from '@/features/freights/components/FreightForm'
import type { FreightFormData } from '@/features/freights/schemas/freight.schema'
import { toFreightPayload } from '@/features/freights/schemas/freight.schema'
import { useFreight } from '@/features/freights/hooks/useFreights'
import { freightsApi } from '@/features/freights/services/freights-api'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { ROUTES } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/lib/api-client'

export function FreightEditPage() {
  const { id } = useParams()
  const freightId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: freight, isLoading, isError, error } = useFreight(freightId)

  const mutation = useMutation({
    mutationFn: (data: FreightFormData) => freightsApi.update(freightId, toFreightPayload(data)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['freights'] })
      await queryClient.invalidateQueries({ queryKey: ['freights', freightId] })
      navigate(ROUTES.freightDetail(freightId))
    },
    onError: (err) => {
      setErrorMessage(getApiErrorMessage(err, 'Não foi possível atualizar o frete.'))
    },
  })

  if (isLoading) {
    return <LoadingState message="Carregando frete..." />
  }

  if (isError || !freight) {
    return <ErrorMessage message={getApiErrorMessage(error, 'Frete não encontrado.')} />
  }

  if (freight.status === 'completed' || freight.status === 'cancelled') {
    return (
      <ErrorMessage message="Fretes concluídos ou cancelados não podem ser editados." />
    )
  }

  return (
    <div>
      <PageHeader
        title="Editar frete"
        description={`Frete #${freight.id}`}
        action={
          <Link
            className="text-sm font-medium text-primary hover:underline"
            to={ROUTES.freightDetail(freight.id)}
          >
            Cancelar
          </Link>
        }
      />
      <FreightForm
        submitLabel="Salvar alterações"
        errorMessage={errorMessage}
        isLoading={mutation.isPending}
        defaultValues={{
          driver_id: freight.driver?.id ?? 0,
          cargo_type: freight.cargo_type ?? '',
          cargo_name: freight.cargo_name ?? '',
          cargo_description: freight.cargo_description ?? '',
          weight: freight.weight ?? 0,
          origin_cep: freight.origin?.cep ?? '',
          origin_street: freight.origin?.street ?? '',
          origin_neighborhood: '',
          origin_city: freight.origin?.city ?? '',
          origin_state: freight.origin?.state ?? '',
          origin_lat: freight.origin?.lat ?? freight.origin_lat ?? 0,
          origin_lng: freight.origin?.lng ?? freight.origin_lng ?? 0,
          destination_cep: freight.destination?.cep ?? '',
          destination_street: freight.destination?.street ?? '',
          destination_neighborhood: '',
          destination_city: freight.destination?.city ?? '',
          destination_state: freight.destination?.state ?? '',
          destination_lat: freight.destination?.lat ?? freight.destination_lat ?? 0,
          destination_lng: freight.destination?.lng ?? freight.destination_lng ?? 0,
          distance_km: freight.distance_km ?? undefined,
          price_per_km: freight.price_per_km ?? undefined,
          price_per_ton: freight.price_per_ton ?? undefined,
          toll_cost: freight.toll_cost ?? undefined,
          fuel_cost: freight.fuel_cost ?? undefined,
          deadline_at: freight.deadline_at
            ? new Date(freight.deadline_at).toISOString().slice(0, 16)
            : '',
        }}
        onSubmit={async (data) => {
          setErrorMessage(null)
          await mutation.mutateAsync(data)
        }}
      />
    </div>
  )
}
