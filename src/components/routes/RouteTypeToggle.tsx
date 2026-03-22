export type RouteFilter = 'all' | 'driver' | 'commuter'

interface RouteTypeToggleProps {
  value: RouteFilter
  onChange: (v: RouteFilter) => void
  driverCount: number
  commuterCount: number
}

const OPTIONS: { value: RouteFilter; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'driver',   label: 'Driver' },
  { value: 'commuter', label: 'Community' },
]

export default function RouteTypeToggle({ value, onChange, driverCount, commuterCount }: RouteTypeToggleProps) {
  function countFor(v: RouteFilter) {
    if (v === 'driver')   return driverCount
    if (v === 'commuter') return commuterCount
    return driverCount + commuterCount
  }

  return (
    <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
      {OPTIONS.map((opt) => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all
            ${value === opt.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {opt.label}
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
            ${value === opt.value ? 'bg-primary-100 text-primary-600' : 'bg-slate-200 text-slate-500'}`}>
            {countFor(opt.value)}
          </span>
        </button>
      ))}
    </div>
  )
}
