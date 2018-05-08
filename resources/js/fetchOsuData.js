import renderImages from "./renderImages";

let ids;
let setData = {};
let index;
let newData;

function noFetch() {
  newData.push(setData);
  renderImages(newData);
}

function goFetch() {
  fetch("https://script.megaapplepi.net/loved-wiki-osu/index.php", {
    "body": `beatmapset=${encodeURIComponent(ids[index])}`,
    "cache": "no-cache",
    "credentials": "same-origin",
    "headers": {
      "content-type": "application/x-www-form-urlencoded"
    },
    "method": "POST"
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
  newData = data;
  ids = data[2];
  index = 0;
  goFetch();
}
