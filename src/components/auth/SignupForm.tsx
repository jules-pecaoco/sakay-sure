import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import FormField from '@/components/common/FormField'
import RoleSelector from './RoleSelector'
import type { UserRole } from '@/types'

interface SignupFormErrors {
  displayName?: string
  email?: string
  password?: string
  confirmPassword?: string
  role?: string
  general?: string
}

function mapFirebaseError(code: string): SignupFormErrors {
  switch (code) {
    case 'auth/email-already-in-use':
      return { email: 'This email is already registered.' }
    case 'auth/invalid-email':
      return { email: 'Please enter a valid email address.' }
    case 'auth/weak-password':
      return { password: 'Password must be at least 6 characters.' }
    default:
      return { general: 'Something went wrong. Please try again.' }
  }
}

type Step = 'role' | 'details'

export default function SignupForm() {
  const { signUp } = useAuth()
  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState<UserRole | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<SignupFormErrors>({})
  const [loading, setLoading] = useState(false)

  function validateRole(): boolean {
    if (!role) {
      setErrors({ role: 'Please select a role to continue.' })
      return false
    }
    setErrors({})
    return true
  }

  function validateDetails(): boolean {
    const next: SignupFormErrors = {}
    if (!displayName.trim()) next.displayName = 'Name is required.'
    if (!email.trim()) next.email = 'Email is required.'
    if (!password) next.password = 'Password is required.'
    else if (password.length < 6)
      next.password = 'Password must be at least 6 characters.'
    if (password !== confirmPassword)
      next.confirmPassword = 'Passwords do not match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleNext(e: FormEvent) {
    e.preventDefault()
    if (validateRole()) setStep('details')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validateDetails() || !role) return
    setLoading(true)
    setErrors({})
    try {
      await signUp(email.trim(), password, displayName.trim(), role)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? 'auth/unknown'
      setErrors(mapFirebaseError(code))
    } finally {
      setLoading(false)
    }
  }

  // ── Step 1: Role ───────────────────────────────────────────────────────────
  if (step === 'role') {
    return (
      <form onSubmit={handleNext} noValidate className="space-y-5">
        <div className="space-y-1 mb-2">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Create account
          </h1>
          <p className="text-sm text-slate-500">Step 1 of 2 · Choose your role</p>
        </div>

        <RoleSelector selected={role} onChange={setRole} />

        {errors.role && (
          <p className="text-xs text-red-500 text-center">{errors.role}</p>
        )}

        <button
          type="submit"
          className="
            w-full rounded-xl bg-primary-500 py-3.5 text-sm font-semibold text-white
            transition-all hover:bg-primary-600 active:scale-[.98]
          "
        >
          Continue →
        </button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Sign in
          </Link>
        </p>
      </form>
    )
  }

  // ── Step 2: Details ────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1 mb-2">
        <button
          type="button"
          onClick={() => setStep('role')}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-1"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Your details
        </h1>
        <p className="text-sm text-slate-500">
          Step 2 of 2 ·{' '}
          <span className="capitalize font-medium text-slate-700">{role}</span>{' '}
          account
        </p>
      </div>

      {errors.general && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {errors.general}
        </div>
      )}

      <FormField
        label="Full name"
        type="text"
        placeholder="Juan dela Cruz"
        autoComplete="name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        error={errors.displayName}
      />

      <FormField
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />

      <FormField
        label="Password"
        type="password"
        placeholder="At least 6 characters"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />

      <FormField
        label="Confirm password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
      />

      <button
        type="submit"
        disabled={loading}
        className="
          w-full rounded-xl bg-primary-500 py-3.5 text-sm font-semibold text-white
          transition-all hover:bg-primary-600 active:scale-[.98]
          disabled:opacity-60 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        "
      >
        {loading ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Creating account…
          </>
        ) : (
          'Create account'
        )}
      </button>
    </form>
  )
}
