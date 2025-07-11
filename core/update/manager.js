// CLI update manager
import pkg from "../../package.json" with {type: "json"};
import { getKey, setKey } from "../db/index.js";

const Version = {
  get: () => getKey("version"),
  set: (newVersion) => setKey("version", newVersion),
};

export const needsUpdate = () => {
  return Version.get().replaceAll(".", "") < pkg.version.replaceAll(".", "");
};
