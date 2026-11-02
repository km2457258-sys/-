import {
  Ban,
  Gauge,
  LayoutDashboard,
  Router,
  Settings,
  Smartphone,
  Stethoscope,
  Wifi,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { TabId } from '@/types/network';

interface NavItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'devices', label: 'مراقبة الأجهزة', icon: Smartphone },
  { id: 'wifi', label: 'إعدادات الواي فاي', icon: Wifi },
  { id: 'blocking', label: 'حظر المواقع', icon: Ban },
  { id: 'diagnostics', label: 'إصلاح الشبكة تلقائياً', icon: Stethoscope },
  { id: 'router', label: 'تسجيل الدخول للراوتر', icon: Router },
  { id: 'settings', label: 'الإعدادات العامة', icon: Settings },
];

interface SidebarProps {
  activeTab: TabId;
  open: boolean;
  onSelect: (tab: TabId) => void;
  onClose: () => void;
}

export function Sidebar({ activeTab, open, onSelect, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-72 flex-col border-s border-slate-800 bg-slate-950 transition-transform duration-300 ease-out lg:translate-x-0 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 ring-1 ring-cyan-400/40">
              <Gauge className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">مدير الشبكة المنزلية</p>
              <p className="text-xs text-slate-400">مركز التحكم بالشبكة</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="القائمة الرئيسية">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                {isActive && (
                  <span className="absolute end-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-s-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                )}
                <Icon
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-cyan-400' : ''}`}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="rounded-xl bg-slate-900/70 p-3 text-xs text-slate-400">
            <p className="font-medium text-slate-300">البوابة</p>
            <p className="mt-0.5 tabular-nums" dir="ltr">192.168.1.1</p>
          </div>
        </div>
      </aside>
    </>
  );
}
