const asyncHandler = require("express-async-handler");
const userRepository = require("../database/repositories/userRepository");
const HttpError = require("../helpers/httpError");
const { hashPassword, comparePassword } = require("../helpers/password");
const { generateSessionToken, verifySessionToken } = require("../helpers/tokens");
const { requireFields, requireString } = require("../helpers/validate");
const { runtimeFlags } = require("../constants");

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toPublicUser = (user) => ({
  _id: user._id,
  username: user.username,
  fullname: user.fullname,
  email: user.email,
  isAdmin: user.isAdmin,
});

const validatePassword = (password) => {
  requireString(password, "password");
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, `password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
};

const validateEmail = (email) => {
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
    throw new HttpError(400, "email is not valid");
  }
};

const addUser = asyncHandler(async (req, res) => {
  const { username, fullname, email, password, isAdmin } = req.body;
  requireFields(req.body, ["username", "fullname", "email", "password"]);
  requireString(username, "username");
  requireString(fullname, "fullname");
  validateEmail(email);
  validatePassword(password);

  if (await userRepository.findUserByUsername(username)) {
    throw new HttpError(409, "User already exists");
  }

  const newUser = await userRepository.createUser({
    username,
    fullname,
    email,
    password: await hashPassword(password),
    // Public sign-up must not be able to mint admins; see README (ALLOW_ADMIN_SIGNUP).
    isAdmin: runtimeFlags.allowAdminSignup && isAdmin === true,
  });

  res.status(201).json({
    message: "User is successfully registered",
    data: toPublicUser(newUser),
  });
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  requireString(username, "username");
  requireString(password, "password");

  // Same response for "no such user" and "wrong password" so the endpoint
  // cannot be used to discover which usernames exist.
  const user = await userRepository.findUserByUsername(username);
  if (!user || !(await comparePassword(password, user.password))) {
    throw new HttpError(401, "Invalid username or password");
  }

  // Reuse a still-valid session; retire any whose token has expired.
  let session = null;
  for (const existing of await userRepository.findActiveUserSessions(user._id)) {
    if (!verifySessionToken(existing.sessionToken)) {
      await userRepository.deactivateUserSession(existing);
    } else if (!session) {
      session = existing;
    }
  }
  if (!session) {
    session = await userRepository.createUserSession({
      userId: user._id,
      sessionToken: generateSessionToken(user._id),
    });
  }

  res.status(200).json({
    message: "User logged in successfully",
    data: { ...toPublicUser(user), sessionToken: session.sessionToken },
  });
});

const userDetails = asyncHandler(async (req, res) => {
  const user = await userRepository.findUserById(req.params.id);
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  res.status(200).json(toPublicUser(user));
});

const logout = asyncHandler(async (req, res) => {
  await userRepository.deactivateSessionByToken(req.sessionToken);
  res.status(200).json({ message: "User is successfully logged out." });
});

const editUser = asyncHandler(async (req, res) => {
  const { fullname, email, password, isAdmin } = req.body;
  const changes = {};

  if (fullname !== undefined) changes.fullname = requireString(fullname, "fullname");
  if (email !== undefined) {
    validateEmail(email);
    changes.email = email;
  }
  if (password !== undefined) {
    validatePassword(password);
    changes.password = await hashPassword(password);
  }
  // Only an admin may change admin status; for everyone else the field is ignored.
  if (isAdmin !== undefined && req.user.isAdmin) {
    if (typeof isAdmin !== "boolean") {
      throw new HttpError(400, "isAdmin must be true or false");
    }
    changes.isAdmin = isAdmin;
  }
  if (Object.keys(changes).length === 0) {
    throw new HttpError(400, "No valid fields provided to update");
  }

  const updated = await userRepository.updateUser(req.params.id, changes);
  if (!updated) {
    throw new HttpError(404, "User not found");
  }
  res.status(200).json({ message: "Details are successfully updated." });
});

// Soft delete; also ends every session so the user's tokens stop working at once.
const deleteUser = asyncHandler(async (req, res) => {
  const user = await userRepository.updateUser(req.params.id, { isActive: false });
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  await userRepository.deactivateAllSessionsOfUser(user._id);
  res.status(200).json({ message: "User deleted successfully" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userRepository.findActiveUsers();
  res.status(200).json({ users, message: "Successfully fetched all Users." });
});

module.exports = {
  addUser,
  deleteUser,
  editUser,
  getAllUsers,
  userDetails,
  login,
  logout,
};
