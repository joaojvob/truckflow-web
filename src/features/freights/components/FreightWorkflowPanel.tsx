import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLinkedDrivers } from '@/features/drivers/hooks/useDrivers'
import type { Freight } from '@/features/freights/types/freight.types'
import { freightsApi } from '@/features/freights/services/freights-api'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { Button } from '@/shared/components/ui/Button'
import { Card, CardTitle } from '@/shared/components/ui/Card'
import { Select } from '@/shared/components/ui/Select'
import { getApiErrorMessage } from '@/shared/lib/api-client'

interface FreightWorkflowPanelProps {
  freight: Freight
}

export function FreightWorkflowPanel({ freight }: FreightWorkflowPanelProps) {
  const queryClient = useQueryClient()
  const { data: driversData } = useLinkedDrivers()
  const [driverId, setDriverId] = useState(String(freight.driver?.id ?? ''))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['freights', freight.id] })
    await queryClient.invalidateQueries({ queryKey: ['freights'] })
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const mutation = useMutation({
    mutationFn: async (action: () => Promise<unknown>) => action(),
    onSuccess: async () => {
      setErrorMessage(null)
      await invalidate()
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error))
    },
  })

  const pendingDoping = freight.doping_tests?.find((test) => test.status === 'pending')
  const drivers = driversData?.data ?? []
  const canEdit = freight.status !== 'completed' && freight.status !== 'cancelled'

  return (
    <Card>
      <CardTitle>Ações do gestor</CardTitle>

      <div className="mt-4 space-y-4">
        {freight.status === 'pending' ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-text">Atribuir motorista</label>
              <Select value={driverId} onChange={(event) => setDriverId(event.target.value)}>
                <option value="">Selecione...</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              disabled={!driverId || mutation.isPending}
              onClick={() =>
                mutation.mutate(() => freightsApi.assign(freight.id, Number(driverId)))
              }
            >
              Atribuir
            </Button>
          </div>
        ) : null}

        {freight.status === 'accepted' && pendingDoping ? (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate(() =>
                  freightsApi.reviewDoping(freight.id, pendingDoping.id, true, 'Aprovado pelo gestor'),
                )
              }
            >
              Aprovar doping
            </Button>
            <Button
              variant="danger"
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate(() =>
                  freightsApi.reviewDoping(freight.id, pendingDoping.id, false, 'Reprovado pelo gestor'),
                )
              }
            >
              Reprovar doping
            </Button>
          </div>
        ) : null}

        {freight.status === 'accepted' &&
        freight.doping_approved &&
        freight.checklist_completed &&
        !freight.manager_approved ? (
          <Button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(() => freightsApi.approve(freight.id))}
          >
            Liberar viagem
          </Button>
        ) : null}

        {canEdit ? (
          <Button
            variant="danger"
            disabled={mutation.isPending}
            onClick={() => {
              if (window.confirm('Confirma o cancelamento deste frete?')) {
                mutation.mutate(() => freightsApi.cancel(freight.id))
              }
            }}
          >
            Cancelar frete
          </Button>
        ) : null}

        {!canEdit && freight.status !== 'pending' && !pendingDoping ? (
          <p className="text-sm text-muted">Nenhuma ação disponível para o status atual.</p>
        ) : null}

        {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
      </div>
    </Card>
  )
}
