import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { buildConfig } from '../../dsl/index.js';
import { RemoteClient, buildAndPushImage } from "../../core/index.js";
import { Config } from "../../config.js";

const getConfig = async (options) => {
  const configPath = resolve(process.cwd(), options.config);
  return await buildConfig(configPath);
};

const sync = async (host, config) => {
  const configStr = JSON.stringify(config);
  
  console.log(join(tmpdir(), "orel.json"));

  writeFileSync(join(tmpdir(), "orel.json"), configStr, { encoding: "utf8" });

  const client = new RemoteClient({
    host: host,
    username: Config.DEPLOYER_USERNAME,
    port: 22,
  });

  await client.connect();

  await client.uploadFile(join(tmpdir(), "orel.json"), `/home/${Config.DEPLOYER_USERNAME}/orel.json`);

  console.log(`Successfully synchronized with ${host}`);

  await client.disconnect();
};
function findDockerBuildTasks(config) {
  return config.services.filter(c => !!c.dockerfile && c.image == undefined);
}

export const push = async (host, options) => {
  const config = await getConfig(options);
  console.log(JSON.stringify(config, null, 2));
  await sync(host, config);

  const dockerTasks = findDockerBuildTasks(config);
  console.log(dockerTasks);

  for (const task of dockerTasks) {
    await buildAndPushImage(config.containerRegistry, task.name, config.tag, {
      cwd: join(resolve(process.cwd(), options.config), "..", task.path),
      dockerfile: join(resolve(process.cwd(), options.config), "..", task.dockerfile),
    });
  }
};
