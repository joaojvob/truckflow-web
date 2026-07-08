import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supportApi } from '@/features/support/services/support-api'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { Select } from '@/shared/components/ui/Select'
import { Textarea } from '@/shared/components/ui/Textarea'
import { ROUTES } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/lib/api-client'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { isManagerOrAdmin } from '@/shared/lib/role-routing'

export function SupportCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('general')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => supportApi.create({ subject, category, message }),
    onSuccess: (ticket) => {
      void queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] })
      navigate(`/suporte/${ticket.id}`)
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  return (
    <div>
      <PageHeader title="Novo chamado" description="Descreva sua dúvida ou problema." />
      {error ? <ErrorMessage message={error} /> : null}
      <Card className="max-w-xl space-y-4 p-6">
        <div>
          <Label htmlFor="subject">Assunto</Label>
          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="general">Geral</option>
            <option value="technical">Técnico</option>
            <option value="billing">Financeiro</option>
            <option value="fiscal">Fiscal</option>
            <option value="freight">Fretes</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="message">Mensagem</Label>
          <Textarea id="message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
            Enviar
          </Button>
          <Link to={ROUTES.support}>
            <Button variant="ghost">Cancelar</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export function SupportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [reply, setReply] = useState('')

  const { data: ticket, isLoading, isError, error } = useQuery({
    queryKey: ['support', 'ticket', id],
    queryFn: () => supportApi.get(Number(id)),
    enabled: Boolean(id),
  })

  const replyMutation = useMutation({
    mutationFn: (message: string) => supportApi.reply(Number(id), message),
    onSuccess: () => {
      setReply('')
      void queryClient.invalidateQueries({ queryKey: ['support', 'ticket', id] })
      void queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] })
    },
  })

  const closeMutation = useMutation({
    mutationFn: () => supportApi.close(Number(id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['support', 'ticket', id] })
    },
  })

  if (isLoading) return <LoadingState />
  if (isError || !ticket) return <ErrorMessage message={getApiErrorMessage(error)} />

  const canManage = user ? isManagerOrAdmin(user.role) : false

  return (
    <div>
      <PageHeader title={ticket.subject} description={`Status: ${ticket.status}`} />
      <div className="mb-4">
        <Link to={ROUTES.support} className="text-sm text-primary hover:underline">
          ← Voltar
        </Link>
      </div>

      <div className="space-y-3">
        {ticket.messages?.map((msg) => (
          <Card
            key={msg.id}
            className={`p-4 ${msg.is_staff ? 'border-l-4 border-l-primary bg-primary-soft/30' : ''}`}
          >
            <p className="mb-1 text-xs font-medium text-muted">
              {msg.user.name} · {new Date(msg.created_at).toLocaleString('pt-BR')}
              {msg.is_staff ? ' · Equipe' : ''}
            </p>
            <p className="whitespace-pre-wrap text-sm text-text">{msg.body}</p>
          </Card>
        ))}
      </div>

      {ticket.status !== 'closed' ? (
        <Card className="mt-4 space-y-3 p-4">
          <Textarea rows={3} placeholder="Sua resposta..." value={reply} onChange={(e) => setReply(e.target.value)} />
          <div className="flex gap-2">
            <Button
              size="sm"
              isLoading={replyMutation.isPending}
              onClick={() => reply && replyMutation.mutate(reply)}
            >
              Responder
            </Button>
            {canManage ? (
              <Button size="sm" variant="secondary" isLoading={closeMutation.isPending} onClick={() => closeMutation.mutate()}>
                Encerrar chamado
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}
    </div>
  )
}
