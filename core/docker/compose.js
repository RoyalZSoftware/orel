import fs from "fs";
import { fileURLToPath } from 'url';
import path from "path";
import ejs from "ejs";
import { sh } from "../utils/sh.js";
import { Config } from "../../init/config.js";
import { dockerImageName } from "./builder.js";
import { FSSecretManager } from "../secrets/fsadapter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a docker-compose.yml from config using EJS template.
 * @param {Object} config - The deployment configuration object.
 * @param {String} outputPath - Where to write the docker-compose.yml
 */
export async function generateComposeFile(
  config,
  outputPath = "docker-compose.yml"
) {
  const templatePath = path.resolve(path.join(__dirname, "/../../templates/docker-compose.yml.ejs"));
  const template = fs.readFileSync(templatePath, "utf-8");
  const secretManager = FSSecretManager(Config.FS_SECRET_STORE_PATH);

  const secrets = await secretManager.listSecrets();

  fs.writeFileSync((outputPath, "..", ".env"), secrets.map((key) => {
    return `SECRET_${key.toUpperCase()}=${secretManager.getSecret(key)}`;
  }).join("\n"), {encoding: "utf8"})
  
  const content = ejs
    .render(
      template,
      {
        volumes: config.volumes,
        secretManager,
        secrets,
        services: config.services.map(c => {
            if (c.dockerfile) {
                delete c.dockerfile;
                return {...c, image: dockerImageName(config.containerRegistry, c.name, config.tag) };
            }

            return c;
        })
      },
      { async: false }
    )
const cleaned = content
  .split('\n')
  .map(line => line.trimEnd())  // trailing whitespace entfernen
  .join('\n')
  .replace(/\n{2,}/g, '\n'); 


  fs.writeFileSync(outputPath, cleaned);
  console.log(`✅ Generated: ${outputPath}`);
  return content;
}

export async function down() {
  return sh(`docker compose -f ${Config.DOCKER_COMPOSE_FILE} down || true`);
}

export async function up(pull) {
  return sh(
    `docker compose -f ${Config.DOCKER_COMPOSE_FILE} ${
      pull ? "--pull" : ""
    } up -d`
  );
}

export async function login(registry, username, password) {
  return sh(`echo ${password} | docker login ${registry} -u ${username} --password-stdin`);
}
