import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteDriverRoute } from '@/services/firebase/routes'
import ActiveToggle from './ActiveToggle'
import type { DriverRoute } from '@/types'

const VEHICLE_EMOJI: Record<string, string> = {
  jeepney: '🚌',
  bus: '🚍',
  tricycle: '🛺',
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
        <span className="text-2xl mt-0.5" aria-hidden>
          {VEHICLE_EMOJI[route.vehicleType]}
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
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
          </svg>
        </button>
      </div>

      {/* Schedule */}
      <div className="px-4 pb-3 flex items-center gap-2 text-xs text-slate-500">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0 text-slate-400">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd"/>
        </svg>
        {route.schedule.startTime} – {route.schedule.endTime}
        {route.pricing && (
          <>
            <span className="text-slate-300">·</span>
            <span className="text-sky-600 font-medium">
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
                className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5"
              >
                {i === 0 ? '🟢 ' : i === route.stops.length - 1 ? '🔴 ' : ''}{stop.name.split(',')[0]}
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
