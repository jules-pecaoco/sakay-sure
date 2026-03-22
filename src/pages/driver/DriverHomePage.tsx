import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useDriverRoutes } from '@/hooks/useDriverRoutes'
import DriverRouteCard from '@/components/driver/DriverRouteCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function DriverHomePage() {
  const { user } = useAuth()
  const { routes, loading } = useDriverRoutes()
  const navigate = useNavigate()

  const activeCount = routes.filter((r) => r.isActive).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white px-5 pt-14 pb-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Hi, {user?.displayName?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {routes.length === 0
                ? 'No routes yet'
                : `${routes.length} route${routes.length !== 1 ? 's' : ''} · ${activeCount} active`}
            </p>
          </div>

          {/* Status pill */}
          <span
            className={`mt-1 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
              activeCount > 0
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                activeCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {activeCount > 0 ? 'On route' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-lg mx-auto">
        {/* Add route CTA */}
        <button
          type="button"
          onClick={() => navigate('/driver/add-route')}
          className="
            w-full flex items-center justify-center gap-2
            rounded-2xl bg-sky-500 py-4 text-sm font-semibold text-white
            shadow-sm hover:bg-sky-600 active:scale-[.98] transition-all
          "
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd"/>
          </svg>
          Add new route
        </button>

        {/* Route list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="Loading your routes…" />
          </div>
        ) : routes.length === 0 ? (
          <EmptyState onAdd={() => navigate('/driver/add-route')} />
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              Your routes
            </p>
            {routes.map((route) => (
              <DriverRouteCard key={route.id} route={route} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="text-5xl mb-4">🚌</div>
      <h3 className="font-semibold text-slate-700 mb-1">No routes yet</h3>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">
        Add your first route so commuters can find you and get ETAs.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600 transition-all"
      >
        Add your first route
      </button>
    </div>
  )
}
