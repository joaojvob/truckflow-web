import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useCalendarFreights } from '@/features/calendar/hooks/useCalendarFreights'
import { STATUS_COLORS } from '@/features/calendar/lib/status-colors'
import type { Freight } from '@/features/freights/types/freight.types'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageHeader } from '@/shared/components/layout/AuthLayout'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { ROUTES } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/lib/api-client'
import { cn } from '@/shared/lib/cn'

type ViewMode = 'week' | 'month'

export function CalendarPage() {
  const [view, setView] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())

  const range = useMemo(() => {
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      return { start, end, days: eachDayOfInterval({ start, end }) }
    }
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const gridStart = startOfWeek(start, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(end, { weekStartsOn: 1 })
    return { start, end, days: eachDayOfInterval({ start: gridStart, end: gridEnd }) }
  }, [view, currentDate])

  const deadlineFrom = range.days[0].toISOString()
  const deadlineTo = range.days[range.days.length - 1].toISOString()

  const { data, isLoading, isError, error } = useCalendarFreights(deadlineFrom, deadlineTo)

  const freightsByDay = useMemo(() => {
    const map = new Map<string, Freight[]>()
    for (const freight of data?.data ?? []) {
      if (!freight.deadline_at) continue
      const key = format(new Date(freight.deadline_at), 'yyyy-MM-dd')
      const list = map.get(key) ?? []
      list.push(freight)
      map.set(key, list)
    }
    return map
  }, [data])

  function navigatePrev() {
    setCurrentDate((d) => (view === 'week' ? addDays(d, -7) : subMonths(d, 1)))
  }

  function navigateNext() {
    setCurrentDate((d) => (view === 'week' ? addDays(d, 7) : addMonths(d, 1)))
  }

  const title =
    view === 'week'
      ? `${format(range.days[0], 'd MMM', { locale: ptBR })} – ${format(range.days[6], 'd MMM yyyy', { locale: ptBR })}`
      : format(currentDate, 'MMMM yyyy', { locale: ptBR })

  return (
    <div>
      <PageHeader
        title="Calendário"
        description="Fretes organizados por prazo de entrega."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-border bg-white p-0.5 shadow-sm">
              <button
                type="button"
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  view === 'week' ? 'bg-primary text-white' : 'text-muted hover:text-text',
                )}
                onClick={() => setView('week')}
              >
                Semana
              </button>
              <button
                type="button"
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  view === 'month' ? 'bg-primary text-white' : 'text-muted hover:text-text',
                )}
                onClick={() => setView('month')}
              >
                Mês
              </button>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date())}>
              Hoje
            </Button>
            <Button variant="secondary" size="sm" onClick={navigatePrev}>
              ←
            </Button>
            <Button variant="secondary" size="sm" onClick={navigateNext}>
              →
            </Button>
          </div>
        }
      />

      <Card className="mb-4">
        <p className="text-lg font-semibold capitalize text-text">{title}</p>
      </Card>

      {isLoading ? <LoadingState message="Carregando calendário..." /> : null}
      {isError ? <ErrorMessage message={getApiErrorMessage(error)} /> : null}

      {!isLoading && !isError ? (
        view === 'week' ? (
          <WeekGrid days={range.days} freightsByDay={freightsByDay} />
        ) : (
          <MonthGrid days={range.days} currentMonth={currentDate} freightsByDay={freightsByDay} />
        )
      ) : null}
    </div>
  )
}

function WeekGrid({
  days,
  freightsByDay,
}: {
  days: Date[]
  freightsByDay: Map<string, Freight[]>
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
      {days.map((day) => {
        const key = format(day, 'yyyy-MM-dd')
        const freights = freightsByDay.get(key) ?? []
        return (
          <Card
            key={key}
            className={cn('min-h-40 p-3', isToday(day) && 'ring-2 ring-primary ring-offset-1')}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase text-muted">
                {format(day, 'EEE', { locale: ptBR })}
              </span>
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                  isToday(day) ? 'bg-primary text-white' : 'text-text',
                )}
              >
                {format(day, 'd')}
              </span>
            </div>
            <div className="space-y-1.5">
              {freights.map((freight) => (
                <FreightEvent key={freight.id} freight={freight} />
              ))}
              {freights.length === 0 ? (
                <p className="text-xs text-muted">Sem fretes</p>
              ) : null}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function MonthGrid({
  days,
  currentMonth,
  freightsByDay,
}: {
  days: Date[]
  currentMonth: Date
  freightsByDay: Map<string, Freight[]>
}) {
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-muted">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const freights = freightsByDay.get(key) ?? []
          const inMonth = isSameMonth(day, currentMonth)
          return (
            <div
              key={key}
              className={cn(
                'min-h-24 rounded-xl border border-border p-2',
                inMonth ? 'bg-white' : 'bg-slate-50 opacity-50',
                isToday(day) && 'ring-2 ring-primary',
              )}
            >
              <span
                className={cn(
                  'text-xs font-semibold',
                  isToday(day) ? 'text-primary' : 'text-muted',
                )}
              >
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-0.5">
                {freights.slice(0, 3).map((freight) => (
                  <FreightEvent key={freight.id} freight={freight} compact />
                ))}
                {freights.length > 3 ? (
                  <p className="text-[10px] text-muted">+{freights.length - 3} mais</p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FreightEvent({ freight, compact = false }: { freight: Freight; compact?: boolean }) {
  const colorClass = STATUS_COLORS[freight.status] ?? 'bg-slate-100 border-slate-200'
  const time = freight.deadline_at
    ? format(new Date(freight.deadline_at), 'HH:mm')
    : ''

  return (
    <Link
      to={ROUTES.freightDetail(freight.id)}
      className={cn(
        'block rounded-lg border px-2 py-1 text-xs transition-opacity hover:opacity-80',
        colorClass,
        compact && 'truncate',
      )}
    >
      {!compact && time ? <span className="font-medium">{time} · </span> : null}
      {freight.cargo_name}
    </Link>
  )
}
