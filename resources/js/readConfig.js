import {fs} from "./$$nodeRequire";
import yaml from "js-yaml";

let config;

export function readConfig(configPath) {
  try {
    config = yaml.safeLoad(fs.readFileSync(configPath, "utf8"));
  } catch (e) {
    throw new Error(e);
  }
}

export function getConfig() {
  return config;
}
