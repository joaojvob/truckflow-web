import { useEffect, useRef } from 'react'
import { trackingApi } from '@/features/tracking/services/tracking-api'

const MIN_INTERVAL_MS = 15_000

export function useDriverLocationReporter(freightId: number, enabled: boolean) {
  const lastSentRef = useRef(0)

  useEffect(() => {
    if (!enabled || !navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now()
        if (now - lastSentRef.current < MIN_INTERVAL_MS) return

        lastSentRef.current = now

        void trackingApi
          .send(freightId, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            speed_kmh:
              position.coords.speed != null && position.coords.speed >= 0
                ? position.coords.speed * 3.6
                : undefined,
            heading:
              position.coords.heading != null && position.coords.heading >= 0
                ? position.coords.heading
                : undefined,
          })
          .catch(() => {
            // Falhas de rede ou permissão são tratadas silenciosamente; o próximo ciclo tenta de novo.
          })
      },
      () => {
        // Permissão negada ou indisponível — o motorista pode enviar manualmente pelo app mobile.
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10_000,
        timeout: 15_000,
      },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [freightId, enabled])
}
