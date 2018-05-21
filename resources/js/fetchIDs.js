import {fs, path} from "./$$nodeRequire";
import fetchOsuData from "./fetchOsuData";
import notify from "./notify";
import {readConfig} from "./readConfig";

let newData;

export default function fetchIDs(data) {
  newData = data;
  let files = data[1];
  let ids = [];
  // go though the files
  for (let file of files) {
    if (
      // checking for PNG and JPG
      fs.existsSync(path.join(data[0], file)) && // does it exist?
      fs.statSync(path.join(data[0], file)).isFile() && // is it a file?
      !Number.isNaN(parseInt(file.split(".").shift(), 10)) && // is it an actual id?
      (/jpe?g|png/).test(file.split(".").pop()) // is the extension an image?
    ) {
      // if so, add the id to the list
      ids.push(file.split(".").shift());
    } else if (
      // checking for config
      fs.existsSync(path.join(data[0], file)) && // does it exist?
      fs.statSync(path.join(data[0], file)).isFile() && // is it a file?
      file === "config.yaml" // does the name match?
    ) {
      // read it
      readConfig(path.join(data[0], file));
      // report it
      notify(-1, "config file found");
    }
  }
  newData.push(ids);
  // fetch data from the api
  fetchOsuData(newData);
}
