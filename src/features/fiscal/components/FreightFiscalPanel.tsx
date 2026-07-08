import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fiscalApi } from '@/features/fiscal/services/fiscal-api'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card, CardTitle } from '@/shared/components/ui/Card'
import { apiClient, getApiErrorMessage } from '@/shared/lib/api-client'
import { formatDate } from '@/shared/lib/format'

interface FreightFiscalPanelProps {
  freightId: number
}

async function downloadFile(path: string, filename: string) {
  const response = await apiClient.get(path, { responseType: 'blob' })
  const blobUrl = window.URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(blobUrl)
}

export function FreightFiscalPanel({ freightId }: FreightFiscalPanelProps) {
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: documents, isLoading } = useQuery({
    queryKey: ['fiscal-documents', freightId],
    queryFn: () => fiscalApi.list(freightId),
  })

  const emitMutation = useMutation({
    mutationFn: () => fiscalApi.emitCte(freightId),
    onSuccess: async () => {
      setErrorMessage(null)
      await queryClient.invalidateQueries({ queryKey: ['fiscal-documents', freightId] })
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error)),
  })

  const cancelMutation = useMutation({
    mutationFn: (documentId: number) =>
      fiscalApi.cancel(freightId, documentId, 'Cancelamento solicitado pelo gestor no painel web'),
    onSuccess: async () => {
      setErrorMessage(null)
      await queryClient.invalidateQueries({ queryKey: ['fiscal-documents', freightId] })
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error)),
  })

  const hasActiveCte = documents?.some(
    (doc) => doc.type === 'cte' && ['processing', 'authorized'].includes(doc.status),
  )

  if (isLoading) {
    return <LoadingState message="Carregando documentos fiscais..." />
  }

  return (
    <Card>
      <CardTitle>CT-e (documento fiscal)</CardTitle>

      <div className="mt-4 space-y-4">
        {!hasActiveCte ? (
          <Button isLoading={emitMutation.isPending} onClick={() => emitMutation.mutate()}>
            Emitir CT-e
          </Button>
        ) : null}

        {documents && documents.length > 0 ? (
          <ul className="space-y-3">
            {documents.map((doc) => (
              <li key={doc.id} className="rounded-md border border-border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-text">{doc.type_label ?? doc.type.toUpperCase()}</p>
                    <p className="text-xs text-muted break-all">{doc.access_key}</p>
                  </div>
                  <Badge tone={doc.status === 'authorized' ? 'success' : doc.status === 'cancelled' ? 'danger' : 'default'}>
                    {doc.status_label ?? doc.status}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted">Autorizado: {formatDate(doc.authorized_at)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {doc.has_xml ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        void downloadFile(
                          fiscalApi.downloadXmlPath(freightId, doc.id),
                          `cte-${doc.access_key}.xml`,
                        )
                      }
                    >
                      XML
                    </Button>
                  ) : null}
                  {doc.has_pdf ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        void downloadFile(
                          fiscalApi.downloadPdfPath(freightId, doc.id),
                          `dacte-${doc.access_key}.pdf`,
                        )
                      }
                    >
                      PDF
                    </Button>
                  ) : null}
                  {doc.status === 'authorized' ? (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(doc.id)}
                    >
                      Cancelar CT-e
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nenhum documento fiscal emitido ainda.</p>
        )}

        {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
      </div>
    </Card>
  )
}
