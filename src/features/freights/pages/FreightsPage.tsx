import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useFreights } from '@/features/freights/hooks/useFreights'
import type { FreightFilters } from '@/features/freights/services/freights-api'
import { FreightTable } from '@/features/freights/components/FreightTable'
import { FreightFilterBar } from '@/features/freights/components/FreightFilterBar'
import { DriverFreightCards } from '@/features/freights/components/DriverFreightCards'
import { DriverPortalSummary } from '@/features/driver/components/DriverPortalSummary'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { Button } from '@/shared/components/ui/Button'
import { ROUTES } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/lib/api-client'
import { isManagerOrAdmin } from '@/shared/lib/role-routing'

export function FreightsPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<FreightFilters>({})
  const user = useAuthStore((state) => state.user)
  const isDriver = user?.role === 'driver'
  const isManager = user ? isManagerOrAdmin(user.role) : false
  const { data, isLoading, isError, error } = useFreights(page, filters)

  function handleFiltersChange(next: FreightFilters) {
    setPage(1)
    setFilters(next)
  }

  if (isError) {
    return <ErrorMessage message={getApiErrorMessage(error, 'Não foi possível carregar os fretes.')} />
  }

  return (
    <div>
      <PageHeader
        title={isDriver ? 'Meus Fretes' : 'Fretes'}
        description={
          isDriver
            ? 'Fretes atribuídos a você.'
            : 'Acompanhe e gerencie os fretes da transportadora.'
        }
        action={
          isManager ? (
            <Link to={ROUTES.freightCreate}>
              <Button>Novo frete</Button>
            </Link>
          ) : undefined
        }
      />

      {!isDriver ? <FreightFilterBar filters={filters} onChange={handleFiltersChange} /> : null}

      {isDriver && data && !isLoading ? <DriverPortalSummary freights={data.data} /> : null}

      {isLoading || !data ? (
        <LoadingState message="Carregando fretes..." />
      ) : data.data.length === 0 ? (
        <EmptyState
          title="Nenhum frete encontrado"
          description={
            isDriver
              ? 'Você ainda não tem fretes atribuídos.'
              : 'Ajuste os filtros ou crie um novo frete para começar.'
          }
        />
      ) : isDriver ? (
        <DriverFreightCards freights={data.data} />
      ) : (
        <FreightTable freights={data.data} />
      )}

      {data && data.meta.last_page > 1 ? (
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
