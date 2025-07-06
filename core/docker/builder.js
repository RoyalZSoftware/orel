import { Config } from "../../init/config.js";
import { sh } from "../utils/sh.js";

export function dockerImageName(registry, name, version) {
    return `${registry}/${name}:${version}`;
}

export async function buildAndPushImage(registry, name, version, context) {
    const imageName = dockerImageName(registry, name, version);
    console.log(await sh(`docker build -t ${imageName} -f ${context.dockerfile} ${context.cwd}`));

    console.log(await sh(`docker push ${imageName}`));
}

/**
 * Uses the docker configuration from the deployer user to pull the image.
 * @param {*} registry 
 * @param {*} name 
 * @param {*} version 
 */
export async function pullImage(registry, name, version) {
    const imageName = dockerImageName(registry, name, version);
    const dockerConfigPath = `/home/${Config.DEPLOYER_USERNAME}/.docker`;
    await sh(`DOCKER_CONFIG=${dockerConfigPath} docker pull ${imageName}`);
}
