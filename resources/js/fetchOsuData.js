import {getConfig} from "./readConfig";
import renderImages from "./renderImages";

let config;
let key;

let ids;
let setData = {};
let index;
let newData;

function noFetch() {
  newData.push(setData);
  renderImages(newData);
}

function goFetch() {
  fetch(`https://osu.ppy.sh/api/get_beatmaps?k=${key}&limit=1&s=${encodeURIComponent(ids[index])}`, {
    "cache": "no-cache",
    "credentials": "same-origin",
    "method": "GET"
  })
    .then((response) => response.json())
    .then((response) => {
      setData[ids[index]] = {
        "artist": response[0].artist,
        "creator": response[0].creator,
        "title": response[0].title
      };
      if (index < ids.length - 1) {
        goFetch(++index);
      } else {
        noFetch();
      }
    });
}

export default function fetchOsuData(data) {
  config = getConfig();
  key = config.key;

  newData = data;
  ids = data[2];
  index = 0;
  goFetch();
}
