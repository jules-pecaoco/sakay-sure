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
import { Check, X, ChevronUp, ChevronDown, Navigation, Clock, CreditCard, MapPin } from 'lucide-react'
import { reverseGeocode } from '@/services/mapbox/geocoder'
import type { VehicleType, Stop, DriverPricing } from '@/types'

const STEPS = ['Details', 'Stops', 'Schedule'] as const
type StepIndex = 0 | 1 | 2

function StepBar({ current }: { current: StepIndex }) {
  return (
    <div className="flex items-center gap-3 mb-8 bg-white border-[1.5px] border-slate-200 rounded-xl p-3 shadow-sm">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} className="flex items-center gap-2 flex-1 relative">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-lg text-[10px] font-display shrink-0 border-[1.5px] transition-all
              ${done ? 'bg-primary-500 border-ink text-white shadow-sm' : active ? 'bg-white border-primary-500 text-primary-500 shadow-md scale-110' : 'bg-surface border-slate-200 text-muted'}
            `}>
              {done ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
            </div>
            <span className={`text-[9px] font-display uppercase tracking-widest hidden sm:block ${active ? 'text-ink' : done ? 'text-muted' : 'text-muted/50'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full mx-1 ${done ? 'bg-primary-500' : 'bg-slate-200'}`} />
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
  const [pendingPin, setPendingPin] = useState<{lng: number, lat: number} | null>(null)
  const [isResolvingPin, setIsResolvingPin] = useState(false)

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

  function handleMapClick(lngLat: { lng: number; lat: number }) {
    setPendingPin(lngLat)
  }

  async function confirmPin() {
    if (!pendingPin) return
    setIsResolvingPin(true)
    try {
      const placeName = await reverseGeocode(pendingPin.lng, pendingPin.lat)
      await handleAddStop({ name: placeName, coordinates: pendingPin })
    } finally {
      setIsResolvingPin(false)
      setPendingPin(null)
    }
  }

  function handleRemoveStop(id: string) {
    const newStops = stops.filter((s) => s.id !== id)
    setStops(newStops)
    if (newStops.length < 2) setGeometry(null)
  }

  function handleRenameStop(id: string, newName: string) {
    setStops(stops.map(s => s.id === id ? { ...s, name: newName } : s))
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
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <StepBar current={step} />

      {/* ── Step 1: Details ─────────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <FormField
            label="Route Name Tag"
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
            className="
              w-full rounded-xl bg-primary-500 py-4 text-[12px] font-display uppercase tracking-widest text-white
              border-b-4 border-primary-700 shadow-md transition-all mt-4
              hover:bg-primary-600 active:border-b-0 active:translate-y-1 active:shadow-none
            "
          >
           Add stops
          </button>
        </div>
      )}

      {/* ── Step 2: Stops ─────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <LocationPermissionBanner status={locationStatus} onRequest={requestLocation} />

          <div className="space-y-3">
            <p className="section-label pl-1">Signboard Stops</p>
            <div className="border-[1.5px] border-slate-200 rounded-xl focus-within:border-ink transition-all">
              <StopSearchInput onSelect={handleAddStop} proximity={proximity} />
            </div>
            {stopError && <p className="text-[10px] font-bold text-primary-500 uppercase tracking-tight pl-1">{stopError}</p>}
          </div>

          {stops.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider pl-1 font-display">
                {stops.length} Signboard{stops.length !== 1 ? 's' : ''} added
              </p>
              <div className="space-y-3">
                {stops.map((stop, i) => (
                  <div key={stop.id} className="flex items-center gap-3 bg-white rounded-xl border-[1.5px] border-ink px-4 py-3.5 shadow-[4px_4px_0px_0px_rgba(26,18,8,0.05)]">
                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-[10px] font-display shrink-0 shadow-sm
                      ${i === 0 ? 'bg-primary-500 border-ink text-white' : i === stops.length - 1 ? 'bg-accent-500 border-ink text-ink font-bold' : 'bg-surface border-slate-200 text-ink'}`}>
                      {i === 0 ? 'START' : i === stops.length - 1 ? 'END' : i}
                    </div>
                    <input
                      type="text"
                      value={stop.name.split(',')[0]}
                      onChange={(e) => handleRenameStop(stop.id, e.target.value)}
                      placeholder="Stop name"
                      title="Click to rename stop"
                      className="flex-1 min-w-0 text-sm font-bold text-ink bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 rounded px-2 py-1 -ml-2 border-none outline-none truncate uppercase tracking-tight transition-all"
                    />
                    <div className="flex items-center gap-1.5 pl-2">
                      <button type="button" onClick={() => handleMoveStop(stop.id, 'up')} disabled={i === 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-surface hover:text-ink disabled:opacity-25 transition-all">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => handleMoveStop(stop.id, 'down')} disabled={i === stops.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-surface hover:text-ink disabled:opacity-25 transition-all">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-slate-200 mx-0.5" />
                      <button type="button" onClick={() => handleRemoveStop(stop.id)}
                        className="p-1.5 rounded-lg text-primary-400 hover:bg-primary-50 hover:text-primary-600 transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fetchingGeometry && (
            <div className="flex justify-center items-center gap-2">
               <span className="w-4 h-4 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
               <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none">Drawing route…</p>
            </div>
          )}

          <div className="border-[2.5px] border-ink rounded-xl overflow-hidden shadow-md">
            <RouteMapPreview stops={stops} geometry={geometry} userLocation={userLocation} className="h-60" interactive={true} onMapClick={handleMapClick} />
          </div>

          {pendingPin && (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary-600" />
                   </div>
                   <h3 className="text-xl font-display text-ink uppercase tracking-tight leading-none">Add this stop?</h3>
                 </div>
                 <p className="text-sm font-medium text-slate-600 leading-relaxed">
                   Are you sure you want to add this location as a stop? Is this pin another stop/place where people commonly disembark?
                 </p>
                 <div className="flex gap-3 pt-2">
                   <button
                      type="button"
                      disabled={isResolvingPin}
                      onClick={() => setPendingPin(null)}
                      className="flex-1 py-3.5 rounded-xl border-[1.5px] border-slate-200 text-[11px] font-display uppercase tracking-widest text-muted hover:bg-slate-50 hover:text-ink transition-all"
                   >
                      Cancel
                   </button>
                   <button
                      type="button"
                      disabled={isResolvingPin}
                      onClick={confirmPin}
                      className="flex-1 bg-primary-500 py-3.5 rounded-xl text-[11px] font-display uppercase tracking-widest text-white shadow-md border-b-[4px] border-primary-700 active:border-b-0 active:translate-y-1 active:shadow-none transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                   >
                      {isResolvingPin ? (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Yes, add stop"
                      )}
                   </button>
                 </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button type="button" onClick={() => setStep(0)}
              className="flex-1 rounded-xl border-[1.5px] border-slate-200 py-4 text-[11px] font-display uppercase tracking-widest text-muted hover:bg-white hover:border-ink hover:text-ink transition-all">
              Balik
            </button>
            <button type="button" onClick={() => { if (validateStep2()) setStep(2) }}
              className="
                flex-1 rounded-xl bg-ink py-4 text-[11px] font-display uppercase tracking-widest text-white shadow-md
                border-b-4 border-slate-700 active:border-b-0 active:translate-y-1 active:shadow-none transition-all
              ">
              Sunod
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Schedule ──────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-white rounded-xl border-[1.5px] border-ink p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(26,18,8,0.05)]">
            <p className="section-label pl-0.5">Operating Schedule</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Starts at</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-slate-200 bg-surface/30 px-4 py-3 text-sm font-bold text-ink outline-none focus:border-ink focus:bg-white transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Ends at</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-slate-200 bg-surface/30 px-4 py-3 text-sm font-bold text-ink outline-none focus:border-ink focus:bg-white transition-all" />
              </div>
            </div>
            {scheduleError && <p className="text-[10px] font-bold text-primary-500 uppercase tracking-tight">{scheduleError}</p>}
          </div>

          {/* Summary Signboard */}
          <div className="bg-accent-500 border-2 border-ink rounded-xl p-5 space-y-4 shadow-[6px_6px_0px_0px_rgba(26,18,8,0.05)]">
            <p className="section-label text-ink! font-display!">Route Signboard Summary</p>
            <div className="space-y-3">
               <h3 className="text-2xl font-display text-ink uppercase tracking-tight leading-tight">{name}</h3>
               <div className="flex flex-wrap gap-2">
                  <SummaryBadge icon={<Navigation className="w-3 h-3" />} text={`${stops.length} Stops`} />
                  <SummaryBadge icon={<Clock className="w-3 h-3" />} text={`${startTime} - ${endTime}`} />
                  {pricing && <SummaryBadge icon={<CreditCard className="w-3 h-3" />} text={`₱${pricing.minFare} MIN`} />}
               </div>
            </div>
          </div>

          {submitError && (
            <div className="rounded-xl bg-primary-100 border-[1.5px] border-primary-500 px-4 py-3 text-[10px] font-bold text-primary-600 uppercase tracking-tight">{submitError}</div>
          )}

          <div className="flex gap-4">
            <button type="button" onClick={() => setStep(1)}
              className="flex-1 rounded-xl border-[1.5px] border-slate-200 py-4 text-[11px] font-display uppercase tracking-widest text-muted hover:bg-white hover:border-ink hover:text-ink transition-all">
              Balik
            </button>
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="
                flex-1 rounded-xl bg-primary-500 py-4 text-[11px] font-display uppercase tracking-widest text-white shadow-md
                border-b-4 border-primary-700 active:border-b-0 active:translate-y-1 active:shadow-none transition-all
                disabled:opacity-60 flex items-center justify-center gap-2
              ">
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sige lang…</>
              ) : (
                <><Check className="w-4 h-4" strokeWidth={3} /> Isubmit ang Route</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="bg-white/40 border border-ink/10 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
      <span className="text-ink">{icon}</span>
      <span className="text-[10px] font-bold text-ink uppercase tracking-tight">{text}</span>
    </div>
  )
}
