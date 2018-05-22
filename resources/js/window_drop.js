import {fs, path} from "./$$nodeRequire";
import {$notify} from "./$$DOM";
import fetchIDs from "./fetchIDs";
import notify from "./notify";

// [1] listen for a dropped item
export default function window_drop(e) {
  // prevent actually loading the file
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

    // [2] collect the files
    let onlyFiles = [];
    for (let file of files) {
      if (fs.statSync(path.join(folderPath, file)).isFile()) {
        if ((/^\.DS_Store$/i).test(file)) {
          // but don't collect the MacOS .DS_Store thing
          continue;
        }
        onlyFiles.push(file);
      }
    }

    // [3] the files are collected, time to get the IDs
    let data = [folderPath, onlyFiles];
    fetchIDs(data);
  } else {
    // if not, error
    notify(0, "Dropped item is not a folder!");
  }

  return false;// tell the event handler that we took care of it
}
