import { useState } from 'react'
import { useFreights } from '@/features/freights/hooks/useFreights'
import { FreightTable } from '@/features/freights/components/FreightTable'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { Button } from '@/shared/components/ui/Button'
import { getApiErrorMessage } from '@/shared/lib/api-client'

export function FreightsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error } = useFreights(page)

  if (isLoading) {
    return <LoadingState message="Carregando fretes..." />
  }

  if (isError || !data) {
    return <ErrorMessage message={getApiErrorMessage(error, 'Não foi possível carregar os fretes.')} />
  }

  return (
    <div>
      <PageHeader title="Fretes" description="Acompanhe e gerencie os fretes da transportadora." />

      {data.data.length === 0 ? (
        <EmptyState title="Nenhum frete encontrado" description="Os fretes criados aparecerão aqui." />
      ) : (
        <FreightTable freights={data.data} />
      )}

      {data.meta.last_page > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted">
            Página {data.meta.current_page} de {data.meta.last_page}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= data.meta.last_page}
            onClick={() => setPage((current) => current + 1)}
          >
            Próxima
          </Button>
        </div>
      ) : null}
    </div>
  )
}
