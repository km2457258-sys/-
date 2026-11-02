import { supabase } from '@/lib/supabase';
import type {
  BlockedDomain,
  NetworkSettings,
  SecurityMode,
  WifiSettings,
} from '@/types/network';

const DB_ERROR = 'تعذّر الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى.';

function requireRow<T>(row: T | null, label: string): T {
  if (!row) throw new Error(`إعدادات ${label} غير موجودة في قاعدة البيانات.`);
  return row;
}

export async function fetchWifiSettings(): Promise<WifiSettings> {
  const { data, error } = await supabase
    .from('wifi_settings')
    .select('ssid, security_mode')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw new Error(DB_ERROR);
  const row = requireRow(data, 'الواي فاي');
  return { ssid: row.ssid, securityMode: row.security_mode as SecurityMode };
}

export async function saveWifiSettings(settings: WifiSettings): Promise<void> {
  const { error } = await supabase
    .from('wifi_settings')
    .update({
      ssid: settings.ssid,
      security_mode: settings.securityMode,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);
  if (error) throw new Error(DB_ERROR);
}

export async function fetchNetworkSettings(): Promise<NetworkSettings> {
  const { data, error } = await supabase
    .from('network_settings')
    .select('gateway_ip, subnet_mask, dhcp_start, dhcp_end, dns_primary, dns_secondary')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw new Error(DB_ERROR);
  const row = requireRow(data, 'الشبكة');
  return {
    gatewayIp: row.gateway_ip,
    subnetMask: row.subnet_mask,
    dhcpStart: row.dhcp_start,
    dhcpEnd: row.dhcp_end,
    dnsPrimary: row.dns_primary,
    dnsSecondary: row.dns_secondary,
  };
}

export async function saveNetworkSettings(settings: NetworkSettings): Promise<void> {
  const { error } = await supabase
    .from('network_settings')
    .update({
      gateway_ip: settings.gatewayIp,
      subnet_mask: settings.subnetMask,
      dhcp_start: settings.dhcpStart,
      dhcp_end: settings.dhcpEnd,
      dns_primary: settings.dnsPrimary,
      dns_secondary: settings.dnsSecondary,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);
  if (error) throw new Error(DB_ERROR);
}

export async function fetchDeviceNames(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('device_names')
    .select('mac_address, custom_name');
  if (error || !data) throw new Error(DB_ERROR);
  return Object.fromEntries(data.map((row) => [row.mac_address, row.custom_name]));
}

export async function saveDeviceName(mac: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('device_names')
    .upsert(
      { mac_address: mac, custom_name: name, updated_at: new Date().toISOString() },
      { onConflict: 'mac_address' },
    );
  if (error) throw new Error(DB_ERROR);
}

export async function fetchBlockedDomains(): Promise<BlockedDomain[]> {
  const { data, error } = await supabase
    .from('blocked_domains')
    .select('id, device_mac, domain, created_at')
    .order('created_at', { ascending: true });
  if (error || !data) throw new Error(DB_ERROR);
  return data.map((row) => ({
    id: row.id,
    deviceMac: row.device_mac,
    domain: row.domain,
    createdAt: row.created_at,
  }));
}

export async function addBlockedDomain(deviceMac: string, domain: string): Promise<BlockedDomain> {
  const { data, error } = await supabase
    .from('blocked_domains')
    .insert({ device_mac: deviceMac, domain })
    .select('id, device_mac, domain, created_at')
    .single();
  if (error || !data) {
    if (error?.code === '23505') throw new Error('هذا الموقع محظور بالفعل على هذا الجهاز.');
    throw new Error(DB_ERROR);
  }
  return { id: data.id, deviceMac: data.device_mac, domain: data.domain, createdAt: data.created_at };
}

export async function removeBlockedDomain(id: string): Promise<void> {
  const { error } = await supabase.from('blocked_domains').delete().eq('id', id);
  if (error) throw new Error(DB_ERROR);
}
