import type { InputHTMLAttributes, ReactNode } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  help?: string;
  suffix?: ReactNode;
}

export function FormField({ id, label, error, help, suffix, className = "", ...props }: FormFieldProps) {
  return (
    <div className="space-y-1.5" data-error-key={id}>
      <label htmlFor={id} className="label-base">
        {label}
      </label>
      <div className="relative">
        <input id={id} className={`input-base ${suffix ? "pr-20" : ""} ${className}`} {...props} />
        {suffix ? <div className="absolute inset-y-0 right-3 flex items-center text-xs text-stone-500">{suffix}</div> : null}
      </div>
      {help ? <p className="help-text">{help}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  );
}
