import { useState } from 'react';
import { Gamepad2, Cpu, Laptop, Pencil, Smartphone, Tablet, Tv, Globe, type LucideIcon } from 'lucide-react';
import { RenameDeviceDialog } from '@/components/devices/RenameDeviceDialog';
import { Card } from '@/components/ui/Card';
import { StatusMessage } from '@/components/ui/StatusMessage';
import type { Device, DeviceType } from '@/types/network';

const TYPE_ICONS: Record<DeviceType, LucideIcon> = {
  laptop: Laptop,
  phone: Smartphone,
  tablet: Tablet,
  tv: Tv,
  console: Gamepad2,
  iot: Cpu,
};

interface DeviceMonitorPageProps {
  devices: Device[];
  loadError: string | null;
  onRename: (mac: string, name: string) => Promise<void>;
}

export function DeviceMonitorPage({ devices, loadError, onRename }: DeviceMonitorPageProps) {
  const [editingMac, setEditingMac] = useState<string | null>(null);
  const editingDevice = devices.find((device) => device.mac === editingMac) ?? null;

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        عرض مباشر لجميع الأجهزة على شبكتك. تُظهر كل بطاقة الموقع الذي يزوره الجهاز الآن فقط، ولا يتم تسجيل
        أي شيء، لذلك لا تُحفظ المواقع السابقة ولا تُعرض.
      </p>

      {loadError && <StatusMessage tone="error">تعذّر تحميل أسماء الأجهزة المخصصة: {loadError}</StatusMessage>}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {devices.map((device) => {
          const Icon = TYPE_ICONS[device.type];
          const browsing = device.currentSite !== null;
          return (
            <Card key={device.mac} className="flex flex-col transition-colors duration-300 hover:border-slate-700">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 ring-1 ring-slate-700">
                    <Icon className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-100">{device.name}</p>
                    <p className="truncate text-xs tabular-nums text-slate-400" dir="ltr">{device.mac}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingMac(device.mac)}
                  className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-cyan-300"
                  aria-label={`تغيير اسم ${device.name}`}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">عنوان IP المحلي</dt>
                  <dd className="mt-1 tabular-nums text-slate-200" dir="ltr">{device.ip}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">النطاق (تنزيل / رفع)</dt>
                  <dd className="mt-1 tabular-nums text-slate-200">
                    {device.downloadMbps.toFixed(1)} / {device.uploadMbps.toFixed(1)} ميجابت/ث
                  </dd>
                </div>
              </dl>

              <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="flex items-center gap-2 text-xs text-slate-500">
                  <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                  يتصفح حالياً
                </p>
                <div className="mt-2 flex min-h-6 items-center gap-2">
                  {browsing ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                      </span>
                      <span
                        key={device.currentSite}
                        className="truncate text-sm font-medium text-cyan-300 animate-[fadeIn_0.4s_ease-out]"
                        dir="ltr"
                      >
                        {device.currentSite}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-500">لا يوجد نشاط تصفح</span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {editingDevice && (
        <RenameDeviceDialog
          device={editingDevice}
          onClose={() => setEditingMac(null)}
          onSave={(name) => onRename(editingDevice.mac, name)}
        />
      )}
    </div>
  );
}
