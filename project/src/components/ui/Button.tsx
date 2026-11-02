import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_0_20px_-6px_rgba(34,211,238,0.6)]',
  secondary:
    'bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700 hover:border-slate-600',
  danger: 'bg-red-500 text-white hover:bg-red-400 shadow-[0_0_20px_-6px_rgba(239,68,68,0.6)]',
  ghost: 'text-slate-300 hover:bg-slate-800 hover:text-slate-100',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  loading = false,
  icon,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}
