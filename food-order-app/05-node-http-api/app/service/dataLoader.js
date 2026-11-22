const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

// Resolved from this file's location (not the CWD) so the server can be
// started from any directory.
function loadJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), "utf-8"));
}

module.exports = { loadJson };
