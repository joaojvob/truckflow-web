import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { createTenantSchema, type CreateTenantFormData } from '@/features/tenant/services/tenant-api'
import { Button } from '@/shared/components/ui/Button'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'

interface CreateTenantFormProps {
  onSubmit: (data: CreateTenantFormData) => Promise<void>
  errorMessage?: string | null
  isLoading?: boolean
}

export function CreateTenantForm({ onSubmit, errorMessage, isLoading = false }: CreateTenantFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTenantFormData>({
    resolver: zodResolver(createTenantSchema),
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="name">Nome da empresa</Label>
        <Input id="name" hasError={!!errors.name} {...register('name')} />
        {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
      </div>

      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" placeholder="transportadora-alpha" hasError={!!errors.slug} {...register('slug')} />
        {errors.slug ? <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p> : null}
      </div>

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Criar empresa
      </Button>
    </form>
  )
}
