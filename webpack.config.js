module.exports = {
  "entry": "./resources/js/app.js",
  "externals": ["electron", "fs"],
  "output": {
    "filename": "index.js"
  },
  "watch": true,
  "watchOptions": {
    "ignored": /node_modules/
  }
};
