import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'

interface AuthSplitLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
  footer?: ReactNode
}

export function AuthSplitLayout({ children, title, subtitle, footer }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left: form */}
      <div className="flex w-full flex-col justify-between bg-white px-6 py-8 sm:px-12 lg:w-1/2 lg:px-16">
        <div>
          <Link className="inline-flex items-center gap-2" to={ROUTES.login}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
              TF
            </span>
            <span className="text-lg font-bold text-text">TruckFlow</span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md py-8">
          <h1 className="text-3xl font-bold text-text">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>

        <div className="text-xs text-muted">{footer}</div>
      </div>

      {/* Right: branding panel */}
      <div className="relative hidden overflow-hidden bg-primary lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-16">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold leading-tight text-white">
            Gerencie fretes, motoristas e operações com eficiência.
          </h2>
          <p className="mt-4 text-base text-white/80">
            Acesse o painel da transportadora para acompanhar fretes, emitir CT-e e controlar sua frota.
          </p>

          {/* Mini dashboard preview */}
          <div className="mt-10 rounded-2xl bg-white/95 p-5 shadow-2xl backdrop-blur">
            <div className="grid grid-cols-2 gap-3">
              <PreviewStat label="Fretes ativos" value="24" color="bg-pastel-blue" />
              <PreviewStat label="Em trânsito" value="8" color="bg-pastel-green" />
              <PreviewStat label="Receita mês" value="R$ 89k" color="bg-pastel-purple" />
              <PreviewStat label="Motoristas" value="12" color="bg-pastel-orange" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-xl p-3 ${color}`}>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold text-text">{value}</p>
    </div>
  )
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
