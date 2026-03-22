import { Navigation } from 'lucide-react'
import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header — Jeepney Bold Style */}
      <header className="px-6 pt-12 pb-8 flex flex-col items-center bg-primary-500 clip-bottom-slant">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-ink flex items-center justify-center shadow-lg border border-accent-500/20">
            <Navigation className="w-6 h-6 text-accent-500" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-display uppercase tracking-tight text-white leading-none">
            Sakay<span className="text-accent-500">Sure</span>
          </h1>
        </div>
        <p className="mt-3 text-[10px] font-semibold text-white/90 uppercase tracking-[0.2em]">
          Reliable Commute Everywhere
        </p>
      </header>

      {/* Card — Flat Style */}
      <main className="flex-1 flex items-start justify-center px-4 -mt-4 pb-12">
        <div className="w-full max-w-sm bg-white border-[1.5px] border-ink rounded-xl shadow-[6px_6px_0px_0px_rgba(26,18,8,0.05)] p-7">
          {children}
        </div>
      </main>

      <style>{`
        .clip-bottom-slant {
          clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
        }
      `}</style>
    </div>
  )
}
