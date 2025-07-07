import { existsSync, readFileSync } from "fs";
import { requestCertificates } from "../../core/letsencrypt/index.js";
import { resolve } from 'path';
import { ensureRootAccess } from "../../init/system.js";

/**
 * 
 * @param {import("../../dsl/index.js").AppDefinition} config 
 * @returns 
 */
const getCertificates = async (config) => {
  const domain = config.domain;
  const subdomains = config.services
    .map((c) => c.nginx?.subdomain)
    .filter((c) => !!c);

  const domains = [domain, ...subdomains.map((c) => c + "." + domain)];

  if (!config.letsencryptConfig?.email) {
    throw new Error("LetsEncrypt is not set up in the orel.json config.");
  }

  return requestCertificates({
    domains,
    email: config.letsencryptConfig.email,
  });
};

export async function renewOrCreateCertificates(options) {
  ensureRootAccess();
  const configFile = resolve(process.cwd(), options.config);
  if (!existsSync(configFile)) {
    throw new Error("Config file not found. " + configFile);
  }
  const config = JSON.parse(readFileSync(configFile, { encoding: "utf8" }));

  await getCertificates(config);

}