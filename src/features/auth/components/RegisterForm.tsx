import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas/auth.schema'
import { Button } from '@/shared/components/ui/Button'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { ROUTES } from '@/shared/constants/routes'

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>
  errorMessage?: string | null
  isLoading?: boolean
}

export function RegisterForm({ onSubmit, errorMessage, isLoading = false }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" hasError={!!errors.name} {...register('name')} />
        {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
      </div>

      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" hasError={!!errors.email} {...register('email')} />
        {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
      </div>

      <div>
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" hasError={!!errors.password} {...register('password')} />
        {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
      </div>

      <div>
        <Label htmlFor="password_confirmation">Confirmar senha</Label>
        <Input
          id="password_confirmation"
          type="password"
          hasError={!!errors.password_confirmation}
          {...register('password_confirmation')}
        />
        {errors.password_confirmation ? (
          <p className="mt-1 text-xs text-red-600">{errors.password_confirmation.message}</p>
        ) : null}
      </div>

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Criar conta
      </Button>

      <p className="text-center text-sm text-muted">
        Já tem conta?{' '}
        <Link className="font-medium text-primary hover:underline" to={ROUTES.login}>
          Entrar
        </Link>
      </p>
    </form>
  )
}
