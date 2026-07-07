import { type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-text">TruckFlow</h1>
          <p className="mt-1 text-sm text-muted">Painel da transportadora</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-6 shadow-sm">{children}</div>
      </div>
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
    <div className={cn('mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between')}>
      <div>
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
