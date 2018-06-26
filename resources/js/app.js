/* globals nodeRequire */
import Loved from "./Loved";

const remote = nodeRequire("electron").remote;

/* keypress events */
const keyMap = {};
window.addEventListener("keydown", (e) => {
  let {key} = e;
  keyMap[key] = true;
  return false;
});
window.addEventListener("keyup", (e) => {
  if (keyMap.F12) {
    remote.getCurrentWindow().toggleDevTools();
  } else if (keyMap.F5) {
    remote.getCurrentWindow().reload();
  }
  let {key} = e;
  delete keyMap[key];
  return false;
});


/* drop events */
window.addEventListener("dragover", (e) => {
  e.preventDefault();
  return false;
});

window.addEventListener("drop", (e) => {
  e.preventDefault();

  let loved = new Loved();
  loved.processDropFolder(e.dataTransfer.files[0].path);
  return false;
});
