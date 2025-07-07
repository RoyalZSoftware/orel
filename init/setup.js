import path, { join } from "path";
import { sh } from "../core/utils/sh.js";
import { configureFirewall } from "./firewall.js";
import { setupSSH } from "./ssh.js";
import { ensureRootAccess } from "./system.js";
import { setupDeployUser } from "./user.js";
import { installApt, installDocker } from "./vendor.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupNginx() {
    await sh('rm /etc/nginx/sites-enabled/default || true');
    await sh('rm /etc/nginx/sites-available/default || true');
    await sh(`cp ${join(__dirname, "..", "templates", "initial-nginx.conf")} /etc/nginx/nginx.conf`);
}

export async function initServer() {
    ensureRootAccess();
    await setupDeployUser();
    await setupSSH();
    await installDocker();

    await sh('echo iptables-persistent iptables-persistent/autosave_v4 boolean true | sudo debconf-set-selections');
    await sh('echo iptables-persistent iptables-persistent/autosave_v6 boolean true | sudo debconf-set-selections');
    await installApt("nginx", "iptables-persistent", "certbot");
    await configureFirewall();
    await sh('service docker restart');

    await setupNginx();
}