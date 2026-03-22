import { useSearchParams } from 'react-router-dom'
import { useAllRoutes } from '@/hooks/useAllRoutes'
import { runPrediction } from '@/engine'
import PredictionCard from '@/components/predictions/PredictionCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import RouteMapPreview from '@/components/map/RouteMapPreview'
import { Search } from 'lucide-react'

export default function PredictPage() {
  const [params] = useSearchParams()
  const routeId = params.get('routeId')
  const routeType = params.get('type') as 'driver' | 'commuter' | null

  const { driverRoutes, commuterRoutes, activeDrivers, loading } = useAllRoutes()

  // Find the selected route
  const selectedDriver = routeType === 'driver'
    ? driverRoutes.find((r) => r.id === routeId)
    : null
  const selectedCommuter = routeType === 'commuter'
    ? commuterRoutes.find((r) => r.id === routeId)
    : null
  const selectedRoute = selectedDriver ?? selectedCommuter

  // Run prediction for the selected route
  const prediction = selectedRoute
    ? runPrediction({
        driverRoutes: selectedDriver
          ? driverRoutes.filter((r) => r.id === routeId)
          : [],
        activeDriverRoutes: selectedDriver
          ? activeDrivers
              .filter((a) => a.routeId === routeId)
              .map((a) => driverRoutes.find((r) => r.id === a.routeId))
              .filter((r): r is NonNullable<typeof r> => !!r)
          : [],
        commuterRoutes: selectedCommuter
          ? commuterRoutes.filter((r) => r.id === routeId)
          : commuterRoutes,
      })
    : null

  const stops = selectedRoute?.stops ?? []
  const geometry = selectedRoute?.geometry ?? null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white px-4 pt-14 pb-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Prediction</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {selectedRoute ? selectedRoute.name : 'Select a route from Explore'}
        </p>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="Loading data…" />
          </div>
        ) : !selectedRoute ? (
          <EmptyState />
        ) : (
          <>
            {/* Prediction card */}
            {prediction && (
              <PredictionCard
                prediction={prediction}
                routeName={selectedRoute.name}
              />
            )}

            {/* Map preview */}
            {stops.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Route map</p>
                <RouteMapPreview
                  stops={stops}
                  geometry={geometry}
                  className="h-56 rounded-2xl overflow-hidden"
                />
              </div>
            )}

            {/* Stop list */}
            {stops.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stops</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {stops.map((stop, i) => (
                    <div key={stop.id} className="px-4 py-3 flex items-center gap-3">
                      <span className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                        ${i === 0 ? 'bg-green-100 text-green-700'
                          : i === stops.length - 1 ? 'bg-red-100 text-red-600'
                          : 'bg-slate-100 text-slate-500'}
                      `}>
                        {i === 0 ? 'S' : i === stops.length - 1 ? 'E' : i}
                      </span>
                      <span className="text-sm text-slate-700">{stop.name.split(',')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-16 text-center gap-3 px-6">
      <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
        <Search className="w-7 h-7 text-primary-500" />
      </div>
      <h3 className="font-semibold text-slate-700">No route selected</h3>
      <p className="text-sm text-slate-400 leading-relaxed">
        Go to <strong>Explore</strong>, tap any route card, and predictions will appear here.
      </p>
    </div>
  )
}
