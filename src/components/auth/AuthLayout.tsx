import { Navigation } from 'lucide-react'
import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-100 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-2 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-sm">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">
            SakaySure
          </span>
        </div>
        <p className="text-xs text-slate-400 tracking-wide">
          Hybrid Predictive Transport
        </p>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-start justify-center px-4 pt-8 pb-12">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-7">
          {children}
        </div>
      </main>
    </div>
  )
}
