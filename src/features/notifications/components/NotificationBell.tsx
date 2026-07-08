import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useNotificationActions,
  useUnreadNotifications,
} from '@/features/notifications/hooks/useNotifications'
import type { AppNotification } from '@/features/notifications/services/notifications-api'
import { Button } from '@/shared/components/ui/Button'
import { ROUTES } from '@/shared/constants/routes'
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/format'

const TYPE_LABELS: Record<string, string> = {
  freight_assigned: 'Frete atribuído',
  freight_driver_responded: 'Resposta do motorista',
  freight_status_changed: 'Status do frete',
  freight_approved: 'Viagem liberada',
  doping_test_submitted: 'Doping enviado',
  doping_test_reviewed: 'Doping revisado',
  checklist_submitted: 'Checklist enviado',
}

function notificationTitle(notification: AppNotification): string {
  return TYPE_LABELS[notification.data.type] ?? 'Notificação'
}

export function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const { data, isLoading } = useUnreadNotifications()
  const { markAsRead, markAllAsRead } = useNotificationActions()

  const count = data?.count ?? 0
  const notifications = data?.notifications ?? []

  useEffect(() => {
    if (!open) return

    function onClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  async function handleClick(notification: AppNotification) {
    if (!notification.read_at) {
      await markAsRead.mutateAsync(notification.id)
    }

    setOpen(false)

    if (notification.data.freight_id) {
      navigate(ROUTES.freightDetail(notification.data.freight_id))
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label="Notificações"
        className="relative rounded-xl p-2 text-muted transition-colors hover:bg-slate-100 hover:text-text"
        onClick={() => setOpen((v) => !v)}
      >
        <BellIcon />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 99 ? '99+' : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-text">Notificações</p>
            {count > 0 ? (
              <Button
                size="sm"
                variant="ghost"
                disabled={markAllAsRead.isPending}
                onClick={() => markAllAsRead.mutate()}
              >
                Marcar todas
              </Button>
            ) : null}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-6 text-center text-sm text-muted">Carregando...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted">Nenhuma notificação nova.</p>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      className={cn(
                        'w-full border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-slate-50',
                        !notification.read_at && 'bg-primary-soft/40',
                      )}
                      onClick={() => void handleClick(notification)}
                    >
                      <p className="text-xs font-medium text-primary">
                        {notificationTitle(notification)}
                      </p>
                      <p className="mt-0.5 text-sm text-text">{notification.data.message}</p>
                      <p className="mt-1 text-xs text-muted">{formatDate(notification.created_at)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
