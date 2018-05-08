// dragover event
export default function window_dragover(e) {
  // don't do anything if the user is dragging a file over the window
  e.preventDefault();
  return false;
}
