import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FreightForm } from '@/features/freights/components/FreightForm'
import type { FreightFormData } from '@/features/freights/schemas/freight.schema'
import { toFreightPayload } from '@/features/freights/schemas/freight.schema'
import { freightsApi } from '@/features/freights/services/freights-api'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { ROUTES } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/lib/api-client'

export function FreightCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (data: FreightFormData) => freightsApi.create(toFreightPayload(data)),
    onSuccess: async (freight) => {
      await queryClient.invalidateQueries({ queryKey: ['freights'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      navigate(ROUTES.freightDetail(freight.id))
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível criar o frete.'))
    },
  })

  return (
    <div>
      <PageHeader title="Novo frete" description="Cadastre um frete com origem, destino e motorista." />
      <FreightForm
        submitLabel="Criar frete"
        errorMessage={errorMessage}
        isLoading={mutation.isPending}
        onSubmit={async (data) => {
          setErrorMessage(null)
          await mutation.mutateAsync(data)
        }}
      />
    </div>
  )
}
