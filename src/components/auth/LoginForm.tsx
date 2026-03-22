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
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? 'auth/unknown'
      setErrors(mapFirebaseError(code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="space-y-1 mb-2">
        <h2 className="text-2xl font-display text-ink uppercase tracking-tight">
          Welcome Back<span className="text-primary-500">!</span>
        </h2>
        <p className="text-xs font-medium text-muted uppercase tracking-wider">
           Sign in to your SakaySure account
        </p>
      </div>

      {errors.general && (
        <div className="rounded-lg bg-primary-50 border-[1.5px] border-primary-100 px-4 py-3 text-xs font-bold text-primary-600 uppercase tracking-tight">
          {errors.general}
        </div>
      )}

      <div className="space-y-4">
        <FormField
          label="Email Address"
          type="email"
          placeholder="yourname@email.com"
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
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          w-full rounded-xl bg-primary-500 py-4 text-[12px] font-display uppercase tracking-widest text-white
          border-b-[4px] border-primary-700 shadow-md transition-all 
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
          'Sign In'
        )}
      </button>

      <p className="text-center text-[10px] font-bold text-muted uppercase tracking-wider">
        No account yet?{' '}
        <Link
          to="/signup"
          className="text-primary-500 hover:text-primary-600 underline underline-offset-2"
        >
          Create SakaySure Account
        </Link>
      </p>
    </form>
  )
}
