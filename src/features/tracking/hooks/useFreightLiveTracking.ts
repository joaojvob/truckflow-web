import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { trackingApi } from '@/features/tracking/services/tracking-api'
import type { DriverLocation, DriverLocationPayload, SosPayload } from '@/features/tracking/types/tracking.types'
import { getEcho, isReverbConfigured } from '@/shared/lib/echo'

function toDriverLocation(payload: DriverLocationPayload): DriverLocation {
  return {
    freight_id: payload.freight_id,
    driver_id: payload.driver_id,
    lat: payload.lat,
    lng: payload.lng,
    speed_kmh: payload.speed_kmh,
    heading: payload.heading,
    recorded_at: payload.recorded_at,
  }
}

function sortTrail(locations: DriverLocation[]): DriverLocation[] {
  return [...locations]
    .filter((loc) => loc.lat != null && loc.lng != null)
    .sort((a, b) => {
      const aTime = a.recorded_at ? new Date(a.recorded_at).getTime() : 0
      const bTime = b.recorded_at ? new Date(b.recorded_at).getTime() : 0
      return aTime - bTime
    })
}

export function useFreightLiveTracking(
  freightId: number,
  tenantId: number | null,
  enabled: boolean,
) {
  const [location, setLocation] = useState<DriverLocation | null>(null)
  const [trail, setTrail] = useState<DriverLocation[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [sosAlert, setSosAlert] = useState<SosPayload | null>(null)

  const { data: initialData } = useQuery({
    queryKey: ['tracking', freightId],
    queryFn: async () => {
      const [latest, history] = await Promise.all([
        trackingApi.latest(freightId),
        trackingApi.history(freightId),
      ])
      return { latest, history: sortTrail(history) }
    },
    enabled: enabled && freightId > 0,
    refetchInterval: enabled && !isReverbConfigured() ? 30_000 : false,
  })

  useEffect(() => {
    if (!initialData) return
    setLocation(initialData.latest)
    setTrail(initialData.history)
  }, [initialData])

  useEffect(() => {
    if (!enabled || !tenantId || !isReverbConfigured()) {
      setIsConnected(false)
      return
    }

    const echo = getEcho()
    if (!echo) return

    const channelName = `tenant.${tenantId}.freight.${freightId}`
    const channel = echo.private(channelName)

    channel.listen('.driver.location.updated', (payload: DriverLocationPayload) => {
      const next = toDriverLocation(payload)
      setLocation(next)
      setTrail((current) => sortTrail([...current, next]).slice(-50))
      setIsConnected(true)
    })

    channel.listen('.freight.sos.triggered', (payload: SosPayload) => {
      setSosAlert(payload)
    })

    channel.subscribed(() => setIsConnected(true))
    channel.error(() => setIsConnected(false))

    return () => {
      echo.leave(channelName)
      setIsConnected(false)
    }
  }, [enabled, tenantId, freightId])

  return {
    location,
    trail,
    isConnected,
    isReverbConfigured: isReverbConfigured(),
    sosAlert,
    clearSos: () => setSosAlert(null),
  }
}
