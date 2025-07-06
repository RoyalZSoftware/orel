export function secret(key) {
  return `__secret:${key}__`;
}

let volumes = [];

export function volume(name, path) {
  volumes.push(name);
  return `${name}:${path}`;
}

export function getVolumes() {
    return volumes;
}