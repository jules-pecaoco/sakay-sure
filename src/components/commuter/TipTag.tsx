interface TipTagProps {
  label: string
  variant?: 'default' | 'warning' | 'success' | 'info'
}

const VARIANT_STYLES = {
  default: 'bg-slate-100 text-slate-600',
  warning: 'bg-amber-100 text-amber-700',
  success: 'bg-green-100 text-green-700',
  info:    'bg-sky-100 text-sky-700',
}

export default function TipTag({ label, variant = 'default' }: TipTagProps) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${VARIANT_STYLES[variant]}`}>
      {label}
    </span>
  )
}
