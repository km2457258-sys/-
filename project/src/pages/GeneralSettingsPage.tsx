import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusMessage } from '@/components/ui/StatusMessage';
import { wait } from '@/lib/delay';
import {
  ipToNumber,
  isInSubnet,
  isValidIPv4,
  isValidSubnetMask,
} from '@/lib/validation';
import { fetchNetworkSettings, saveNetworkSettings } from '@/services/networkApi';
import type { NetworkSettings } from '@/types/network';

type DnsPresetId = 'cloudflare' | 'google' | 'custom';

const DNS_PRESETS: { id: DnsPresetId; label: string; primary: string; secondary: string }[] = [
  { id: 'cloudflare', label: 'Cloudflare (1.1.1.1)', primary: '1.1.1.1', secondary: '1.0.0.1' },
  { id: 'google', label: 'Google (8.8.8.8)', primary: '8.8.8.8', secondary: '8.8.4.4' },
  { id: 'custom', label: 'DNS محلي مخصص', primary: '', secondary: '' },
];

type FormErrors = Partial<Record<keyof NetworkSettings, string>>;

function detectPreset(settings: NetworkSettings): DnsPresetId {
  const match = DNS_PRESETS.find(
    (preset) =>
      preset.id !== 'custom' &&
      preset.primary === settings.dnsPrimary &&
      preset.secondary === settings.dnsSecondary,
  );
  return match?.id ?? 'custom';
}

function validate(settings: NetworkSettings): FormErrors {
  const errors: FormErrors = {};
  if (!isValidIPv4(settings.gatewayIp)) errors.gatewayIp = 'أدخل عنوان IP صحيحاً، مثل 192.168.1.1.';
  if (!isValidSubnetMask(settings.subnetMask)) errors.subnetMask = 'أدخل قناع شبكة صحيحاً، مثل 255.255.255.0.';
  if (!isValidIPv4(settings.dhcpStart)) errors.dhcpStart = 'أدخل عنوان بداية صحيحاً.';
  if (!isValidIPv4(settings.dhcpEnd)) errors.dhcpEnd = 'أدخل عنوان نهاية صحيحاً.';
  if (!isValidIPv4(settings.dnsPrimary)) errors.dnsPrimary = 'أدخل عنوان DNS الأساسي بشكل صحيح.';
  if (!isValidIPv4(settings.dnsSecondary)) errors.dnsSecondary = 'أدخل عنوان DNS الثانوي بشكل صحيح.';

  if (Object.keys(errors).length > 0) return errors;

  if (!isInSubnet(settings.dhcpStart, settings.gatewayIp, settings.subnetMask)) {
    errors.dhcpStart = 'يجب أن يقع نطاق DHCP داخل شبكة البوابة.';
  }
  if (!isInSubnet(settings.dhcpEnd, settings.gatewayIp, settings.subnetMask)) {
    errors.dhcpEnd = 'يجب أن يقع نطاق DHCP داخل شبكة البوابة.';
  }
  if (ipToNumber(settings.dhcpStart) > ipToNumber(settings.dhcpEnd)) {
    errors.dhcpEnd = 'يجب أن يأتي عنوان النهاية بعد عنوان البداية.';
  }
  return errors;
}

