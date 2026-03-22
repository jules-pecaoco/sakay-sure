import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useDriverRoutes } from '@/hooks/useDriverRoutes'
import DriverRouteCard from '@/components/driver/DriverRouteCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import TopBar from '@/components/common/TopBar'
import EmptyState from '@/components/common/EmptyState'
import { PlusCircle, Navigation, Users, LayoutGrid } from 'lucide-react'

export default function DriverHomePage() {
  const { user } = useAuth()
  const { routes, loading } = useDriverRoutes()
  const navigate = useNavigate()

  const activeCount = routes.filter((r) => r.isActive).length

  return (
    <div className="min-h-screen bg-surface">
      <TopBar 
        title="PredictSure" 
        showBack={false}
        rightElement={
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-display uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-sm ${
                activeCount > 0
                  ? 'bg-ink text-white border-green-500'
                  : 'bg-white/10 text-white/50 border-white/20 font-bold'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-white/40'
                }`}
              />
              {activeCount > 0 ? 'On Route' : 'Offline'}
            </span>
          </div>
        }
      />

      <div className="bg-primary-500 px-5 pb-12 shadow-lg border-b-[3px] border-ink/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-ink flex items-center justify-center border border-accent-500/20 shadow-md">
                <LayoutGrid className="w-6 h-6 text-accent-500" />
              </div>
              <div>
                <h1 className="text-2xl font-display text-white uppercase tracking-tight leading-none">
                  Hi, {user?.displayName?.split(' ')[0]}<span className="text-accent-500">!</span>
                </h1>
                <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mt-1.5">
                  Driver Dashboard
                </p>
              </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6 max-w-lg mx-auto -mt-6 relative z-20">
        {/* Stats Summary — Simple Signboard Cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="Your Routes" value={routes.length.toString()} icon={<Navigation className="w-3.5 h-3.5 text-primary-500" />} />
          <StatBox label="Active Now" value={activeCount.toString()} icon={<Users className="w-3.5 h-3.5 text-accent-500" />} />
        </div>

        {/* Add route CTA — Bold Action */}
        <button
          type="button"
          onClick={() => navigate('/driver/add-route')}
          className="
            w-full flex items-center justify-center gap-3
            rounded-xl bg-ink py-4 text-[12px] font-display uppercase tracking-widest text-white
            border-b-[4px] border-slate-700 shadow-lg transition-all
            hover:bg-slate-900 active:border-b-0 active:translate-y-1 active:shadow-none
          "
        >
          <PlusCircle className="w-5 h-5 text-accent-500" />
          Add New Route
        </button>

        {/* Route list */}
        <div className="space-y-4 pb-12">
          <p className="section-label pl-1">Manage Your Signboards</p>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner message="Checking routes…" />
            </div>
          ) : routes.length === 0 ? (
            <EmptyState 
              title="No routes yet" 
              message="Add your first route so commuters can find you."
              action={
                <button
                  type="button"
                  onClick={() => navigate('/driver/add-route')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-ink py-4 text-[10px] font-display uppercase tracking-widest text-white border-b-[3px] border-slate-700 shadow-md active:translate-y-1 active:border-b-0 transition-all font-bold"
                >
                  Create Route
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {routes.map((route) => (
                <DriverRouteCard key={route.id} route={route} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border-[1.5px] border-ink rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(26,18,8,0.05)]">
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-[9px] font-bold text-muted uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-display text-ink leading-none">{value}</p>
    </div>
  )
}

