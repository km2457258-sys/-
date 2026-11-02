export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#]/)[0];
}

export function isValidDomain(domain: string): boolean {
  return /^(?=.{1,253}$)(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,63}$/.test(domain);
}

export function isValidIPv4(ip: string): boolean {
  const parts = ip.trim().split('.');
  return (
    parts.length === 4 &&
    parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255)
  );
}

export function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, part) => ((acc << 8) | Number(part)) >>> 0, 0);
}

export function isValidSubnetMask(mask: string): boolean {
  if (!isValidIPv4(mask)) return false;
  const inverted = (~ipToNumber(mask)) >>> 0;
  return (inverted & (inverted + 1)) === 0;
}

export function isInSubnet(ip: string, gateway: string, mask: string): boolean {
  const maskValue = ipToNumber(mask);
  return (ipToNumber(ip) & maskValue) === (ipToNumber(gateway) & maskValue);
}

export function isValidSsid(ssid: string): boolean {
  const length = ssid.trim().length;
  return length >= 1 && length <= 32;
}

export function isValidWifiPassword(password: string): boolean {
  return password.length >= 8 && password.length <= 63;
}
