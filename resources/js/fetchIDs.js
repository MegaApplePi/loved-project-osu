import {fs, path} from "./$$nodeRequire";
import fetchOsuData from "./fetchOsuData";
import notify from "./notify";
import {readConfig} from "./readConfig";

let newData;

export default function fetchIDs(data) {
  newData = data;
  // get the files from the data
  let files = data[1];
  let ids = [];

  // [4] go though each file
  for (let file of files) {
    // [5] we only want PNG, JPG, and config.yaml
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
      // checking for config.yaml
      fs.existsSync(path.join(data[0], file)) && // does it exist?
      fs.statSync(path.join(data[0], file)).isFile() && // is it a file?
      file === "config.yaml" // does the name match?
    ) {
      // [6] the config was found, read it
      readConfig(path.join(data[0], file));
      // and report that we found it
      notify(-1, "config file found");
    } else {
      continue;
    }
  }
  // add the ids to the data array
  newData.push(ids);
  // [7] we're done, so let's fetch data from the osu!api
  fetchOsuData(newData);
}
