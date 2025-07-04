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

export function defineApp({ domain, services, containerRegistry }) {
  return {
    domain,
    services,
    containerRegistry,
  };
}

export function useMongo({ name, user, password, database }) {
  return defineService({
    name: name,
    type: "docker",
    image: "mongo:6",
    volumes: ["/data/db"],
    env: {
      USER: user,
      PASSWORD: password,
      DATABASE: database,
    },
    backup: true,
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