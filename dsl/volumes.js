let volumes = [];

export function volume(name, path) {
  volumes.push(name);
  return `${name}:${path}`;
}

export function getVolumes() {
    return volumes;
}