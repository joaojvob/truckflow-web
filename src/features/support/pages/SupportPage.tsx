import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supportApi } from '@/features/support/services/support-api'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { getApiErrorMessage } from '@/shared/lib/api-client'

const STATUS_LABELS: Record<string, string> = {
  open: 'Aberto',
  answered: 'Respondido',
  closed: 'Encerrado',
}

export function SupportPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['support', 'tickets'],
    queryFn: () => supportApi.list(),
  })

  if (isLoading) return <LoadingState message="Carregando chamados..." />
  if (isError || !data) {
    return <ErrorMessage message={getApiErrorMessage(error, 'Não foi possível carregar os chamados.')} />
  }

  return (
    <div>
      <PageHeader
        title="Suporte"
        description="Abra chamados e acompanhe o atendimento."
        action={
          <Link to="/suporte/novo">
            <Button>Novo chamado</Button>
          </Link>
        }
      />

      {data.length === 0 ? (
        <EmptyState title="Nenhum chamado" description="Você ainda não abriu nenhum chamado de suporte." />
      ) : (
        <div className="space-y-3">
          {data.map((ticket) => (
            <Link key={ticket.id} to={`/suporte/${ticket.id}`}>
              <Card className="flex items-center justify-between p-4 transition-shadow hover:shadow-md">
                <div>
                  <p className="font-medium text-text">{ticket.subject}</p>
                  <p className="text-xs text-muted">
                    {ticket.category} · {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Badge tone={ticket.status === 'closed' ? 'default' : 'info'}>
                  {STATUS_LABELS[ticket.status] ?? ticket.status}
                </Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
