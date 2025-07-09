import { existsSync, readFileSync } from "node:fs";
import { pullImage, down, Nginx, generateNginxConfig, FSSecretManager } from "../../core/index.js";
import { pullImage } from "../../core/docker/builder.js";
import { down, generateComposeFile, login, up } from "../../core/docker/index.js";
import { Config } from "../../config.js";
import { join, resolve } from "node:path";
import { FSSecretManager } from "../../core/secrets/fsadapter.js";
import { sh } from "../../core/utils/index.js";
import { renewOrCreateCertificates } from "./certs.js";
import { ensureRootAccess } from "../common/index.js";

export const pull = async (options) => {
  ensureRootAccess();
  const configFile = resolve(process.cwd(), options.config);
  if (!existsSync(configFile)) {
    throw new Error("Config file not found. " + configFile);
  }
  const config = JSON.parse(readFileSync(configFile, { encoding: "utf8" }));
  const containerRegistryDomain = config.containerRegistry.split("/")[0];

  if (options.username && options.password) {
    await login(containerRegistryDomain, options.username, options.password);
  }

  try {
  } catch(e) {
    console.error("Could not obtain certificates");
    console.error(e)
  }

  await Promise.all(
    config.services.filter(c => !!c.dockerfile).map((c) => pullImage(config.containerRegistry, c.name, config.tag))
  );

  await down();

  await FSSecretManager(resolve(Config.FS_SECRET_STORE_PATH)).resolveSecrets(config);
  await generateComposeFile(config, resolve(Config.DOCKER_COMPOSE_FILE));

  await Nginx.stop();
  const sslEnabledDomains = await renewOrCreateCertificates(options);
  await generateNginxConfig(config, resolve(Config.NGINX_CONFIG_FILE), sslEnabledDomains);
  await Nginx.start();

  const orelPath = join(resolve(Config.DOCKER_COMPOSE_FILE), "..");
  await sh(`chown -R root ${orelPath}`);
  await sh(`chmod 700 ${orelPath}`);

  await up();
};
