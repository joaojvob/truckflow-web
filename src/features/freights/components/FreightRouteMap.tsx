import { useMemo } from 'react'
import type { Freight } from '@/features/freights/types/freight.types'
import type { Waypoint } from '@/features/waypoints/services/waypoints-api'
import { decodePolyline } from '@/shared/lib/polyline'
import { cn } from '@/shared/lib/cn'

interface MapPoint {
  id: string
  label: string
  lat: number
  lng: number
  tone: 'origin' | 'destination' | 'waypoint'
  icon?: string
}

interface FreightRouteMapProps {
  freight: Freight
  waypoints?: Waypoint[]
  polyline?: string | null
  className?: string
}

const TONE_COLORS = {
  origin: '#22c55e',
  destination: '#ef4444',
  waypoint: '#5b5bf5',
}

export function FreightRouteMap({ freight, waypoints = [], polyline, className }: FreightRouteMapProps) {
  const points = useMemo(() => {
    const list: MapPoint[] = []

    if (freight.origin?.lat != null && freight.origin?.lng != null) {
      list.push({
        id: 'origin',
        label: 'Origem',
        lat: freight.origin.lat,
        lng: freight.origin.lng,
        tone: 'origin',
      })
    }

    for (const wp of [...waypoints].sort((a, b) => a.order - b.order)) {
      if (wp.lat == null || wp.lng == null) continue
      list.push({
        id: `wp-${wp.id}`,
        label: wp.name,
        lat: wp.lat,
        lng: wp.lng,
        tone: 'waypoint',
        icon: wp.type_icon,
      })
    }

    if (freight.destination?.lat != null && freight.destination?.lng != null) {
      list.push({
        id: 'destination',
        label: 'Destino',
        lat: freight.destination.lat,
        lng: freight.destination.lng,
        tone: 'destination',
      })
    }

    return list
  }, [freight, waypoints])

  const routePath = useMemo(() => {
    if (polyline) {
      const decoded = decodePolyline(polyline)
      if (decoded.length >= 2) return decoded.map(([lat, lng]) => ({ lat, lng }))
    }
    return points.map((p) => ({ lat: p.lat, lng: p.lng }))
  }, [polyline, points])

  if (points.length < 2) {
    return (
      <div className={cn('flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-slate-50 text-sm text-muted', className)}>
        Coordenadas insuficientes para exibir o mapa.
      </div>
    )
  }

  const padding = 24
  const width = 640
  const height = 320

  const allCoords = routePath.length >= 2 ? routePath : points.map((p) => ({ lat: p.lat, lng: p.lng }))
  const lats = allCoords.map((c) => c.lat)
  const lngs = allCoords.map((c) => c.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  const latSpan = maxLat - minLat || 0.01
  const lngSpan = maxLng - minLng || 0.01

  function project(lat: number, lng: number): { x: number; y: number } {
    const x = padding + ((lng - minLng) / lngSpan) * (width - padding * 2)
    const y = padding + (1 - (lat - minLat) / latSpan) * (height - padding * 2)
    return { x, y }
  }

  const pathD = routePath
    .map((coord, i) => {
      const { x, y } = project(coord.lat, coord.lng)
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-slate-50', className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full" role="img" aria-label="Mapa da rota">
        <rect width={width} height={height} fill="#f8fafc" />
        <path d={pathD} fill="none" stroke="#5b5bf5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />

        {points.map((point) => {
          const { x, y } = project(point.lat, point.lng)
          const color = TONE_COLORS[point.tone]
          return (
            <g key={point.id}>
              <circle cx={x} cy={y} r={10} fill={color} stroke="white" strokeWidth={2} />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill="white">
                {point.icon ?? (point.tone === 'origin' ? 'A' : point.tone === 'destination' ? 'B' : '•')}
              </text>
              <title>{`${point.label} (${point.lat.toFixed(4)}, ${point.lng.toFixed(4)})`}</title>
            </g>
          )
        })}
      </svg>

      <div className="flex flex-wrap gap-4 border-t border-border bg-white px-4 py-2 text-xs text-muted">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Origem</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Paradas</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Destino</span>
        {freight.distance_km ? <span className="ml-auto">{freight.distance_km.toFixed(0)} km</span> : null}
      </div>
    </div>
  )
}
