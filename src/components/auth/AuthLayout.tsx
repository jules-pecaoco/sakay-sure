import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-100 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-2 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5 text-white"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
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
