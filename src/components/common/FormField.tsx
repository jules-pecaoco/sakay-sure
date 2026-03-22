import type { InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function FormField({ label, error, ...props }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="section-label pl-1">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          className={`
            w-full rounded-xl border-[1.5px] bg-white px-4 py-3.5 text-sm text-ink
            transition-all outline-none placeholder:text-muted/50 font-medium
            ${error 
              ? 'border-primary-500 bg-primary-50/30' 
              : 'border-slate-200 focus:border-ink focus:bg-white'}
          `}
        />
        {error && (
          <p className="absolute -bottom-5 left-1 text-[9px] font-bold text-primary-500 uppercase tracking-wider">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
