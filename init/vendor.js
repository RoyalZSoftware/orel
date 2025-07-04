import { sh } from "../core/utils/sh.js";

export async function installDocker() {
  await sh(`which docker || curl -fsSL https://get.docker.com | sudo sh`);
  await sh(`sudo usermod -aG docker $USER`);
  await sh(`which docker-compose || sudo apt-get update && sudo apt-get install -y docker-compose`);
}

export async function installApt(...packages) {
    await sh('sudo apt-get update');
    await sh(`sudo apt-get install -y ${packages.join(' ')}`);
}
