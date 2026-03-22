import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function FormField({ label, error, id, ...props }: FormFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={fieldId}
        className={`
          w-full rounded-xl border px-4 py-3 text-sm text-slate-800
          placeholder:text-slate-400 outline-none transition-colors
          ${
            error
              ? "border-red-400 bg-red-50 focus:border-red-500"
              : "border-slate-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
          }
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
