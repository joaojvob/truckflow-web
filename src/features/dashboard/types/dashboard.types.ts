export interface DashboardData {
  freights: {
    total: number
    active: number
    in_transit: number
    completed: number
    by_status: Record<string, number>
  }
  financial: {
    revenue_total: number
    revenue_this_month: number
    avg_freight_value: number
  }
  distance: {
    total_km: number
    avg_km_per_freight: number
  }
}
