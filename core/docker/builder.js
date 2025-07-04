import { sh } from "../utils/sh.js";

export function dockerImageName(registry, name, version) {
    return `${registry}/${name}:${version}`;
}

export async function buildAndPushImage(registry, name, version, context) {
    const imageName = dockerImageName(registry, name, version);
    await sh(`docker build -t ${imageName} -f ${context.dockerfile}`);

    await sh(`docker push ${imageName}`);
}

export async function pullImage(registry, name, version) {
    const imageName = dockerImageName(registry, name, version);
    await sh(`docker pull ${imageName}`);
}
