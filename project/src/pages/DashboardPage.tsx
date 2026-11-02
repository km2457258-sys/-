import { ArrowDown, ArrowUp, HeartPulse, Users } from 'lucide-react';
import { SpeedGauge } from '@/components/dashboard/SpeedGauge';
import { Card } from '@/components/ui/Card';
import { DOWNLOAD_CAPACITY_MBPS, UPLOAD_CAPACITY_MBPS } from '@/data/devices';
import type { Device } from '@/types/network';

interface DashboardPageProps {
  devices: Device[];
  downloadMbps: number;
  uploadMbps: number;
  latencyMs: number;
}

function healthScore(latencyMs: number) {
  return Math.round(Math.min(100, Math.max(0, 100 - (latencyMs - 15) * 1.5)));
}

function healthLabel(score: number) {
  if (score >= 85) return 'ممتازة';
  if (score >= 60) return 'جيدة';
  return 'تحتاج إلى انتباه';
}

export function DashboardPage({ devices, downloadMbps, uploadMbps, latencyMs }: DashboardPageProps) {
  const score = healthScore(latencyMs);
  const activeDevices = devices.filter((device) => device.currentSite !== null).length;
  const usagePercent = Math.round(((downloadMbps + uploadMbps) / (DOWNLOAD_CAPACITY_MBPS + UPLOAD_CAPACITY_MBPS)) * 100);
  const topDevices = [...devices].sort((a, b) => b.downloadMbps - a.downloadMbps).slice(0, 4);
  const maxTop = Math.max(1, ...topDevices.map((device) => device.downloadMbps));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="السرعة المباشرة" subtitle="سرعة التنزيل والرفع لحظياً عبر اتصالك" className="xl:col-span-2">
          <div className="grid gap-8 sm:grid-cols-2">
            <SpeedGauge label="التنزيل" value={downloadMbps} max={DOWNLOAD_CAPACITY_MBPS} tone="cyan" />
            <SpeedGauge label="الرفع" value={uploadMbps} max={UPLOAD_CAPACITY_MBPS} tone="blue" />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-cyan-400" aria-hidden="true" />
              السعة القصوى للتنزيل {DOWNLOAD_CAPACITY_MBPS} ميجابت/ث
            </span>
            <span className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-blue-400" aria-hidden="true" />
              السعة القصوى للرفع {UPLOAD_CAPACITY_MBPS} ميجابت/ث
            </span>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">الأجهزة المتصلة</p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-slate-100">{devices.length}</p>
                <p className="mt-1 text-xs text-slate-500">{activeDevices} تتصفح الآن</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/30">
                <Users className="h-6 w-6 text-cyan-400" aria-hidden="true" />
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-sm text-slate-400">استهلاك النطاق</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-slate-100">
              {(downloadMbps + uploadMbps).toFixed(1)}
              <span className="ms-1 text-base font-medium text-slate-400">ميجابت/ث</span>
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-l from-blue-500 to-cyan-400 transition-[width] duration-700 ease-out"
                style={{ width: `${Math.min(100, usagePercent)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">{usagePercent}% من السعة الكلية</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">صحة الشبكة</p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-slate-100">
                  {score}
                  <span className="ms-1 text-base font-medium text-slate-400">/100</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {healthLabel(score)} · زمن استجابة {Math.round(latencyMs)} ms
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 ring-1 ring-emerald-400/30">
                <HeartPulse className="h-6 w-6 text-emerald-400" aria-hidden="true" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card title="أكثر الأجهزة استهلاكاً" subtitle="الأجهزة الأكثر تنزيلاً للبيانات الآن">
        <ul className="space-y-4">
          {topDevices.map((device) => (
            <li key={device.mac} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[180px_1fr_110px]">
              <span className="truncate text-sm font-medium text-slate-200">{device.name}</span>
              <span className="text-start text-sm tabular-nums text-slate-300 sm:order-last sm:text-end">
                {device.downloadMbps.toFixed(1)} ميجابت/ث
              </span>
              <div className="col-span-2 h-2 overflow-hidden rounded-full bg-slate-800 sm:col-span-1">
                <div
                  className="h-full rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)] transition-[width] duration-700 ease-out"
                  style={{ width: `${(device.downloadMbps / maxTop) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
