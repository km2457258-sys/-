import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { ReactNode } from 'react';

type StatusTone = 'success' | 'error' | 'info';

const TONE_CLASSES: Record<StatusTone, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  error: 'border-red-500/40 bg-red-500/10 text-red-300',
  info: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
};

const TONE_ICONS: Record<StatusTone, ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />,
  error: <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />,
  info: <Info className="h-4 w-4 shrink-0" aria-hidden="true" />,
};

interface StatusMessageProps {
  tone: StatusTone;
  children: ReactNode;
}

export function StatusMessage({ tone, children }: StatusMessageProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm animate-[fadeIn_0.3s_ease-out] ${TONE_CLASSES[tone]}`}
    >
      {TONE_ICONS[tone]}
      <span>{children}</span>
    </div>
  );
}
