import path from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile } from 'fs/promises';
import ejs from 'ejs';
import { sh } from '../utils/sh.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Renders the nginx config based on a template and app config.
 * @param {object} appConfig - App config containing domains, services, rewrites etc.
 * @param {string} outputPath - Path where to write the rendered config
 */
export async function generateNginxConfig(appConfig, outputPath) {
  const templatePath = path.join(__dirname, '../../templates/nginx.conf.ejs');

  // Load template
  const template = await readFile(templatePath, 'utf-8');

  // Render template with appConfig
  const rendered = ejs.render(template, { app: appConfig });
const cleaned = rendered
  .split('\n')
  .map(line => line.trimEnd())  // trailing whitespace entfernen
  .join('\n')
  .replace(/\n{3,}/g, '\n'); 

  // Write to output
  await writeFile(outputPath, cleaned, 'utf-8');

  console.log(`✅ Nginx config written to ${outputPath}`);
}

export async function stop() {
  return sh('service nginx stop || true');
}

export async function start() {
  return sh('service nginx start');
}

export async function restart() {
    return sh('service nginx restart || true');
}