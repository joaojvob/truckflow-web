import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { driverProfileApi } from '@/features/driver/services/driver-profile-api'
import type { DriverProfile, UpdateDriverProfilePayload } from '@/features/driver/services/driver-profile-api'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { Avatar } from '@/shared/components/ui/Avatar'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card, CardDescription, CardTitle } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { getApiErrorMessage } from '@/shared/lib/api-client'
import { useAuthStore } from '@/features/auth/store/auth-store'

export function DriverProfilePage() {
  const userName = useAuthStore((state) => state.user?.name) ?? 'Motorista'
  const { data: profile, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['driver-profile'],
    queryFn: () => driverProfileApi.get(),
  })

  if (isLoading) {
    return <LoadingState message="Carregando perfil..." />
  }

  if (isError) {
    return <ErrorMessage message={getApiErrorMessage(error, 'Não foi possível carregar o perfil.')} />
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Meu Perfil"
        description="Atualize seus dados pessoais e documentos."
      />

      <IdentityCard profile={profile ?? null} name={userName} onChanged={() => refetch()} />

      <ProfileForm
        defaultValues={{
          phone: profile?.phone ?? '',
          cpf: profile?.cpf ?? '',
          birth_date: profile?.birth_date ?? '',
          cnh_number: profile?.cnh_number ?? '',
          cnh_category: profile?.cnh_category ?? '',
          cnh_expiry: profile?.cnh_expiry ?? '',
          address: profile?.address ?? '',
          city: profile?.city ?? '',
          state: profile?.state ?? '',
          zip_code: profile?.zip_code ?? '',
          emergency_contact_name: profile?.emergency_contact_name ?? '',
          emergency_contact_phone: profile?.emergency_contact_phone ?? '',
        }}
        onSaved={() => refetch()}
      />

      <CnhUploadSection
        hasDocument={profile?.cnh_has_document ?? false}
        onUploaded={() => refetch()}
      />
    </div>
  )
}

function IdentityCard({
  profile,
  name,
  onChanged,
}: {
  profile: DriverProfile | null
  name: string
  onChanged: () => void
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isAvailable = profile?.is_available ?? true

  const photoMutation = useMutation({
    mutationFn: (file: File) => driverProfileApi.uploadPhoto(file),
    onSuccess: () => {
      setErrorMessage(null)
      onChanged()
    },
    onError: (err) => setErrorMessage(getApiErrorMessage(err, 'Não foi possível enviar a foto.')),
  })

  const availabilityMutation = useMutation({
    mutationFn: (value: boolean) => driverProfileApi.update({ is_available: value }),
    onSuccess: () => onChanged(),
    onError: (err) => setErrorMessage(getApiErrorMessage(err, 'Não foi possível atualizar a disponibilidade.')),
  })

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar src={profile?.photo_url} name={name} size="lg" />
          <div>
            <p className="text-lg font-semibold text-text">{name}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge tone={isAvailable ? 'success' : 'warning'}>
                {isAvailable ? 'Disponível' : 'Indisponível'}
              </Badge>
              {profile?.cnh_expired ? <Badge tone="danger">CNH vencida</Badge> : null}
              {profile?.cnh_expiring_soon && !profile?.cnh_expired ? (
                <Badge tone="warning">CNH vence em breve</Badge>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={isAvailable}
              disabled={availabilityMutation.isPending}
              onChange={(e) => availabilityMutation.mutate(e.target.checked)}
            />
            Estou disponível para novos fretes
          </label>
          <div>
            <Label htmlFor="photo">Foto de perfil</Label>
            <Input
              id="photo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={photoMutation.isPending}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) photoMutation.mutate(file)
              }}
            />
          </div>
        </div>
      </div>
      {errorMessage ? <div className="mt-3"><ErrorMessage message={errorMessage} /></div> : null}
    </Card>
  )
}

function ProfileForm({
  defaultValues,
  onSaved,
}: {
  defaultValues: UpdateDriverProfilePayload
  onSaved: () => void
}) {
  const [form, setForm] = useState(defaultValues)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (data: UpdateDriverProfilePayload) => driverProfileApi.update(data),
    onSuccess: () => {
      setErrorMessage(null)
      setSuccessMessage('Perfil atualizado com sucesso.')
      onSaved()
    },
    onError: (err) => {
      setSuccessMessage(null)
      setErrorMessage(getApiErrorMessage(err, 'Não foi possível atualizar o perfil.'))
    },
  })

  function updateField(field: keyof UpdateDriverProfilePayload, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardTitle>Dados pessoais</CardTitle>
      <CardDescription>Telefone, CNH, endereço e contato de emergência.</CardDescription>

      <form
        className="mt-4 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate(form)
        }}
      >
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" value={form.phone ?? ''} onChange={(e) => updateField('phone', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" value={form.cpf ?? ''} onChange={(e) => updateField('cpf', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="birth_date">Data de nascimento</Label>
          <Input
            id="birth_date"
            type="date"
            value={form.birth_date ?? ''}
            onChange={(e) => updateField('birth_date', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="cnh_number">Número da CNH</Label>
          <Input
            id="cnh_number"
            value={form.cnh_number ?? ''}
            onChange={(e) => updateField('cnh_number', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="cnh_category">Categoria CNH</Label>
          <Input
            id="cnh_category"
            value={form.cnh_category ?? ''}
            onChange={(e) => updateField('cnh_category', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="cnh_expiry">Validade CNH</Label>
          <Input
            id="cnh_expiry"
            type="date"
            value={form.cnh_expiry ?? ''}
            onChange={(e) => updateField('cnh_expiry', e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="address">Endereço</Label>
          <Input id="address" value={form.address ?? ''} onChange={(e) => updateField('address', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" value={form.city ?? ''} onChange={(e) => updateField('city', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="state">UF</Label>
          <Input id="state" maxLength={2} value={form.state ?? ''} onChange={(e) => updateField('state', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="zip_code">CEP</Label>
          <Input id="zip_code" value={form.zip_code ?? ''} onChange={(e) => updateField('zip_code', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="emergency_contact_name">Contato de emergência</Label>
          <Input
            id="emergency_contact_name"
            value={form.emergency_contact_name ?? ''}
            onChange={(e) => updateField('emergency_contact_name', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="emergency_contact_phone">Telefone de emergência</Label>
          <Input
            id="emergency_contact_phone"
            value={form.emergency_contact_phone ?? ''}
            onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
          {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
          <Button type="submit" isLoading={mutation.isPending}>
            Salvar perfil
          </Button>
        </div>
      </form>
    </Card>
  )
}

function CnhUploadSection({
  hasDocument,
  onUploaded,
}: {
  hasDocument: boolean
  onUploaded: () => void
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (file: File) => driverProfileApi.uploadCnh(file),
    onSuccess: () => {
      setErrorMessage(null)
      onUploaded()
    },
    onError: (err) => setErrorMessage(getApiErrorMessage(err, 'Não foi possível enviar a CNH.')),
  })

  return (
    <Card>
      <CardTitle>Documento CNH</CardTitle>
      <CardDescription>
        {hasDocument ? 'CNH já enviada.' : 'Envie uma foto ou PDF da sua CNH.'}
      </CardDescription>
      <div className="mt-4">
        <Input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) mutation.mutate(file)
          }}
        />
        {errorMessage ? <div className="mt-2"><ErrorMessage message={errorMessage} /></div> : null}
      </div>
    </Card>
  )
}
