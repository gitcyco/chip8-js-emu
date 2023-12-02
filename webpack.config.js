const path = require("path");

module.exports = {
  entry: "./src/webapp.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
};
