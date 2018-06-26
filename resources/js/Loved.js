import ImageCompressor from "image-compressor.js";
import yaml from "js-yaml";

/* globals nodeRequire */
const FS = nodeRequire("fs");
const PATH = nodeRequire("path");
const SHELL = nodeRequire("electron").shell;

export default class Loved {
  constructor() {
    // define the DOM elements
    this.$notify = document.getElementById("notify");
    this.$canvas = document.getElementById("canvas");
    this.$dropzone = document.getElementById("dropzone");
    this.$dummy = document.getElementById("dummy");
    this.$dummyCreator = document.getElementById("dummy-creator");
    this.$dummyArtist1 = document.getElementById("dummy-artist-1");
    this.$dummySong1 = document.getElementById("dummy-song-1");
    this.$dummyImage = document.getElementById("dummy-image");
    this.$dummyImagePosition = document.getElementById("dummy-image-position");

    this.folderPath = null;
    this.config = {};
    this.notifies = [];
    this.files = null;
    this.beatmapMeta = {};
    this.positionImageIndex = 0;
    this.renderImageIndex = 0;

    this.ctx = this.$canvas.getContext("2d");
    this.ctx.fillStyle = "#ffffff";

    this.$overlay = new Image();
    this.$overlay.src = "resources/img/overlay.png";

    this.MAPPED_Y = 400 - 36;
    this.ARTIST_Y = 400 - 62;
    this.SONG_Y = 400 - 88;
  }

  getBeatmapIds() {
    return Object.keys(this.beatmapMeta);
  }

  // report messages to the user
  notify(message, level) {
    while (this.$notify.children.length >= 8) {
      this.$notify.lastChild.remove();
    }

    let $container = document.createElement("div");
    let $time = document.createElement("time");

    let time = (new Date()).toLocaleTimeString();
    $time.textContent = `[${time}] `;

    $container.insertAdjacentElement("beforeEnd", $time);

    let $symbol = document.createElement("b");
    let $message = document.createElement("span");
    if (level === 3) {
      $symbol.textContent = "Error: ";
    } else if (level === 2) {
      $symbol.textContent = "Warn: ";
    } else if (level === 1) {
      $symbol.textContent = "Info: ";
    } else if (level === 0) {
      $symbol.textContent = "Verbose: ";
    } else {
      $symbol.textContent = "Unknown: ";
    }

    $container.insertAdjacentElement("beforeEnd", $symbol);
    $message.textContent = message;
    $container.insertAdjacentElement("beforeEnd", $message);

    this.$notify.insertAdjacentElement("afterBegin", $container);
    this.notifies.push($container);
  }

  // gather files
  processDropFolder(folderPath) {
    this.notify("Processing folder", 0);
    this.$dropzone.setAttribute("data-hidden", "");
    this.folderPath = folderPath;

    if (FS.existsSync(this.folderPath)) {
      if (FS.statSync(this.folderPath).isDirectory()) {
        this.files = FS.readdirSync(folderPath);

        for (let file of this.files) {
          let filePath = PATH.join(this.folderPath, file);

          if (FS.existsSync(filePath) && FS.statSync(filePath).isFile()) {
            if ((/^\.DS_Store$/i).test(file)) {
              this.files.splice(this.files.indexOf(file), 1);
              this.notify("Ignoring .DS_Store", 0);
            } else if ((/^config\.yaml$/i).test(file)) {
              this.files.splice(this.files.indexOf(file), 1);
            }
          }
        }

        this.readConfig();
      } else {
        this.notify("Not a folder (stopping)", 3);
        this.$dropzone.removeAttribute("data-hidden");
      }
    } else {
      this.notify("Folder Not Found (stopping)", 3);
      this.$dropzone.removeAttribute("data-hidden");
    }
  }

  // read the config file
  readConfig() {
    this.notify("Reading config", 0);
    let configPath = PATH.join(this.folderPath, "config.yaml");
    if (FS.existsSync(configPath)) {
      if (FS.statSync(configPath).isFile()) {
        try {
          this.config = yaml.safeLoad(FS.readFileSync(configPath), "utf8");
        } catch (e) {
          this.notify(`${e} (stopping)`, 3);
          this.$dropzone.removeAttribute("data-hidden");
        }
        if (this.config) {
          this.fetchBeatmapIds();
        }
      } else {
        this.notify("Config not a file (stopping)", 3);
        this.$dropzone.removeAttribute("data-hidden");
      }
    } else {
      this.notify("No config (stopping)", 3);
      this.$dropzone.removeAttribute("data-hidden");
    }
  }

