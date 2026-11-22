const express = require("express");
const { auth, isAdmin, selfOrAdmin } = require("../middleware/authenticationHandler");
const userRouter = express.Router();

const {
  addUser,
  deleteUser,
  editUser,
  getAllUsers,
  userDetails,
  login,
  logout,
} = require("../services/userService");

userRouter.route("/").post(addUser);
userRouter.route("/login").post(login);
userRouter.route("/logout").put(auth, logout);
userRouter.route("/:id").get(auth, selfOrAdmin("id"), userDetails);
userRouter.route("/:id").delete(auth, isAdmin, deleteUser);
userRouter.route("/:id").put(auth, selfOrAdmin("id"), editUser);
userRouter.route("/").get(auth, isAdmin, getAllUsers);

module.exports = userRouter
