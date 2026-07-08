import { useQuery } from '@tanstack/react-query'
import { freightsApi, type FreightFilters } from '@/features/freights/services/freights-api'

export function useFreights(page = 1, filters: FreightFilters = {}) {
  return useQuery({
    queryKey: ['freights', page, filters],
    queryFn: () => freightsApi.list(page, filters),
  })
}

export function useFreight(id: number) {
  return useQuery({
    queryKey: ['freights', id],
    queryFn: () => freightsApi.getById(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}
