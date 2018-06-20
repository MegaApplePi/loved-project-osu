import {$dummyArtist1, $dummySong1} from "./$$DOM";
import {getConfig} from "./readConfig";
import {path} from "./$$nodeRequire";
import renderImages from "./renderImages";

const $dummyImage = document.getElementById("dummy-image");
const $dummyImagePosition = document.getElementById("dummy-image-position");
const $dummyCreator = document.getElementById("dummy-creator");

let config;
let newData;
let index;
let background;
let positions;

function window_pointermove(e) {
  let currentPosition = Number.parseInt($dummyImagePosition.style.getPropertyValue("background-position-y"), 10) || 0;
  let newPosition = currentPosition + e.movementY;

  let maxHeight = (400 * background.naturalHeight / 1000) / 2;
  if (newPosition <= 0 && newPosition >= -maxHeight) {
    $dummyImagePosition.style.setProperty("background-position-y", `${newPosition}px`);
  }
}

function $dummyImagePosition_pointerdown() {
  window.addEventListener("pointermove", window_pointermove, true);
}

function window_pointerup() {
  window.removeEventListener("pointermove", window_pointermove, true);
}

function window_keyup(e) {
  let {key} = e;
  if (key === "Enter") {
    let imagePosition = Number.parseInt($dummyImagePosition.style.getPropertyValue("background-position-y"), 10) || 0;
    positions.push(imagePosition);

    index++;
    if (newData[2][index]) {
      loadImage();
    } else {
      newData.push(positions);
      renderImages(newData);
      $dummyImagePosition.style.removeProperty("background-image");
      $dummyImage.setAttribute("data-hidden", "");
      $dummyImagePosition.removeEventListener("pointerdown", $dummyImagePosition_pointerdown);
      window.removeEventListener("pointerup", window_pointerup);
      window.removeEventListener("keyup", window_keyup);
    }
  }
}

function background_load() {
  background.removeEventListener("load", background_load);
  $dummyImagePosition.style.setProperty("background-position-y", "0");
  $dummyImagePosition.style.setProperty("background-image", `url(${background.src})`);

  $dummyImagePosition.addEventListener("pointerdown", $dummyImagePosition_pointerdown, false);
  window.addEventListener("pointerup", window_pointerup, false);
  window.addEventListener("keyup", window_keyup);
}

function loadImage() {
  background = new Image();
  background.src = path.join(newData[0], newData[1][index]);
  background.addEventListener("load", background_load);


  // beatmapset info
  let thisBeatmap = newData[3][newData[2][index]];
  let beatmapsetID = newData[2][index];

  while ($dummyCreator.firstChild) {
    $dummyCreator.firstChild.remove();
  }
  let $dummyCreator1 = document.createElement("span");
  $dummyCreator1.setAttribute("id", "dummy-creator-1");
  $dummyCreator1.textContent = "mapped by ";
  $dummyCreator.insertAdjacentElement("beforeEnd", $dummyCreator1);
  // creator line //
  // list of creator nodes
  let creators = [];

  // is there a creator value for this beatmapset from the config?
  if (config[beatmapsetID] && config[beatmapsetID].creator) {
    // if so, use it
    let config_creator = config[beatmapsetID].creator;
    if (typeof config_creator === "string") {
      let $creator = document.createElement("b");
      $creator.textContent = config_creator;
      $dummyCreator.insertAdjacentElement("beforeEnd", $creator);
      creators.push($creator);
    } else {
      for (let creator of config_creator) {
        if (/^et al.$/i.test(creator)) {
          // remove the comma
          $dummyCreator.lastChild.remove();
          creators.pop();
          // add et al.
          let $creator = document.createElement("span");
          $creator.textContent = " et al.";
          $dummyCreator.insertAdjacentElement("beforeEnd", $creator);
          creators.push($creator);
          break;// stop here; ignore proceeding values after this
        } else {
          let $creator = document.createElement("b");
          $creator.textContent = creator;
          $dummyCreator.insertAdjacentElement("beforeEnd", $creator);
          creators.push($creator);

          // begin comma seperation
          let $comma = document.createElement("span");
          // are we at the the last creator?
          if (config_creator.indexOf(creator) === config_creator.length - 2) {
            // if so, are there only two creators?
            if (config_creator.length === 2) {
              // if so, use "and"
              $comma.textContent = " and ";
            } else {
              // if not, use serial comma then "and"
              $comma.textContent = ", and ";
            }
          } else if (config_creator.indexOf(creator) !== config_creator.length - 1) { // are we at the end?
            // if so, just comma
            $comma.textContent = ", ";
          } // otherwise, nothing
          // add it to the DOM
          $dummyCreator.insertAdjacentElement("beforeEnd", $comma);
          // add it to the creator nodes
          creators.push($comma);
        }
      }
    }
  } else if (thisBeatmap && thisBeatmap.creator) {
    // if not, use the API
    let $creator = document.createElement("b");
    $creator.textContent = thisBeatmap.creator;
    $dummyCreator.insertAdjacentElement("beforeEnd", $creator);
    creators.push($creator);
  } else {
    let $creator = document.createElement("b");
    $creator.textContent = "�";
    $dummyCreator.insertAdjacentElement("beforeEnd", $creator);
    creators.push($creator);
  }

  // artist line //
  if (config[newData[2][index]] && config[newData[2][index]].artist) {
    $dummyArtist1.textContent = config[newData[2][index]].artist;
  } else if (thisBeatmap && thisBeatmap.artist) {
    $dummyArtist1.textContent = thisBeatmap.artist;
  } else {
    $dummyArtist1.textContent = "�";
  }

  // song line //
  if (config[newData[2][index]] && config[newData[2][index]].title) {
    $dummySong1.textContent = config[newData[2][index]].title;
  } else if (thisBeatmap && thisBeatmap.title) {
    $dummySong1.textContent = thisBeatmap.title;
  } else {
    $dummySong1.textContent = "�";
  }
}

export default function positionImages(data) {
  config = getConfig();
  newData = data;
  index = 0;
  positions = [];

  loadImage();
}
