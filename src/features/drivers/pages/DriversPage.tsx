import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLinkedDrivers, useTenantDrivers } from '@/features/drivers/hooks/useDrivers'
import type { DriverFilters } from '@/features/drivers/services/drivers-api'
import {
  createDriverSchema,
  driversApi,
  type CreateDriverFormData,
} from '@/features/drivers/services/drivers-api'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { Avatar } from '@/shared/components/ui/Avatar'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card, CardTitle } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { Modal } from '@/shared/components/ui/Modal'
import { Select } from '@/shared/components/ui/Select'
import { getApiErrorMessage } from '@/shared/lib/api-client'

export function DriversPage() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<DriverFilters>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: linked, isLoading } = useLinkedDrivers(filters)
  const { data: allDrivers } = useTenantDrivers()

  const linkMutation = useMutation({
    mutationFn: (driverId: number) => driversApi.link(driverId),
    onSuccess: async () => {
      setErrorMessage(null)
      setSelectedDriverId('')
      await queryClient.invalidateQueries({ queryKey: ['drivers'] })
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error)),
  })

  const unlinkMutation = useMutation({
    mutationFn: (driverId: number) => driversApi.unlink(driverId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['drivers'] })
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error)),
  })

  const linkedIds = new Set((linked?.data ?? []).map((driver) => driver.id))
  const availableDrivers = (allDrivers ?? []).filter((driver) => !linkedIds.has(driver.id))

  return (
    <div className="space-y-4">
      <PageHeader
        title="Motoristas"
        description="Motoristas vinculados ao seu perfil de gestor."
        action={<Button onClick={() => setIsModalOpen(true)}>Cadastrar motorista</Button>}
      />

      <Card className="grid gap-3 p-4 sm:grid-cols-3">
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={filters.search ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
        />
        <Select
          value={filters.available === undefined ? '' : String(filters.available)}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              available: e.target.value === '' ? undefined : e.target.value === 'true',
            }))
          }
        >
          <option value="">Disponibilidade (todos)</option>
          <option value="true">Disponíveis</option>
          <option value="false">Indisponíveis</option>
        </Select>
        <Button variant="ghost" onClick={() => setFilters({})} disabled={!filters.search && filters.available === undefined}>
          Limpar filtros
        </Button>
      </Card>

      <Card>
        <CardTitle>Vincular motorista existente</CardTitle>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Select value={selectedDriverId} onChange={(event) => setSelectedDriverId(event.target.value)}>
              <option value="">Selecione um motorista...</option>
              {availableDrivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} ({driver.email})
                </option>
              ))}
            </Select>
          </div>
          <Button
            disabled={!selectedDriverId || linkMutation.isPending}
            onClick={() => linkMutation.mutate(Number(selectedDriverId))}
          >
            Vincular
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Motoristas vinculados</CardTitle>
        {isLoading ? (
          <LoadingState message="Carregando motoristas..." />
        ) : linked?.data.length ? (
          <ul className="mt-4 divide-y divide-border">
            {linked.data.map((driver) => (
              <li key={driver.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <Avatar src={driver.driver_profile?.photo_url} name={driver.name} />
                  <div>
                    <p className="font-medium text-text">{driver.name}</p>
                    <p className="text-muted">{driver.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {driver.driver_profile?.is_available === false ? (
                    <Badge tone="warning">Indisponível</Badge>
                  ) : (
                    <Badge tone="success">Disponível</Badge>
                  )}
                  {driver.driver_profile?.cnh_expired ? <Badge tone="danger">CNH vencida</Badge> : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={unlinkMutation.isPending}
                    onClick={() => unlinkMutation.mutate(driver.id)}
                  >
                    Desvincular
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <EmptyState title="Nenhum motorista vinculado" description="Cadastre ou vincule um motorista para começar." />
          </div>
        )}
      </Card>

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar novo motorista"
        description="Cria a conta do motorista e já vincula ao seu perfil."
        size="lg"
      >
        <RegisterDriverForm
          onRegistered={() => {
            void queryClient.invalidateQueries({ queryKey: ['drivers'] })
            setIsModalOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}

function RegisterDriverForm({ onRegistered }: { onRegistered: () => void }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDriverFormData>({
    resolver: zodResolver(createDriverSchema),
  })

  const mutation = useMutation({
    mutationFn: (data: CreateDriverFormData) => driversApi.create(data),
    onSuccess: () => {
      setErrorMessage(null)
      reset()
      onRegistered()
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível cadastrar o motorista.'))
    },
  })

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      <div>
        <Label htmlFor="driver_name">Nome</Label>
        <Input id="driver_name" hasError={!!errors.name} {...register('name')} />
        {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
      </div>
      <div>
        <Label htmlFor="driver_email">E-mail</Label>
        <Input id="driver_email" type="email" hasError={!!errors.email} {...register('email')} />
        {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
      </div>
      <div>
        <Label htmlFor="driver_password">Senha</Label>
        <Input id="driver_password" type="password" hasError={!!errors.password} {...register('password')} />
        {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
      </div>
      <div>
        <Label htmlFor="driver_phone">Telefone (opcional)</Label>
        <Input id="driver_phone" {...register('phone')} />
      </div>
      <div>
        <Label htmlFor="driver_cpf">CPF (opcional)</Label>
        <Input id="driver_cpf" {...register('cpf')} />
      </div>
      <div>
        <Label htmlFor="driver_cnh">CNH (opcional)</Label>
        <Input id="driver_cnh" {...register('cnh_number')} />
      </div>

      <div className="sm:col-span-2 space-y-2">
        {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
        <div className="flex justify-end">
          <Button type="submit" isLoading={mutation.isPending}>
            Cadastrar motorista
          </Button>
        </div>
      </div>
    </form>
  )
}
