import { useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardPage } from '@/pages/DashboardPage';
import { DeviceMonitorPage } from '@/pages/DeviceMonitorPage';
import { WifiSettingsPage } from '@/pages/WifiSettingsPage';
import { WebBlockingPage } from '@/pages/WebBlockingPage';
import { DiagnosticsPage } from '@/pages/DiagnosticsPage';
import { RouterLoginPage } from '@/pages/RouterLoginPage';
import { GeneralSettingsPage } from '@/pages/GeneralSettingsPage';
import { useDeviceNames } from '@/hooks/useDeviceNames';
import { useLiveNetwork } from '@/hooks/useLiveNetwork';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type { RouterCredentials, TabId } from '@/types/network';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [routerCredentials, setRouterCredentials] = useState<RouterCredentials>({
    username: 'admin',
    password: '',
  });

  const online = useOnlineStatus();
  const network = useLiveNetwork();
  const { names, loadError: deviceNamesError, rename } = useDeviceNames();

  const devices = useMemo(
    () =>
      network.devices.map((device) => ({
        ...device,
        name: names[device.mac] ?? device.defaultName,
      })),
    [network.devices, names],
  );

  const selectTab = (tab: TabId) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            devices={devices}
            downloadMbps={network.downloadMbps}
            uploadMbps={network.uploadMbps}
            latencyMs={network.latencyMs}
          />
        );
      case 'devices':
        return <DeviceMonitorPage devices={devices} onRename={rename} loadError={deviceNamesError} />;
      case 'wifi':
        return <WifiSettingsPage />;
      case 'blocking':
        return <WebBlockingPage devices={devices} />;
      case 'diagnostics':
        return <DiagnosticsPage />;
      case 'router':
        return (
          <RouterLoginPage
            credentials={routerCredentials}
            onCredentialsChange={setRouterCredentials}
          />
        );
      case 'settings':
        return <GeneralSettingsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      <Sidebar
        activeTab={activeTab}
        open={menuOpen}
        onSelect={selectTab}
        onClose={() => setMenuOpen(false)}
      />
      <div className="lg:pr-72">
        <Header activeTab={activeTab} online={online} onMenuClick={() => setMenuOpen(true)} />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
          <div key={activeTab} className="animate-[fadeIn_0.35s_ease-out]">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
