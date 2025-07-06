import { sh } from "../core/utils/sh.js";
import { configureFirewall } from "./firewall.js";
import { setupSSH } from "./ssh.js";
import { ensureRootAccess } from "./system.js";
import { setupDeployUser } from "./user.js";
import { installApt, installDocker } from "./vendor.js";

async function cleanNginx() {
    await sh('rm /etc/nginx/sites-enabled/default || true');
    await sh('rm /etc/nginx/sites-available/default || true');
}

export async function initServer() {
    ensureRootAccess();
    await setupDeployUser();
    await setupSSH();
    await installDocker();
    await installApt("nginx", "iptables-persistent");
    await configureFirewall();
    await cleanNginx();
}