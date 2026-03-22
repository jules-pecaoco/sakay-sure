import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LogOut, Settings, CreditCard, ShieldCheck } from 'lucide-react'
import TopBar from '@/components/common/TopBar'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } finally {
      setSigningOut(false)
    }
  }

  const roleStyles =
    user?.role === 'driver'
      ? 'bg-accent-500 text-ink border-ink'
      : 'bg-ink text-white border-white/20'

  return (
    <div className="min-h-screen bg-surface">
      <TopBar 
        title="ProfileSure" 
      />

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Avatar + info card — Flat Signboard Style */}
        <div className="bg-white border-[1.5px] border-ink rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(26,18,8,0.05)] flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-surface border-[1.5px] border-slate-200 flex items-center justify-center text-primary-500 text-3xl font-display shrink-0 shadow-inner">
            {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-display text-ink uppercase tracking-tight truncate leading-tight">
              {user?.displayName ?? '—'}
            </h2>
            <p className="text-xs text-muted font-medium truncate mb-2">{user?.email}</p>
            <span
              className={`inline-block text-[10px] font-display uppercase tracking-wider px-2.5 py-1 rounded-[6px] border ${roleStyles}`}
            >
              {user?.role}
            </span>
          </div>
        </div>

        {/* Account settings list */}
        <div className="space-y-3">
          <p className="section-label pl-1">User Account</p>
          <div className="bg-white rounded-xl border-[1.5px] border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 font-medium">
               <ProfileRow icon={<Settings className="w-4 h-4" />} label="Display Name" value={user?.displayName ?? '—'} />
               <ProfileRow icon={<CreditCard className="w-4 h-4" />} label="Email Address" value={user?.email ?? '—'} />
               <ProfileRow icon={<ShieldCheck className="w-4 h-4" />} label="App Member Since" 
                 value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short' }) : '—'} 
               />
            </div>
          </div>
        </div>

        {/* Sign out — Heavy Border Style */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="
            w-full rounded-xl bg-white border-[1.5px] border-primary-500 py-4
            text-[12px] font-display uppercase tracking-widest text-primary-500 shadow-[4px_4px_0px_0px_rgba(232,50,26,0.1)]
            transition-all hover:bg-primary-50 active:translate-y-0.5 active:shadow-none
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2.5
          "
        >
          {signingOut ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-primary-200 border-t-primary-500 animate-spin" />
              Please wait…
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4" strokeWidth={2.5} />
              Sign Out
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-5 py-4 flex items-center justify-between gap-4 group hover:bg-surface transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-muted group-hover:text-primary-500 transition-colors">
          {icon}
        </div>
        <span className="text-xs text-muted font-bold uppercase tracking-tight">{label}</span>
      </div>
      <span className="text-sm font-bold text-ink tracking-tight">{value}</span>
    </div>
  )
}
