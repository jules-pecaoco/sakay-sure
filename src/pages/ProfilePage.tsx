import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LogOut } from 'lucide-react'

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

  const roleBadge =
    user?.role === 'driver'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-primary-100 text-primary-700'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Profile</h1>
      </div>

      <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
        {/* Avatar + info card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold shrink-0">
            {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 truncate">
              {user?.displayName ?? '—'}
            </p>
            <p className="text-sm text-slate-500 truncate">{user?.email}</p>
            <span
              className={`mt-1.5 inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${roleBadge}`}
            >
              {user?.role}
            </span>
          </div>
        </div>

        {/* Account details */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Account
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            <InfoRow label="Name" value={user?.displayName ?? '—'} />
            <InfoRow label="Email" value={user?.email ?? '—'} />
            <InfoRow label="Role" value={user?.role ?? '—'} capitalize />
            <InfoRow
              label="Member since"
              value={
                user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'
              }
            />
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="
            w-full rounded-2xl bg-white border border-red-200 py-4
            text-sm font-semibold text-red-500 shadow-sm
            transition-all hover:bg-red-50 active:scale-[.98]
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2
          "
        >
          {signingOut ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-red-300 border-t-red-500 animate-spin" />
              Signing out…
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              Sign out
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Helper ────────────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  capitalize = false,
}: {
  label: string
  value: string
  capitalize?: boolean
}) {
  return (
    <div className="px-5 py-3.5 flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      <span
        className={`text-sm font-medium text-slate-800 text-right truncate ${
          capitalize ? 'capitalize' : ''
        }`}
      >
        {value}
      </span>
    </div>
  )
}
