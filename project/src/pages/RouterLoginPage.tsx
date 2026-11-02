import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Eye, EyeOff, LogOut, Power, RefreshCw, ShieldCheck, Terminal, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusMessage } from '@/components/ui/StatusMessage';
import { wait } from '@/lib/delay';
import type { RouterCredentials } from '@/types/network';

const ROUTER_IP = '192.168.1.1';

interface RouterStatus {
  model: string;
  firmware: string;
  uptime: string;
  cpuLoad: number;
  memoryUsed: number;
  wanLink: string;
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

const CONNECT_STEPS = [
  `جارٍ فتح قناة آمنة إلى ${ROUTER_IP} عبر المنفذ 22 (SSH)...`,
  'جارٍ التحقق من مفتاح المضيف للبوابة...',
  'جارٍ تسجيل الدخول إلى الجلسة...',
  'جارٍ قراءة حالة النظام...',
];

function readStatus(): RouterStatus {
  return {
    model: 'HomeGateway AX3000',
    firmware: 'v3.2.1 (مستقر)',
    uptime: '12 يوماً و4 ساعات',
    cpuLoad: 8 + Math.round(Math.random() * 20),
    memoryUsed: 38 + Math.round(Math.random() * 14),
    wanLink: '1 Gbps ثنائي الاتجاه',
  };
}

interface RouterLoginPageProps {
  credentials: RouterCredentials;
  onCredentialsChange: (credentials: RouterCredentials) => void;
}

export function RouterLoginPage({ credentials, onCredentialsChange }: RouterLoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionState>('disconnected');
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<RouterStatus | null>(null);
  const [pushing, setPushing] = useState(false);
  const runRef = useRef(0);

  useEffect(() => {
    return () => {
      runRef.current += 1;
    };
  }, []);

  const appendLog = (line: string) => setLogs((current) => [...current, line]);

  const handleConnect = async (event: FormEvent) => {
    event.preventDefault();
    if (!credentials.username.trim() || !credentials.password) {
      setFormError('أدخل اسم المستخدم وكلمة المرور الخاصة بمدير الراوتر.');
      return;
    }
    setFormError(null);
    const run = ++runRef.current;
    setConnection('connecting');
    setLogs([]);
    setStatus(null);

    for (const step of CONNECT_STEPS) {
      await wait(800 + Math.random() * 500);
      if (run !== runRef.current) return;
      appendLog(step);
    }
    setStatus(readStatus());
    appendLog('تم الاتصال. تم استلام حالة البوابة.');
    setConnection('connected');
  };

  const handleDisconnect = () => {
    runRef.current += 1;
    setConnection('disconnected');
    setStatus(null);
    setPushing(false);
    setLogs([]);
  };

  const handleRefresh = () => {
    setStatus(readStatus());
    appendLog('تم تحديث الحالة.');
  };

  const handlePush = async () => {
    const run = ++runRef.current;
    setPushing(true);
    appendLog('جارٍ رفع تحديثات الإعدادات المعلقة إلى البوابة...');
    await wait(1200);
    if (run !== runRef.current) return;
    appendLog('جارٍ التحقق من الإعدادات على البوابة...');
    await wait(900);
    if (run !== runRef.current) return;
    appendLog('تم اعتماد الإعدادات وإعادة تشغيل خدمات البوابة.');
    setPushing(false);
  };

  const isConnected = connection === 'connected';
  const isConnecting = connection === 'connecting';

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card title="بيانات دخول الراوتر" subtitle="حساب مدير البوابة المستخدم للوصول إليها." className="h-fit lg:col-span-2">
        <form onSubmit={handleConnect} className="space-y-5" noValidate>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300">عنوان الراوتر</span>
            <input
              value={ROUTER_IP}
              readOnly
              dir="ltr"
              className="w-full cursor-not-allowed rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-2.5 tabular-nums text-slate-400"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300">اسم مستخدم المدير</span>
            <input
              value={credentials.username}
              autoComplete="username"
              disabled={isConnecting || isConnected}
              dir="ltr"
              onChange={(event) => onCredentialsChange({ ...credentials, username: event.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 transition-colors focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-60"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300">كلمة مرور المدير</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                autoComplete="current-password"
                disabled={isConnecting || isConnected}
                dir="ltr"
                onChange={(event) => onCredentialsChange({ ...credentials, password: event.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 ps-4 pe-12 text-slate-100 transition-colors focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 end-0 flex items-center px-3 text-slate-400 transition-colors hover:text-cyan-300"
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </label>

          <p className="text-xs text-slate-500">
            تبقى بيانات الدخول في جلسة المتصفح الحالية فقط ولا تُحفظ في قاعدة البيانات.
          </p>

          {formError && <StatusMessage tone="error">{formError}</StatusMessage>}

          {isConnected ? (
            <Button type="button" variant="secondary" className="w-full" icon={<LogOut className="h-4 w-4" aria-hidden="true" />} onClick={handleDisconnect}>
              قطع الاتصال بالراوتر
            </Button>
          ) : (
            <Button type="submit" className="w-full" loading={isConnecting} icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}>
              {isConnecting ? 'جارٍ الاتصال...' : 'الاتصال بالراوتر'}
            </Button>
          )}
        </form>
      </Card>

      <div className="grid gap-6 lg:col-span-3">
        <Card
          title="حالة البوابة"
          subtitle={isConnected ? 'جلسة مباشرة مع الراوتر' : 'اتصل لعرض حالة الراوتر'}
          action={
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold ${
                isConnected
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-700 bg-slate-800 text-slate-400'
              }`}
            >
              {isConnected ? 'متصل' : isConnecting ? 'جارٍ الاتصال' : 'غير متصل'}
            </span>
          }
        >
          {status ? (
            <div className="space-y-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <StatItem label="الطراز" value={status.model} />
                <StatItem label="البرنامج الثابت" value={status.firmware} />
                <StatItem label="مدة التشغيل" value={status.uptime} />
                <StatItem label="رابط الإنترنت (WAN)" value={status.wanLink} />
                <StatItem label="حمل المعالج" value={`${status.cpuLoad}%`} />
                <StatItem label="الذاكرة المستخدمة" value={`${status.memoryUsed}%`} />
              </dl>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />} onClick={handleRefresh} disabled={pushing}>
                  تحديث الحالة
                </Button>
                <Button loading={pushing} icon={<Upload className="h-4 w-4" aria-hidden="true" />} onClick={handlePush}>
                  رفع تحديثات الإعدادات
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-700 py-12 text-center">
              <Power className="h-6 w-6 text-slate-500" aria-hidden="true" />
              <p className="text-sm text-slate-400">لا توجد جلسة نشطة. اتصل لعرض تفاصيل البوابة.</p>
            </div>
          )}
        </Card>

        {logs.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
            <header className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5 text-xs text-slate-400">
              <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
              سجل الجلسة
            </header>
            <div className="max-h-56 space-y-1.5 overflow-y-auto p-4 font-mono text-xs text-slate-300" aria-live="polite" dir="ltr">
              {logs.map((line, index) => (
                <p key={`${index}-${line}`} className="animate-[fadeIn_0.3s_ease-out]">
                  <span className="text-cyan-500">$ </span>
                  {line}
                </p>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium tabular-nums text-slate-100">{value}</dd>
    </div>
  );
}
