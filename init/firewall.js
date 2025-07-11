import { sh } from "../core/index.js";

/**
 * Setzt eine sichere iptables Konfiguration für den Server.
 */
export async function configureFirewall() {
  console.log('🛡️ Setting up iptables firewall rules...');

  const rules = [
    // Alles flushen
    'iptables -F',
    'iptables -X',
    'iptables -t nat -F',
    'iptables -t nat -X',
    'iptables -t mangle -F',
    'iptables -t mangle -X',

    // Standard-Policy: alles verwerfen
    'iptables -P INPUT DROP',
    'iptables -P FORWARD DROP',
    'iptables -P OUTPUT ACCEPT',

    // Eingehende Verbindungen: Erlaube localhost
    'iptables -A INPUT -i lo -j ACCEPT',

    // Eingehende Verbindungen: Erlaube bestehende Verbindungen
    'iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT',

    // SSH (Port 22)
    'iptables -A INPUT -p tcp --dport 22 -j ACCEPT',

    // HTTP (Port 80)
    'iptables -A INPUT -p tcp --dport 80 -j ACCEPT',

    // HTTPS (Port 443)
    'iptables -A INPUT -p tcp --dport 443 -j ACCEPT',

    // Docker bridge traffic (für inter-container-Kommunikation)
    'iptables -A INPUT -i docker0 -j ACCEPT',

    // Logging (optional)
    // 'iptables -A INPUT -j LOG --log-prefix "iptables-dropped: " --log-level 4',
  ];

  for (const rule of rules) {
    try {
      await sh(`sudo ${rule}`);
    } catch (err) {
      console.error(`❌ Failed to execute: ${rule}`, err);
    }
  }

  await sh('sudo netfilter-persistent save');

  console.log('✅ iptables firewall setup complete.');
}
