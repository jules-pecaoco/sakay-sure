import type { DriverPricing } from '@/types'

interface PricingFieldsProps {
  pricing: DriverPricing | null
  onChange: (p: DriverPricing | null) => void
}

export default function PricingFields({ pricing, onChange }: PricingFieldsProps) {
  const enabled = pricing !== null

  function toggle(on: boolean) {
    onChange(on ? { minFare: 13, perStopFare: null } : null)
  }

  function update(field: keyof DriverPricing, raw: string) {
    const val = raw === '' ? null : Number(raw)
    onChange({
      minFare: pricing?.minFare ?? 13,
      perStopFare: pricing?.perStopFare ?? null,
      [field]: val ?? (field === 'minFare' ? 0 : null),
    })
  }

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">Fare information</p>
          <p className="text-xs text-slate-400 mt-0.5">Optional — helps commuters budget their trip</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => toggle(!enabled)}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
            enabled ? 'bg-primary-500' : 'bg-slate-200'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Fields — only shown when enabled */}
      {enabled && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          {/* Minimum / base fare */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-600">
              Minimum fare (₱)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                ₱
              </span>
              <input
                type="number"
                min={0}
                step={0.5}
                placeholder="13"
                value={pricing?.minFare ?? ''}
                onChange={(e) => update('minFare', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-7 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
              />
            </div>
            <p className="text-xs text-slate-400">Base boarding fare for the first stop</p>
          </div>

          {/* Per-stop fare */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-600">
              Additional fare per stop (₱) <span className="text-slate-400 font-normal">— optional</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                ₱
              </span>
              <input
                type="number"
                min={0}
                step={0.5}
                placeholder="Leave blank if flat rate"
                value={pricing?.perStopFare ?? ''}
                onChange={(e) => update('perStopFare', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-7 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
              />
            </div>
            <p className="text-xs text-slate-400">Charged per additional stop after boarding</p>
          </div>

          {/* Live preview */}
          {pricing && pricing.minFare > 0 && (
            <div className="bg-white border border-primary-100 rounded-xl px-3 py-2.5 space-y-1">
              <p className="text-[10px] font-semibold text-primary-600 uppercase tracking-wider">
                Fare preview
              </p>
              <p className="text-xs text-slate-600">
                Boarding: <span className="font-semibold text-slate-800">₱{pricing.minFare}</span>
              </p>
              {pricing.perStopFare && (
                <p className="text-xs text-slate-600">
                  + <span className="font-semibold text-slate-800">₱{pricing.perStopFare}</span> per stop after
                </p>
              )}
              {!pricing.perStopFare && (
                <p className="text-xs text-slate-400 italic">Flat rate — same fare for all stops</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
