// Root hooks: pick the test environment before any app code is loaded, then start
// the server once (connects to MongoDB, listens on a random free port) and stop it
// after the whole run so mocha exits cleanly without --exit.
process.env.NODE_ENV = "test";
process.env.PORT = "0";

const mongoose = require("mongoose");
const { DATABASE_URI, runtimeFlags } = require("../app/constants");
const { start, stop } = require("../server");

// The suite empties the database, so refuse to touch anything not named *_test.
const databaseName = DATABASE_URI.split("?")[0].split("/").pop();
if (!databaseName.endsWith("_test")) {
  throw new Error(
    `Refusing to run tests against database "${databaseName}". ` +
      "Set TEST_DATABASE_URI to a database whose name ends in _test."
  );
}

exports.mochaHooks = {
  async beforeAll() {
    await start();
    await mongoose.connection.dropDatabase();
    // Lets the tests create admins through the public sign-up endpoint.
    runtimeFlags.allowAdminSignup = true;
  },
  async afterAll() {
    await mongoose.connection.dropDatabase();
    await stop();
  },
};
