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
      <form onSubmit={handleNext} noValidate className="space-y-6">
        <div className="space-y-1 mb-2">
          <h2 className="text-2xl font-display text-ink uppercase tracking-tight">
            Create an Account
          </h2>
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
            Step 1 of 2 · Choose your role
          </p>
        </div>

        <RoleSelector selected={role} onChange={setRole} />

        {errors.role && (
          <p className="text-xs font-bold text-primary-500 text-center uppercase tracking-tight">{errors.role}</p>
        )}

        <button
          type="submit"
          className="
            w-full rounded-xl bg-primary-500 py-4 text-[12px] font-display uppercase tracking-widest text-white
            border-b-[4px] border-primary-700 shadow-md transition-all 
            hover:bg-primary-600 active:border-b-0 active:translate-y-1 active:shadow-none
          "
        >
          Continue
        </button>

        <p className="text-center text-[10px] font-bold text-muted uppercase tracking-wider">
          Already a member?{' '}
          <Link
            to="/login"
            className="text-primary-500 hover:text-primary-600 underline underline-offset-2"
          >
            Sign In Here
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
          className="text-[10px] font-bold text-muted hover:text-ink flex items-center gap-1 mb-2 uppercase tracking-widest"
        >
          Back
        </button>
        <h2 className="text-2xl font-display text-ink uppercase tracking-tight">
          Your Details
        </h2>
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
          Step 2 of 2 ·{' '}
          <span className="text-primary-500">{role}</span> account
        </p>
      </div>

      {errors.general && (
        <div className="rounded-lg bg-primary-50 border-[1.5px] border-primary-100 px-4 py-3 text-xs font-bold text-primary-600 uppercase tracking-tight">
          {errors.general}
        </div>
      )}

      <div className="space-y-3">
        <FormField
          label="Your Name"
          type="text"
          placeholder="Juan dela Cruz"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={errors.displayName}
        />

        <FormField
          label="Email Address"
          type="email"
          placeholder="juan@email.com"
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
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          w-full rounded-xl bg-primary-500 py-4 text-[12px] font-display uppercase tracking-widest text-white
          border-b-[4px] border-primary-700 shadow-md transition-all mt-4
          hover:bg-primary-600 active:border-b-0 active:translate-y-1 active:shadow-none
          disabled:opacity-60 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        "
      >
        {loading ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Connecting…
          </>
        ) : (
          'Sign Up Now'
        )}
      </button>
    </form>
  )
}
