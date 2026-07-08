import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUsers } from '@/features/users/hooks/useUsers'
import { usersApi } from '@/features/users/services/users-api'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Select } from '@/shared/components/ui/Select'
import type { UserRole } from '@/shared/types/api.types'
import { getApiErrorMessage } from '@/shared/lib/api-client'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Gestor',
  driver: 'Motorista',
}

const ROLE_TONE: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  admin: 'info',
  manager: 'warning',
  driver: 'success',
}

export function UsersPage() {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin'
  const [page, setPage] = useState(1)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data, isLoading, isError, error } = useUsers(page)

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: Exclude<UserRole, 'super_admin'> }) =>
      usersApi.updateRole(userId, role),
    onSuccess: async () => {
      setErrorMessage(null)
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (err) => setErrorMessage(getApiErrorMessage(err)),
  })

  const cnhMutation = useMutation({
    mutationFn: (userId: number) => usersApi.downloadCnh(userId),
    onError: (err) => setErrorMessage(getApiErrorMessage(err)),
  })

  if (isLoading) return <LoadingState message="Carregando usuários..." />
  if (isError || !data) {
    return <ErrorMessage message={getApiErrorMessage(error, 'Não foi possível carregar os usuários.')} />
  }

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Equipe da transportadora e permissões de acesso."
      />

      {errorMessage ? <div className="mb-4"><ErrorMessage message={errorMessage} /></div> : null}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-muted">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Cargo</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((user) => (
                <tr key={user.id} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium text-text">{user.name}</td>
                  <td className="px-4 py-3 text-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    {isAdmin && user.id !== currentUser?.id && user.role !== 'super_admin' ? (
                      <Select
                        value={user.role}
                        disabled={roleMutation.isPending}
                        onChange={(e) =>
                          roleMutation.mutate({
                            userId: user.id,
                            role: e.target.value as Exclude<UserRole, 'super_admin'>,
                          })
                        }
                      >
                        <option value="admin">Administrador</option>
                        <option value="manager">Gestor</option>
                        <option value="driver">Motorista</option>
                      </Select>
                    ) : (
                      <Badge tone={ROLE_TONE[user.role] ?? 'default'}>
                        {user.role_label ?? ROLE_LABELS[user.role] ?? user.role}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.role === 'driver' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        isLoading={cnhMutation.isPending}
                        onClick={() => cnhMutation.mutate(user.id)}
                      >
                        Baixar CNH
                      </Button>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {data.meta.last_page > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-muted">
            Página {data.meta.current_page} de {data.meta.last_page}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= data.meta.last_page}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      ) : null}
    </div>
  )
}
