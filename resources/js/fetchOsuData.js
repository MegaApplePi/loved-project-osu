import {getConfig} from "./readConfig";
import notify from "./notify";
import renderImages from "./renderImages";

let config;
let key;

let ids;
let setData = {};
let index;
let newData;

function noFetch() {
  // add the beatmapset data to the original data (new data)
  newData.push(setData);
  // send the new data to renderImages
  renderImages(newData);
}

function goFetch() {
  // fetch stuff from the api
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
      // is there any more to go though?
      if (index < ids.length - 1) {
        // if so, fetch again
        goFetch(++index);
      } else {
        // if not, we're done
        noFetch();
      }
    })
    .catch((response) => {
      notify(0, `Error during fetch: ${response}`);
      notify(1, `Possible invalid osu!api key given`);
      notify(-1, `osu!api fetch SKIPPED`);
      // there was an error, skip fetch
      noFetch();
    });
}

export default function fetchOsuData(data) {
  // get the config
  config = getConfig();
  key = config.key;
  newData = data;

  // do we have the osu!api key?
  if (key) {
    // if so, go fetch
    ids = data[2];
    index = 0;
    goFetch();
  } else {
    // if not, skip fetching
    noFetch();
    notify(-1, "No osu!api key given; looking at config instead");
  }
}
