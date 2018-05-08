import {$canvas, $dummyArtist1, $dummyCreator1, $dummyCreator2, $dummySong1} from "./$$DOM";
import {fs, path} from "./$$nodeRequire";
import ImageCompressor from "image-compressor.js";

let ctx = $canvas.getContext("2d");
ctx.fillStyle = "#ffffff";
ctx.shadowColor = "#000";
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;
ctx.shadowBlur = 10;
let image;
let overlay = new Image();
overlay.src = "resources/img/overlay.png";

let index;
let thisData;

// canvas text Y-position constants //
const MAPPED_Y = 400 - 36;
const ARTIST_Y = 400 - 62;
const SONG_Y = 400 - 88;

let fileReader = new FileReader();
fileReader.onload = (e) => {
  let {result} = e.target;
  result = result.replace(/^data:image\/\w+;base64,/, "");
  let imageBuffer = new Buffer(result, "base64");

  if (!fs.existsSync(path.join(thisData[0], "output"))) {
    fs.mkdirSync(path.join(thisData[0], "output"));
  }

  fs.writeFile(path.join(thisData[0], "output", `${thisData[2][index]}.jpg`), imageBuffer, (error) => {
    if (error) {
      throw error;
    }
    if (index < thisData[1].length - 1) {
      nextImage(++index);// eslint-disable-line
    }
  });
};

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
  let thisBeatmap = thisData[3][thisData[2][index]];
  // creator line //
  ctx.font = "14px 'Exo 2'";
  $dummyCreator2.textContent = thisBeatmap.creator;
  ctx.fillText("mapped by", $dummyCreator1.getBoundingClientRect().left, MAPPED_Y);
  ctx.font = "bold 14px 'Exo 2'";
  ctx.fillText(thisBeatmap.creator, $dummyCreator2.getBoundingClientRect().left, MAPPED_Y);

  // artist line //
  $dummyArtist1.textContent = thisBeatmap.artist;
  ctx.font = "600 italic 20px 'Exo 2'";
  ctx.fillText(thisBeatmap.artist, $dummyArtist1.getBoundingClientRect().left, ARTIST_Y);

  // song line //
  $dummySong1.textContent = thisBeatmap.title;
  ctx.font = "600 italic 30px 'Exo 2'";
  ctx.fillText(thisBeatmap.title, $dummySong1.getBoundingClientRect().left, SONG_Y);

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
  thisData = data;
  index = 0;
  nextImage();
}
