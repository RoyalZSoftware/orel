import { SecretManager } from "./manager.js";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { sh } from "../utils/index.js";

const makeSecret = () => {
  return randomBytes(16).toString("hex");
};

function generateSecret(basePath, key) {
  const secret = makeSecret();
  writeFileSync(join(basePath, key), secret, {
    encoding: "utf8",
  });

  return secret;
}

export function getSecret(basePath, key) {
  if (!existsSync(join(basePath, key)))
    return generateSecret(basePath, key);

  return readFileSync(join(basePath, key), { encoding: "utf8" });
}

async function secrets(basePath) {
  return readdirSync(basePath);
}

export const FSSecretManager = (basePath) => {
    mkdirSync(basePath, {recursive: true});
    sh(`chown -R root ${basePath}`);
    sh(`chmod 750 ${basePath}`);
    return new SecretManager({ getSecret: (key) => getSecret(basePath, key), secrets: () => secrets(basePath) })
};
