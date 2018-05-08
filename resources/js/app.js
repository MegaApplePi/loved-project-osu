import {window_keydown, window_keyup} from "./window_key";
import window_dragover from "./window_dragover";
import window_drop from "./window_drop";

window.addEventListener("drop", window_drop);
window.addEventListener("dragover", window_dragover);
window.addEventListener("keydown", window_keydown);
window.addEventListener("keyup", window_keyup);