  // gather beatmap ids
  fetchBeatmapIds() {
    this.notify("Gathering beatmap ids", 0);
    for (let file of this.files) {
      let fileNameParts = file.split(".");

      if (fileNameParts.length === 2 && (/^\d+$/).test(fileNameParts[0])) {
        if (/jpe?g|png|webp|bmp|tiff?|gif/i.test(fileNameParts[1])) {
          this.beatmapMeta[fileNameParts[0]] = {};
        } else {
          this.notify(`Skipping file: "${file}" (invalid format)`, 2);
        }
      } else {
        this.notify(`Skipping file: "${file}" (invalid name)`, 2);
      }
    }
    this.fetchApiData();
  }

  // start go fetch
  fetchApiData() {
    if (this.config.key) {
      this.notify("Fetching beatmap metadata", 0);
      this.goFetch(0);
    } else {
      this.notify("Skipped fetching beatmap metadata (No API Key)", 2);
      this.noFetch();
    }
  }

  // fetch request
  goFetch(index) {
    fetch(`https://osu.ppy.sh/api/get_beatmaps?k=${this.config.key}&limit=1&s=${encodeURIComponent(this.getBeatmapIds()[index])}`, {
      "cache": "no-cache",
      "credentials": "same-origin",
      "method": "GET"
    })
      .then((response) => response.json())
      .then((response) => {
        this.beatmapMeta[this.getBeatmapIds()[index]] = {
          "artist": response[0].artist,
          "creator": response[0].creator,
          "title": response[0].title
        };
        if (index < this.getBeatmapIds().length - 1) {
          this.goFetch(index + 1);
        } else {
          return true;
        }
      })
      .catch((response) => {
        this.notify(`Fetch error: ${response}`, 2);
        this.notify(`Possible invalid API key`, 2);
        this.notify(`Skipping API fetch`);
        return true;
      })
      .then((response) => {
        if (response) {
          this.noFetch();
        }
      });
  }

  // done fetching
  noFetch() {
    this.notify("Click and drag to position the images then press [Enter]", 1);
    this.positionImages(0);
  }

  // position images
  positionImages() {
    this.$dummy.removeAttribute("data-hidden");

    const SELF = this;

    // beatmapset info
    let thisBeatmapId = this.getBeatmapIds()[this.positionImageIndex];
    let thisBeatmapMeta = this.beatmapMeta[thisBeatmapId];

    function window_pointermove(e) {
      let currentPosition = Number.parseInt(SELF.$dummyImagePosition.style.getPropertyValue("background-position-y"), 10) || 0;
      let newPosition = currentPosition + e.movementY;

      let maxHeight = (400 * SELF.$background.naturalHeight / 1000) / 2;
      if (newPosition <= 0 && newPosition >= -maxHeight) {
        SELF.$dummyImagePosition.style.setProperty("background-position-y", `${newPosition}px`);
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
        let imagePosition = Number.parseInt(SELF.$dummyImagePosition.style.getPropertyValue("background-position-y"), 10) || 0;
        thisBeatmapMeta.offset = imagePosition;

        SELF.$dummyImagePosition.removeEventListener("pointerdown", $dummyImagePosition_pointerdown);
        window.removeEventListener("pointerup", window_pointerup);
        window.removeEventListener("keyup", window_keyup);

        SELF.positionImageIndex = SELF.positionImageIndex + 1;
        if (SELF.getBeatmapIds()[SELF.positionImageIndex]) {
          SELF.positionImages();
        } else {
          delete SELF.$background;
          SELF.$dummy.setAttribute("data-hidden", "");
          SELF.$dummyImagePosition.style.removeProperty("background-image");
          SELF.$dummyImage.setAttribute("data-hidden", "");
          SELF.renderNextImage();
        }
      }
    }

    function $background_load() {
      SELF.$background.removeEventListener("load", $background_load);
      SELF.$dummyImagePosition.style.setProperty("background-position-y", "0");
      SELF.$dummyImagePosition.style.setProperty("background-image", `url(${SELF.$background.src})`);

      SELF.$dummyImagePosition.addEventListener("pointerdown", $dummyImagePosition_pointerdown, false);
      window.addEventListener("pointerup", window_pointerup, false);
      window.addEventListener("keyup", window_keyup);
    }

    // internal variable to load the image first
    this.$background = new Image();
    this.$background.src = PATH.join(this.folderPath, this.files[this.positionImageIndex]);
    this.$background.addEventListener("load", $background_load);

    while (this.$dummyCreator.firstChild) {
      this.$dummyCreator.firstChild.remove();
    }

    // creator line //
    let $dummyCreator1 = document.createElement("span");
    $dummyCreator1.setAttribute("id", "dummy-creator-1");
    $dummyCreator1.textContent = "mapped by ";
    this.$dummyCreator.insertAdjacentElement("beforeEnd", $dummyCreator1);

    let creators = [];

    if (this.config[thisBeatmapId] && this.config[thisBeatmapId].creator) {
      let config_creator = this.config[thisBeatmapId].creator;
      if (typeof config_creator === "string") {
        let $creator = document.createElement("b");
        $creator.textContent = config_creator;
        this.$dummyCreator.insertAdjacentElement("beforeEnd", $creator);
        creators.push($creator);
      } else {
        for (let creator of config_creator) {
          if (/^et al.$/i.test(creator)) {
            this.$dummyCreator.lastChild.remove();
            creators.pop();
            let $creator = document.createElement("span");
            $creator.textContent = " et al.";
            this.$dummyCreator.insertAdjacentElement("beforeEnd", $creator);
            creators.push($creator);
            break;
          } else {
            let $creator = document.createElement("b");
            $creator.textContent = creator;
            this.$dummyCreator.insertAdjacentElement("beforeEnd", $creator);
            creators.push($creator);

            let $comma = document.createElement("span");
            if (config_creator.indexOf(creator) === config_creator.length - 2) {
              $comma.textContent = " and ";
              /* if (config_creator.length === 2) {
                $comma.textContent = " and ";
              } else {
                $comma.textContent = ", and ";
              } */
            } else if (config_creator.indexOf(creator) !== config_creator.length - 1) {
              $comma.textContent = ", ";
            }
            this.$dummyCreator.insertAdjacentElement("beforeEnd", $comma);
            creators.push($comma);
          }
        }
      }
    } else if (thisBeatmapMeta && thisBeatmapMeta.creator) {
      let $creator = document.createElement("b");
      $creator.textContent = thisBeatmapMeta.creator;
      this.$dummyCreator.insertAdjacentElement("beforeEnd", $creator);
      creators.push($creator);
    } else {
      let $creator = document.createElement("b");
      $creator.textContent = "�";
      this.$dummyCreator.insertAdjacentElement("beforeEnd", $creator);
      creators.push($creator);
    }

    // artist line //
    if (this.config[thisBeatmapId] && this.config[thisBeatmapId].artist) {
      this.$dummyArtist1.textContent = this.config[thisBeatmapId].artist;
    } else if (thisBeatmapMeta && thisBeatmapMeta.artist) {
      this.$dummyArtist1.textContent = thisBeatmapMeta.artist;
    } else {
      this.$dummyArtist1.textContent = "�";
    }

    // song line //
    if (this.config[thisBeatmapId] && this.config[thisBeatmapId].title) {
      this.$dummySong1.textContent = this.config[thisBeatmapId].title;
    } else if (thisBeatmapMeta && thisBeatmapMeta.title) {
      this.$dummySong1.textContent = thisBeatmapMeta.title;
    } else {
      this.$dummySong1.textContent = "�";
    }
  }

