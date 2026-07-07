import type { FreightStatus } from '@/shared/types/api.types'
import { Badge } from '@/shared/components/ui/Badge'

const statusTone: Record<FreightStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'default',
  assigned: 'info',
  accepted: 'info',
  ready: 'warning',
  in_transit: 'warning',
  completed: 'success',
  cancelled: 'danger',
  rejected: 'danger',
}

interface FreightStatusBadgeProps {
  status: FreightStatus
  label?: string
}

export function FreightStatusBadge({ status, label }: FreightStatusBadgeProps) {
  return <Badge tone={statusTone[status]}>{label ?? status}</Badge>
}
