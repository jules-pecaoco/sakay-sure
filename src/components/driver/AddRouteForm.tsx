import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { createDriverRoute } from '@/services/firebase/routes'
import { fetchRouteGeometry } from '@/services/mapbox/directions'
import { useUserLocation } from '@/hooks/useUserLocation'
import FormField from '@/components/common/FormField'
import VehicleTypeSelector from './VehicleTypeSelector'
import PricingFields from './PricingFields'
import StopSearchInput from '@/components/map/StopSearchInput'
import RouteMapPreview from '@/components/map/RouteMapPreview'
import LocationPermissionBanner from '@/components/common/LocationPermissionBanner'
import { Check, X, ChevronUp, ChevronDown } from 'lucide-react'
import type { VehicleType, Stop, DriverPricing } from '@/types'

const STEPS = ['Details', 'Stops', 'Schedule'] as const
type StepIndex = 0 | 1 | 2

function StepBar({ current }: { current: StepIndex }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`
              flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0
              ${done ? 'bg-primary-500 text-white' : active ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-500' : 'bg-slate-100 text-slate-400'}
            `}>
              {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs font-medium ${active ? 'text-primary-600' : done ? 'text-slate-500' : 'text-slate-400'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px ${done ? 'bg-primary-300' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function AddRouteForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { location: userLocation, status: locationStatus, request: requestLocation } = useUserLocation()

  const [step, setStep] = useState<StepIndex>(0)

  // Step 1
  const [name, setName] = useState('')
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null)
  const [pricing, setPricing] = useState<DriverPricing | null>(null)
  const [step1Errors, setStep1Errors] = useState<{ name?: string; vehicleType?: string }>({})

  // Step 2
  const [stops, setStops] = useState<Stop[]>([])
  const [geometry, setGeometry] = useState<GeoJSON.LineString | null>(null)
  const [stopError, setStopError] = useState<string | null>(null)
  const [fetchingGeometry, setFetchingGeometry] = useState(false)

  // Step 3
  const [startTime, setStartTime] = useState('06:00')
  const [endTime, setEndTime] = useState('22:00')
  const [scheduleError, setScheduleError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function validateStep1() {
    const errs: typeof step1Errors = {}
    if (!name.trim()) errs.name = 'Route name is required.'
    if (!vehicleType) errs.vehicleType = 'Please select a vehicle type.'
    setStep1Errors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleAddStop(partial: Omit<Stop, 'id'>) {
    setStopError(null)
    const stop: Stop = { id: crypto.randomUUID(), ...partial }
    const newStops = [...stops, stop]
    setStops(newStops)
    if (newStops.length >= 2) {
      setFetchingGeometry(true)
      const geo = await fetchRouteGeometry(newStops.map((s) => s.coordinates))
      setGeometry(geo)
      setFetchingGeometry(false)
    }
  }

  function handleRemoveStop(id: string) {
    const newStops = stops.filter((s) => s.id !== id)
    setStops(newStops)
    if (newStops.length < 2) setGeometry(null)
  }

  function handleMoveStop(id: string, dir: 'up' | 'down') {
    const idx = stops.findIndex((s) => s.id === id)
    if (idx < 0) return
    const next = [...stops]
    const swap = dir === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    setStops(next)
  }

  function validateStep2() {
    if (stops.length < 2) { setStopError('Add at least 2 stops.'); return false }
    return true
  }

  function validateSchedule() {
    if (startTime >= endTime) { setScheduleError('End time must be after start time.'); return false }
    setScheduleError(null)
    return true
  }

  async function handleSubmit() {
    if (!user || !vehicleType) return
    if (!validateSchedule()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await createDriverRoute({
        driverId: user.uid,
        name: name.trim(),
        vehicleType,
        stops,
        geometry,
        schedule: { startTime, endTime },
        pricing,
      })
      navigate('/driver')
    } catch (err) {
      console.error(err)
      setSubmitError('Failed to save route. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const proximity = userLocation
    ? [userLocation.lng, userLocation.lat] as [number, number]
    : undefined

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <StepBar current={step} />

      {/* ── Step 1: Details ─────────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-5">
          <FormField
            label="Route name"
            placeholder="e.g. SM Seaside – Colon"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={step1Errors.name}
          />
          <VehicleTypeSelector
            selected={vehicleType}
            onChange={setVehicleType}
            error={step1Errors.vehicleType}
          />
          <PricingFields pricing={pricing} onChange={setPricing} />
          <button
            type="button"
            onClick={() => { if (validateStep1()) setStep(1) }}
            className="w-full rounded-xl bg-primary-500 py-3.5 text-sm font-semibold text-white hover:bg-primary-600 active:scale-[.98] transition-all"
          >
            Next: Add stops →
          </button>
        </div>
      )}

      {/* ── Step 2: Stops ─────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <LocationPermissionBanner status={locationStatus} onRequest={requestLocation} />

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Search & add stops</p>
            <StopSearchInput onSelect={handleAddStop} proximity={proximity} />
            {stopError && <p className="text-xs text-red-500">{stopError}</p>}
          </div>

          {stops.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {stops.length} stop{stops.length !== 1 ? 's' : ''} added
              </p>
              {stops.map((stop, i) => (
                <div key={stop.id} className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2.5">
                  <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0
                    ${i === 0 ? 'bg-green-100 text-green-700' : i === stops.length - 1 ? 'bg-red-100 text-red-600' : 'bg-primary-100 text-primary-600'}`}>
                    {i === 0 ? 'S' : i === stops.length - 1 ? 'E' : i}
                  </span>
                  <span className="flex-1 text-sm text-slate-700 truncate">{stop.name.split(',')[0]}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => handleMoveStop(stop.id, 'up')} disabled={i === 0}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-25">
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => handleMoveStop(stop.id, 'down')} disabled={i === stops.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-25">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => handleRemoveStop(stop.id)}
                      className="p-1 text-red-400 hover:text-red-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {fetchingGeometry && (
            <p className="text-xs text-slate-400 text-center animate-pulse">Drawing route…</p>
          )}

          <RouteMapPreview stops={stops} geometry={geometry} userLocation={userLocation} />

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(0)}
              className="flex-1 rounded-xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              ← Back
            </button>
            <button type="button" onClick={() => { if (validateStep2()) setStep(2) }}
              className="flex-1 rounded-xl bg-primary-500 py-3.5 text-sm font-semibold text-white hover:bg-primary-600 active:scale-[.98] transition-all">
              Next: Schedule →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Schedule ──────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
            <p className="text-sm font-medium text-slate-700">Operating hours</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Start time</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">End time</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15" />
              </div>
            </div>
            {scheduleError && <p className="text-xs text-red-500">{scheduleError}</p>}
          </div>

          {/* Summary */}
          <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Summary</p>
            <p className="text-sm font-semibold text-slate-800">{name}</p>
            <p className="text-xs text-slate-500 capitalize">
              {vehicleType} · {stops.length} stops · {startTime}–{endTime}
            </p>
            {pricing && (
              <p className="text-xs text-slate-500">
                Fare: ₱{pricing.minFare}
                {pricing.perStopFare ? ` + ₱${pricing.perStopFare}/stop` : ' flat rate'}
              </p>
            )}
          </div>

          {submitError && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{submitError}</div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)}
              className="flex-1 rounded-xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              ← Back
            </button>
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="flex-1 rounded-xl bg-primary-500 py-3.5 text-sm font-semibold text-white hover:bg-primary-600 active:scale-[.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
              ) : (
                <><Check className="w-4 h-4" /> Save route</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
