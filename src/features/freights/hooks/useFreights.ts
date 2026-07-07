import { useQuery } from '@tanstack/react-query'
import { freightsApi } from '@/features/freights/services/freights-api'

export function useFreights(page = 1) {
  return useQuery({
    queryKey: ['freights', page],
    queryFn: () => freightsApi.list(page),
  })
}

export function useFreight(id: number) {
  return useQuery({
    queryKey: ['freights', id],
    queryFn: () => freightsApi.getById(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}
