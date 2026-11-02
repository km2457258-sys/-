/*
# Create home network manager tables

Plain-English summary: adds the storage the Home Network Manager needs to remember
Wi-Fi settings, general network settings, custom device names, and per-device blocked websites.

1. New Tables
- `wifi_settings`: single row holding the Wi-Fi network name (SSID) and security mode (WPA2 or WPA3).
- `network_settings`: single row holding gateway IP, subnet mask, DHCP range, and primary/secondary DNS.
- `device_names`: one row per device (keyed by MAC address) holding the custom name the user gave it.
- `blocked_domains`: one row per blocked website per device (device MAC + domain).

2. Security
- RLS enabled on every table.
- The app has no sign-in screen, so every policy targets `anon, authenticated`.
  The data is intentionally shared across the single household dashboard.
- Grants are given only for the verbs the app uses.
- Router admin credentials are NOT stored in this database.

3. Important notes
- Seed rows are inserted for the two singleton tables so the settings pages always have something to load.
- Statements are idempotent (IF NOT EXISTS / ON CONFLICT DO NOTHING / DROP POLICY IF EXISTS).
*/

CREATE TABLE IF NOT EXISTS wifi_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  ssid text NOT NULL DEFAULT 'HomeNetwork',
  security_mode text NOT NULL DEFAULT 'WPA2' CHECK (security_mode IN ('WPA2', 'WPA3')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS network_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  gateway_ip text NOT NULL DEFAULT '192.168.1.1',
  subnet_mask text NOT NULL DEFAULT '255.255.255.0',
  dhcp_start text NOT NULL DEFAULT '192.168.1.100',
  dhcp_end text NOT NULL DEFAULT '192.168.1.200',
  dns_primary text NOT NULL DEFAULT '1.1.1.1',
  dns_secondary text NOT NULL DEFAULT '1.0.0.1',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS device_names (
  mac_address text PRIMARY KEY,
  custom_name text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blocked_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_mac text NOT NULL,
  domain text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_mac, domain)
);

CREATE INDEX IF NOT EXISTS blocked_domains_device_mac_idx ON blocked_domains (device_mac);

INSERT INTO wifi_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO network_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE wifi_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_domains ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON wifi_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON network_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON device_names TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON blocked_domains TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_wifi_settings" ON wifi_settings;
CREATE POLICY "anon_select_wifi_settings" ON wifi_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_wifi_settings" ON wifi_settings;
CREATE POLICY "anon_insert_wifi_settings" ON wifi_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_wifi_settings" ON wifi_settings;
CREATE POLICY "anon_update_wifi_settings" ON wifi_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_network_settings" ON network_settings;
CREATE POLICY "anon_select_network_settings" ON network_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_network_settings" ON network_settings;
CREATE POLICY "anon_insert_network_settings" ON network_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_network_settings" ON network_settings;
CREATE POLICY "anon_update_network_settings" ON network_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_device_names" ON device_names;
CREATE POLICY "anon_select_device_names" ON device_names FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_device_names" ON device_names;
CREATE POLICY "anon_insert_device_names" ON device_names FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_device_names" ON device_names;
CREATE POLICY "anon_update_device_names" ON device_names FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_device_names" ON device_names;
CREATE POLICY "anon_delete_device_names" ON device_names FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_blocked_domains" ON blocked_domains;
CREATE POLICY "anon_select_blocked_domains" ON blocked_domains FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_blocked_domains" ON blocked_domains;
CREATE POLICY "anon_insert_blocked_domains" ON blocked_domains FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_blocked_domains" ON blocked_domains;
CREATE POLICY "anon_delete_blocked_domains" ON blocked_domains FOR DELETE
  TO anon, authenticated USING (true);
