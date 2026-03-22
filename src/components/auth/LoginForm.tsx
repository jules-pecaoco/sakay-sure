import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import FormField from '@/components/common/FormField'

interface LoginFormErrors {
  email?: string
  password?: string
  general?: string
}

function mapFirebaseError(code: string): LoginFormErrors {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return { general: 'Incorrect email or password.' }
    case 'auth/too-many-requests':
      return { general: 'Too many attempts. Please try again later.' }
    case 'auth/invalid-email':
      return { email: 'Please enter a valid email address.' }
    default:
      return { general: 'Something went wrong. Please try again.' }
  }
}

export default function LoginForm() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const next: LoginFormErrors = {}
    if (!email.trim()) next.email = 'Email is required.'
    if (!password) next.password = 'Password is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrors({})
    try {
      await signIn(email.trim(), password)
      // Navigation handled by router after auth state change
    } catch (err: unknown) {
      const code =
        (err as { code?: string }).code ?? 'auth/unknown'
      setErrors(mapFirebaseError(code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="space-y-1 mb-2">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500">Sign in to continue</p>
      </div>

      {errors.general && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {errors.general}
        </div>
      )}

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
        placeholder="••••••••"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />

      <button
        type="submit"
        disabled={loading}
        className="
          w-full rounded-xl bg-sky-500 py-3.5 text-sm font-semibold text-white
          transition-all hover:bg-sky-600 active:scale-[.98]
          disabled:opacity-60 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        "
      >
        {loading ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </button>

      <p className="text-center text-sm text-slate-500">
        No account?{' '}
        <Link
          to="/signup"
          className="font-semibold text-sky-600 hover:text-sky-700"
        >
          Create one
        </Link>
      </p>
    </form>
  )
}
