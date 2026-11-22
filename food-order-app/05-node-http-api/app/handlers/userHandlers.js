const users = require("../service/userService");
const { HttpError, readJsonBody, sendJson } = require("../http");

const fetchAllUsersHandler = (req, res) => {
  sendJson(res, 200, users.getAllUsers());
};

const fetchUserByUsernameHandler = (req, res, username) => {
  const user = users.getUserByUsername(username);
  if (!user) throw new HttpError(404, `User with username ${username} was not found`);
  sendJson(res, 200, user);
};

// POST /v1/login with { "username": "...", "password": "..." }.
// Responds with the bare user object (no password) for compatibility with the original API.
const loginHandler = async (req, res) => {
  const { username, password } = await readJsonBody(req);

  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    throw new HttpError(400, "username and password are required strings");
  }

  const user = users.login(username, password);
  if (!user) throw new HttpError(401, "Invalid credentials");
  sendJson(res, 200, user);
};

module.exports = { fetchAllUsersHandler, fetchUserByUsernameHandler, loginHandler };
