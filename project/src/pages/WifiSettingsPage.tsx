import { useEffect, useState, type FormEvent } from 'react';
import { Eye, EyeOff, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusMessage } from '@/components/ui/StatusMessage';
import { wait } from '@/lib/delay';
import { isValidSsid, isValidWifiPassword } from '@/lib/validation';
import { fetchWifiSettings, saveWifiSettings } from '@/services/networkApi';
import type { SecurityMode, WifiSettings } from '@/types/network';

const ROUTER_IP = '192.168.1.1';

const SECURITY_MODES: { value: SecurityMode; description: string }[] = [
  { value: 'WPA2', description: 'أوسع توافق مع الأجهزة' },
  { value: 'WPA3', description: 'حماية أقوى، للأجهزة الحديثة فقط' },
];

type Status = { tone: 'info' | 'success' | 'error'; text: string } | null;

interface FormErrors {
  ssid?: string;
  password?: string;
}

export function WifiSettingsPage() {
  const [saved, setSaved] = useState<WifiSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ssid, setSsid] = useState('');
  const [securityMode, setSecurityMode] = useState<SecurityMode>('WPA2');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [applying, setApplying] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    let active = true;
    fetchWifiSettings()
      .then((settings) => {
        if (!active) return;
        setSaved(settings);
        setSsid(settings.ssid);
        setSecurityMode(settings.securityMode);
      })
      .catch((error: Error) => {
        if (active) setLoadError(error.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleApply = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!isValidSsid(ssid)) nextErrors.ssid = 'يجب أن يكون اسم الشبكة بين حرف و32 حرفاً.';
    if (!isValidWifiPassword(password)) nextErrors.password = 'يجب أن تكون كلمة المرور بين 8 و63 حرفاً.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const next: WifiSettings = { ssid: ssid.trim(), securityMode };
    setApplying(true);
    setStatus({ tone: 'info', text: `جارٍ الاتصال بالراوتر على العنوان ${ROUTER_IP}...` });
    try {
      await wait(1200);
      setStatus({ tone: 'info', text: 'جارٍ إرسال إعدادات الشبكة اللاسلكية...' });
      await wait(1000);
      await saveWifiSettings(next);
      setSaved(next);
      setSsid(next.ssid);
      setPassword('');
      setShowPassword(false);
      setStatus({ tone: 'success', text: 'تم تحديث الواي فاي بنجاح' });
    } catch (error) {
      setStatus({
        tone: 'error',
        text: error instanceof Error ? error.message : 'تعذّر تطبيق تغييرات الواي فاي.',
      });
    } finally {
      setApplying(false);
    }
  };

  if (loadError) {
    return <StatusMessage tone="error">تعذّر تحميل إعدادات الواي فاي: {loadError}</StatusMessage>;
  }

  if (!saved) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        جارٍ تحميل إعدادات الواي فاي...
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card
        title="الشبكة اللاسلكية"
        subtitle="تُرسل التغييرات إلى الراوتر وتسري على جميع الأجهزة المتصلة."
        className="lg:col-span-3"
      >
        <form onSubmit={handleApply} className="space-y-6" noValidate>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300">اسم الشبكة (SSID)</span>
            <input
              value={ssid}
              maxLength={32}
              onChange={(event) => setSsid(event.target.value)}
              disabled={applying}
              aria-invalid={Boolean(errors.ssid)}
              dir="ltr"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 transition-colors focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-60"
            />
            {errors.ssid && <p className="text-sm text-red-400">{errors.ssid}</p>}
          </label>

          <fieldset className="space-y-2" disabled={applying}>
            <legend className="mb-2 text-sm font-medium text-slate-300">نمط الأمان</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {SECURITY_MODES.map((mode) => {
                const selected = securityMode === mode.value;
                return (
                  <label
                    key={mode.value}
                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                      selected
                        ? 'border-cyan-400/60 bg-cyan-400/10 ring-1 ring-cyan-400/30'
                        : 'border-slate-700 bg-slate-950 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="security-mode"
                      value={mode.value}
                      checked={selected}
                      onChange={() => setSecurityMode(mode.value)}
                      className="sr-only"
                    />
                    <span className={`block text-sm font-bold ${selected ? 'text-cyan-300' : 'text-slate-200'}`} dir="ltr">
                      {mode.value}-Personal
                    </span>
                    <span className="mt-1 block text-xs text-slate-400">{mode.description}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300">كلمة مرور الواي فاي</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                autoComplete="new-password"
                onChange={(event) => setPassword(event.target.value)}
                disabled={applying}
                aria-invalid={Boolean(errors.password)}
                placeholder="أدخل كلمة المرور الجديدة"
                dir="ltr"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 ps-4 pe-12 text-slate-100 placeholder:text-slate-600 transition-colors focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-60"
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
            {errors.password ? (
              <p className="text-sm text-red-400">{errors.password}</p>
            ) : (
              <p className="text-xs text-slate-500">من 8 إلى 63 حرفاً. تُرسل كلمة المرور إلى الراوتر ولا تُحفظ.</p>
            )}
          </label>

          {status && <StatusMessage tone={status.tone}>{status.text}</StatusMessage>}

          <div className="flex justify-end">
            <Button type="submit" loading={applying} icon={<Save className="h-4 w-4" aria-hidden="true" />}>
              حفظ وتطبيق التغييرات
            </Button>
          </div>
        </form>
      </Card>

      <Card title="الشبكة الحالية" subtitle="ما تراه أجهزتك الآن" className="h-fit lg:col-span-2">
        <dl className="space-y-5">
          <div>
            <dt className="text-xs text-slate-500">اسم الشبكة</dt>
            <dd className="mt-1 truncate text-lg font-bold text-slate-100" dir="ltr">{saved.ssid}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">الأمان</dt>
            <dd className="mt-1">
              <span className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300" dir="ltr">
                {saved.securityMode}-Personal
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">الراوتر</dt>
            <dd className="mt-1 tabular-nums text-slate-200" dir="ltr">{ROUTER_IP}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
