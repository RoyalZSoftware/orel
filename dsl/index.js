import { getVolumes } from './common.js';

export {getVolumes, secret, volume} from './common.js';
export {mongoDB, postgresDB} from './databases.js';
export * from './nginx.js';
export {useGitHubRegistry} from './registries.js';
export {SPA_ROUTING_DISBALED, SPA_ROUTING_ENABLED, exposedPort, exposedService, internalService, useZitadel} from './services.js';

function compileServices(services, databaseConfig) {
  if (typeof services == "function") {
    return services(databaseConfig);
  }

  return services;
}

/**
 * @typedef {Object} LetsEncryptConfiguration
 * @property {string} email
 */

export function autoSSL(email) {
  return {email};
}

/**
 * @typedef {Object} AppDefinition
 * @property {string} domain
 * @property {(dbConfiguration: import('./databases.js').DatabaseConfiguration) => import('./services.js').ServiceDefinition[] | import('./services.js').ServiceDefinition[]} services
 * @property {string} containerRegistry
 * @property {import('./databases.js').DatabaseAdapter} [database]
 * @property {LetsEncryptConfiguration} [letsencryptConfig]
 * @property {string} [tag]
 */

/**
 * @param {AppDefinition} param0 
 * @returns 
 */
export function defineApp({ domain, services, containerRegistry, database, tag, letsencryptConfig }) {
  if (!containerRegistry) throw new Error("Container registry needs to be set.");
  
  const compiledServices = compileServices(services, database.config).reduce((prev, curr) => {
    if (Array.isArray(curr)) {
      curr.forEach(i => prev.push(i));
      return prev;
    }

    prev.push(curr);
    return prev;
  }, []);

  return {
    tag: tag ?? "latest",
    domain,
    services: [
      database?.service,
      ...compiledServices,
    ].filter((c) => !!c),
    containerRegistry,
    volumes: getVolumes(),
    letsencryptConfig,
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

      const ports = appConfig.services.map(c => c.port?.host).filter(c => !!c);
      const duplicates = ports.filter((c, i) => ports.indexOf(c) !== i);

      if (duplicates.length > 0) throw new Error("Duplicated port mapping detected. Duplicated ports: " + duplicates);
      
      return appConfig;
    })
    .catch((err) => {
      console.error("Creating orel.json failed with error", err);
      throw err;
    });
}