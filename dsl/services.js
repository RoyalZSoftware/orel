/**
 * @typedef {Object} ExposedPort
 * @property {number} host
 * @property {number} container
 */

import { secret } from "./secret.js";
import { postgresDB } from "./databases.js";

/**
 * @typedef {Object} NginxConfiguration
 * @property {string | null} subdomain
 * @property {boolean} singlePageApplication
 */

/**
 * @typedef {Object} ServiceDefinitionBase
 * @property {string} name
 * @property {string} [dockerfile]
 * @property {string} [path]
 * @property {string} [image]
 * @property {ExposedPort | undefined} [port]
 * @property {{[key: string]: string} | undefined} [env]
 * @property {string[] | undefined} [volumes]
 * @property {NginxConfiguration | undefined} [nginx]
 * @property {string} command
 * 
 * @typedef {ServiceDefinitionBase} ServiceDefinition
 */

/**
 * 
 * @param {ServiceDefinition} param0 
 * @returns 
 */
function defineService({
  command,
  name,
  dockerfile,
  port,
  env,
  volumes,
  nginx,
  path,
  image,
}) {
  if (dockerfile && image)
    throw new Error("Can't have dockerfile and image at the same time.");
  if (port < 1023) throw new Error("Please do not use ports smaller than 1023 to not interfere with existing ones.");
  return {
    command,
    image,
    name,
    volumes,
    dockerfile,
    env,
    nginx,
    path,
    port,
  };
}

/**
 * @param {Omit<ServiceDefinition, "nginx" | "port">} service
 */
export function internalService(service) {
    return defineService(service);
}

export const SPA_ROUTING_ENABLED = true;
export const SPA_ROUTING_DISBALED = false;

/**
 * @param {Omit<ServiceDefinition, "nginx">} service
 */
export function exposedService(service, isSPA = SPA_ROUTING_DISBALED, isRootDomain = false) {
    return defineService({...service, nginx: {
        subdomain: isRootDomain ? "" : service.name,
        singlePageApplication: isSPA,
    }});
}

let startPort = 11000;

export function nextHostPort() {
    return startPort++;
}

export function exposedPort(containerPort, hostPort = undefined) {
  return {
    host: hostPort ?? nextHostPort(),
    container: containerPort,
  };
}

/**
 * @param {string | undefined} initialRootPassword if no initialRootPassword is given, then the default one will be used. Credentials username: `root@zitadel.localhost`. password: `RootPassword1!`
 * @returns 
 */
export function useZitadel(domain, initialRootPassword = undefined) {
  const postgres = postgresDB("zitadel_db", secret('zitadel_db_password'));
  return [
    exposedService({
      name: "auth",
      port: exposedPort(8080),
      image: "ghcr.io/zitadel/zitadel:latest",
      command: `start-from-init --masterkeyFromEnv`,
      env: {
        ZITADEL_DATABASE_POSTGRES_HOST: postgres.config.host,
        ZITADEL_DATABASE_POSTGRES_PORT: postgres.config.port,
        ZITADEL_DATABASE_POSTGRES_DATABASE: postgres.config.database,
        ZITADEL_DATABASE_POSTGRES_USER_USERNAME: postgres.config.user,
        ZITADEL_DATABASE_POSTGRES_USER_PASSWORD: postgres.config.password,
        ZITADEL_DATABASE_POSTGRES_USER_SSL_MODE: 'disable',
        ZITADEL_DATABASE_POSTGRES_ADMIN_USERNAME: postgres.config.user,
        ZITADEL_DATABASE_POSTGRES_ADMIN_PASSWORD: postgres.config.password,
        ZITADEL_DATABASE_POSTGRES_ADMIN_SSL_MODE: 'disable',
        ZITADEL_EXTERNALSECURE: true,
        ZITADEL_EXTERNALPORT: 443,
        ZITADEL_TLS_ENABLED: false,
        ZITADEL_EXTERNALDOMAIN: "auth." + domain,
        ZITADEL_FIRSTINSTANCE_ORG_HUMAN_USERNAME: "root",
        ZITADEL_FIRSTINSTANCE_ORG_HUMAN_PASSWORD: initialRootPassword ?? "RootPassword1!", // will need to be changed when signing in
        ZITADEL_MASTERKEY: secret('zitadel_master_key')
      }
    }),
    postgres.service,
  ];
}

export function useZentry() {
  return exposedService({
    name: "zentry",
    image: "royalzsoftware/zentry:latest",
    port: exposedPort(8080),
  });
}