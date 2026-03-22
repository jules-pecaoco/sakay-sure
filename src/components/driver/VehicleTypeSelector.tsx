import { TramFront, Bus, Bike } from 'lucide-react'
import type { VehicleType } from '@/types'
import type { ReactNode } from 'react'

interface Option {
  value: VehicleType
  label: string
  icon: ReactNode
}

const OPTIONS: Option[] = [
  { value: 'jeepney', label: 'Jeepney', icon: <TramFront className="w-7 h-7" /> },
  { value: 'bus',     label: 'Bus',     icon: <Bus className="w-7 h-7" /> },
  { value: 'tricycle',label: 'Tricycle',   icon: <Bike className="w-7 h-7" /> },
]

interface VehicleTypeSelectorProps {
  selected: VehicleType | null
  onChange: (v: VehicleType) => void
  error?: string
}

export default function VehicleTypeSelector({
  selected,
  onChange,
  error,
}: VehicleTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="section-label pl-1">Vehicle Signboard</p>
      <div className="grid grid-cols-3 gap-3">
        {OPTIONS.map((opt) => {
          const active = selected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`
                flex flex-col items-center justify-center gap-2 rounded-xl border-[2px] py-4 px-2
                text-center transition-all duration-200 cursor-pointer shadow-sm
                ${active
                  ? 'border-primary-500 bg-primary-500 text-white shadow-[4px_4px_0px_0px_rgba(232,50,26,0.15)]'
                  : 'border-slate-200 bg-white hover:border-ink text-ink'}
              `}
            >
              <div className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                {opt.icon}
              </div>
              <span className={`text-[10px] font-display uppercase tracking-widest ${active ? 'text-accent-500' : 'text-muted'}`}>
                {opt.label}
              </span>
            </button>
          )
        })}
      </div>
      {error && <p className="text-[10px] font-bold text-primary-500 uppercase tracking-tight pl-1">{error}</p>}
    </div>
  )
}
