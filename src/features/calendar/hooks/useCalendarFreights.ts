import { useQuery } from '@tanstack/react-query'
import { freightsApi } from '@/features/freights/services/freights-api'

export function useCalendarFreights(deadlineFrom: string, deadlineTo: string) {
  return useQuery({
    queryKey: ['freights', 'calendar', deadlineFrom, deadlineTo],
    queryFn: () =>
      freightsApi.listByDeadline({
        deadline_from: deadlineFrom,
        deadline_to: deadlineTo,
        per_page: 100,
      }),
    enabled: Boolean(deadlineFrom && deadlineTo),
  })
}
