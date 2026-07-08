import type { VehicleStatus } from '@/features/fleet/types/fleet.types'
import { Badge } from '@/shared/components/ui/Badge'

const STATUS_TONE: Record<VehicleStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  available: 'success',
  in_use: 'info',
  maintenance: 'warning',
  inactive: 'default',
}

export function VehicleStatusBadge({ status, label }: { status: VehicleStatus; label?: string }) {
  return <Badge tone={STATUS_TONE[status]}>{label ?? status}</Badge>
}
