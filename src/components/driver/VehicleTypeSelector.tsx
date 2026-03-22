import { TramFront, Bus, Bike } from 'lucide-react'
import type { VehicleType } from '@/types'
import type { ReactNode } from 'react'

interface Option {
  value: VehicleType
  label: string
  icon: ReactNode
  description: string
}

const OPTIONS: Option[] = [
  { value: 'jeepney', label: 'Jeepney', icon: <TramFront className="w-6 h-6" />, description: 'Fixed route jeep' },
  { value: 'bus',     label: 'Bus',     icon: <Bus className="w-6 h-6" />,      description: 'City / provincial bus' },
  { value: 'tricycle',label: 'Tricycle', icon: <Bike className="w-6 h-6" />,     description: 'Short-distance trike' },
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
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Vehicle type</p>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => {
          const active = selected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`
                flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3
                text-center transition-all duration-150 cursor-pointer
                ${active
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'}
              `}
            >
              <span className={active ? 'text-primary-600' : 'text-slate-500'}>{opt.icon}</span>
              <span className={`text-xs font-semibold ${active ? 'text-primary-700' : 'text-slate-700'}`}>
                {opt.label}
              </span>
              <span className={`text-[10px] leading-tight ${active ? 'text-primary-500' : 'text-slate-400'}`}>
                {opt.description}
              </span>
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
