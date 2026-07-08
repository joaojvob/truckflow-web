import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/features/notifications/services/notifications-api'

export function useUnreadNotifications() {
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationsApi.listUnread(),
    refetchInterval: 30_000,
  })
}

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: ['notifications', 'all', page],
    queryFn: () => notificationsApi.list(page),
  })
}

export function useNotificationActions() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: invalidate,
  })

  const markAllAsRead = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: invalidate,
  })

  return { markAsRead, markAllAsRead }
}
