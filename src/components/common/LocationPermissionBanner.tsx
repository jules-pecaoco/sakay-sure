import { MapPin } from 'lucide-react'
import type { LocationStatus } from '@/hooks/useUserLocation'

interface LocationPermissionBannerProps {
  status: LocationStatus
  onRequest: () => void
}

export default function LocationPermissionBanner({
  status,
  onRequest,
}: LocationPermissionBannerProps) {
  if (status === 'granted' || status === 'unavailable') return null

  if (status === 'denied') {
    return (
      <div className="flex items-start gap-4 bg-ink border-[1.5px] border-primary-500 rounded-xl px-5 py-4 shadow-lg">
        <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
          <MapPin className="w-6 h-6 text-accent-500" fill="currentColor" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[11px] font-display text-white uppercase tracking-wider mb-1">Enable Location Access</p>
          <p className="text-[10px] font-medium text-white/60 leading-tight">
            Enable location in your browser settings to see your real-time position on the map.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 bg-ink border-[1.5px] border-primary-500 rounded-xl px-4 py-4 shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center shrink-0 shadow-inner z-10">
        <MapPin className="w-6 h-6 text-accent-500" fill="currentColor" strokeWidth={2.5} />
      </div>
      
      <div className="flex-1 min-w-0 z-10">
        <p className="text-[11px] font-display text-white uppercase tracking-wider mb-0.5">Enable Map View?</p>
        <p className="text-[10px] font-medium text-white/50 leading-tight uppercase tracking-tight">
          Centers map & improves suggestions
        </p>
      </div>

      <button
        type="button"
        onClick={onRequest}
        disabled={status === 'requesting'}
        className="
          shrink-0 rounded-lg bg-primary-500 px-5 py-2 text-[10px] font-display uppercase tracking-widest text-white 
          border-b-[3px] border-primary-700 shadow-md transition-all active:border-b-0 active:translate-y-0.5
          disabled:opacity-60 z-10 font-bold
        "
      >
        {status === 'requesting' ? (
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          'Enable'
        )}
      </button>
    </div>
  )
}
