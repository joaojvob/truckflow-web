import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLinkedDrivers } from '@/features/drivers/hooks/useDrivers'
import { DopingViewer } from '@/features/freights/components/DopingViewer'
import type { DopingTest, Freight } from '@/features/freights/types/freight.types'
import { freightsApi } from '@/features/freights/services/freights-api'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { Badge } from '@/shared/components/ui/Badge'
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
  const [viewingDoping, setViewingDoping] = useState<DopingTest | null>(null)

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
  const dopingHistory = [...(freight.doping_tests ?? [])].sort(
    (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
  )
  const drivers = driversData?.data ?? []
  const canEdit = freight.status !== 'completed' && freight.status !== 'cancelled'

  return (
    <>
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

          {dopingHistory.length > 0 ? (
            <section className="space-y-2 rounded-xl border border-border bg-slate-50 p-4">
              <p className="text-sm font-medium text-text">Exames de doping</p>
              <ul className="space-y-2">
                {dopingHistory.map((test) => (
                  <li key={test.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge
                        tone={
                          test.status === 'approved'
                            ? 'success'
                            : test.status === 'rejected'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {test.status_label ?? test.status}
                      </Badge>
                      {test.created_at ? (
                        <span className="text-muted">
                          {new Date(test.created_at).toLocaleString('pt-BR')}
                        </span>
                      ) : null}
                    </div>
                    {(test.has_file ?? test.file_path) ? (
                      <Button size="sm" variant="secondary" onClick={() => setViewingDoping(test)}>
                        Ver comprovante
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
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

          {!canEdit && freight.status !== 'pending' && !pendingDoping && dopingHistory.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma ação disponível para o status atual.</p>
          ) : null}

          {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
        </div>
      </Card>

      {viewingDoping ? (
        <DopingViewer
          freightId={freight.id}
          test={viewingDoping}
          onClose={() => setViewingDoping(null)}
        />
      ) : null}
    </>
  )
}
