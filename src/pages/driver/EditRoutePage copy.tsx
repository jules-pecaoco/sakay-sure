import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDriverRoutes } from '@/hooks/useDriverRoutes'
import { updateDriverRoute } from '@/services/firebase/routes'
import { fetchRouteGeometry } from '@/services/mapbox/directions'
import { useUserLocation } from '@/hooks/useUserLocation'
import FormField from '@/components/common/FormField'
import VehicleTypeSelector from '@/components/driver/VehicleTypeSelector'
import PricingFields from '@/components/driver/PricingFields'
import StopSearchInput from '@/components/map/StopSearchInput'
import RouteMapPreview from '@/components/map/RouteMapPreview'
import LocationPermissionBanner from '@/components/common/LocationPermissionBanner'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { VehicleType, Stop, DriverPricing } from '@/types'

export default function EditRoutePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { routes, loading } = useDriverRoutes()
  const { location: userLocation, status: locationStatus, request: requestLocation } = useUserLocation()

  const route = routes.find((r) => r.id === id)

  const [name, setName] = useState('')
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null)
  const [pricing, setPricing] = useState<DriverPricing | null>(null)
  const [stops, setStops] = useState<Stop[]>([])
  const [geometry, setGeometry] = useState<GeoJSON.LineString | null>(null)
  const [startTime, setStartTime] = useState('06:00')
  const [endTime, setEndTime] = useState('22:00')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!route) return
    setName(route.name)
    setVehicleType(route.vehicleType)
    setPricing(route.pricing ?? null)
    setStops(route.stops)
    setGeometry(route.geometry)
    setStartTime(route.schedule.startTime)
    setEndTime(route.schedule.endTime)
  }, [route])

  async function handleAddStop(partial: Omit<Stop, 'id'>) {
    const stop: Stop = { id: crypto.randomUUID(), ...partial }
    const newStops = [...stops, stop]
    setStops(newStops)
    if (newStops.length >= 2) {
      const geo = await fetchRouteGeometry(newStops.map((s) => s.coordinates))
      setGeometry(geo)
    }
  }

  function handleRemoveStop(stopId: string) {
    const newStops = stops.filter((s) => s.id !== stopId)
    setStops(newStops)
    if (newStops.length < 2) setGeometry(null)
  }

  async function handleSave() {
    if (!route || !vehicleType) return
    if (stops.length < 2) { setError('Add at least 2 stops.'); return }
    if (startTime >= endTime) { setError('End time must be after start time.'); return }
    setSaving(true)
    setError(null)
    try {
      await updateDriverRoute(route.id, {
        name: name.trim(),
        vehicleType,
        stops,
        geometry,
        schedule: { startTime, endTime },
        pricing,
      })
      navigate('/driver')
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const proximity = userLocation
    ? [userLocation.lng, userLocation.lat] as [number, number]
    : undefined

  if (loading) return <LoadingSpinner fullScreen message="Loading route…" />

  if (!route) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-slate-500">Route not found.</p>
        <button onClick={() => navigate('/driver')} className="text-sky-600 text-sm font-semibold">
          ← Back to dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white px-4 pt-14 pb-4 shadow-sm flex items-center gap-3">
        <button type="button" onClick={() => navigate('/driver')}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors -ml-1">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd"/>
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Edit route</h1>
          <p className="text-xs text-slate-400 truncate max-w-[200px]">{route.name}</p>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
        <FormField label="Route name" value={name} onChange={(e) => setName(e.target.value)} />

        <VehicleTypeSelector selected={vehicleType} onChange={setVehicleType} />

        <PricingFields pricing={pricing} onChange={setPricing} />

        {/* Stops */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Stops</p>
          <LocationPermissionBanner status={locationStatus} onRequest={requestLocation} />
          <StopSearchInput onSelect={handleAddStop} proximity={proximity} />

          {stops.map((stop, i) => (
            <div key={stop.id} className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2.5">
              <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0
                ${i === 0 ? 'bg-green-100 text-green-700' : i === stops.length - 1 ? 'bg-red-100 text-red-600' : 'bg-sky-100 text-sky-600'}`}>
                {i === 0 ? 'S' : i === stops.length - 1 ? 'E' : i}
              </span>
              <span className="flex-1 text-sm text-slate-700 truncate">{stop.name.split(',')[0]}</span>
              <button type="button" onClick={() => handleRemoveStop(stop.id)} className="p-1 text-red-400 hover:text-red-600">✕</button>
            </div>
          ))}

          <RouteMapPreview stops={stops} geometry={geometry} userLocation={userLocation} />
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <p className="text-sm font-medium text-slate-700">Operating hours</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Start</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">End</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500"/>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <button type="button" onClick={handleSave} disabled={saving}
          className="w-full rounded-xl bg-sky-500 py-3.5 text-sm font-semibold text-white hover:bg-sky-600 active:scale-[.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
          ) : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