  renderNextImage() {
    const SELF = this;

    function image_load() {
      // argu 2 = X-position from left; use 0
      // argu 3 = Y-position from top; use 20% of scaled height
      // argu 4 = image element's original width
      // argu 5 = scaled image height
      SELF.ctx.drawImage(SELF.$image, 0, SELF.beatmapMeta[SELF.getBeatmapIds()[SELF.renderImageIndex]].offset * -1, SELF.$image.naturalWidth, (400 * SELF.$image.naturalWidth / 1000), 0, 0, 1000, 400);
      SELF.$image.removeEventListener("load", image_load);
      SELF.ctx.drawImage(SELF.$overlay, 0, 0);
      SELF.drawText();
    }

    this.ctx.clearRect(0, 0, 1000, 400);
    this.$image = new Image();
    this.$image.addEventListener("load", image_load);
    this.$image.src = PATH.join(this.folderPath, this.files[this.renderImageIndex]);
  }

  drawText() {
    this.ctx.shadowColor = "rgba(0,0,0,0.5)";
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 2;
    this.ctx.shadowBlur = 4;

    let thisBeatmapId = this.getBeatmapIds()[this.renderImageIndex];
    let thisBeatmapMeta = this.beatmapMeta[thisBeatmapId];

    while (this.$dummyCreator.firstChild) {
      this.$dummyCreator.firstChild.remove();
    }

    let $dummyCreator1 = document.createElement("span");
    $dummyCreator1.setAttribute("id", "dummy-creator-1");
    $dummyCreator1.textContent = "mapped by ";
    this.$dummyCreator.insertAdjacentElement("beforeEnd", $dummyCreator1);

    // creator line //
    this.ctx.font = "14px 'Exo 2'";
    let creators = [];

    // is there a creator value for this beatmapset from the config?
    if (this.config[thisBeatmapId] && this.config[thisBeatmapId].creator) {
      // if so, use it
      let config_creator = this.config[thisBeatmapId].creator;
      if (typeof config_creator === "string") {
        let $creator = document.createElement("b");
        $creator.textContent = config_creator;
        this.$dummyCreator.insertAdjacentElement("beforeEnd", $creator);
        creators.push($creator);
      } else {
        for (let creator of config_creator) {
          if (/^et al.$/i.test(creator)) {
            // remove the comma
            this.$dummyCreator.lastChild.remove();
            creators.pop();
            // add et al.
            let $creator = document.createElement("span");
            $creator.textContent = " et al.";
            this.$dummyCreator.insertAdjacentElement("beforeEnd", $creator);
            creators.push($creator);
            break;// stop here; ignore proceeding values after this
          } else {
            let $creator = document.createElement("b");
            $creator.textContent = creator;
            this.$dummyCreator.insertAdjacentElement("beforeEnd", $creator);
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
            this.$dummyCreator.insertAdjacentElement("beforeEnd", $comma);
            // add it to the creator nodes
            creators.push($comma);
          }
        }
      }
    } else if (thisBeatmapMeta && thisBeatmapMeta.creator) {
      // if not, use the API
      let $creator = document.createElement("b");
      $creator.textContent = thisBeatmapMeta.creator;
      this.$dummyCreator.insertAdjacentElement("beforeEnd", $creator);
      creators.push($creator);
    } else {
      this.notify(`Creator not defined for beatmapset: ${thisBeatmapId}`, 2);
      let $creator = document.createElement("b");
      $creator.textContent = "�";
      this.$dummyCreator.insertAdjacentElement("beforeEnd", $creator);
      creators.push($creator);
    }

    this.ctx.fillText("mapped by", $dummyCreator1.getBoundingClientRect().left, this.MAPPED_Y);
    for (let creator of creators) {
      if (creators.indexOf(creator) % 2 === 0) {
        this.ctx.font = "bold 14px 'Exo 2'";
        this.ctx.fillText(creator.textContent, creator.getBoundingClientRect().left, this.MAPPED_Y);
      } else {
        this.ctx.font = "14px 'Exo 2'";
        this.ctx.fillText(creator.textContent, creator.getBoundingClientRect().left, this.MAPPED_Y);
      }
    }

    // artist line //
    if (this.config[thisBeatmapId] && this.config[thisBeatmapId].artist) {
      this.$dummyArtist1.textContent = this.config[thisBeatmapId].artist;
    } else if (thisBeatmapMeta && thisBeatmapMeta.artist) {
      this.$dummyArtist1.textContent = thisBeatmapMeta.artist;
    } else {
      this.notify(`Artist not defined for beatmapset: ${thisBeatmapId}`, 2);
      this.$dummyArtist1.textContent = "�";
    }
    this.ctx.font = "600 italic 20px 'Exo 2'";
    this.ctx.fillText(this.$dummyArtist1.textContent, this.$dummyArtist1.getBoundingClientRect().left, this.ARTIST_Y);

    // song line //
    if (this.config[thisBeatmapId] && this.config[thisBeatmapId].title) {
      this.$dummySong1.textContent = this.config[thisBeatmapId].title;
    } else if (thisBeatmapMeta && thisBeatmapMeta.title) {
      this.$dummySong1.textContent = thisBeatmapMeta.title;
    } else {
      this.notify(`Title not defined for beatmapset: ${thisBeatmapId}`, 2);
      this.$dummySong1.textContent = "�";
    }
    this.ctx.font = "600 italic 30px 'Exo 2'";
    this.ctx.fillText(this.$dummySong1.textContent, this.$dummySong1.getBoundingClientRect().left, this.SONG_Y);

    this.notify("Rendering and saving images", 0);
    this.saveImage();
  }

