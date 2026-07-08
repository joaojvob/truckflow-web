import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { DopingTest } from '@/features/freights/types/freight.types'
import { freightsApi } from '@/features/freights/services/freights-api'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { getApiErrorMessage } from '@/shared/lib/api-client'

interface DopingViewerProps {
  freightId: number
  test: DopingTest
  onClose: () => void
}

export function DopingViewer({ freightId, test, onClose }: DopingViewerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['doping-file', freightId, test.id],
    queryFn: () => freightsApi.fetchDopingFile(freightId, test.id),
  })

  useEffect(() => {
    if (!data) return
    const url = URL.createObjectURL(data.blob)
    setPreviewUrl(url)
    setMimeType(data.mimeType)
    return () => URL.revokeObjectURL(url)
  }, [data])

  const isPdf = mimeType?.includes('pdf') ?? false
  const isImage = mimeType?.startsWith('image/') ?? false

  return (
    <Modal open={true} onClose={onClose} title="Comprovante de doping" size="lg">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={test.status === 'approved' ? 'success' : test.status === 'rejected' ? 'danger' : 'warning'}>
            {test.status_label ?? test.status}
          </Badge>
          {test.created_at ? (
            <span className="text-sm text-muted">
              Enviado em {new Date(test.created_at).toLocaleString('pt-BR')}
            </span>
          ) : null}
        </div>

        {isLoading ? <LoadingState message="Carregando comprovante..." /> : null}
        {isError ? <ErrorMessage message={getApiErrorMessage(error, 'Não foi possível carregar o arquivo.')} /> : null}

        {previewUrl && isPdf ? (
          <iframe src={previewUrl} title="Comprovante de doping" className="h-[480px] w-full rounded-xl border border-border" />
        ) : null}

        {previewUrl && isImage ? (
          <img src={previewUrl} alt="Comprovante de doping" className="max-h-[480px] w-full rounded-xl border border-border object-contain" />
        ) : null}

        {previewUrl && !isPdf && !isImage ? (
          <p className="text-sm text-muted">Formato não suportado para visualização inline. Use o botão de download.</p>
        ) : null}

        <div className="flex justify-end gap-2">
          {data ? (
            <Button
              variant="secondary"
              onClick={() => {
                const link = document.createElement('a')
                link.href = previewUrl ?? URL.createObjectURL(data.blob)
                link.download = `doping-frete-${freightId}-${test.id}`
                link.click()
              }}
            >
              Baixar
            </Button>
          ) : null}
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </Modal>
  )
}
