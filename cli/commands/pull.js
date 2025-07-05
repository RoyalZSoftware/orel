import { existsSync, readFileSync } from "node:fs";
import { requestCertificates } from "../../core/letsencrypt/index.js";
import { pullImage } from "../../core/docker/builder.js";
import { down, generateComposeFile, up } from "../../core/docker/compose.js";
import { Config } from "../../init/config.js";
import { generateNginxConfig, restart } from "../../core/config/index.js";
import { join, resolve } from "node:path";
import { ensureRootAccess } from "../../init/system.js";
import { FSSecretManager } from "../../core/secrets/fsadapter.js";

const getCertificates = async (config) => {
  const domain = config.domain;
  const subdomains = config.services
    .map((c) => c.nginx?.subdomain)
    .filter((c) => !!c);

  const domains = [domain, ...subdomains.map((c) => c + "." + domain)];

  return requestCertificates({
    domains,
    email: "panov@royalzsoftware.de",
  });
};

export const pull = async (options) => {
    // ensureRootAccess();
  const configFile = join(process.cwd(), options.config);
  if (!existsSync(configFile)) {
    throw new Error("Config file not found. " + configFile);
  }
  const config = JSON.parse(readFileSync(configFile, { encoding: "utf8" }));

  try {
  } catch(e) {
    console.error("Could not obtain certificates");
    console.error(e)
  }

  await Promise.all(
    config.services.filter(c => !!c.dockerfile).map((c) => pullImage(config.containerRegistry, c.name, config.tag))
  );

  await down();

  await FSSecretManager(Config.FS_SECRET_STORE_PATH).resolveSecrets(config);

  await generateComposeFile(config, resolve(Config.DOCKER_COMPOSE_FILE));
  await generateNginxConfig(config, resolve(Config.NGINX_CONFIG_FILE));
  await restart()

  await up();
};
