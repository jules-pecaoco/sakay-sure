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
      className="flex items-center justify-between py-2 transition-all"
    >
      <div className="space-y-1">
        <p className={`text-[10px] font-display uppercase tracking-widest flex items-center gap-2 ${active ? 'text-green-600' : 'text-muted'}`}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
          {active ? 'Currently On Route' : 'Signboard Offline'}
        </p>
        <p className="text-[10px] font-bold text-ink uppercase tracking-tight">
          {active
            ? 'Commuters can see you'
            : 'Toggle on when you start driving'}
        </p>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        aria-pressed={active}
        className={`
          relative w-14 h-8 rounded-lg transition-all duration-200 focus:outline-none border-[1.5px]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${active
            ? 'bg-primary-500 border-ink shadow-sm'
            : 'bg-slate-200 border-slate-300'}
        `}
      >
        <div
          className={`
            absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-[6px] border border-ink/10
            transition-all duration-200 shadow-sm
            ${active ? 'translate-x-6 bg-accent-500' : 'translate-x-0'}
          `}
        />
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </span>
        )}
      </button>
    </div>
  )
}
