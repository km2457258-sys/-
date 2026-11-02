import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, subtitle, action, children, className = '' }: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_1px_0_0_rgba(148,163,184,0.06)_inset] backdrop-blur ${className}`}
    >
      {(title || action) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-semibold text-slate-100">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
