import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe a senha.'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Informe seu nome.'),
    email: z.email('Informe um e-mail válido.'),
    password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres.'),
    password_confirmation: z.string().min(8, 'Confirme a senha.'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas não conferem.',
    path: ['password_confirmation'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