export function GeneralSettingsPage() {
  const [loaded, setLoaded] = useState<NetworkSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<NetworkSettings | null>(null);
  const [preset, setPreset] = useState<DnsPresetId>('cloudflare');
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    fetchNetworkSettings()
      .then((settings) => {
        if (!active) return;
        setLoaded(settings);
        setForm(settings);
        setPreset(detectPreset(settings));
      })
      .catch((error: Error) => {
        if (active) setLoadError(error.message);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loadError) {
    return <StatusMessage tone="error">تعذّر تحميل الإعدادات العامة: {loadError}</StatusMessage>;
  }

  if (!loaded || !form) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        جارٍ تحميل الإعدادات العامة...
      </div>
    );
  }

  const updateField = (field: keyof NetworkSettings, value: string) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setStatus(null);
  };

  const choosePreset = (id: DnsPresetId) => {
    setPreset(id);
    const option = DNS_PRESETS.find((item) => item.id === id);
    if (option && id !== 'custom') {
      setForm((current) =>
        current ? { ...current, dnsPrimary: option.primary, dnsSecondary: option.secondary } : current,
      );
      setErrors((current) => ({ ...current, dnsPrimary: undefined, dnsSecondary: undefined }));
    }
    setStatus(null);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setStatus(null);
    try {
      await wait(900);
      await saveNetworkSettings(form);
      setLoaded(form);
      setStatus({ tone: 'success', text: 'تم حفظ الإعدادات العامة وإرسالها إلى الراوتر.' });
    } catch (error) {
      setStatus({
        tone: 'error',
        text: error instanceof Error ? error.message : 'تعذّر حفظ الإعدادات العامة.',
      });
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = (field: keyof NetworkSettings) =>
    `w-full rounded-lg border bg-slate-950 px-4 py-2.5 tabular-nums text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-60 ${
      errors[field] ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-cyan-400'
    }`;

  const renderField = (field: keyof NetworkSettings, label: string, disabled = false) => (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <input
        value={form[field]}
        disabled={saving || disabled}
        dir="ltr"
        onChange={(event) => updateField(field, event.target.value)}
        aria-invalid={Boolean(errors[field])}
        className={fieldClass(field)}
      />
      {errors[field] && <p className="text-sm text-red-400">{errors[field]}</p>}
    </label>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card title="العناوين" subtitle="كيف يوزّع الراوتر العناوين ويصل إلى الأجهزة على شبكتك." className="lg:col-span-3">
        <form onSubmit={handleSave} className="space-y-6" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            {renderField('gatewayIp', 'عنوان البوابة (Gateway)')}
            {renderField('subnetMask', 'قناع الشبكة (Subnet Mask)')}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-300">نطاق DHCP المحلي</p>
            <div className="grid gap-5 sm:grid-cols-2">
              {renderField('dhcpStart', 'عنوان البداية')}
              {renderField('dhcpEnd', 'عنوان النهاية')}
            </div>
          </div>

          <fieldset className="space-y-3" disabled={saving}>
            <legend className="mb-3 text-sm font-medium text-slate-300">خوادم DNS</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {DNS_PRESETS.map((option) => {
                const selected = preset === option.id;
                return (
                  <label
                    key={option.id}
                    className={`cursor-pointer rounded-xl border p-3 text-center text-sm transition-all duration-200 ${
                      selected
                        ? 'border-cyan-400/60 bg-cyan-400/10 font-bold text-cyan-300'
                        : 'border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dns-preset"
                      className="sr-only"
                      checked={selected}
                      onChange={() => choosePreset(option.id)}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
            <div className="grid gap-5 pt-2 sm:grid-cols-2">
              {renderField('dnsPrimary', 'DNS الأساسي', preset !== 'custom')}
              {renderField('dnsSecondary', 'DNS الثانوي', preset !== 'custom')}
            </div>
          </fieldset>

          {status && <StatusMessage tone={status.tone}>{status.text}</StatusMessage>}

          <div className="flex justify-end">
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" aria-hidden="true" />}>
              حفظ الإعدادات
            </Button>
          </div>
        </form>
      </Card>

      <Card title="الإعدادات الحالية" subtitle="آخر القيم المحفوظة" className="h-fit lg:col-span-2">
        <dl className="space-y-5 text-sm">
          <SummaryRow label="البوابة" value={loaded.gatewayIp} />
          <SummaryRow label="قناع الشبكة" value={loaded.subnetMask} />
          <SummaryRow label="نطاق DHCP" value={`${loaded.dhcpStart} إلى ${loaded.dhcpEnd}`} />
          <SummaryRow label="DNS الأساسي" value={loaded.dnsPrimary} />
          <SummaryRow label="DNS الثانوي" value={loaded.dnsSecondary} />
        </dl>
        <p className="mt-6 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400">
          قد يؤدي تغيير عنوان البوابة إلى انقطاع الأجهزة لفترة قصيرة أثناء تجديد إعداداتها.
        </p>
      </Card>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 tabular-nums text-slate-100" dir="ltr">{value}</dd>
    </div>
  );
}
