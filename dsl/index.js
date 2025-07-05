export function secret(key) {
  return `__secret:${key}__`;
}

export function defineService({
  name,
  type,
  dockerfile,
  port,
  env,
  volumes,
  migrate,
  nginx,
  path,
  image
}) {

  return {
    image,
    name,
    type,
    volumes,
    dockerfile,
    env,
    migrate,
    nginx,
    path,
    port,
  };
}

export const ROOT_DOMAIN = "";

let volumes = [];

export function volume(name, path) {
  volumes.push(name);
  return `${name}:${path}`;
}

export function defineApp({ domain, services, containerRegistry, database }) {
  return {
    domain,
    services: [database.service, ...(typeof services == "function" ? services(database.dbConfiguration) : services)].filter(c => !!c),
    containerRegistry,
    volumes,
  };
}

export function mongoDB() {
  const dbConfiguration = {
    host: "db",
    port: 27017,
    database: "main",
    user: "database_user",
    password: secret("db"),
  };
  const service = defineService({
    name: dbConfiguration.host,
    type: "docker",
    image: "mongo:6",
    volumes: [
      volume("db_data", "/data/db")
    ],
    env: {
      USER: dbConfiguration.user,
      PASSWORD: dbConfiguration.password,
      DATABASE: dbConfiguration.database,
    },
    backup: true,
  });

  return {
    dbConfiguration,
    service
  };
}

export function flywayMigrations(db) {
  return defineService({
    name: "flyway",
    type: "docker",
    image: "flyway/flyway",
    env: {
      HOST: db.host,
      USER: db.user,
      PASSWORD: db.password,
      DATABASE: db.database
    }
  });
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

export function findDockerBuildTasks(config) {
  return config.services.filter(c => c.type == "docker" && !!c.dockerfile && c.image == undefined);
}

export function useGitHubRegistry(repository) {
  return `ghcr.io/${repository}`;
}
