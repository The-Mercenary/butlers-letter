import type { SelectHTMLAttributes } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  options: { value: string; label: string }[] | readonly string[];
  placeholder?: string;
  error?: string;
  help?: string;
}

export function SelectField({ id, label, options, placeholder = "선택", error, help, className = "", ...props }: SelectFieldProps) {
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );

  return (
    <div className="space-y-1.5" data-error-key={id}>
      <label htmlFor={id} className="label-base">
        {label}
      </label>
      <select id={id} className={`input-base ${className}`} {...props}>
        <option value="">{placeholder}</option>
        {normalizedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {help ? <p className="help-text">{help}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  );
}
