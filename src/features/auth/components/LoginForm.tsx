import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/auth.schema'
import { Button } from '@/shared/components/ui/Button'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { ROUTES } from '@/shared/constants/routes'

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
  errorMessage?: string | null
  isLoading?: boolean
}

export function LoginForm({ onSubmit, errorMessage, isLoading = false }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'gerente@alpha.com',
      password: 'password',
    },
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" autoComplete="email" hasError={!!errors.email} {...register('email')} />
        {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
      </div>

      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          hasError={!!errors.password}
          {...register('password')}
        />
        {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
      </div>

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Entrar
      </Button>

      <p className="text-center text-sm text-muted">
        Não tem conta?{' '}
        <Link className="font-medium text-primary hover:underline" to={ROUTES.register}>
          Criar conta
        </Link>
      </p>
    </form>
  )
}
