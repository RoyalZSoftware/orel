/**
 * @typedef {Object} ServiceDefinition
 * @property {string} name
 * @property {string | undefined} [path]
 * @property {string | undefined} [dockerfile]
 * @property {number} port
 * @property {{[key: string]: string} | undefined} [env]
 * @property {string[] | undefined} [volumes]
 * @property {string | undefined} [image]
 * @property {NginxConfiguration | undefined} [nginx]
 */

/**
 * 
 * @param {ServiceDefinition} param0 
 * @returns 
 */
function defineService({
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
export function exposedService(service, isSPA = SPA_ROUTING_DISBALED) {
    return defineService({...service, nginx: {
        subdomain: service.name,
        singlePageApplication: isSPA,
    }});
}