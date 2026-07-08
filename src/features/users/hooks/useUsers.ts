import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/features/users/services/users-api'

export function useUsers(page = 1) {
  return useQuery({
    queryKey: ['users', page],
    queryFn: () => usersApi.list(page),
  })
}
