import path from "path";
import { fileURLToPath } from "url";
import { readFile, writeFile } from "fs/promises";
import ejs from "ejs";
import { sh } from "../utils/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Renders the nginx config based on a template and app config.
 * @param {object} appConfig - App config containing domains, services, rewrites etc.
 * @param {string} outputPath - Path where to write the rendered config
 */
export async function generateNginxConfig(appConfig, outputPath, sslEnabledDomains = []) {
  const templatePath = path.join(__dirname, "../../templates/nginx.conf.ejs");

  // Load template
  const template = await readFile(templatePath, "utf-8");
  
  const services = appConfig.services.filter(c => c.nginx?.subdomain != undefined).map((service) => {
    service.hasSSL = sslEnabledDomains.includes(service.nginx.subdomain == "" ? appConfig.domain : service.nginx.subdomain + "." + appConfig.domain);
    return service;
  })

  // Render template with appConfig
  const rendered = ejs.render(template, { app: {
    ...appConfig,
    services
  }, sslEnabledDomains });
  const cleaned = rendered
    .split("\n")
    .map((line) => line.trimEnd()) // trailing whitespace entfernen
    .join("\n")
    .replace(/\n{3,}/g, "\n");

  // Write to output
  await writeFile(outputPath, cleaned, "utf-8");

  console.log(`✅ Nginx config written to ${outputPath}`);
}

export const Nginx = {
  stop: async () => sh("service nginx stop || true"),
  start: async () => sh("service nginx start"),
  restart: async () => sh("service nginx restart || true"),
};
