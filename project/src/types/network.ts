export type TabId =
  | 'dashboard'
  | 'devices'
  | 'wifi'
  | 'blocking'
  | 'diagnostics'
  | 'router'
  | 'settings';

export type DeviceType = 'laptop' | 'phone' | 'tablet' | 'tv' | 'console' | 'iot';

export interface Device {
  mac: string;
  ip: string;
  defaultName: string;
  name: string;
  type: DeviceType;
  downloadMbps: number;
  uploadMbps: number;
  currentSite: string | null;
}

export type SecurityMode = 'WPA2' | 'WPA3';

export interface WifiSettings {
  ssid: string;
  securityMode: SecurityMode;
}

export interface NetworkSettings {
  gatewayIp: string;
  subnetMask: string;
  dhcpStart: string;
  dhcpEnd: string;
  dnsPrimary: string;
  dnsSecondary: string;
}

export interface BlockedDomain {
  id: string;
  deviceMac: string;
  domain: string;
  createdAt: string;
}

export interface RouterCredentials {
  username: string;
  password: string;
}
