import { Menu, Wifi, WifiOff } from 'lucide-react';
import type { TabId } from '@/types/network';
import { NAV_ITEMS } from '@/components/layout/Sidebar';

const ROUTER_IP = '192.168.1.1';

interface HeaderProps {
  activeTab: TabId;
  online: boolean;
  onMenuClick: () => void;
}

export function Header({ activeTab, online, onMenuClick }: HeaderProps) {
  const title = NAV_ITEMS.find((item) => item.id === activeTab)?.label ?? '';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/85 px-4 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-2 text-slate-300 transition-colors hover:bg-slate-800 lg:hidden"
          aria-label="فتح القائمة"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-bold text-slate-100">{title}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 sm:flex">
          <span className="text-slate-500">الراوتر</span>
          <span className="font-medium tabular-nums text-slate-100" dir="ltr">{ROUTER_IP}</span>
        </div>
        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors duration-300 ${
            online
              ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300'
              : 'border-red-500/40 bg-red-500/10 text-red-300'
          }`}
          role="status"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                online ? 'animate-ping bg-cyan-400' : 'bg-red-500'
              }`}
            />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${online ? 'bg-cyan-400' : 'bg-red-500'}`} />
          </span>
          {online ? <Wifi className="h-3.5 w-3.5" aria-hidden="true" /> : <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />}
          {online ? 'متصل' : 'غير متصل'}
        </div>
      </div>
    </header>
  );
}
