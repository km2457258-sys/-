import { useEffect, useRef, useState } from 'react';
import { Stethoscope, Wrench, RotateCcw } from 'lucide-react';
import { CheckRow } from '@/components/diagnostics/CheckRow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusMessage } from '@/components/ui/StatusMessage';
import { DIAGNOSTIC_CHECKS, type CheckState } from '@/data/diagnostics';
import { wait } from '@/lib/delay';

type Phase = 'idle' | 'scanning' | 'scanned' | 'fixing' | 'complete';

const INITIAL_STATES = Object.fromEntries(
  DIAGNOSTIC_CHECKS.map((check) => [check.id, 'pending' as CheckState]),
) as Record<string, CheckState>;

export function DiagnosticsPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [states, setStates] = useState<Record<string, CheckState>>(INITIAL_STATES);
  const runRef = useRef(0);

  useEffect(() => {
    return () => {
      runRef.current += 1;
    };
  }, []);

  const issues = DIAGNOSTIC_CHECKS.filter((check) => !check.passed);
  const finished = DIAGNOSTIC_CHECKS.filter((check) => {
    const state = states[check.id];
    return state === 'passed' || state === 'issue' || state === 'fixed';
  }).length;
  const progress = Math.round((finished / DIAGNOSTIC_CHECKS.length) * 100);

  const setCheckState = (id: string, state: CheckState) =>
    setStates((current) => ({ ...current, [id]: state }));

  const startScan = async () => {
    const run = ++runRef.current;
    setStates(INITIAL_STATES);
    setPhase('scanning');
    for (const check of DIAGNOSTIC_CHECKS) {
      if (run !== runRef.current) return;
      setCheckState(check.id, 'running');
      await wait(1400 + Math.random() * 700);
      if (run !== runRef.current) return;
      setCheckState(check.id, check.passed ? 'passed' : 'issue');
    }
    if (run === runRef.current) setPhase('scanned');
  };

  const applyFixes = async () => {
    const run = ++runRef.current;
    setPhase('fixing');
    for (const check of issues) {
      if (run !== runRef.current) return;
      setCheckState(check.id, 'fixing');
      await wait(1100);
      if (run !== runRef.current) return;
      setCheckState(check.id, 'fixed');
    }
    if (run === runRef.current) setPhase('complete');
  };

  const busy = phase === 'scanning' || phase === 'fixing';

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card
        title="الفحوصات التلقائية"
        subtitle="يفحص شبكتك بحثاً عن المشكلات الشائعة ويصلح ما يمكن إصلاحه بأمان."
        className="lg:col-span-3"
      >
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-[width] duration-500 ease-out"
            style={{ width: `${phase === 'idle' ? 0 : progress}%` }}
          />
        </div>

        <ol className="divide-y divide-slate-800">
          {DIAGNOSTIC_CHECKS.map((check) => (
            <CheckRow key={check.id} check={check} state={states[check.id]} />
          ))}
        </ol>
      </Card>

      <Card title="الإجراءات" className="h-fit lg:col-span-2">
        <div className="space-y-5">
          {phase === 'idle' && (
            <>
              <p className="text-sm text-slate-400">
                أجرِ فحصاً شاملاً للتحقق من DHCP وDNS وقناة الواي فاي وأمان المنافذ.
              </p>
              <Button
                className="w-full"
                icon={<Stethoscope className="h-4 w-4" aria-hidden="true" />}
                onClick={startScan}
              >
                بدء الفحص والإصلاح التلقائي
              </Button>
            </>
          )}

          {phase === 'scanning' && (
            <StatusMessage tone="info">جارٍ فحص شبكتك. قد يستغرق ذلك بضع ثوانٍ.</StatusMessage>
          )}

          {phase === 'scanned' && (
            <>
              <StatusMessage tone={issues.length > 0 ? 'error' : 'success'}>
                {issues.length > 0
                  ? `تم العثور على ${issues.length} ${issues.length === 1 ? 'مشكلة' : 'مشكلات'}.`
                  : 'لم يتم العثور على مشكلات. شبكتك تبدو بصحة جيدة.'}
              </StatusMessage>
              {issues.length > 0 && (
                <Button className="w-full" icon={<Wrench className="h-4 w-4" aria-hidden="true" />} onClick={applyFixes}>
                  تطبيق الإصلاحات المقترحة
                </Button>
              )}
            </>
          )}

          {phase === 'fixing' && (
            <StatusMessage tone="info">جارٍ تطبيق الإصلاحات المقترحة على الراوتر...</StatusMessage>
          )}

          {phase === 'complete' && (
            <StatusMessage tone="success">تم تطبيق جميع الإصلاحات المقترحة. شبكتك محمية الآن.</StatusMessage>
          )}

          {(phase === 'scanned' || phase === 'complete') && (
            <Button variant="secondary" className="w-full" icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />} onClick={startScan} disabled={busy}>
              إعادة الفحص
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
