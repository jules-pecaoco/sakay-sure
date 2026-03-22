import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Stop } from '@/types'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

interface RouteMapPreviewProps {
  stops: Stop[]
  geometry?: GeoJSON.LineString | null
  className?: string
  /** If provided and no stops yet, center and zoom the map here */
  userLocation?: { lng: number; lat: number } | null
  interactive?: boolean
  onMapClick?: (lngLat: { lng: number; lat: number }) => void
}

const DEFAULT_CENTER: [number, number] = [123.8854, 10.3157]
const DEFAULT_ZOOM = 12

export default function RouteMapPreview({
  stops,
  geometry,
  className = 'h-48 rounded-2xl overflow-hidden',
  userLocation,
  interactive = false,
  onMapClick,
}: RouteMapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef        = useRef<mapboxgl.Map | null>(null)
  const markersRef    = useRef<mapboxgl.Marker[]>([])
  const styleLoadedRef       = useRef(false)
  const pendingGeometryRef   = useRef<GeoJSON.LineString | null | undefined>(undefined)

  // ── Init map ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return

    const initialCenter: [number, number] = userLocation
      ? [userLocation.lng, userLocation.lat]
      : DEFAULT_CENTER

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: userLocation ? 14 : DEFAULT_ZOOM,
      interactive: interactive,
      attributionControl: false,
      cooperativeGestures: interactive, // require two fingers to pan on mobile
    })

    map.addControl(new mapboxgl.AttributionControl({ compact: true }))
    mapRef.current = map

    map.on('load', () => {
      styleLoadedRef.current = true

      map.addSource('route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#3b82f6', 'line-width': 4, 'line-opacity': 0.85 },
      })

      if (pendingGeometryRef.current !== undefined) {
        applyGeometry(map, pendingGeometryRef.current ?? null)
        pendingGeometryRef.current = undefined
      }
    })

    if (onMapClick) {
      map.on('click', (e) => {
        // Only trigger if we click on the map surface, not on a marker if we had marker click events,
        // mapboxgl markers capture their own events by default, so map click won't fire.
        // Convert mapboxgl.LngLat to a plain JS object to avoid Firebase serialization errors
        onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat })
      })
      // Change cursor to make it look clickable
      map.getCanvas().style.cursor = 'crosshair'
    }

    return () => {
      styleLoadedRef.current = false
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, onMapClick]) // Re-run if these props change, though normally they are static 

  // ── Fly to user location when it arrives (only if no stops yet) ───────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !userLocation || stops.length > 0) return
    map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 14, duration: 800 })
  }, [userLocation, stops.length])

  // ── Update stop markers ───────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    stops.forEach((stop, i) => {
      const isFirst = i === 0
      const isLast  = i === stops.length - 1

      const el = document.createElement('div')
      el.style.cssText = `
        width:28px;height:28px;border-radius:50%;
        background:${isFirst ? '#22c55e' : isLast ? '#ef4444' : '#3b82f6'};
        border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
        color:white;font-size:11px;font-weight:700;
      `
      el.textContent = isFirst ? 'S' : isLast ? 'E' : String(i)

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
        .setPopup(new mapboxgl.Popup({ offset: 16 }).setText(stop.name))
        .addTo(map)

      markersRef.current.push(marker)
    })

    if (stops.length > 1) {
      const bounds = new mapboxgl.LngLatBounds()
      stops.forEach((s) => bounds.extend([s.coordinates.lng, s.coordinates.lat]))
      map.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 600 })
    } else if (stops.length === 1) {
      map.flyTo({ center: [stops[0].coordinates.lng, stops[0].coordinates.lat], zoom: 14, duration: 600 })
    }
  }, [stops])

  // ── Update route line ─────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (!styleLoadedRef.current) {
      pendingGeometryRef.current = geometry
      return
    }

    applyGeometry(map, geometry ?? null)
  }, [geometry])

  return <div ref={containerRef} className={className} />
}

function applyGeometry(map: mapboxgl.Map, geometry: GeoJSON.LineString | null) {
  const source = map.getSource('route') as mapboxgl.GeoJSONSource | undefined
  if (!source) return
  source.setData(
    geometry
      ? { type: 'Feature', properties: {}, geometry }
      : { type: 'FeatureCollection', features: [] },
  )
}
