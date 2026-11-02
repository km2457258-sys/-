import { AlertTriangle, CheckCircle2, Circle, Loader2, Wrench } from 'lucide-react';
import type { CheckState, DiagnosticCheck } from '@/data/diagnostics';

interface CheckRowProps {
  check: DiagnosticCheck;
  state: CheckState;
}

export function CheckRow({ check, state }: CheckRowProps) {
  const showResult = state !== 'pending' && state !== 'running';

  return (
    <li className="flex gap-4 py-5 first:pt-0 last:pb-0">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center">
        {state === 'pending' && <Circle className="h-5 w-5 text-slate-600" aria-hidden="true" />}
        {(state === 'running' || state === 'fixing') && (
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400" aria-hidden="true" />
        )}
        {state === 'passed' && <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />}
        {state === 'issue' && <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />}
        {state === 'fixed' && <Wrench className="h-5 w-5 text-cyan-400" aria-hidden="true" />}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className={`font-bold ${state === 'pending' ? 'text-slate-500' : 'text-slate-100'}`}>{check.title}</p>
        {state === 'running' && <p className="animate-pulse text-sm text-slate-400">{check.scanningText}</p>}
        {state === 'fixing' && <p className="text-sm text-cyan-300">جارٍ تطبيق الإصلاح...</p>}
        {showResult && (
          <p className={`text-sm ${state === 'issue' ? 'text-amber-300' : state === 'fixed' ? 'text-cyan-300' : 'text-slate-400'}`}>
            {state === 'fixed' && check.fix ? `تم الإصلاح: ${check.fix}` : check.result}
          </p>
        )}
        {state === 'issue' && check.fix && <p className="text-xs text-slate-500">الإصلاح المقترح: {check.fix}</p>}
      </div>
    </li>
  );
}
