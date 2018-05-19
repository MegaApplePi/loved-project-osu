import {fs} from "./$$nodeRequire";
import notify from "./notify";
import yaml from "js-yaml";

let config;

export function readConfig(configPath) {
  try {
    config = yaml.safeLoad(fs.readFileSync(configPath, "utf8"));
  } catch (e) {
    notify(0, `Failed to read config: ${e}`);
  }
}

export function getConfig() {
  return config;
}
