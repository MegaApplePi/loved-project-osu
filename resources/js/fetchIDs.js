import {fs, path} from "./$$nodeRequire";
import fetchOsuData from "./fetchOsuData";

let newData;

export default function fetchIDs(data) {
  newData = data;
  let files = data[1];
  let ids = [];
  for (let file of files) {
    if (
      fs.existsSync(path.join(data[0], file)) &&
      fs.statSync(path.join(data[0], file)).isFile() &&
      !Number.isNaN(parseInt(file.split(".").shift(), 10)) &&
      (/jpe?g|png/).test(file.split(".").pop())
    ) {
      ids.push(file.split(".").shift());
    }
  }
  newData.push(ids);
  fetchOsuData(newData);
}
