import {$canvas, $dummyArtist1, $dummySong1} from "./$$DOM";
import {fs, path, shell} from "./$$nodeRequire";
import ImageCompressor from "image-compressor.js";
import {getConfig} from "./readConfig";
import notify from "./notify";

const $dummyCreator = document.getElementById("dummy-creator");

let config;

// set up the canvas context
let ctx = $canvas.getContext("2d");
ctx.fillStyle = "#ffffff";
ctx.shadowColor = "#000";
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;
ctx.shadowBlur = 10;

// set up the images
let image;
let overlay = new Image();
overlay.src = "resources/img/overlay.png";// hoping that this loads first before anything else

let index;
let thisData;

// canvas text Y-position constants //
// NOTE: 400 is the bottom; we're offsetting from the bottom
const MAPPED_Y = 400 - 36;
const ARTIST_Y = 400 - 62;
const SONG_Y = 400 - 88;

// filereader to read the blobs generated
let fileReader = new FileReader();
fileReader.onload = (e) => {
  let {result} = e.target;
  result = result.replace(/^data:image\/\w+;base64,/, "");
  let imageBuffer = new Buffer(result, "base64");

  if (!fs.existsSync(path.join(thisData[0], "output"))) {
    fs.mkdirSync(path.join(thisData[0], "output"));
  }

  // save the image
  fs.writeFile(path.join(thisData[0], "output", `${thisData[2][index]}.jpg`), imageBuffer, (error) => {
    if (error) {
      notify(0, `Error while saving: ${error}`);
    }
    // are there more to go?
    if (index < thisData[2].length - 1) {
      // if so, start over with next image
      nextImage(++index);// eslint-disable-line
    } else {
      // if not, we're done!
      notify(-1, "Done!");
      notify(-1, "Opening output folder");
      shell.openItem(path.join(thisData[0], "output"));
    }
  });
};

// more like save to blob for compression, then save via FileReader
function saveImage() {
  $canvas.toBlob((blob) => {
    /* eslint-disable */
    new ImageCompressor(blob, {
      "quality": 0.8,
      success(result) {
        fileReader.readAsDataURL(result);
      }
    });
  }, "image/jpeg");
  /* eslint-enable */
}

function drawText() {
  // beatmapset info
  let thisBeatmap = thisData[3][thisData[2][index]];
  let beatmapsetID = thisData[2][index];

  while ($dummyCreator.firstChild) {
    $dummyCreator.firstChild.remove();
  }
  let $dummyCreator1 = document.createElement("span");
  $dummyCreator1.setAttribute("id", "dummy-creator-1");
  $dummyCreator1.textContent = "mapped by ";
  $dummyCreator.insertAdjacentElement("beforeEnd", $dummyCreator1);
  // creator line //
  ctx.font = "14px 'Exo 2'";
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
    notify(1, `Creator not defined for beatmapset: ${beatmapsetID}`);
    let $creator = document.createElement("b");
    $creator.textContent = "�";
    $dummyCreator.insertAdjacentElement("beforeEnd", $creator);
    creators.push($creator);
  }

  ctx.fillText("mapped by", $dummyCreator1.getBoundingClientRect().left, MAPPED_Y);
  for (let creator of creators) {
    if (creators.indexOf(creator) % 2 === 0) {
      ctx.font = "bold 14px 'Exo 2'";
      ctx.fillText(creator.textContent, creator.getBoundingClientRect().left, MAPPED_Y);
    } else {
      ctx.font = "14px 'Exo 2'";
      ctx.fillText(creator.textContent, creator.getBoundingClientRect().left, MAPPED_Y);
    }
  }

  // artist line //
  if (config[thisData[2][index]] && config[thisData[2][index]].artist) {
    $dummyArtist1.textContent = config[thisData[2][index]].artist;
  } else if (thisBeatmap && thisBeatmap.artist) {
    $dummyArtist1.textContent = thisBeatmap.artist;
  } else {
    notify(1, `Artist not defined for beatmapset: ${beatmapsetID}`);
    $dummyArtist1.textContent = "�";
  }
  ctx.font = "600 italic 20px 'Exo 2'";
  ctx.fillText($dummyArtist1.textContent, $dummyArtist1.getBoundingClientRect().left, ARTIST_Y);

  // song line //
  if (config[thisData[2][index]] && config[thisData[2][index]].title) {
    $dummySong1.textContent = config[thisData[2][index]].title;
  } else if (thisBeatmap && thisBeatmap.title) {
    $dummySong1.textContent = thisBeatmap.title;
  } else {
    notify(1, `Title not defined for beatmapset: ${beatmapsetID}`);
    $dummySong1.textContent = "�";
  }
  ctx.font = "600 italic 30px 'Exo 2'";
  ctx.fillText($dummySong1.textContent, $dummySong1.getBoundingClientRect().left, SONG_Y);

  saveImage();
}

function image_load() {
  // argu 2 = X-position from left; use 0
  // argu 3 = Y-position from top; use 20% of scaled height
  // argu 4 = image element's original width
  // argu 5 = scaled image height
  ctx.drawImage(image, 0, (400 * image.naturalWidth / 1000) * 0.2, image.naturalWidth, (400 * image.naturalWidth / 1000), 0, 0, 1000, 400);
  image.removeEventListener("load", image_load);
  ctx.drawImage(overlay, 0, 0);
  drawText();
}

function nextImage() {
  ctx.clearRect(0, 0, 1000, 400);
  image = new Image();
  image.addEventListener("load", image_load);
  image.src = path.join(thisData[0], thisData[1][index]);
}

export default function renderImages(data) {
  config = getConfig();
  thisData = data;
  index = 0;
  nextImage();
}
