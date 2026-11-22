const mongoose = require("mongoose");
const request = require("supertest");
const { app } = require("../server");
const { runtimeFlags } = require("../app/constants");

const PASSWORD = "correct-horse-battery";
let counter = 0;

// Names are unique per call so test files never collide with each other's data.
const uniqueName = (prefix) => `${prefix}_${Date.now()}_${counter++}`;

const newObjectId = () => new mongoose.Types.ObjectId().toString();

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

// Registers and logs in a user; resolves to { username, password, id, token }.
async function createUser({ isAdmin = false } = {}) {
  const username = uniqueName(isAdmin ? "admin" : "user");
  const registration = await request(app)
    .post("/api/v1/users")
    .send({
      username,
      fullname: "Test User",
      email: `${username}@example.com`,
      password: PASSWORD,
      isAdmin,
    });
  if (registration.status !== 201) {
    throw new Error(`Test setup failed to register ${username}: ${registration.status}`);
  }

  const login = await request(app).post("/api/v1/users/login").send({ username, password: PASSWORD });
  if (login.status !== 200) {
    throw new Error(`Test setup failed to log in ${username}: ${login.status}`);
  }
  return {
    username,
    password: PASSWORD,
    id: login.body.data._id,
    token: login.body.data.sessionToken,
  };
}

module.exports = { app, request, runtimeFlags, createUser, bearer, uniqueName, newObjectId, PASSWORD };
