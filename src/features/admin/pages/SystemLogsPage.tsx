import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logsApi, type LogFilters } from '@/features/admin/services/logs-api'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'

type Tab = 'system' | 'activity'

const LEVEL_TONE: Record<string, 'default' | 'warning' | 'danger' | 'info'> = {
  info: 'info',
  warning: 'warning',
  error: 'danger',
  critical: 'danger',
  debug: 'default',
}

export function SystemLogsPage() {
  const [tab, setTab] = useState<Tab>('system')
  const [filters, setFilters] = useState<LogFilters>({})

  return (
    <div>
      <PageHeader title="Logs do sistema" description="Erros técnicos e auditoria de ações da empresa selecionada." />

      <div className="mb-4 flex gap-2 border-b border-border">
        <TabButton active={tab === 'system'} onClick={() => setTab('system')}>
          Erros do sistema
        </TabButton>
        <TabButton active={tab === 'activity'} onClick={() => setTab('activity')}>
          Auditoria
        </TabButton>
      </div>

      <Card className="mb-4 grid gap-3 p-4 sm:grid-cols-4">
        <Input
          placeholder="Buscar..."
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
        />
        {tab === 'system' ? (
          <Select onChange={(e) => setFilters((f) => ({ ...f, level: e.target.value || undefined }))}>
            <option value="">Todos os níveis</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </Select>
        ) : null}
        <Input type="date" onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))} />
        <Input type="date" onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined }))} />
      </Card>

      {tab === 'system' ? <SystemLogsTab filters={filters} /> : <ActivityLogsTab filters={filters} />}
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text'
      }`}
    >
      {children}
    </button>
  )
}

function SystemLogsTab({ filters }: { filters: LogFilters }) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'system-logs', filters],
    queryFn: () => logsApi.systemLogs(filters),
  })

  const resolveMutation = useMutation({
    mutationFn: (id: number) => logsApi.resolveSystemLog(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'system-logs'] }),
  })

  if (isLoading) return <LoadingState />
  if (!data || data.data.length === 0) {
    return <EmptyState title="Sem registros" description="Nenhum erro de sistema no período." />
  }

  return (
    <div className="space-y-2">
      {data.data.map((log) => (
        <Card key={log.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge tone={LEVEL_TONE[log.level] ?? 'default'}>{log.level}</Badge>
                {log.channel ? <span className="text-xs text-muted">{log.channel}</span> : null}
                {log.resolved_at ? <Badge tone="default">Resolvido</Badge> : null}
              </div>
              <p className="mt-1 text-sm font-medium text-text">{log.message}</p>
              {log.exception_message ? (
                <p className="mt-1 truncate text-xs text-red-600">{log.exception_message}</p>
              ) : null}
              <p className="mt-1 text-xs text-muted">
                {new Date(log.created_at).toLocaleString('pt-BR')}
                {log.user ? ` · ${log.user.name}` : ''}
                {log.method && log.url ? ` · ${log.method} ${log.url}` : ''}
              </p>
            </div>
            {!log.resolved_at ? (
              <Button size="sm" variant="secondary" onClick={() => resolveMutation.mutate(log.id)}>
                Resolver
              </Button>
            ) : null}
          </div>
        </Card>
      ))}
    </div>
  )
}

function ActivityLogsTab({ filters }: { filters: LogFilters }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'activity-logs', filters],
    queryFn: () => logsApi.activityLogs(filters),
  })

  if (isLoading) return <LoadingState />
  if (!data || data.data.length === 0) {
    return <EmptyState title="Sem registros" description="Nenhuma ação registrada no período." />
  }

  return (
    <div className="space-y-2">
      {data.data.map((log) => (
        <Card key={log.id} className="p-4">
          <div className="flex items-center gap-2">
            <Badge tone="info">{log.action}</Badge>
            <p className="text-sm text-text">{log.description}</p>
          </div>
          <p className="mt-1 text-xs text-muted">
            {new Date(log.created_at).toLocaleString('pt-BR')}
            {log.user ? ` · ${log.user.name}` : ''}
          </p>
        </Card>
      ))}
    </div>
  )
}
