import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Freight } from '@/features/freights/types/freight.types'
import { freightsApi } from '@/features/freights/services/freights-api'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card, CardDescription, CardTitle } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { getApiErrorMessage } from '@/shared/lib/api-client'

const CHECKLIST_ITEMS = [
  { key: 'pneus', label: 'Pneus em bom estado' },
  { key: 'oleo', label: 'Nível de óleo' },
  { key: 'luzes', label: 'Luzes e sinalização' },
  { key: 'documentacao', label: 'Documentação do veículo' },
] as const

interface DriverFreightWorkflowPanelProps {
  freight: Freight
}

export function DriverFreightWorkflowPanel({ freight }: DriverFreightWorkflowPanelProps) {
  const queryClient = useQueryClient()
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    pneus: true,
    oleo: true,
    luzes: true,
    documentacao: true,
  })
  const [completeNotes, setCompleteNotes] = useState('')
  const [rating, setRating] = useState('5')

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

  const pendingDoping = freight.doping_tests?.find((test) => test.status === 'pending')
  const rejectedDoping = freight.doping_tests?.find((test) => test.status === 'rejected')

  const canRespond = freight.status === 'assigned'
  const canSubmitDocs = freight.status === 'accepted'
  const canStart = freight.status === 'ready' && freight.manager_approved
  const canComplete = freight.status === 'in_transit'
  const waitingApproval =
    freight.status === 'accepted' &&
    freight.doping_approved &&
    freight.checklist_completed &&
    !freight.manager_approved

  const hasActions =
    canRespond || canSubmitDocs || canStart || canComplete || waitingApproval

  if (!hasActions) {
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
      <CardDescription>Workflow do frete — aceite, documentos e viagem.</CardDescription>

      <div className="mt-4 space-y-5">
        {canRespond ? (
          <section className="space-y-3">
            <p className="text-sm font-medium text-text">1. Responder ao frete</p>
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
          </section>
        ) : null}

        {canSubmitDocs ? (
          <section className="space-y-4 rounded-xl border border-border bg-slate-50 p-4">
            <p className="text-sm font-medium text-text">2. Documentação pré-viagem</p>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Exame de doping</span>
                {freight.doping_approved ? (
                  <Badge tone="success">Aprovado</Badge>
                ) : pendingDoping ? (
                  <Badge tone="warning">Aguardando análise</Badge>
                ) : rejectedDoping ? (
                  <Badge tone="danger">Reprovado — reenvie</Badge>
                ) : (
                  <Badge tone="default">Pendente</Badge>
                )}
              </div>

              {!freight.doping_approved && !pendingDoping ? (
                <div>
                  <Label htmlFor="doping_file">Enviar comprovante (PDF ou imagem)</Label>
                  <Input
                    id="doping_file"
                    type="file"
                    accept=".pdf,image/*"
                    disabled={mutation.isPending}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) mutation.mutate(() => freightsApi.submitDoping(freight.id, file))
                    }}
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Checklist pré-viagem</span>
                {freight.checklist_completed ? (
                  <Badge tone="success">Enviado</Badge>
                ) : (
                  <Badge tone="default">Pendente</Badge>
                )}
              </div>

              {!freight.checklist_completed ? (
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault()
                    mutation.mutate(() => freightsApi.submitChecklist(freight.id, checklist))
                  }}
                >
                  <ul className="space-y-2">
                    {CHECKLIST_ITEMS.map((item) => (
                      <li key={item.key}>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={checklist[item.key] ?? false}
                            onChange={(e) =>
                              setChecklist((prev) => ({ ...prev, [item.key]: e.target.checked }))
                            }
                          />
                          {item.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                  <Button type="submit" size="sm" isLoading={mutation.isPending}>
                    Enviar checklist
                  </Button>
                </form>
              ) : null}
            </div>
          </section>
        ) : null}

        {waitingApproval ? (
          <section className="rounded-xl border border-primary/20 bg-primary-soft p-4 text-sm text-text">
            Documentação enviada. Aguardando liberação do gestor para iniciar a viagem.
          </section>
        ) : null}

        {canStart ? (
          <section className="space-y-2">
            <p className="text-sm font-medium text-text">3. Iniciar viagem</p>
            <Button
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(() => freightsApi.start(freight.id))}
            >
              Iniciar viagem
            </Button>
          </section>
        ) : null}

        {canComplete ? (
          <section className="space-y-3 rounded-xl border border-border bg-slate-50 p-4">
            <p className="text-sm font-medium text-text">4. Finalizar viagem</p>
            <div>
              <Label htmlFor="rating">Avaliação (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="complete_notes">Observações (opcional)</Label>
              <Input
                id="complete_notes"
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
                placeholder="Ocorrências na entrega..."
              />
            </div>
            <Button
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate(() =>
                  freightsApi.complete(
                    freight.id,
                    Number(rating) || undefined,
                    completeNotes || undefined,
                  ),
                )
              }
            >
              Finalizar viagem
            </Button>
          </section>
        ) : null}

        {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
      </div>
    </Card>
  )
}
