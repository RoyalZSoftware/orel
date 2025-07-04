import { RemoteClient } from "../../core/ssh/remoteClient.js";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { buildAndPushImage } from "../../core/docker/builder.js";
import { findDockerBuildTasks } from "../../dsl/index.js";
import { join } from "node:path";
import { getConfig } from "../utils/getConfig.js";

const sync = async (host, config) => {
  const configStr = JSON.stringify(config);
  
  console.log(join(tmpdir(), "orel.json"));

  writeFileSync(join(tmpdir(), "orel.json"), configStr, { encoding: "utf8" });

  const client = new RemoteClient({
    host,
    username: "root",
    port: 22,
  });

  await client.connect();

  await client.uploadFile(join(tmpdir(), "orel.json"), "/root/orel.json");

  console.log(`Successfully synchronized with ${host}`);

  await client.disconnect();
};

export const push = async (host, options) => {
  const config = await getConfig(options);
  await sync(host, config);

  const dockerTasks = findDockerBuildTasks(config);

  for (const task of dockerTasks) {
    await buildAndPushImage(config.containerRegistry, task.name, "latest", {
      cwd: task.path,
      dockerfile: task.dockerfile,
    });
  }
};
