import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Ban, Loader2, Plus, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusMessage } from '@/components/ui/StatusMessage';
import { isValidDomain, normalizeDomain } from '@/lib/validation';
import { addBlockedDomain, fetchBlockedDomains, removeBlockedDomain } from '@/services/networkApi';
import type { BlockedDomain, Device } from '@/types/network';

const SUGGESTED_DOMAINS = ['tiktok.com', 'facebook.com', 'youtube.com'];

interface WebBlockingPageProps {
  devices: Device[];
}

export function WebBlockingPage({ devices }: WebBlockingPageProps) {
  const [selectedMac, setSelectedMac] = useState(devices[0]?.mac ?? '');
  const [rules, setRules] = useState<BlockedDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchBlockedDomains()
      .then((loaded) => {
        if (active) setRules(loaded);
      })
      .catch((error: Error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selectedDevice = devices.find((device) => device.mac === selectedMac) ?? devices[0];
  const deviceRules = useMemo(
    () => rules.filter((rule) => rule.deviceMac === selectedDevice?.mac),
    [rules, selectedDevice],
  );

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedDevice) return;
    const domain = normalizeDomain(input);
    if (!isValidDomain(domain)) {
      setInputError('أدخل اسم نطاق صحيحاً، مثل tiktok.com.');
      return;
    }
    if (deviceRules.some((rule) => rule.domain === domain)) {
      setInputError(`الموقع ${domain} محظور بالفعل على هذا الجهاز.`);
      return;
    }

    setInputError(null);
    setActionError(null);
    setAdding(true);
    try {
      const rule = await addBlockedDomain(selectedDevice.mac, domain);
      setRules((current) => [...current, rule]);
      setInput('');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'تعذّر حظر هذا الموقع.');
    } finally {
      setAdding(false);
    }
  };

  const handleUnblock = async (id: string) => {
    setActionError(null);
    setRemovingId(id);
    try {
      await removeBlockedDomain(id);
      setRules((current) => current.filter((rule) => rule.id !== id));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'تعذّر إلغاء حظر هذا الموقع.');
    } finally {
      setRemovingId(null);
    }
  };

  if (devices.length === 0) {
    return <StatusMessage tone="info">لا توجد أجهزة متصلة حالياً.</StatusMessage>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card title="حظر موقع" subtitle="تُطبّق القواعد على الجهاز الذي تختاره فقط." className="h-fit lg:col-span-2">
        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300">الجهاز</span>
            <select
              value={selectedDevice?.mac}
              onChange={(event) => {
                setSelectedMac(event.target.value);
                setInputError(null);
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 transition-colors focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            >
              {devices.map((device) => (
                <option key={device.mac} value={device.mac}>
                  {device.name} ({device.ip})
                </option>
              ))}
            </select>
          </label>

          <form onSubmit={handleAdd} className="space-y-2" noValidate>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">اسم الموقع</span>
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value);
                    setInputError(null);
                  }}
                  placeholder="tiktok.com"
                  aria-invalid={Boolean(inputError)}
                  disabled={adding}
                  dir="ltr"
                  className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 placeholder:text-slate-600 transition-colors focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
                <Button type="submit" loading={adding} icon={<Plus className="h-4 w-4" aria-hidden="true" />}>
                  حظر
                </Button>
              </div>
            </label>
            {inputError && <p className="text-sm text-red-400">{inputError}</p>}
          </form>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_DOMAINS.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => setInput(domain)}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition-colors hover:border-red-400/60 hover:text-red-300"
                dir="ltr"
              >
                {domain}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card
        title="المواقع المحظورة"
        subtitle={`${deviceRules.length} ${deviceRules.length === 1 ? 'قاعدة نشطة' : 'قواعد نشطة'} لـ ${selectedDevice?.name}`}
        className="lg:col-span-3"
      >
        {loadError && <StatusMessage tone="error">تعذّر تحميل المواقع المحظورة: {loadError}</StatusMessage>}
        {actionError && (
          <div className="mb-4">
            <StatusMessage tone="error">{actionError}</StatusMessage>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 py-10 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            جارٍ تحميل القواعد...
          </div>
        ) : deviceRules.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-700 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
              <ShieldOff className="h-6 w-6 text-slate-500" aria-hidden="true" />
            </div>
            <p className="text-sm text-slate-400">لا توجد مواقع محظورة على هذا الجهاز.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500">
                  <th className="pb-3 font-medium">الموقع</th>
                  <th className="pb-3 font-medium">الحالة</th>
                  <th className="pb-3 text-end font-medium">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {deviceRules.map((rule) => (
                  <tr key={rule.id} className="animate-[fadeIn_0.3s_ease-out] transition-colors hover:bg-slate-800/40">
                    <td className="py-3 font-medium text-slate-100" dir="ltr">{rule.domain}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-300">
                        <Ban className="h-3 w-3" aria-hidden="true" />
                        محظور
                      </span>
                    </td>
                    <td className="py-3 text-end">
                      <Button
                        variant="secondary"
                        className="px-3 py-1.5 text-xs"
                        loading={removingId === rule.id}
                        onClick={() => handleUnblock(rule.id)}
                      >
                        إلغاء الحظر
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
