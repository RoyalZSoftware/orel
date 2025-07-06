import { sh } from "../core/utils/sh.js";
import { Config } from "./config.js";

const setupUser = async (username) => {
  await sh(`id -u ${username} || sudo useradd -m ${username}`);
};

const ALLOWED_CALLS_FOR_DEPLOY_USER = [
  "/usr/local/bin/orel pull",
];

export async function setupDeployUser() {
  const username = Config.DEPLOYER_USERNAME;
  await setupUser(username);
  return Promise.all(
    ALLOWED_CALLS_FOR_DEPLOY_USER.map((c) =>
      sh(
        `echo '${username} ALL=(ALL) NOPASSWD: ${c}' | sudo tee /etc/sudoers.d/${username}`
      )
    )
  );
}
