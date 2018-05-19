import {fs, path} from "./$$nodeRequire";
import {$notify} from "./$$DOM";
import fetchIDs from "./fetchIDs";
// import renderImages from "./renderImages";

// drop event handler
export default function window_drop(e) {
  // don't load the file
  e.preventDefault();

  while ($notify.firstChild) {
    $notify.firstChild.remove();
  }
  let folderPath = e.dataTransfer.files[0].path;

  if (fs.statSync(folderPath).isDirectory()) {
    let files = fs.readdirSync(folderPath);

    let onlyFiles = [];
    for (let file of files) {
      if (fs.statSync(path.join(folderPath, file)).isFile()) {
        onlyFiles.push(file);
      }
    }
    let data = [folderPath, onlyFiles];
    fetchIDs(data);
    // renderImages(folderPath, files);
  }
  return false;
}
