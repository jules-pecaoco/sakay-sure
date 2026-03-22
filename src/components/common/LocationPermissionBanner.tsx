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
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
        <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-700">Location access denied</p>
          <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
            Enable location in your browser settings to center the map on your current position.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-2xl px-4 py-3">
      <MapPin className="w-5 h-5 text-primary-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-primary-700">Use your location</p>
        <p className="text-xs text-primary-500 mt-0.5">
          Centers the map and improves stop suggestions
        </p>
      </div>
      <button
        type="button"
        onClick={onRequest}
        disabled={status === 'requesting'}
        className="shrink-0 rounded-xl bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-600 transition-colors disabled:opacity-60 flex items-center gap-1.5"
      >
        {status === 'requesting' ? (
          <>
            <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
            Locating…
          </>
        ) : (
          'Allow'
        )}
      </button>
    </div>
  )
}
