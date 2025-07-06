import { existsSync, readFileSync } from "node:fs";
import { requestCertificates } from "../../core/letsencrypt/index.js";
import { pullImage } from "../../core/docker/builder.js";
import { down, generateComposeFile, login, up } from "../../core/docker/compose.js";
import { Config } from "../../init/config.js";
import { generateNginxConfig, restart } from "../../core/config/index.js";
import { join, resolve } from "node:path";
import { FSSecretManager } from "../../core/secrets/fsadapter.js";
import { ensureRootAccess } from "../../init/system.js";

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

  console.log("Running down");
  console.log(await down());

  await FSSecretManager(Config.FS_SECRET_STORE_PATH).resolveSecrets(config);

  await generateComposeFile(config, resolve(Config.DOCKER_COMPOSE_FILE));
  await generateNginxConfig(config, resolve(Config.NGINX_CONFIG_FILE));
  await restart()

  console.log("Running up");
  console.log(await up());
};
