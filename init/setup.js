import { configureFirewall } from "./firewall.js";
import { setupSSH } from "./ssh.js";
import { ensureRootAccess } from "./system.js";
import { setupDeployUser } from "./user.js";
import { installApt, installDocker } from "./vendor.js";

export async function initServer() {
    ensureRootAccess();
    await setupDeployUser();
    await setupSSH();
    await installDocker();
    await installApt("nginx", "iptables-persistent");
    await configureFirewall();
}