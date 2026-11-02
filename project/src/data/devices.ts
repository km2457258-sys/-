import type { Device } from '@/types/network';

export const DOWNLOAD_CAPACITY_MBPS = 1000;
export const UPLOAD_CAPACITY_MBPS = 500;

export const SEED_DEVICES: Device[] = [
  {
    mac: 'A4:83:E7:12:9B:01',
    ip: '192.168.1.101',
    defaultName: 'ماك بوك برو',
    name: 'ماك بوك برو',
    type: 'laptop',
    downloadMbps: 84,
    uploadMbps: 6,
    currentSite: null,
  },
  {
    mac: 'F0:18:98:4C:2D:7A',
    ip: '192.168.1.112',
    defaultName: 'آيفون 15',
    name: 'آيفون 15',
    type: 'phone',
    downloadMbps: 32,
    uploadMbps: 3,
    currentSite: null,
  },
  {
    mac: '3C:22:FB:90:E1:5C',
    ip: '192.168.1.118',
    defaultName: 'تلفاز غرفة المعيشة',
    name: 'تلفاز غرفة المعيشة',
    type: 'tv',
    downloadMbps: 210,
    uploadMbps: 1,
    currentSite: null,
  },
  {
    mac: 'B8:27:EB:6A:0F:33',
    ip: '192.168.1.124',
    defaultName: 'جهاز الأطفال اللوحي',
    name: 'جهاز الأطفال اللوحي',
    type: 'tablet',
    downloadMbps: 18,
    uploadMbps: 1,
    currentSite: null,
  },
  {
    mac: '00:1A:7D:DA:71:0E',
    ip: '192.168.1.131',
    defaultName: 'بلايستيشن 5',
    name: 'بلايستيشن 5',
    type: 'console',
    downloadMbps: 145,
    uploadMbps: 12,
    currentSite: null,
  },
  {
    mac: 'DC:A6:32:0B:7E:90',
    ip: '192.168.1.140',
    defaultName: 'منظم حرارة ذكي',
    name: 'منظم حرارة ذكي',
    type: 'iot',
    downloadMbps: 0,
    uploadMbps: 0,
    currentSite: null,
  },
];

export const SITE_CANDIDATES = [
  'youtube.com',
  'netflix.com',
  'github.com',
  'apple.com',
  'wikipedia.org',
  'news.google.com',
  'instagram.com',
  'amazon.com',
  'docs.google.com',
  'spotify.com',
];
