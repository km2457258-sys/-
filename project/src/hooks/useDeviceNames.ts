import { useCallback, useEffect, useState } from 'react';
import { fetchDeviceNames, saveDeviceName } from '@/services/networkApi';

export function useDeviceNames() {
  const [names, setNames] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchDeviceNames()
      .then((loaded) => {
        if (active) setNames(loaded);
      })
      .catch((error: Error) => {
        if (active) setLoadError(error.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const rename = useCallback(async (mac: string, name: string) => {
    await saveDeviceName(mac, name);
    setNames((current) => ({ ...current, [mac]: name }));
  }, []);

  return { names, loadError, rename };
}
