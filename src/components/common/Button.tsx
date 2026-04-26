import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-teal-700 text-white hover:bg-teal-800 border-teal-700",
  secondary: "bg-white text-stone-900 hover:bg-stone-50 border-stone-300",
  ghost: "bg-transparent text-stone-700 hover:bg-stone-100 border-transparent",
  danger: "bg-rose-700 text-white hover:bg-rose-800 border-rose-700",
};

export function Button({ className = "", variant = "primary", icon, children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
