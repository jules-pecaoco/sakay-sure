interface TipTagProps {
  label: string
  variant?: 'default' | 'warning' | 'success' | 'info'
}

const VARIANT_STYLES = {
  default: 'bg-surface border-slate-200 text-muted',
  warning: 'bg-accent-500 border-ink text-ink shadow-sm',
  success: 'bg-green-500 border-ink text-white shadow-sm',
  info:    'bg-primary-500 border-ink text-white shadow-sm',
}

export default function TipTag({ label, variant = 'default' }: TipTagProps) {
  return (
    <span className={`
      inline-block rounded-[6px] px-2.5 py-1 text-[9px] font-display uppercase tracking-widest border-[1.5px]
      ${VARIANT_STYLES[variant]}
    `}>
      {label}
    </span>
  )
}
