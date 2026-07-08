import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store/auth-store'
import {
  tenantApi,
  tenantFiscalSchema,
  updateTenantSchema,
  type TenantFiscalFormData,
  type UpdateTenantFormData,
} from '@/features/tenant/services/tenant-api'
import type { Tenant } from '@/shared/types/api.types'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { Avatar } from '@/shared/components/ui/Avatar'
import { Button } from '@/shared/components/ui/Button'
import { Card, CardDescription, CardTitle } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { getApiErrorMessage } from '@/shared/lib/api-client'

export function TenantSettingsPage() {
  const queryClient = useQueryClient()
  const refreshUser = useAuthStore((state) => state.refreshUser)
  const { data: tenant, isLoading, isError, error } = useQuery({
    queryKey: ['tenant'],
    queryFn: () => tenantApi.get(),
  })

  if (isLoading) {
    return <LoadingState message="Carregando dados da empresa..." />
  }

  if (isError || !tenant) {
    return <ErrorMessage message={getApiErrorMessage(error, 'Não foi possível carregar a empresa.')} />
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Empresa" description="Dados cadastrais e fiscais da transportadora." />

      <LogoSection
        tenant={tenant}
        onSaved={async () => {
          await queryClient.invalidateQueries({ queryKey: ['tenant'] })
          await refreshUser()
        }}
      />

      <GeneralDataForm
        defaultValues={{ name: tenant.name, slug: tenant.slug }}
        onSaved={async () => {
          await queryClient.invalidateQueries({ queryKey: ['tenant'] })
          await refreshUser()
        }}
      />

      <FiscalDataForm
        defaultValues={{
          cnpj: tenant.settings?.fiscal?.cnpj ?? '',
          ie: tenant.settings?.fiscal?.ie ?? '',
          razao_social: tenant.settings?.fiscal?.razao_social ?? '',
          uf: tenant.settings?.fiscal?.uf ?? '',
          municipio: tenant.settings?.fiscal?.municipio ?? '',
        }}
        onSaved={async () => {
          await queryClient.invalidateQueries({ queryKey: ['tenant'] })
        }}
      />
    </div>
  )
}

function LogoSection({ tenant, onSaved }: { tenant: Tenant; onSaved: () => Promise<void> }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (file: File) => tenantApi.uploadLogo(file),
    onSuccess: async () => {
      setErrorMessage(null)
      await onSaved()
    },
    onError: (err) => setErrorMessage(getApiErrorMessage(err, 'Não foi possível enviar a logo.')),
  })

  return (
    <Card>
      <CardTitle>Logo da empresa</CardTitle>
      <CardDescription>Exibida no painel. Use PNG, JPG ou WEBP (até 4MB).</CardDescription>

      <div className="mt-4 flex items-center gap-4">
        <Avatar src={tenant.logo_url} name={tenant.name} size="lg" />
        <div>
          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={mutation.isPending}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) mutation.mutate(file)
            }}
          />
          {mutation.isPending ? <p className="mt-1 text-xs text-muted">Enviando...</p> : null}
          {errorMessage ? <div className="mt-2"><ErrorMessage message={errorMessage} /></div> : null}
        </div>
      </div>
    </Card>
  )
}

function useSuccessMessage() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!message) return
    const timeout = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(timeout)
  }, [message])

  return [message, setMessage] as const
}

function GeneralDataForm({
  defaultValues,
  onSaved,
}: {
  defaultValues: UpdateTenantFormData
  onSaved: () => Promise<void>
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useSuccessMessage()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateTenantFormData>({
    resolver: zodResolver(updateTenantSchema),
    defaultValues,
  })

  const mutation = useMutation({
    mutationFn: (data: UpdateTenantFormData) => tenantApi.update(data),
    onSuccess: async () => {
      setErrorMessage(null)
      setSuccessMessage('Dados da empresa atualizados com sucesso.')
      await onSaved()
    },
    onError: (err) => setErrorMessage(getApiErrorMessage(err, 'Não foi possível atualizar a empresa.')),
  })

  return (
    <Card>
      <CardTitle>Dados gerais</CardTitle>
      <CardDescription>Nome e identificador da transportadora.</CardDescription>

      <form
        className="mt-4 grid gap-4 sm:grid-cols-2"
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
      >
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input id="name" hasError={!!errors.name} {...register('name')} />
          {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" hasError={!!errors.slug} {...register('slug')} />
          {errors.slug ? <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p> : null}
        </div>

        <div className="sm:col-span-2 space-y-2">
          {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
          {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
          <Button type="submit" isLoading={mutation.isPending}>
            Salvar dados gerais
          </Button>
        </div>
      </form>
    </Card>
  )
}

function FiscalDataForm({
  defaultValues,
  onSaved,
}: {
  defaultValues: TenantFiscalFormData
  onSaved: () => Promise<void>
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useSuccessMessage()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFiscalFormData>({
    resolver: zodResolver(tenantFiscalSchema),
    defaultValues,
  })

  const mutation = useMutation({
    mutationFn: (data: TenantFiscalFormData) => tenantApi.updateFiscal(data),
    onSuccess: async () => {
      setErrorMessage(null)
      setSuccessMessage('Dados fiscais atualizados. Já é possível emitir CT-e.')
      await onSaved()
    },
    onError: (err) => setErrorMessage(getApiErrorMessage(err, 'Não foi possível atualizar os dados fiscais.')),
  })

  return (
    <Card>
      <CardTitle>Dados fiscais (CT-e)</CardTitle>
      <CardDescription>Necessários para emitir o Conhecimento de Transporte Eletrônico.</CardDescription>

      <form
        className="mt-4 grid gap-4 sm:grid-cols-2"
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
      >
        <div className="sm:col-span-2">
          <Label htmlFor="razao_social">Razão social</Label>
          <Input id="razao_social" hasError={!!errors.razao_social} {...register('razao_social')} />
          {errors.razao_social ? (
            <p className="mt-1 text-xs text-red-600">{errors.razao_social.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="cnpj">CNPJ (somente números)</Label>
          <Input id="cnpj" placeholder="12345678000199" hasError={!!errors.cnpj} {...register('cnpj')} />
          {errors.cnpj ? <p className="mt-1 text-xs text-red-600">{errors.cnpj.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="ie">Inscrição estadual</Label>
          <Input id="ie" hasError={!!errors.ie} {...register('ie')} />
          {errors.ie ? <p className="mt-1 text-xs text-red-600">{errors.ie.message}</p> : null}
        </div>

        <div>
          <Label htmlFor="municipio">Município</Label>
          <Input id="municipio" hasError={!!errors.municipio} {...register('municipio')} />
          {errors.municipio ? <p className="mt-1 text-xs text-red-600">{errors.municipio.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="uf">UF</Label>
          <Input id="uf" maxLength={2} placeholder="SP" hasError={!!errors.uf} {...register('uf')} />
          {errors.uf ? <p className="mt-1 text-xs text-red-600">{errors.uf.message}</p> : null}
        </div>

        <div className="sm:col-span-2 space-y-2">
          {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
          {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
          <Button type="submit" isLoading={mutation.isPending}>
            Salvar dados fiscais
          </Button>
        </div>
      </form>
    </Card>
  )
}
