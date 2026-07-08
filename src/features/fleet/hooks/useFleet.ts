import { useQuery } from '@tanstack/react-query'
import { trailersApi, trucksApi } from '@/features/fleet/services/fleet-api'

export function useTrucks(page = 1) {
  return useQuery({
    queryKey: ['trucks', page],
    queryFn: () => trucksApi.list(page),
  })
}

export function useTrailers(page = 1) {
  return useQuery({
    queryKey: ['trailers', page],
    queryFn: () => trailersApi.list(page),
  })
}
