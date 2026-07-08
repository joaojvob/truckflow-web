import type { FreightStatus } from '@/shared/types/api.types'

export const STATUS_COLORS: Record<FreightStatus, string> = {
  pending: 'bg-pastel-blue border-blue-300 text-blue-800',
  assigned: 'bg-pastel-purple border-purple-300 text-purple-800',
  accepted: 'bg-pastel-cyan border-cyan-300 text-cyan-800',
  ready: 'bg-pastel-green border-green-300 text-green-800',
  in_transit: 'bg-pastel-orange border-orange-300 text-orange-800',
  completed: 'bg-slate-100 border-slate-300 text-slate-700',
  cancelled: 'bg-red-50 border-red-200 text-red-700',
  rejected: 'bg-red-50 border-red-300 text-red-800',
}

export const STATUS_DOT_COLORS: Record<FreightStatus, string> = {
  pending: 'bg-blue-500',
  assigned: 'bg-purple-500',
  accepted: 'bg-cyan-500',
  ready: 'bg-green-500',
  in_transit: 'bg-orange-500',
  completed: 'bg-slate-400',
  cancelled: 'bg-red-400',
  rejected: 'bg-red-500',
}