  saveImage() {
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      let {result} = e.target;
      result = result.replace(/^data:image\/\w+;base64,/, "");
      let imageBuffer = new Buffer(result, "base64");

      if (!FS.existsSync(PATH.join(this.folderPath, "output"))) {
        FS.mkdirSync(PATH.join(this.folderPath, "output"));
      }

      // save the image
      FS.writeFile(PATH.join(this.folderPath, "output", `${this.getBeatmapIds()[this.renderImageIndex]}.jpg`), imageBuffer, (error) => {
        if (error) {
          this.notify(`Error while saving: ${error} (stopping)`, 3);
          this.$dropzone.removeAttribute("data-hidden");
        }
        if (this.renderImageIndex < this.getBeatmapIds().length - 1) {
          this.renderImageIndex = this.renderImageIndex + 1;
          this.renderNextImage();
        } else {
          this.notify("Done!", 0);
          this.notify("Opening the output folder", 0);
          SHELL.openItem(PATH.join(this.folderPath, "output"));
        }
      });
    };

    this.$canvas.toBlob((blob) => {
      /* eslint-disable */
      new ImageCompressor(blob, {
        "quality": 0.8,
        success(result) {
          fileReader.readAsDataURL(result);
        }
      });
      /* eslint-enable */
    }, "image/jpeg");
  }
}
