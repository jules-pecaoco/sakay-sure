import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteDriverRoute } from '@/services/firebase/routes'
import ActiveToggle from './ActiveToggle'
import { Bus, TramFront, Bike, Pencil, Clock } from 'lucide-react'
import type { DriverRoute } from '@/types'
import type { JSX } from 'react'

const VEHICLE_ICON: Record<string, JSX.Element> = {
  jeepney: <TramFront className="w-5 h-5" />,
  bus: <Bus className="w-5 h-5" />,
  tricycle: <Bike className="w-5 h-5" />,
}

interface DriverRouteCardProps {
  route: DriverRoute
}

export default function DriverRouteCard({ route }: DriverRouteCardProps) {
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteDriverRoute(route.id)
    } catch (err) {
      console.error('Delete failed:', err)
      setDeleting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        <span className="mt-0.5 text-primary-600" aria-hidden>
          {VEHICLE_ICON[route.vehicleType]}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate">{route.name}</h3>
          <p className="text-xs text-slate-500 capitalize mt-0.5">
            {route.vehicleType} · {route.stops.length} stop{route.stops.length !== 1 ? 's' : ''}
          </p>
        </div>
        {/* Edit button */}
        <button
          type="button"
          onClick={() => navigate(`/driver/edit-route/${route.id}`)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Edit route"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      {/* Schedule */}
      <div className="px-4 pb-3 flex items-center gap-2 text-xs text-slate-500">
        <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        {route.schedule.startTime} – {route.schedule.endTime}
        {route.pricing && (
          <>
            <span className="text-slate-300">·</span>
            <span className="text-primary-600 font-medium">
              ₱{route.pricing.minFare}
              {route.pricing.perStopFare ? `+₱${route.pricing.perStopFare}/stop` : ' flat'}
            </span>
          </>
        )}
      </div>

      {/* Stops preview */}
      {route.stops.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {route.stops.slice(0, 4).map((stop, i) => (
              <span
                key={stop.id}
                className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5 inline-flex items-center gap-1"
              >
                {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />}
                {i === route.stops.length - 1 && i !== 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />}
                {stop.name.split(',')[0]}
              </span>
            ))}
            {route.stops.length > 4 && (
              <span className="text-xs text-slate-400">
                +{route.stops.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Active toggle */}
      <div className="px-4 pb-4">
        <ActiveToggle route={route} />
      </div>

      {/* Delete */}
      {!showConfirm ? (
        <div className="border-t border-slate-100 px-4 py-2.5">
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Delete route
          </button>
        </div>
      ) : (
        <div className="border-t border-red-100 bg-red-50 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-red-600 font-medium">Delete this route?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
