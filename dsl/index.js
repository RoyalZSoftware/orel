import { getVolumes } from './common.js';

function compileServices(services, databaseConfig) {
  if (typeof services == "function") {
    return services(databaseConfig);
  }

  return services;
}

/**
 * @typedef {Object} AppDefinition
 * @property {string} domain
 * @property {(dbConfiguration: import('./databases.js').DatabaseConfiguration) => import('./services.js').ServiceDefinition[] | import('./services.js').ServiceDefinition[]} services
 * @property {string} containerRegistry
 * @property {import('./databases.js').DatabaseAdapter} [database]
 * @property {boolean} [autoSSL]
 * @property {string} [tag]
 */

/**
 * @param {AppDefinition} param0 
 * @returns 
 */
export function defineApp({ domain, services, containerRegistry, database, tag, autoSSL }) {
  if (!containerRegistry) throw new Error("Container registry needs to be set.");

  return {
    tag: tag ?? "latest",
    domain,
    services: [
      database?.service,
      ...compileServices(services, database.config),
    ].filter((c) => !!c),
    containerRegistry,
    volumes: getVolumes(),
    autoSSL: autoSSL ?? false,
  };
}

export async function buildConfig(configPath) {
  // Dynamisch importieren (ESM):
  return import(configPath)
    .then((module) => {
      // config.js exportiert das App-Objekt als default
      const appConfig = module.default;

      if (!appConfig) {
        console.error("Konfigurationsdatei exportiert kein default Objekt.");
        process.exit(1);
      }
      return appConfig;
    })
    .catch((err) => {
      console.error("Creating orel.json failed with error", err);
      throw err;
    });
}

export * from './common.js';
export * from './databases.js';
export * from './nginx.js';
export * from './registries.js';
export * from './services.js';