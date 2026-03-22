import { useState } from 'react'
import { setRouteActive } from '@/services/firebase/routes'
import { setDriverActive, setDriverInactive } from '@/services/firebase/drivers'
import { useAuth } from '@/context/AuthContext'
import type { DriverRoute } from '@/types'

interface ActiveToggleProps {
  route: DriverRoute
}

export default function ActiveToggle({ route }: ActiveToggleProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(route.isActive)

  async function handleToggle() {
    if (!user) return
    setLoading(true)
    const next = !active
    try {
      await setRouteActive(route.id, next)
      if (next) {
        // Use first stop coordinates as initial position, fallback to Cebu
        const pos = route.stops[0]?.coordinates ?? { lng: 123.8854, lat: 10.3157 }
        await setDriverActive(user.uid, route.id, pos)
      } else {
        await setDriverInactive(user.uid)
      }
      setActive(next)
    } catch (err) {
      console.error('Toggle failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`
        flex items-center justify-between rounded-2xl p-4 border-2 transition-colors
        ${active
          ? 'bg-green-50 border-green-300'
          : 'bg-slate-50 border-slate-200'}
      `}
    >
      <div className="space-y-0.5">
        <p className={`text-sm font-semibold ${active ? 'text-green-700' : 'text-slate-600'}`}>
          {active ? '🟢 Currently active' : '⚫ Inactive'}
        </p>
        <p className="text-xs text-slate-400">
          {active
            ? 'Commuters can see you on the map'
            : 'Toggle on when you start your route'}
        </p>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        aria-pressed={active}
        className={`
          relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none
          focus-visible:ring-2 focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${active
            ? 'bg-green-500 focus-visible:ring-green-500'
            : 'bg-slate-300 focus-visible:ring-slate-400'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm
            transition-transform duration-200
            ${active ? 'translate-x-7' : 'translate-x-0'}
          `}
        />
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-3 h-3 border border-white/60 border-t-white rounded-full animate-spin" />
          </span>
        )}
      </button>
    </div>
  )
}
