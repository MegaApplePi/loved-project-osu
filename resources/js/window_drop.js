import {fs, path} from "./$$nodeRequire";
import {$notify} from "./$$DOM";
import fetchIDs from "./fetchIDs";
import notify from "./notify";

// drop event handler
export default function window_drop(e) {
  // don't load the file
  e.preventDefault();

  // clean up the notifications
  while ($notify.firstChild) {
    $notify.firstChild.remove();
  }
  // get dropped folder
  let folderPath = e.dataTransfer.files[0].path;

  // is the dropped folder really a folder?
  if (fs.statSync(folderPath).isDirectory()) {
    // if so, read the contents
    let files = fs.readdirSync(folderPath);

    // collect the files
    let onlyFiles = [];
    for (let file of files) {
      if (fs.statSync(path.join(folderPath, file)).isFile()) {
        if (!(/^\.DS_Store$/i).test(file)) {
          onlyFiles.push(file);
        }
      }
    }
    let data = [folderPath, onlyFiles];
    // let's get beatmap ids from the images
    fetchIDs(data);
  } else {
    // if not, error
    notify(0, "Dropped folder is not a folder!");
  }
  return false;
}
