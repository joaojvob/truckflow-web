import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Freight } from '@/features/freights/types/freight.types'
import { freightsApi } from '@/features/freights/services/freights-api'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { Button } from '@/shared/components/ui/Button'
import { Card, CardTitle } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { getApiErrorMessage } from '@/shared/lib/api-client'

interface DriverFreightWorkflowPanelProps {
  freight: Freight
}

export function DriverFreightWorkflowPanel({ freight }: DriverFreightWorkflowPanelProps) {
  const queryClient = useQueryClient()
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['freights', freight.id] })
    await queryClient.invalidateQueries({ queryKey: ['freights'] })
  }

  const mutation = useMutation({
    mutationFn: async (action: () => Promise<unknown>) => action(),
    onSuccess: async () => {
      setErrorMessage(null)
      setShowReject(false)
      await invalidate()
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error)),
  })

  const canRespond = freight.status === 'assigned'
  const canStart = freight.status === 'ready' && freight.manager_approved
  const canComplete = freight.status === 'in_transit'

  if (!canRespond && !canStart && !canComplete) {
    return (
      <Card>
        <CardTitle>Ações do motorista</CardTitle>
        <p className="mt-3 text-sm text-muted">Nenhuma ação disponível para o status atual.</p>
      </Card>
    )
  }

  return (
    <Card>
      <CardTitle>Ações do motorista</CardTitle>

      <div className="mt-4 space-y-4">
        {canRespond ? (
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(() => freightsApi.accept(freight.id))}
            >
              Aceitar frete
            </Button>
            <Button
              variant="danger"
              disabled={mutation.isPending}
              onClick={() => setShowReject((v) => !v)}
            >
              Recusar frete
            </Button>
          </div>
        ) : null}

        {showReject ? (
          <div className="space-y-2">
            <Input
              placeholder="Motivo da recusa"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <Button
              variant="danger"
              size="sm"
              disabled={!rejectReason.trim() || mutation.isPending}
              onClick={() =>
                mutation.mutate(() => freightsApi.reject(freight.id, rejectReason))
              }
            >
              Confirmar recusa
            </Button>
          </div>
        ) : null}

        {canStart ? (
          <Button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(() => freightsApi.start(freight.id))}
          >
            Iniciar viagem
          </Button>
        ) : null}

        {canComplete ? (
          <Button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(() => freightsApi.complete(freight.id))}
          >
            Finalizar viagem
          </Button>
        ) : null}

        {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
      </div>
    </Card>
  )
}
