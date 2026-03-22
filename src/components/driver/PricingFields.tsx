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
    <div className="space-y-4">
      {/* Toggle — Signboard Style */}
      <div className="flex items-center justify-between bg-white border-[1.5px] border-slate-200 rounded-xl p-4 shadow-sm">
        <div>
          <p className="text-[10px] font-display uppercase tracking-widest text-ink">Fare Details</p>
          <p className="text-[10px] font-bold text-muted uppercase tracking-tight mt-0.5">Optional Community Guide</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => toggle(!enabled)}
          className={`relative w-12 h-7 rounded-lg transition-all shrink-0 border-[1.5px] ${
            enabled ? 'bg-primary-500 border-ink' : 'bg-slate-200 border-slate-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-[4px] shadow-sm transition-transform duration-200 ${
              enabled ? 'translate-x-5 bg-accent-500' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Fields — Flat Card Style */}
      {enabled && (
        <div className="bg-white border-[1.5px] border-ink rounded-xl p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(26,18,8,0.05)]">
          {/* Minimum / base fare */}
          <div className="space-y-1.5">
            <label className="section-label pl-0.5">Boarding Fare (₱)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink font-bold">₱</span>
              <input
                type="number"
                min={0}
                step={0.5}
                placeholder="13"
                value={pricing?.minFare ?? ''}
                onChange={(e) => update('minFare', e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-slate-200 bg-surface/30 pl-8 pr-4 py-3 text-sm text-ink font-bold outline-none focus:border-ink focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Per-stop fare */}
          <div className="space-y-1.5">
            <label className="section-label pl-0.5">Successive Stop/KM (₱)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink font-bold">₱</span>
              <input
                type="number"
                min={0}
                step={0.5}
                placeholder="0.00"
                value={pricing?.perStopFare ?? ''}
                onChange={(e) => update('perStopFare', e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-slate-200 bg-surface/30 pl-8 pr-4 py-3 text-sm text-ink font-bold outline-none focus:border-ink focus:bg-white transition-all"
              />
            </div>
            <p className="text-[9px] font-bold text-muted uppercase tracking-tight pl-1">Leave blank if flat rate</p>
          </div>

          {/* Live preview — Signboard Badge */}
          {pricing && pricing.minFare > 0 && (
            <div className="bg-accent-500 border-[1.5px] border-ink rounded-lg px-4 py-3 flex flex-col gap-1 items-center justify-center text-center mt-2">
              <p className="section-label !text-ink !font-display !text-[9px] mb-1">Route Fare Signboard</p>
              <p className="text-xl font-display text-ink uppercase leading-none tracking-tighter">
                ₱{pricing.minFare} <span className="text-[10px] font-bold">Base</span>
              </p>
              {pricing.perStopFare && (
                <p className="text-[10px] font-bold text-ink uppercase tracking-tight mt-1">
                  + ₱{pricing.perStopFare} per succeeding
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
