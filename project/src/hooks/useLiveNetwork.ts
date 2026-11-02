import { useEffect, useRef, useState } from 'react';
import {
  DOWNLOAD_CAPACITY_MBPS,
  SEED_DEVICES,
  SITE_CANDIDATES,
  UPLOAD_CAPACITY_MBPS,
} from '@/data/devices';
import type { Device } from '@/types/network';

export interface LiveNetwork {
  devices: Device[];
  downloadMbps: number;
  uploadMbps: number;
  latencyMs: number;
}

const TICK_MS = 1000;
const RETARGET_EVERY_TICKS = 3;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function jitter(value: number, spread: number) {
  return value + (Math.random() - 0.5) * spread;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickSite() {
  return SITE_CANDIDATES[Math.floor(Math.random() * SITE_CANDIDATES.length)];
}

export function useLiveNetwork(): LiveNetwork {
  const [devices, setDevices] = useState<Device[]>(SEED_DEVICES);
  const [downloadMbps, setDownloadMbps] = useState(0);
  const [uploadMbps, setUploadMbps] = useState(0);
  const [latencyMs, setLatencyMs] = useState(18);

  const targets = useRef({ download: 340, upload: 45 });

  useEffect(() => {
    let tick = 0;
    const timer = window.setInterval(() => {
      tick += 1;
      if (tick % RETARGET_EVERY_TICKS === 0) {
        targets.current = {
          download: randomBetween(60, 820),
          upload: randomBetween(10, 320),
        };
      }

      setDownloadMbps((current) =>
        clamp(jitter(current + (targets.current.download - current) * 0.4, 12), 0, DOWNLOAD_CAPACITY_MBPS),
      );
      setUploadMbps((current) =>
        clamp(jitter(current + (targets.current.upload - current) * 0.4, 6), 0, UPLOAD_CAPACITY_MBPS),
      );
      setLatencyMs((current) => clamp(jitter(current, 4), 8, 60));
      setDevices((current) =>
        current.map((device) => {
          if (device.type === 'iot') return device;
          const siteChanged = Math.random() < 0.3 || !device.currentSite;
          return {
            ...device,
            downloadMbps: clamp(jitter(device.downloadMbps, 14), 1, 400),
            uploadMbps: clamp(jitter(device.uploadMbps, 3), 0.5, 60),
            currentSite: siteChanged ? pickSite() : device.currentSite,
          };
        }),
      );
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, []);

  return { devices, downloadMbps, uploadMbps, latencyMs };
}
