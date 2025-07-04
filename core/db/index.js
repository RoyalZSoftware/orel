import { join } from "node:path";
import { homedir } from "node:os";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

const DB_PATH = join(homedir(), ".orel", "orel.json");

export function ensureDatabaseExists() {
  if (!existsSync(DB_PATH)) {
    mkdirSync(join(DB_PATH, ".."), { recursive: true });
    writeFileSync(DB_PATH, "{}", { encoding: "utf8" });
  }
}

const readDB = () => {
  return readFileSync(DB_PATH, { encoding: "utf8" });
};

export function setKey(key, value) {
  readDB();
  writeFileSync(DB_PATH, JSON.stringify({ ...readDB(), [key]: value }), {
    encoding: "utf8",
  });
}

export function getKey(key) {
  return readDB()[key];
}
