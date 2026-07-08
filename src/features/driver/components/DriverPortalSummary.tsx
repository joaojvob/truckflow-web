import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { Freight } from '@/features/freights/types/freight.types'
import { driverProfileApi } from '@/features/driver/services/driver-profile-api'
import { Card } from '@/shared/components/ui/Card'
import { ROUTES } from '@/shared/constants/routes'

interface DriverPortalSummaryProps {
  freights: Freight[]
}

export function DriverPortalSummary({ freights }: DriverPortalSummaryProps) {
  const { data: profile } = useQuery({
    queryKey: ['driver-profile'],
    queryFn: () => driverProfileApi.get(),
  })

  const active = freights.filter((f) =>
    ['assigned', 'accepted', 'ready', 'in_transit'].includes(f.status),
  ).length

  const inTransit = freights.filter((f) => f.status === 'in_transit').length

  const pendingAccept = freights.filter((f) => f.status === 'assigned').length

  const pendingDocs = freights.filter(
    (f) =>
      f.status === 'accepted' &&
      (!f.doping_approved || !f.checklist_completed),
  ).length

  const readyToStart = freights.filter(
    (f) => f.status === 'ready' && f.manager_approved,
  ).length

  const nextDeadline = freights
    .filter((f) => f.deadline_at && !['completed', 'cancelled', 'rejected'].includes(f.status))
    .sort((a, b) => new Date(a.deadline_at!).getTime() - new Date(b.deadline_at!).getTime())[0]

  return (
    <div className="mb-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Fretes ativos" value={active} tone="blue" />
        <SummaryCard label="Em trânsito" value={inTransit} tone="orange" />
        <SummaryCard label="Aguardando aceite" value={pendingAccept} tone="purple" />
        <SummaryCard label="Prontos para iniciar" value={readyToStart} tone="green" />
      </div>

      {(pendingDocs > 0 || profile?.cnh_expiring_soon || profile?.cnh_expired) ? (
        <Card className="border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">Atenção</p>
          <ul className="mt-2 space-y-1 text-sm text-amber-800">
            {pendingDocs > 0 ? (
              <li>{pendingDocs} frete(s) com documentação pendente (doping ou checklist).</li>
            ) : null}
            {profile?.cnh_expired ? <li>Sua CNH está vencida — atualize no perfil.</li> : null}
            {profile?.cnh_expiring_soon && !profile?.cnh_expired ? (
              <li>Sua CNH vence em breve.</li>
            ) : null}
          </ul>
        </Card>
      ) : null}

      {nextDeadline ? (
        <Card className="p-4">
          <p className="text-xs text-muted">Próximo prazo de entrega</p>
          <p className="mt-1 text-sm font-medium text-text">
            Frete #{nextDeadline.id} ·{' '}
            {new Date(nextDeadline.deadline_at!).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <Link className="mt-2 inline-block text-sm text-primary hover:underline" to={ROUTES.freightDetail(nextDeadline.id)}>
            Ver frete
          </Link>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link
          to={ROUTES.driverProfile}
          className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text shadow-sm hover:bg-slate-50"
        >
          Meu perfil
        </Link>
        <Link
          to={ROUTES.fleet}
          className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text shadow-sm hover:bg-slate-50"
        >
          Minha frota
        </Link>
        <Link
          to={ROUTES.support}
          className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text shadow-sm hover:bg-slate-50"
        >
          Suporte
        </Link>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'blue' | 'green' | 'orange' | 'purple'
}) {
  const tones = {
    blue: 'bg-pastel-blue',
    green: 'bg-pastel-green',
    orange: 'bg-pastel-orange',
    purple: 'bg-pastel-purple',
  }

  return (
    <Card className={`p-4 ${tones[tone]}`}>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-2xl font-bold text-text">{value}</p>
    </Card>
  )
}
