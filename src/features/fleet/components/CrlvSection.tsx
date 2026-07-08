import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { getApiErrorMessage } from '@/shared/lib/api-client'

interface CrlvSectionProps {
  hasDocument: boolean
  expiry?: string | null
  expired?: boolean
  onUpload: (file: File, expiry?: string) => Promise<void>
  onDownload?: () => Promise<void>
}

export function CrlvSection({ hasDocument, expiry, expired, onUpload, onDownload }: CrlvSectionProps) {
  const [expiryDate, setExpiryDate] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const uploadMutation = useMutation({
    mutationFn: ({ file, expiry }: { file: File; expiry?: string }) => onUpload(file, expiry),
    onSuccess: () => {
      setErrorMessage(null)
      setExpiryDate('')
    },
    onError: (err) => setErrorMessage(getApiErrorMessage(err, 'Não foi possível enviar o CRLV.')),
  })

  const downloadMutation = useMutation({
    mutationFn: () => onDownload?.() ?? Promise.resolve(),
    onError: (err) => setErrorMessage(getApiErrorMessage(err, 'Não foi possível baixar o CRLV.')),
  })

  return (
    <div className="rounded-xl border border-border bg-slate-50 p-4">
      <p className="text-sm font-medium text-text">CRLV</p>
      <p className="mt-1 text-xs text-muted">
        {hasDocument
          ? `Documento enviado${expiry ? ` · validade ${expiry}` : ''}${expired ? ' · VENCIDO' : ''}`
          : 'Nenhum documento enviado.'}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="crlv_expiry">Validade (opcional)</Label>
          <Input id="crlv_expiry" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="crlv_file">Arquivo (PDF ou imagem)</Label>
          <Input
            id="crlv_file"
            type="file"
            accept=".pdf,image/*"
            disabled={uploadMutation.isPending}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadMutation.mutate({ file, expiry: expiryDate || undefined })
            }}
          />
        </div>
      </div>

      {hasDocument && onDownload ? (
        <Button
          className="mt-3"
          size="sm"
          variant="secondary"
          isLoading={downloadMutation.isPending}
          onClick={() => downloadMutation.mutate()}
        >
          Baixar CRLV
        </Button>
      ) : null}

      {errorMessage ? <div className="mt-2"><ErrorMessage message={errorMessage} /></div> : null}
    </div>
  )
}
