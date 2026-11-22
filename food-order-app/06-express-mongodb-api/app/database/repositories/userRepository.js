const UserModel = require("../../models/userModel");
const UserSessionModel = require("../../models/userSessionModel");

// The password hash is excluded from every read except the one login needs.
const PUBLIC_FIELDS = "-password";

const findUserByUsername = async (username) =>
  UserModel.findOne({ username, isActive: true });

const createUser = async (userData) => UserModel.create(userData);

const findUserById = async (id) =>
  UserModel.findOne({ _id: id, isActive: true }).select(PUBLIC_FIELDS);

// Returns the updated user (without password), or null if not found.
const updateUser = async (id, fields) =>
  UserModel.findOneAndUpdate(
    { _id: id, isActive: true },
    { $set: { ...fields, updatedTs: Date.now() } },
    { new: true, runValidators: true }
  ).select(PUBLIC_FIELDS);

const findActiveUsers = async () => UserModel.find({ isActive: true }).select(PUBLIC_FIELDS);

const findActiveUserSessions = async (userId) =>
  UserSessionModel.find({ userId, isActive: true });

const createUserSession = async (sessionData) => UserSessionModel.create(sessionData);

const deactivateUserSession = async (userSessionObject) => {
  userSessionObject.isActive = false;
  userSessionObject.updatedTs = Date.now();
  return userSessionObject.save();
};

const deactivateSessionByToken = async (sessionToken) =>
  UserSessionModel.updateMany(
    { sessionToken, isActive: true },
    { $set: { isActive: false, updatedTs: Date.now() } }
  );

const deactivateAllSessionsOfUser = async (userId) =>
  UserSessionModel.updateMany(
    { userId, isActive: true },
    { $set: { isActive: false, updatedTs: Date.now() } }
  );

module.exports = {
  findUserByUsername,
  createUser,
  findUserById,
  updateUser,
  findActiveUsers,
  findActiveUserSessions,
  createUserSession,
  deactivateUserSession,
  deactivateSessionByToken,
  deactivateAllSessionsOfUser,
};
